import * as connectRedis from 'connect-redis'

export interface Config {
  Host?: string
  Port: number

  session_secret: string
  redis: connectRedis.RedisStoreOptions
}
