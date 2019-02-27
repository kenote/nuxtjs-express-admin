<template>
  <el-menu
    ref="sidebar"
    :default-active="defaultActive"
    :background-color="backgroundColor"
    :text-color="textColor"
    :collapse="collapse"
    :router="router"
    :unique-opened="true"
    @select="handleSelect"
    :active-text-color="activeTextColor">
    <sidebar-menu-item 
      v-for="(menu, key) in sidebar" 
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

@Component({
  name: 'console-sidebar',
  components: {
    sidebarMenuItem
  }
})
export default class  extends Vue {

  @Prop({ default: [] }) sidebar: Array<Sidebar.MenuItem>
  @Prop({ default: '' }) defaultActive: string
  @Prop({ default: false }) router: boolean
  @Prop({ default: false }) collapse: boolean
  @Prop() backgroundColor: string
  @Prop() textColor: string
  @Prop() activeTextColor: string
  //@Prop({ default: [] }) open: string[]
  
  handleSelect (index) {
    //console.log(index)
  }
}
</script>