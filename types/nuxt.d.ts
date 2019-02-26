import Vue from 'vue'
import { Store } from 'vuex'
import { Route } from 'vue-router'

declare namespace nuxt {
  interface ErrorParams {
    statusCode?: string
    message?: string
  }

  interface Context {
    app: Vue
    isClient: boolean
    isServer: boolean
    isStatic: boolean
    isDev: boolean
    isHMR: boolean
    route: Route
    store: Store<any>
    env: object
    query: Route['query']
    nuxtState: object
    req: Request
    res: Response
    params: Route['params']
    redirect(path: string, query?: Route['query']): void
    redirect(status: number, path: string, query?: Route['query']): void
    error(params: ErrorParams): void
    beforeNuxtRender({Conmponents, nuxtState}: any): void
  }
}

export = nuxt