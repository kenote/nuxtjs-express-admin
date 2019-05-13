<template>
  <page ref="thePage">
    <console-breadcrumb :channel="selectedChannel" :store="channelStore" :route="$route" />
    
    <channel-queryer v-if="pageSetting.queryer" 
      :queryer="pageSetting.queryer" 
      :options="selectedChannel && selectedChannel.options" 
      @submit="handleSubmit"
      :auto-submit="pageSetting.created && pageSetting.created === 'submit'"
      :token="token">
      
    </channel-queryer>
    <channel-result-cards v-if="pageSetting.cards" :data="data" :options="pageSetting.cards" :columns="pageSetting.columns || []" :loading="loading">
      
    </channel-result-cards>
    <channel-result-charts v-else-if="pageSetting.charts" 
      :data="data" 
      :options="pageSetting.cards" 
      :columns="pageSetting.columns || []" 
      :step="currentStep"
      :loading="loading">
      <span>图表步进：</span>
      <el-select v-model="currentStep" @change="handleChangeStep">
        <el-option v-for="(item, key) in steps" :key="key" :label="item.name" :value="item.key"></el-option>
      </el-select>
    </channel-result-charts>
    <channel-result-table v-else :data="data" :columns="pageSetting.columns || []" :loading="loading" :pagination="pagination">
      <el-switch
        v-model="pagination"
        style="margin-top: 10px"
        active-text="分页"
        inactive-text="不分页"
        >
      </el-switch>
    </channel-result-table>
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
import channelResultTable from '~/components/channel/result-table.vue'
import channelResultCards from '~/components/channel/result-cards.vue'// channel-result-charts
import channelResultCharts from '~/components/channel/result-charts.vue'
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
    channelResultTable,
    channelResultCards,
    channelResultCharts
  },
  mounted () {
    let pageSetting: channel.MenuItem = this.channelStore.find(this.$route.path)
    this.$data.pageSetting = pageSetting
    if (pageSetting['charts']) {
      this.$data.steps = pageSetting['charts']['step'] || [];
      this.$data.currentStep = (pageSetting.columns || [])[0]['default']['step']
    }
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
  @Provide() steps: Array<{}> = []
  @Provide() currentStep: number = 0

  handleChangeStep (value: number): void {
    this.currentStep = value
  }

  async handleSubmit (values: any): Promise<void> {
    let { queryer, polling } = this.pageSetting
    let multipleBegin: channel.Queryer | undefined = queryer && queryer.find( o => o.key === 'begin' && o.type === 'range-picker')
    if (multipleBegin) {
      let { begin, end } = zipObject(['begin', 'end'], values['begin'])
      console.log('轮询开始...')
      this.data = []
      await getDifferenceDate(<string> begin, <string> end, this.pollingTimeRequest.bind(this, values))
      console.log('轮询结束!!!')
      return
    }
    else if (!!polling) {
      console.log('轮询开始...')
      this.data = []
      let _data: Array<any> = []
      let { options } = this.selectedChannel
      for (let item of values[polling].sort()) {
        let _queryer: channel.Queryer | undefined = (queryer || []).find( o => o.key === polling )
        if (_queryer && (_queryer.data || _queryer.options)) {
          let queryerData: Array<{ key: string, name: string }> = (options && _queryer.options) ? options[_queryer.options] : _queryer.data
          let dataItem: { key: string, name: string } | undefined = queryerData.find( o => o.key === item )
          let opts: any = {
            id: dataItem && dataItem.key,
            title: dataItem && dataItem.name
          }
          let result: any = await this.pollingRequest({ ...values, [polling]: item })
          if (this.pageSetting['charts']) {
            _data = [
              ..._data,
              ...{ ...opts, data: result }
            ]
          }
          else {
            this.data = [
              ...this.data,
              ...{ ...opts, data: result }
            ]
          }
        }
      }
      if (this.pageSetting['charts']) {
        this.data = _data
      }
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

  async pollingRequest (values: any): Promise<any> {
    this.loading = true
    try {
      let options: HeaderOptions = {
        token: this.token || undefined
      }
      let result: resufulInfo = await http.post(this.pageSetting.api || `/proto${this.pageSetting.index}`, values, options)
      this.loading = false
      if (result.Status.code === 0) {
        //let _data: any[] = [ ...this.data, ...result.data['data'] ]
        //this.data = _data
        //console.log(result.data['data'])
        return result.data['data']
      }
      this.$message.warning(result.Status.message || '')
    } catch (error) {
      this.loading = false
      this.$message.warning(error.message)
    }
  }

  async pollingTimeRequest (values: any, time: number): Promise<void> {
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