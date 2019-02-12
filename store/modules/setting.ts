import { ActionTree, MutationTree, GetterTree, ActionContext } from 'vuex'
import { RootState } from 'store'

import { Register } from '~/server/types/config'

export const name = 'setting'

export const types = {
  REGISTER: 'REGISTER'
}

export interface State {
  register: Register
}

export const namespaced = true

export const state = (): State => ({
  register: {
    invitation: true
  }
})

export const getters: GetterTree<State, RootState> = {
  
}

export interface Actions<S, R> extends ActionTree<S, R> {
  
}

export const actions: Actions<State, RootState> = {
  
}

export const mutations: MutationTree<State> = {
  [types.REGISTER](state, register: Register) {
    state.register = register
  },
}