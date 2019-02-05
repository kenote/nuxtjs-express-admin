import { Nuxt, Builder } from 'nuxt'
import { Express } from 'express'
import nuxtConfig from '../nuxt.config'

const dev: boolean = process.env.NODE_ENV !== 'production'
const nuxt: any = new Nuxt({ ...nuxtConfig, dev })

if (process.env.NODE_ENV === 'development') {
  const builder: any = new Builder(nuxt)
  builder.build()
}

export default (app: Express): void => {
  app.use(nuxt.render)
}