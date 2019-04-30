<template>
  <el-menu
    ref="sidebar"
    :default-active="defaultActive"
    :background-color="backgroundColor"
    :text-color="textColor"
    :collapse="collapse"
    :router="router"
    :unique-opened="true"
    :active-text-color="activeTextColor">
    <sidebar-menu-item 
      v-for="(menu, key) in navs" 
      :key="key" 
      :name="menu.name" 
      :icon="menu.icon" 
      :index="menu.index" 
      :children="menu.children" 
      :disabled="menu.disabled" />
  </el-menu>
</template>

<script lang="ts">
import Component from 'nuxt-class-component'
import { Prop, Vue, Provide } from 'vue-property-decorator'
import { Sidebar } from '~/types'
import sidebarMenuItem from './sidebar-menu-item.vue'
import { responseDocument as responseUserDocument } from '~/server/types/proxys/user'
import { map, uniq, concat } from 'lodash'
import { accessNavs } from '~/utils/channel'
import channel from '~/server/types/channel'

@Component({
  name: 'console-sidebar',
  components: {
    sidebarMenuItem
  },
  mounted () {
    this.updateNavs()
  },
})
export default class  extends Vue {

  @Prop({ default: null }) auth: responseUserDocument | null
  @Prop({ default: [] }) sidebar: Array<Sidebar.MenuItem>
  @Prop({ default: '' }) defaultActive: string
  @Prop({ default: false }) router: boolean
  @Prop({ default: false }) collapse: boolean
  @Prop() backgroundColor: string
  @Prop() textColor: string
  @Prop() activeTextColor: string
  
  @Provide() navs: Array<channel.MenuItem> = []
  
  updateNavs () {
    if (!this.auth) return
    let access: string[] | undefined
    if (this.auth.group.level < 9000) {
      access = (this.auth.access || []).length > 0 ? this.auth.access : uniq(map(this.auth.teams, 'access').toString().split(','))
    }
    this.navs = accessNavs(this.sidebar, access)
  }
}
</script>