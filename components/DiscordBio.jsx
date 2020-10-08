const {
  React,
  getModule,
  i18n: { Messages },
  getModuleByDisplayName,
} = require('powercord/webpack');
const { Spinner, Text, Flex } = require('powercord/components');
const AsyncComponent = require('powercord/components/AsyncComponent');

const FormSection = AsyncComponent.from(getModuleByDisplayName('FormSection'));
const Anchor = AsyncComponent.from(getModuleByDisplayName('Anchor'));

const { AdvancedScrollerThin } = getModule(['AdvancedScrollerThin'], false);

const Genders = ['DSCBIO_GENDER_MALE', 'DSCBIO_GENDER_FEMALE', 'DSCBIO_GENDER_NONBINARY', 'DSCBIO_GENDER_UNDISCLOSED'];

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
      nelly: getModule(['flexWrapper', 'image'], false).image,
      ...getModule(['emptyIcon'], false),
    };

    this.state = {
      streamerMode: getModule(['hidePersonalInformation'], false)
        .hidePersonalInformation,
    };
  }

  render() {
    const moment = getModule(['momentProperties'], false);
    const { streamerMode } = this.state;
    const { getSetting, bio } = this.props;

    if (streamerMode) {
      return (
        <div className={this.classes.empty}>
          <div className={this.classes.emptyIconStreamerMode} />
          <div className={this.classes.emptyText}>
            {Messages.DSCBIO_STREAMER_MODE_ENABLED}
          </div>
        </div>
      );
    } else if (!bio) {
      return (
        <div className={this.classes.empty}>
          <Spinner />
        </div>
      );
    } else if (bio.error) {
      const { message, icon } = bio.error;

      return (
        <div className={this.classes.empty}>
          <div className={(icon || this.classes.nelly) + ' error-icon'} />
          <div className={this.classes.emptyText}>{message}</div>
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
        created_at,
      } = bio.user.details;
      const dateFormat = getSetting('date-format', 'DD.MM.YYYY');

      return (
        <AdvancedScrollerThin className='discord-bio' fade={true}>
          <Flex justify={Flex.Justify.START} wrap={Flex.Wrap.WRAP}>
            <Section title={Messages.DSCBIO_DESCRIPTION}>{description}</Section>
            <Section title={Messages.DSCBIO_GENDER}>{Messages[Genders[gender]]}</Section>
            <Section title={Messages.DSCBIO_LOCATION}>{location}</Section>
            <Section title={Messages.DSCBIO_OCCUPATION}>{occupation}</Section>
            {birthday && (
              <Section title={Messages.DSCBIO_BIRTHDAY}>
                {moment(birthday).utc().startOf('day').format(dateFormat)}
              </Section>
            )}
            <Section title={Messages.DSCBIO_CREATED_AT}>
              {moment(created_at).utc().startOf('day').format(dateFormat)}
            </Section>
            {email && (
              <Section title={Messages.DSCBIO_EMAIL}>
                <Anchor href={`mailto:${email}`}>{email}</Anchor>
              </Section>
            )}
          </Flex>
        </AdvancedScrollerThin>
      );
    }
  }
};
