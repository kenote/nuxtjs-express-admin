import { GetterTree, ActionContext, ActionTree, MutationTree } from 'vuex'
import { RootState } from 'store'
import { IRequest } from '~/server/types/resuful'
import * as setting from './modules/setting'
import * as auth from './modules/auth'

import http, { resufulInfo } from '~/utils/http'
import { getChannelId } from '~/utils/channel'
import { HeaderOptions } from '~/server/types/resuful'
import channel from '~/server/types/channel'

export const types = {}

export interface State {}

export const state = (): State => ({})

export const getters: GetterTree<State, RootState> = {}

export interface Actions<S, R> extends ActionTree<S, R> {
  nuxtServerInit(context: ActionContext<S, R>, server: HTTPServer): void
}

interface HTTPServer {
  req: IRequest
}

export const actions: Actions<State, RootState> = {
  async nuxtServerInit({ commit }, { req }) {
    commit(`${setting.name}/${setting.types.REGISTER}`, req.__register)
    commit(`${setting.name}/${setting.types.__RULES}`, req.__rules)
    commit(`${setting.name}/${setting.types.CHANNELS}`, req.__channels)
    let channelId: number = getChannelId(req.__channels, req.path)
    commit(`${setting.name}/${setting.types.SELECTCHANNEL}`, channelId || req.__selected.channels)
    commit(`${setting.name}/${setting.types.FLAGES}`, req.__flags)
    if (req.cookies['token']) {
      let site_url: string = req.protocol + '://' + req.headers.host
      let opttions: HeaderOptions = {
        token: req.cookies['token'],
        entry: site_url + http.__APIEntrance
      }
      try {
        let result: resufulInfo = await http.get('/account/accesstoken', null, opttions)
        if (result.Status.code === 0) {
          commit(`${auth.name}/${auth.types.SET}`, result.data)
          return
        }
        console.warn(result.Status.message)
      } catch (error) {
        console.error((<Error>error).message)
      }
    }
  }
}

export const mutations: MutationTree<State> = {}