import * as path from 'path'
import * as http from 'http'
import * as express from 'express'
import * as nunjucks from 'nunjucks'
import * as bodyParser from 'body-parser'
import * as methodOverride from 'method-override'
import * as compress from 'compression'
import * as cookieParser from 'cookie-parser'
import * as session from 'express-session'
import * as connectRedis from 'connect-redis'
import * as errorhandler from 'errorhandler'

import config from './config'
import nuxt from './nuxt'
import restful from './middlewares/restful'

const { Host, Port, session_secret, redis } = config
const app: express.Express = express()
const RedisStore: connectRedis.RedisStore = connectRedis(session)

// 设置模版
app.set('view', path.resolve(process.cwd(), 'views'))
app.set('view engine', 'njk')
nunjucks.configure('views', { autoescape: true, express: app })

// 设置 POST
app.use(bodyParser.json({ limit: '1mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }))

// 让服务器能转发 PUT、DELETE 请求
app.use(methodOverride())

// 压缩数据
app.use(compress())

// Cookie
app.use(cookieParser(session_secret))

// Session
app.use(session({
  secret: session_secret,
  store: new RedisStore(redis),
  resave: true,
  saveUninitialized: true
}))

//  自定义 Restful 中间件
app.use(restful.hendler())

// Renderer Nuxt
nuxt(app)

// 404 Not Found.
app.use('*', (req: express.Request, res: express.Response): void => {
  return res.status(404).render('error', { message: 'This page could not be found' })
})

// 500 Error
if (process.env.NODE_ENV === 'development') {
  app.use(errorhandler)
}
else {
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction): void => {
    console.error('server 500 error: ', err)
    return res.status(500).render('error', { message: 'This page could internal server error' })
  })
}

// Starting Server
const server: http.Server = http.createServer(app)
server.listen(Port, Host, (err: Error): void => {
  if (err) throw err
  console.log(`Service running in %s environment, PORT: %d ...`, process.env.NODE_ENV || 'development', Port)
})