<template>
  <page ref="thePage">
    <console-breadcrumb :channel="selectedChannel" :store="channelStore" :route="$route" />

    <setting-channel-create v-if="mode === 'create'" 
      @submit="handleSubmitCreate" 
      :loading="loading" 
      @goback="handleGoback" />
    <setting-channel-config v-else-if="mode === 'config'" 
      :data="selected"
      @submit="handleSubmitCreate" 
      :loading="loading" 
      @goback="handleGoback" />
    <setting-channel-list v-else 
      :data="list" 
      :loading="loading" 
      @config="handleConfig"
      @getlist="handleList" >
      <el-button type="primary" @click="handleCreate">创建新频道</el-button>
    </setting-channel-list>
  </page>
</template>

<script lang="ts">
import Component from 'nuxt-class-component'
import { Provide, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import * as setting from '~/store/modules/setting'
import * as auth from '~/store/modules/auth'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import consoleBreadcrumb from '~/components/console/breadcrumb.vue'
import settingChannelList from '~/components/setting/channel-list.vue'
import settingChannelCreate from '~/components/setting/channel-create.vue'
import settingChannelConfig from '~/components/setting/channel-config.vue'
import channel from '~/server/types/channel'
import http, { resufulInfo } from '~/utils/http'
import { HeaderOptions } from '~/server/types/resuful'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)

@Component({
  layout: 'console',
  middleware: ['authenticated'],
  components: {
    consoleBreadcrumb,
    settingChannelList,
    settingChannelCreate,
    settingChannelConfig
  },
  mounted () {
    console.log(this.channels)
  }
})
export default class  extends Vue {

  @Auth.State token: string | null
  @Setting.State channels: Array<channel.NavMenus>
  @Setting.Getter selectedChannel
  @Setting.Getter channelStore

  @Provide() list: Array<channel.NavMenus> = []
  @Provide() mode: 'list' | 'create' | 'edit' | 'config' | 'router' = 'list'
  @Provide() selected: channel.NavMenus | null = null
  @Provide() loading: boolean = false

  handleList (): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.get(`/setting/channel/list`, {}, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.list = result.data
          return
        }
        this.$message.warning(result.Status.message || '')
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 800)
  }

  handleEdit (index: number, row: channel.NavMenus): void {
    this.mode = 'edit'
    this.selected = row
  }

  handleConfig (index: number, row: channel.NavMenus): void {
    this.mode = 'config'
    this.selected = row
  }

  handleRouter (index: number, row: channel.NavMenus): void {
    this.mode = 'router'
    this.selected = row
  }

  handleRemove (index: number, row: channel.NavMenus): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.delete(`/setting/channel/${row.id}`, {}, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.handleList()
          return
        }
        this.$message.warning(result.Status.message || '')
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleGoback (): void {
    this.mode = 'list'
  }

  handleCreate (): void {
    this.mode = 'create'
  }

  handleSubmitCreate (values: any): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.post(`/ucenter/group/create`, values, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.mode = 'list'
          return
        }
        this.$message.warning(result.Status.message || '')
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleSubmitEdit (_id: string, values: any): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.post(`/ucenter/group/edit/${_id}`, values, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.mode = 'list'
          this.selected = null
          return
        }
        this.$message.warning(result.Status.message || '')
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

}
</script>