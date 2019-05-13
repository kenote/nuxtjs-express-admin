import RPCClient from '@alicloud/pop-core'

export declare namespace alicloud {

  interface Store {
    key             : string
    name            : string
    description    ?: string
    setting         : RPCClient.Config
    SMS            ?: SMS.Config
  }

  interface Config {
    setting         : RPCClient.Config
    SMS             : SMS.Config
  }

  interface requestOption {
    method          : 'GET' | 'POST'
  }
  
}

export declare namespace SMS {

  interface Config {
    signName        : string
    templates       : Templates
  }

  type Template = 'register' | 'verifyid' | 'password' | 'setinfos'

  interface Templates {
    register        : string
    verifyid        : string
    password        : string
    setinfos        : string
  }

  interface requestParams {
    PhoneNumbers    : string
    SignName        : string
    TemplateCode    : string
    TemplateParam  ?: string
  }

  interface SendResponse {
    RequestId       : string
    Code            : string
    Message         : string
    BizId           : string
  }
}