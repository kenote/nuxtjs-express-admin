<template>
  <header>
    <div class="header-start">
      <div class="header-link-box">
        <nuxt-link class="header-link logo" to="/">
          <img src="~/assets/images/logo.png" />
        </nuxt-link>
      </div>
      <el-dropdown @command="selectChannel" placement="top-start" trigger="click" @visible-change="handleVisible">
        <a class="header-link" v-bind:class="visible ? 'active' : ''">
          <span class="el-dropdown-link">
            <i class="el-icon-menu el-icon--left"></i>{{ currentChannel.name }}
          </span>
        </a>
        <el-dropdown-menu slot="dropdown" class="header-link-dropdown">
          <template v-for="(channel, idx) in channels">
            <el-dropdown-item v-if="channel.id === 11" :key="idx+1000" divided></el-dropdown-item>
            <el-dropdown-item :key="idx" :command="channel.id">[{{ channel.id }}] {{ channel.name }}</el-dropdown-item>
          </template>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div class="header-end">
      <slot></slot>
      <auth-dropdown :auth="auth" :command="command" :user-entrance="userEntrance" />
    </div>
  </header>
</template>

<script lang="ts">
import Component from 'nuxt-class-component'
import { Prop, Provide, Vue } from 'vue-property-decorator'
import channel from '~/server/types/channel'
import { responseDocument as responseUserDocument } from '~/server/types/proxys/user'
import authDropdown from './auth-dropdown.vue'
import { Dropdown } from '~/types'

@Component({
  name: 'console-header',
  components: {
    authDropdown
  },
})
export default class  extends Vue {

  @Prop({ default: null }) auth: responseUserDocument | null
  @Prop({ default: [] }) userEntrance: Array<Dropdown.MenuItem>
  @Prop({ default: [] }) channels: Array<channel.NavMenus>
  @Prop({ default: { id: 0, name: '控制台', navs: [], default: '/' } }) currentChannel: channel.NavMenus
  @Prop({ default: (value: number): void => {} }) selectChannel: (value: number) => void
  @Prop({ default: (value: string): void => {} }) command: (value: string) => void

  @Provide() visible: boolean = false

  handleVisible (visible: boolean): void {
    this.visible = visible
  }
  
}

</script>