import * as connectRedis from 'connect-redis'
import { loadData } from '../utils'
import { Config } from '../types/config'

const project: Config = {
  Host: '0.0.0.0',
  Port: 4000,

  site_name: 'Kenote',
  site_url: 'http://localhost:4000',
  store_root: 'uploadfile',

  session_secret: 'kenote_secret',
  redis: {
    host: '127.0.0.1',
    port: 6379,
    db: 0
  },

  mongo: {
    uris: 'mongodb://localhost:27017/kenote_nuxtjs_admin',
  },
  ...loadData('data/config.default.ini'),
  ...loadData('data/config.ini')
}

project.Port = Number(project.Port)
parseRedis(project.redis)

export default project

function parseRedis (setting: connectRedis.RedisStoreOptions): void {
  setting.port = Number(setting.port || 6379)
  setting.db = Number(setting.db || 0)
}