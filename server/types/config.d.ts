import * as connectRedis from 'connect-redis'
import { mongoSetting } from 'kenote-mongoose-helper'

export interface Config {
  Host?: string
  Port: number

  session_secret: string
  redis: connectRedis.RedisStoreOptions

  mongo: mongoSetting
}
