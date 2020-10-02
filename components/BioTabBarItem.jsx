const { React } = require('powercord/webpack');

module.exports = class BioTabBarItem extends React.PureComponent {
  state = {};

  async componentDidMount() {
    const { id, fetchBio } = this.props;
    try {
      await fetchBio(id);
      this.setState({ bio: true });
    } catch (e) {
      // Just fail silently since we only care if the requests goes through
    }
  }

  render() {
    const { children, getSetting } = this.props;
    const showBio = getSetting('show-bio-tab', 'always');

    // Check the "Show Bio Tab" setting

    switch (showBio) {
      // Always show the tab
      case 'always':
        return children;
      // Only display tab if the user has a bio
      case 'has-bio':
        if (this.state.bio) return children;
        break;
      // Never show the tab
      default:
        return null;
    }

    return null;
  }
};
