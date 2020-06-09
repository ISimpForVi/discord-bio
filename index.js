const {
  Plugin
} = require("powercord/entities");
const {
  getModule,
  getModuleByDisplayName,
  React
} = require("powercord/webpack");
const {
  inject,
  uninject
} = require("powercord/injector");
const {
  get,
  del
} = require('powercord/http');

module.exports = class Bio extends Plugin {
  constructor() {
    super()
  }
  async startPlugin() {
    this._fetchUserProfile()
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

          const bio = await this.fetchBio(id)

          return ({
            type: 'discord-bio',
            id: bio.user.details.slug,
            name: bio.discord.username,
            verified: !!bio.user.details.verified
          });
        } catch (e) {
          console.log(e);
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
    uninject("discord-bio")
  }

  async fetchBio(id) {
    const bio = await get(`https://api.discord.bio/v1/user/details/${id}`)
      .then(r => r.body && r.body.payload);
  }

  async _fetchUserProfile() {
    const UserProfileBody = await getModule(m => m.default && m.default.displayName === "UserProfileBody")
    const TabBar = await getModule()
    inject('discord-bio', UserProfileBody.prototype, 'renderTabBar', function (_, res) {
      const {
        user
      } = this.props;

      if (!user || !user.bot) return res;

      const bioTab = React.createElement(TabBar.Item, {
        key: 'DISCORD_BIO',
        className: tabBarItem,
        id: 'DISCORD_BIO'
      }, 'discord.bio');

      res.props.children.props.children.push(bioTab)

      return res;
    });
  }
}