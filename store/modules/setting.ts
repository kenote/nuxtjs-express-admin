import { ActionTree, MutationTree, GetterTree, ActionContext } from 'vuex'
import { RootState } from 'store'
import { clone, orderBy } from 'lodash'
import Channel from '~/utils/channel'

import { Register, __Rules } from '~/server/types/config'
import channel from '~/server/types/channel'

export const name = 'setting'

export const types = {
  REGISTER: 'REGISTER',
  __RULES: 'RULES',
  CHANNELS: 'CHANNELS',
  SELECT: 'SELECT',
  SELECTCHANNEL: 'SELECTCHANNEL',
  LOADING: 'LOADING',
  FLAGES: 'FLAGES',
}

export interface State {
  register: Register
  __rules: __Rules
  channels: Array<channel.NavMenus>
  selected: Selected
  loading: Loading
  flags: channel.Flags
}

export interface Selected {
  channel: number
}

export interface Loading {
  channel: boolean
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
    mailphone_step: 60,
    sms: { 
      alicound: ''
    }
  },
  __rules: {},
  channels: [],
  selected: {
    channel: 0
  },
  loading: {
    channel: false
  },
  flags: {}
})

const defaultChannel: channel.NavMenus = { id: 0, name: '控制台', label: 'console', navs: [], default: '/' }

export const getters: GetterTree<State, RootState> = {
  selectedChannel: state => {
    let p: channel.NavMenus | undefined = state.channels.find( o => o.id === state.selected.channel)
    return p ? p : defaultChannel
  },
  channelStore: state => {
    let p: channel.NavMenus = state.channels.find( channel => channel.id === state.selected.channel ) || defaultChannel
    return new Channel(p)
  }
}

export interface Actions<S, R> extends ActionTree<S, R> {
  selectChannel(context: ActionContext<S, R>, id: number): void
}

export const actions: Actions<State, RootState> = {
  async selectChannel({ commit }, id: number) {
    commit(types.LOADING, 'channel')
    setTimeout(() => {
      commit(types.SELECTCHANNEL, id)
      Promise.resolve(null)
    }, 300)
  }
}

export const mutations: MutationTree<State> = {
  [types.REGISTER] (state: State, register: Register) {
    state.register = register
  },
  [types.__RULES] (state: State, __rules: __Rules) {
    state.__rules = clone(__rules)
  },
  [types.CHANNELS] (state: State, channels: Array<channel.NavMenus>) {
    state.channels = orderBy(channels, ['id'], ['asc'])
  },
  [types.SELECT](state: State, selected: Selected) {
    state.selected = selected
  },
  [types.SELECTCHANNEL](state: State, id: number) {
    state.selected.channel = id
    state.loading.channel = false
  },
  [types.LOADING](state: State, key: string): void {
    state.loading[key] = true
  },
  [types.FLAGES](state: State, flags: channel.Flags): void {
    state.flags = flags
  },
}