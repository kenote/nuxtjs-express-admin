<template>
  <el-submenu v-if="children && children.length > 0" :index="index" :disabled="disabled">
    <template slot="title">
      <i v-if="icon" v-bind:class="icon"></i>
      <span>{{ name }}</span>
    </template>
    <sidebar-menu-item v-for="(menu, key) in children" :key="key" :index="menu.index" :name="menu.name" :icon="menu.icon" :children="menu.children" :disabled="menu.disabled" />
  </el-submenu>
  <el-menu-item v-else :index="index" :disabled="disabled">
    <i v-if="icon" v-bind:class="icon"></i>
    <span slot="title">{{ name }}</span>
  </el-menu-item>
</template>

<script lang="ts">
import Component from 'nuxt-class-component'
import { Prop, Vue } from 'vue-property-decorator'
import { Sidebar } from '~/types'

@Component({
  name: 'sidebar-menu-item'
})
export default class  extends Vue {

  @Prop() name: string
  @Prop() index: string
  @Prop() icon: string
  @Prop() children: Array<Sidebar.MenuItem> | undefined
  @Prop({ default: false }) disabled: boolean

}
</script>

<style lang="scss">
.el-submenu .iconfont {
  vertical-align: middle;
  margin-right: 5px;
  width: 24px;
  text-align: center;
  font-size: 18px;
}
</style>