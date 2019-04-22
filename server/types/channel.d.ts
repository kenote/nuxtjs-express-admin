import { PBSetting } from 'kenote-socket-helper'
import { Setting } from './proto'

declare namespace channel {

  interface NavMenus {
    id             : number
    name           : string
    description   ?: string
    default        : string
    navs           : Array<MenuItem>
    rstp          ?: Rstps
    proto         ?: PBSetting
  }

  interface Options {
    [propsName: string]: Array<{}> | {}
  }

  interface Rstps {
    [propsName: string]: Setting.Server
  }

  interface MenuItem {
    index       : string
    name        : string
    icon       ?: string
    children   ?: Array<MenuItem>
    maps       ?: Array<MenuItem>
    disabled   ?: boolean
  }

  interface Flags {
    [propsName: string]: FlagItem
  }

  interface FlagItem {
    access      : number
  }

  type Selected = number
}

export = channel