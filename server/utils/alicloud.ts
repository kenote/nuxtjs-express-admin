import RPCClient from '@alicloud/pop-core'
import { isObject } from 'lodash'
import { loadData } from './'
import { alicloud, SMS } from '../types/alicloud'

const config: alicloud.Config = <alicloud.Config> {
  ...loadData('data/alicloud.default.ini'),
  ...loadData('data/alicloud.ini')
}

class Alicloud {

  private __client: RPCClient = new RPCClient(config.setting)

  public async SendSms (phone: string | string[], template: SMS.Template, param?: object | string): Promise<any> {
    let requestOption: alicloud.requestOption = {
      method: 'POST'
    }
    let TemplateParam: string | undefined = isObject(param) ? JSON.stringify(param) : <string> param
    let requestParams: SMS.requestParams = {
      PhoneNumbers: Array.isArray(phone) ? phone.join(',') : phone,
      SignName: config.SMS.signName,
      TemplateCode: config.SMS.templates[template],
      TemplateParam
    }
    return this.__client.request('SendSms', requestParams, requestOption)
  }
}

export default new Alicloud()