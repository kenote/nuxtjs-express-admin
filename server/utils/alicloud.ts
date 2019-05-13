import RPCClient from '@alicloud/pop-core'
import { isObject } from 'lodash'
import { alicloud, SMS } from '../types/alicloud'

class Alicloud {

  private __store: alicloud.Store
  private __client: RPCClient

  constructor (store: alicloud.Store) {
    this.__store = store
    if (!store || !store.setting) {
      console.log('No configuration found for Alicound.')
      return
    }
    this.__client = new RPCClient(store.setting)
  }

  public async SendSms (phone: string | string[], template: SMS.Template, param?: object | string): Promise<any> {
    if (!this.__store.SMS) return
    let requestOption: alicloud.requestOption = {
      method: 'POST'
    }
    let TemplateParam: string | undefined = isObject(param) ? JSON.stringify(param) : <string> param
    let requestParams: SMS.requestParams = {
      PhoneNumbers: Array.isArray(phone) ? phone.join(',') : phone,
      SignName: this.__store.SMS.signName,
      TemplateCode: this.__store.SMS.templates[template],
      TemplateParam
    }
    return this.__client.request('SendSms', requestParams, requestOption)
  }
}

export default Alicloud