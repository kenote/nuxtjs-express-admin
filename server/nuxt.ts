import { Nuxt, Builder } from 'nuxt'
import { Express, NextFunction } from 'express'
import nuxtConfig from '../nuxt.config'
import { IRequest, IResponse } from './types/resuful'
import { loadData } from './utils'
import channels from './types/channel'

const dev: boolean = process.env.NODE_ENV !== 'production'
const nuxt: any = new Nuxt({ ...nuxtConfig, dev })

if (process.env.NODE_ENV === 'development') {
  const builder: any = new Builder(nuxt)
  builder.build()
}

export default (app: Express): void => {
  app.use(nuxtHandler, nuxt.render)
}

async function nuxtHandler (req: IRequest, res: IResponse, next: NextFunction): Promise<any> {
  let isPage: boolean = !/^(\/\_nuxt|\/__webpack_hmr)|(\.ico|\.png)$/.test(req.path)
  if (isPage) {
    req.__channels = <Array<channels.NavMenus>> loadData('data/channels', 'array')
    req.__selected = {
      channels: req.path === '/' ? 0 : 1
    }
  }
  return next()
}