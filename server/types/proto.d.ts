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
  proto        : Send.Proto
  request      : Send.Request
  parse       ?: Array<Send.Parse>
  alias       ?: Send.Alias
  autoFields  ?: Send.AutoFields
}

export declare namespace Send {

  interface Proto {
    code   : number | string
    req    : string
    res    : string
    rstp  ?: string
  }

  interface Request {
    [propsName: string]: 'date' | 'string' | 'number'
  }

  interface Parse {
    key         : string
    separator   : string | RegExp
    collection  : Array<CollectionItem>
    orderBy    ?: OrderBy
    int        ?: ParseInt
  }

  interface ParseInt {
    key         : string
    function    : string
    options     : string[]
  }

  interface AutoFields {
    [propsName: string]: AutoFieldItem
  }

  type AutoFieldItem = {
    [propsName in 'subtract' | 'add']: Array<string | number>
  } & {
    reference: string
  }

  interface Alias {
    [propsName: string]: Array<AliasItem>
  }

  interface AliasItem {
    key         : string
    value       : string
    name       ?: string
  }

  interface OrderBy {
    iteratees   : string[]
    orders      : Array<'asc' | 'desc'>
  }

  interface CollectionItem {
    key    : string
    name   : string
  }
}

export interface protoDocument {
  channel      : string
  setting      : Config
  proto        : Send.Proto
  parse       ?: Array<Send.Parse>
  payload     ?: {}
  rtsp_key    ?: string
}