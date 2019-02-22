import { ActionTree, MutationTree, GetterTree, ActionContext } from 'vuex'
import { RootState } from 'store'

import { responseDocument } from '~/server/types/proxys/user'

export const name = 'auth'

export const types = {
  SET: 'SET'
}

export interface State {
  user: responseDocument | null
  token: string | null
}

export const namespaced = true

export const state = (): State => ({
  user: null,
  token: null
})

export const getters: GetterTree<State, RootState> = {
  
}

export interface Actions<S, R> extends ActionTree<S, R> {
  
}

export const actions: Actions<State, RootState> = {
  
}

export const mutations: MutationTree<State> = {
  [types.SET] (state: State, user: responseDocument | null) {
    state.user = user
    state.token = user && user.jw_token ? user.jw_token : null
  }
}