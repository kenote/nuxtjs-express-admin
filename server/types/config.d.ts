import * as connectRedis from 'connect-redis'
import { mongoSetting } from 'kenote-mongoose-helper'
import { Rule } from 'kenote-validate-helper'

export interface Config {
  Host          ?: string
  Port           : number

  site_name      : string
  site_url       : string

  session_secret : string
  redis          : connectRedis.RedisStoreOptions

  mongo          : mongoSetting
}

export interface Register {
  invitation     : boolean
  email_verify   : emailVerify
}

export interface __Rules {
  [propsName: string]: Rule
}

export interface emailVerify {
  timeout        : number
}