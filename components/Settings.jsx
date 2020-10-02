const {
  React,
  getModule,
  getModuleByDisplayName,
  i18n: { Messages },
} = require('powercord/webpack');
const {
  SwitchItem,
  SelectInput,
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
          note={Messages.DATE_FORMAT_DESC.format({
            momentJsDocsUrl: 'https://momentjs.com/docs/#/displaying/format/',
          })}
          value={currentFormat}
          onChange={(value) => {
            updateSetting('date-format', value);
          }}
        >
          {Messages.DATE_FORMAT}
        </TextInput>

        <FormItem
          title={Messages.PREVIEW}
          className={this.classes.margin20Bottom}
        >
          <Text>{moment().utc().startOf('day').format(currentFormat)}</Text>
          <FormDivider className={this.classes.dividerDefault} />
        </FormItem>

        <FormItem
          title={Messages.PRESETS}
          className={this.classes.margin20Bottom}
        >
          <FormText type='description' className={this.classes.margin8Bottom}>
            {Messages.PRESETS_DESC}
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
        <FormItem disabled title={Messages.SHOW_BIO_TAB}>
          <FormText
            disabled
            type='description'
            className={this.classes.margin8Bottom}
          >
            {Messages.SHOW_BIO_TAB_DESC}
          </FormText>
          <RadioGroup
            disabled
            value={getSetting('show-bio-tab', 'always')}
            onChange={(option) => {
              updateSetting('show-bio-tab', option.value);
            }}
            options={[
              { name: Messages.SHOW_BIO_TAB_ALWAYS, value: 'always' },
              { name: Messages.SHOW_BIO_TAB_HAS_BIO, value: 'has-bio' },
              { name: Messages.SHOW_BIO_TAB_NEVER, value: 'never' },
            ]}
          />
        </FormItem>
      </div>
    );
  }
};
