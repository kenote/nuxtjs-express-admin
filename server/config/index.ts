
import { Config } from '../types/config'

const project: Config = {
  Host: '0.0.0.0',
  Port: 4000,

  session_secret: 'kenote_secret',
  redis: {
    host: '127.0.0.1',
    port: 6379,
    db: 0
  }
}

export default project