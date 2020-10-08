const {
  React,
  getModule,
  getModuleByDisplayName,
  i18n: { Messages },
} = require('powercord/webpack');
const {
  TextInput,
} = require('powercord/components/settings');
const { AsyncComponent, Text } = require('powercord/components');

const RadioGroup = AsyncComponent.from(getModuleByDisplayName('RadioGroup'));
const FormItem = AsyncComponent.from(getModuleByDisplayName('FormItem'));
const FormText = AsyncComponent.from(getModuleByDisplayName('FormText'));
const FormDivider = AsyncComponent.from(getModuleByDisplayName('FormDivider'));

module.exports = class DiscordBioSettings extends React.PureComponent {
  constructor(props) {
    super(props);

    this.classes = {
      ...getModule(['marginBottom8'], false),
      ...getModule(['dividerDefault'], false),
    };
  }

  render() {
    const moment = getModule(['momentProperties'], false);
    const { getSetting, updateSetting } = this.props;
    const presets = [
      'Do MMMM YYYY',
      'ddd[,] MMM D[,] YYYY',
      'DD.MM.YYYY',
      'MM.DD.YYYY',
      'DD/MM/YYYY',
      'MM/DD/YYYY',
      'YYYY-MM-DD',
    ];
    const currentFormat = getSetting('date-format', presets[0]);

    return (
      <div className='discord-bio-settings'>
        <TextInput
          note={Messages.DSCBIO_DATE_FORMAT_DESC.format({
            momentJsDocsUrl: 'https://momentjs.com/docs/#/displaying/format/',
          })}
          value={currentFormat}
          onChange={(value) => {
            updateSetting('date-format', value);
          }}
        >
          {Messages.DSCBIO_DATE_FORMAT}
        </TextInput>

        <FormItem
          title={Messages.DSCBIO_PREVIEW}
          className={this.classes.marginBottom20}
        >
          <Text>{moment().utc().startOf('day').format(currentFormat)}</Text>
          <FormDivider className={this.classes.dividerDefault} />
        </FormItem>

        <FormItem
          title={Messages.DSCBIO_PRESETS}
          className={this.classes.marginBottom20}
        >
          <FormText type='description' className={this.classes.marginBottom8}>
            {Messages.DSCBIO_PRESETS_DESC}
          </FormText>
          <RadioGroup
            value={currentFormat}
            onChange={(option) => {
              updateSetting('date-format', option.value);
            }}
            options={presets.map((preset) => {
              return {
                name: moment().utc().startOf('day').format(preset),
                value: preset,
              };
            })}
          />
          <FormDivider className={this.classes.dividerDefault} />
        </FormItem>
        <FormItem title={Messages.DSCBIO_SHOW_BIO_TAB}>
          <FormText
            type='description'
            className={this.classes.marginBottom8}
          >
            {Messages.DSCBIO_SHOW_BIO_TAB_DESC}
          </FormText>
          <RadioGroup
            value={getSetting('show-bio-tab', 'always')}
            onChange={(option) => {
              updateSetting('show-bio-tab', option.value);
            }}
            options={[
              { name: Messages.DSCBIO_SHOW_BIO_TAB_ALWAYS, value: 'always' },
              { name: Messages.DSCBIO_SHOW_BIO_TAB_HAS_BIO, value: 'has-bio' },
              { name: Messages.DSCBIO_SHOW_BIO_TAB_NEVER, value: 'never' },
            ]}
          />
        </FormItem>
      </div>
    );
  }
};
