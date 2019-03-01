<template>
  <el-breadcrumb separator="/">
    <template v-if="breadcrumb">
      <el-breadcrumb-item v-for="(item, key) in breadcrumb" :key="key" :to="/^(\/)/.test(item.index) && item.index">{{ item.name }}</el-breadcrumb-item>
    </template>
  </el-breadcrumb>
</template>

<script lang="ts">
import { Route } from 'vue-router'
import Component from 'nuxt-class-component'
import { Prop, Provide, Vue } from 'vue-property-decorator'
import channel from '~/server/types/channel'
import Channel from '~/utils/channel'

@Component({
  name: 'console-breadcrumb',
  mounted () {
    let breadcrumb: Array<channel.MenuItem> = []
    if (this.$props.channel) {
      breadcrumb.push({
        name: this.$props.channel.name,
        index: this.$props.channel.default
      })
    }
    let store: Channel = this.$props.store
    let route: Route = this.$props.route
    if (store && route) {
      let menu: channel.MenuItem | undefined = store.find(route.path)
      if (menu && menu.maps) {
        breadcrumb = breadcrumb.concat(menu.maps)
      }
    }
    this.$data.breadcrumb = breadcrumb
  }
})
export default class  extends Vue {

  @Prop({ default: undefined }) channel?: channel.NavMenus
  @Prop({ default: undefined }) store?: Channel
  @Prop({ default: undefined }) route?: Route

  @Provide() breadcrumb: Array<channel.MenuItem> = []
  
}
</script>