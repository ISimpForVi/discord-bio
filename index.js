const { Plugin } = require('powercord/entities');
const { React, getModule, getAllModules, i18n: { Messages } } = require('powercord/webpack');
const { forceUpdateElement, getOwnerInstance, waitFor } = require('powercord/util');
const { inject, uninject } = require('powercord/injector');
const { get } = require('powercord/http');
const { TabBar } = require('powercord/components');

const DiscordBio = require('./components/DiscordBio');
const Settings = require('./components/Settings');

const i18n = require('./i18n');

module.exports = class Bio extends Plugin {
  constructor () {
    super();
    this.ConnectedDiscordBio = this.settings.connectStore(DiscordBio)
  }

  async startPlugin() {
    await powercord.api.i18n.loadAllStrings(i18n);

    this.classes = {
      ...await getModule(['headerInfo', 'nameTag']),
      ...await getAllModules(['modal', 'inner'])[1],
      ...await getModule(['emptyIcon']),
      header: (await getModule(['iconBackgroundTierNone', 'container'])).header
    };

    Object.keys(this.classes).forEach(
      key => this.classes[key] = `.${this.classes[key].split(' ')[0]}`
    );

    powercord.api.settings.registerSettings('discord-bio', {
      category: 'discord-bio',
      label: 'discord.bio',
      render: Settings
    });

    this.loadStylesheet('style.css');
    this._patchUserProfile();

    powercord.api.connections.registerConnection({
      type: 'discord-bio',
      name: 'discord.bio',
      color: '#7289da',
      icon: {
        color: 'https://discord.com/assets/28174a34e77bb5e5310ced9f95cb480b.png',
        white: 'https://discord.com/assets/e05ead6e6ebc08df9291738d0aa6986d.png'
      },
      enabled: true,
      fetchAccount: async (id) => {
        try {
          if (!id) {
            ({
              id
            } = (await getModule(['getCurrentUser'])).getCurrentUser());
          }

          const bio = await this.fetchBio(id);

          return ({
            type: 'discord-bio',
            id: bio.user.details.slug,
            name: bio.discord.username,
            verified: !!bio.user.details.verified
          });
        } catch (e) {
          //Just ignore the error, probably just 404
        }
      },
      getPlatformUserUrl: (account) => {
        const slug = account.id;
        return `https://dsc.bio/${encodeURIComponent(slug)}`;
      },
      onDisconnect: () => void 0
    });
  }

  pluginWillUnload() {
    uninject('discord-bio-user-load');
    uninject('discord-bio-user-tab-bar');
    uninject('discord-bio-user-body');
    uninject('discord-bio-user-header');

    powercord.api.connections.unregisterConnection('discord-bio');
    powercord.api.settings.unregisterSettings('discord-bio');

    forceUpdateElement(this.classes.header);
  }

  async fetchBio(id) {
    return await get(`https://api.discord.bio/user/details/${id}`)
      .then(r => r.body && r.body.payload);
  }

  async _patchUserProfile() {
    const { classes } = this;
    const instance = getOwnerInstance((await waitFor([
      classes.modal, classes.headerInfo, classes.nameTag
    ].join(' '))).parentElement);

    const { tabBarItem } = await getModule(['tabBarItem']);

    const UserProfileBody = instance._reactInternalFiber.return.type;
    const _this = this;

    inject('discord-bio-user-load', UserProfileBody.prototype, 'componentDidMount', async function (_, res) {
      const { user } = this.props;
      if (!user || user.bot) return;

      try {
        const bio = await _this.fetchBio(user.id);
        this.setState({ _dscBio: bio });
      } catch (e) {
        switch (e.statusCode) {
          case 404: {
            this.setState({
              _dscBio: {
                error: {
                  message: Messages.DSCBIO_NO_DISCORD_BIO_PROFILE,
                  icon: this.classes.emptyIconFriends,
                }
              }
            });
            break;
          }
          case 429: {
            this.setState({
              _dscBio: {
                error: {
                  message: Messages.DSCBIO_DISCORD_BIO_RATELIMITED,
                }
              }
            });
            break;
          }
          default: {
            _this.error('dsc.bio error:', e)
            this.setState({
              _dscBio: {
                error: {
                  message: Messages.DSCBIO_DISCORD_BIO_UNKNOWN_ERROR,
                }
              }
            });
            break;
          }
        }
      }
    });

    inject('discord-bio-user-tab-bar', UserProfileBody.prototype, 'renderTabBar', function (_, res) {
      const { user } = this.props;

      // Don't bother rendering if there's no tab bar, user or if the user is a bot
      if (!res || !user || user.bot) return res;

      // Create discord.bio tab bar item
      const showSetting = _this.settings.get('show-bio-tab', 'always')
      if (showSetting === 'never' || (showSetting === 'has-bio' && (!this.state._dscBio || this.state._dscBio.error))) {
        return res;
      }

      const bioTab = React.createElement(TabBar.Item, {
        key: 'DISCORD_BIO',
        className: tabBarItem,
        id: 'DISCORD_BIO'
      }, 'Bio');

      // Add the discord.bio tab bar item to the list
      res.props.children.props.children.push(bioTab)

      return res;
    });

    inject('discord-bio-user-body', UserProfileBody.prototype, 'render', function (_, res) {
      const { children } = res.props;
      const { section } = this.props;

      if (section !== 'DISCORD_BIO') return res;

      const body = children.props.children[1];
      body.props.children = [];

      body.props.children.push(React.createElement(_this.ConnectedDiscordBio, { bio: this.state._dscBio }));

      return res;
    });
  }
}
