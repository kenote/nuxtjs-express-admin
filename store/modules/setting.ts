import { ActionTree, MutationTree, GetterTree, ActionContext } from 'vuex'
import { RootState } from 'store'
import { clone } from 'lodash'

import { Register, __Rules } from '~/server/types/config'

export const name = 'setting'

export const types = {
  REGISTER: 'REGISTER',
  __RULES: 'RULES'
}

export interface State {
  register: Register
  __rules: __Rules
}

export const namespaced = true

export const state = (): State => ({
  register: {
    invitation: true,
    email_verify: {
      timeout: 0
    },
    lost_pass: {
      timeout: 0
    },
    mailphone_step: 60
  },
  __rules: {}
})

export const getters: GetterTree<State, RootState> = {
  
}

export interface Actions<S, R> extends ActionTree<S, R> {
  
}

export const actions: Actions<State, RootState> = {
  
}

export const mutations: MutationTree<State> = {
  [types.REGISTER] (state: State, register: Register) {
    state.register = register
  },
  [types.__RULES] (state: State, __rules: __Rules) {
    state.__rules = clone(__rules)
  }
}



const data = {
  user: {
    username: 'dkkd'
  }
}