
import { MailerHelper, MailerSetting, parseMailer, Setting } from 'kenote-mailer-helper'
import * as nunjucks from 'nunjucks'
import { loadData } from './'

const setting: Setting = { 
  ...<Setting> loadData('data/mailer.default.ini'), 
  ...<Setting> loadData('data/mailer.ini') 
}
parseMailer(setting)

@MailerSetting({
  ...setting,
  // Rending Funtion, default use lodash/template
  renderString: nunjucks.renderString
})
class Mailer extends MailerHelper {}

export default new Mailer()