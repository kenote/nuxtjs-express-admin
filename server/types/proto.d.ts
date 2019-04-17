import { PBSetting } from 'kenote-socket-helper'
import channel from './channel'
import { setting } from '../config/group';

export interface Config {
  rstps     : channel.Rstps
  proto     : PBSetting
}

export declare namespace Setting {

  interface Server {
    host      : string
    port      : string
  }

}

export interface APIS {
  [propsName: string]: API
}

export interface API {
  proto     : Send.Proto
  request   : Send.Request
}

export declare namespace Send {

  interface Proto {
    code   : number | string
    req    : 'CS_GM_QUERY'
    res    : 'SC_GM_QUERY'
    rstp  ?: string
  }

  interface Request {
    [propsName: string]: 'date' | 'string' | 'number'
  }
}

export interface protoDocument {
  channel      : string
  setting      : Config
  proto        : Send.Proto
  payload     ?: {}
  rtsp_key    ?: string
}