const {
  React,
  getModule,
  getModuleByDisplayName,
} = require('powercord/webpack');
const { Spinner, Text } = require('powercord/components');
const AsyncComponent = require('powercord/components/AsyncComponent');

const FormSection = AsyncComponent.from(getModuleByDisplayName('FormSection'));

const VerticalScroller = AsyncComponent.from(
  getModuleByDisplayName('VerticalScroller')
);

class Section extends React.PureComponent {
  constructor(props) {
    super(props);

    this.classes = {
      ...getModule(['marginBottom8'], false),
    };
  }

  render() {
    const { children, title } = this.props;

    if (!children) return null;

    return (
      <FormSection
        className={this.classes.marginBottom8}
        tag='h5'
        title={title}
      >
        <Text>{children}</Text>
      </FormSection>
    );
  }
}

module.exports = class DiscordBio extends React.PureComponent {
  constructor(props) {
    super(props);

    this.classes = {
      empty: getModule(['body', 'empty'], false).empty,
      ...getModule(['emptyIcon'], false),
    };

    this.state = {};
  }

  async componentDidMount() {
    const { fetchBio, id } = this.props;

    try {
      const bio = await fetchBio(id);
      this.setState({ bio });
    } catch (e) {
      switch (e.statusCode) {
        case 404: {
          this.setState({
            error: "Looks like this person doesn't have a discord.bio profile.",
          });
          break;
        }
        default: {
          this.setState({
            error: 'An unknown error occured. Maybe try again later?',
          });
          break;
        }
      }
    }
  }

  render() {
    const { bio, error } = this.state;

    if (error) {
      return (
        <div className={this.classes.empty}>
          <div className={this.classes.emptyIconFriends} />
          <div className={this.classes.emptyText}>{error}</div>
        </div>
      );
    } else if (!bio) {
      return (
        <div className={this.classes.empty}>
          <Spinner />
        </div>
      );
    } else {
      const { description } = bio.user.details;

      return (
        <VerticalScroller
          className='discord-bio'
          style={{ padding: this.classes.marginMedium }}
          fade={true}
        >
          <Section title='Description'>{description}</Section>
        </VerticalScroller>
      );
    }
  }
};
