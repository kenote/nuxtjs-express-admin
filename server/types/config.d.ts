import * as connectRedis from 'connect-redis'
import { mongoSetting } from 'kenote-mongoose-helper'
import { Rule } from 'kenote-validate-helper'

export interface Config {
  Host          ?: string
  Port           : number

  site_name      : string
  site_url       : string
  store_root     : string

  session_secret : string
  redis          : connectRedis.RedisStoreOptions

  mongo          : mongoSetting
}

export interface Register {
  invitation     : boolean
  email_verify   : emailVerify
  lost_pass      : lostPass
  mailphone_step : number
  sms            : SMS
  pages          : Array<Page>
  site_name     ?: string
}

export interface Page {
  key               : string
  main_title        : string[]
  secondary_title   : string
}

export interface __Rules {
  [propsName: string]: Rule
}

export interface emailVerify {
  timeout        : number
}

export interface lostPass {
  timeout        : number
}

export interface SMS {
  alicound       : string
}