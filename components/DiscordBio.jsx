const {
  React,
  getModule,
  getModuleByDisplayName,
} = require('powercord/webpack');
const { Spinner, Text, Flex } = require('powercord/components');
const AsyncComponent = require('powercord/components/AsyncComponent');

const FormSection = AsyncComponent.from(getModuleByDisplayName('FormSection'));
const Anchor = AsyncComponent.from(getModuleByDisplayName('Anchor'));

const VerticalScroller = AsyncComponent.from(
  getModuleByDisplayName('VerticalScroller')
);

const Genders = ['Male', 'Female', 'Nonbinary', 'Undisclosed'];

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
        className={this.classes.marginBottom8 + ' bio-section'}
        tag='h5'
        title={title}
      >
        <Text selectable={true}>{children}</Text>
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
            error: "Looks like this person doesn't have a discord.bio profile",
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
    const moment = getModule(['momentProperties'], false);
    const { bio, error } = this.state;
    const { getSetting } = this.props;

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
      const {
        description,
        gender,
        location,
        email,
        occupation,
        birthday,
        createdAt,
      } = bio.user.details;

      return (
        <VerticalScroller className='discord-bio' fade={true}>
          <Flex justify={Flex.Justify.START} wrap={Flex.Wrap.WRAP}>
            <Section title='Description'>{description}</Section>
            <Section title='Gender'>{Genders[gender]}</Section>
            <Section title='Location'>{location}</Section>
            <Section title='Occupation'>{occupation}</Section>
            {birthday && (
              <Section title='Birthday'>
                {moment(birthday)
                  .startOf('day')
                  .format(getSetting('date-format', 'DD.MM.YYYY'))
                  /* I know this is quick and dirty but you can't stop me MUAHAHAHA */
                  .replace(' 12:00 AM', '')}
              </Section>
            )}
            <Section title='Created At'>
              {moment(createdAt)
                .startOf('day')
                .format(getSetting('date-format', 'DD.MM.YYYY'))
                /* I know this is quick and dirty but you can't stop me MUAHAHAHA */
                .replace(' 12:00 AM', '')}
            </Section>
            {email && (
              <Section title='E-Mail'>
                <Anchor href={`mailto:${email}`}>{email}</Anchor>
              </Section>
            )}
          </Flex>
        </VerticalScroller>
      );
    }
  }
};
