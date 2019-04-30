<template>
  <page ref="thePage">
    <console-breadcrumb :channel="selectedChannel" :store="channelStore" :route="$route" />
    
    <channel-queryer v-if="pageSetting.queryer" 
      :queryer="pageSetting.queryer" 
      :options="selectedChannel && selectedChannel.options" 
      @submit="handleSubmit"
      :token="token">
      
    </channel-queryer>
    <channel-result-view :data="data" :columns="pageSetting.columns || []" :loading="loading" :pagination="pagination">
      <el-switch
        v-model="pagination"
        style="margin-top: 10px"
        active-text="分页"
        inactive-text="不分页"
        >
      </el-switch>
    </channel-result-view>
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
import channelQueryer from '~/components/channel/queryer.vue'
import channelResultView from '~/components/channel/result-view.vue'
import channel from '~/server/types/channel'
import http, { resufulInfo } from '~/utils/http'
import { HeaderOptions } from '~/server/types/resuful'// pagination
import { getDifferenceDate } from '~/utils'
import { zipObject, concat } from 'lodash'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)

@Component({
  layout: 'console',
  middleware: ['authenticated'],
  components: {
    consoleBreadcrumb,
    channelQueryer,
    channelResultView
  },
  mounted () {
    let pageSetting: channel.MenuItem = this.channelStore.find(this.$route.path)
    this.$data.pageSetting = pageSetting
  }
})
export default class  extends Vue {

  @Auth.State token: string | null
  @Setting.Getter selectedChannel: channel.NavMenus
  @Setting.Getter channelStore

  @Provide() pageSetting: channel.MenuItem = { index: '-1', name: '' }
  @Provide() loading: boolean = false
  @Provide() data: Array<any> = []
  @Provide() pagination: boolean = true

  async handleSubmit (values: any): Promise<void> {
    let { queryer } = this.pageSetting
    let multipleBegin: channel.Queryer | undefined = queryer && queryer.find( o => o.key === 'begin' && o.type === 'range-picker')
    if (multipleBegin) {
      let { begin, end } = zipObject(['begin', 'end'], values['begin'])
      console.log('轮询开始...')
      this.data = []
      await getDifferenceDate(<string> begin, <string> end, this.pollingRequest.bind(this, values))
      console.log('轮询结束!!!')
      return
    }
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.post(this.pageSetting.api || `/proto${this.pageSetting.index}`, values, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.data = result.data['data']
          return
        }
        this.$message.warning(result.Status.message || '')
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  async pollingRequest (values: any, time: number): Promise<void> {
    let _values: any = { ...values, begin: time }
    this.loading = true
    try {
      let options: HeaderOptions = {
        token: this.token || undefined
      }
      let result: resufulInfo = await http.post(this.pageSetting.api || `/proto${this.pageSetting.index}`, _values, options)
      this.loading = false
      if (result.Status.code === 0) {
        let _data: any[] = [ ...this.data, ...result.data['data'] ]
        this.data = _data
        return
      }
      this.$message.warning(result.Status.message || '')
    } catch (error) {
      this.loading = false
      this.$message.warning(error.message)
    }
  }

}
</script>