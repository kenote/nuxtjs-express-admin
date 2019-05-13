<template>
  <div>
    <ve-line :set-option-opts="false" 
      :data="chartData" 
      :data-zoom="chartDataZoom" 
      :settings="chartSettings"
      :toolbox="chartToolbox"
      :loading="loading">
    </ve-line>

    <div class="baseinfo" >
      <div class="submit-box" v-bind:class="showSubmit ? 'is-show' : ''">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Route } from 'vue-router'
import Component from 'nuxt-class-component'
import { Prop, Provide, Vue, Watch } from 'vue-property-decorator'
import channel from '~/server/types/channel'
import { map, clone, last } from 'lodash'
import * as utils from '~/utils'
import VeLine from 'v-charts/lib/line'
import 'echarts/lib/component/dataZoom'
import 'echarts/lib/component/toolbox'
import VeHistogram from 'v-charts/lib/histogram'

interface ChartData {
  columns: string[]
  rows: Array<{}>
}

interface Data {
  id: string
  title: string
  data: Array<{}>
}

@Component({
  name: 'channel-result-charts',
  components: {
    VeLine,
    VeHistogram
  },
  created () {
    
  },
  mounted () {
    
  },

})
export default class  extends Vue {

  @Prop({ default: [] }) data: Array<Data>
  @Prop({ default: false }) loading: boolean
  @Prop({ default: [] }) columns: Array<channel.ColumnItem>
  @Prop({ default: undefined }) options: channel.Cards
  @Prop({ default: 0 }) step: number

  @Provide() chartData: ChartData = { columns: [], rows: [] }
  @Provide() rowIndex: { key: string, name: string } = { key: '', name: '' }
  @Provide() showSubmit: boolean = false
  @Provide() chartSettings: any = {
    //showDataZoom: true,
    //area: true,
    metrics: []
  }
  @Provide() chartDataZoom: any = [{ type: 'slider', start: 0, end: 100 }]
  @Provide() chartToolbox: any = {
    feature: {
      magicType: {type: ['line', 'bar']},
      saveAsImage: {}
    }
  }

  @Watch('data')
  onDataChange (val: Array<Data>, oldVal: Array<Data>): void {
    let rowIndex: { key: string, name: string } = this.rowIndex
    let options: {} = this.options || {}
    let columns: string[] = map(val, 'title')
    this.chartData.columns = [rowIndex.key].concat(columns)
    this.handleInitialize()
    if (columns.length === 0) return
    this.chartSettings.metrics = columns
    let rows: Array<{}> = this.chartData.rows
    for (let item of val) {
      for (let e of item.data) {
        let rowItem: any = rows.find( o => o[rowIndex.key] === e[rowIndex.name])
        if (rowItem) {
          rowItem[item.title] = e[options['prop'] || 'person']
        }
      }
    }
    this.chartData.rows = rows
    setTimeout(() => {
      this.showSubmit = val.length > 0
    }, 1500)
  }

  @Watch('step')
  onStepChange (val: number, oldVal: number): void {
    
    let options: {} = this.options || {}
    this.handleInitialize()
    let rowIndex: { key: string, name: string } = this.rowIndex
    let rows: Array<{}> = this.chartData.rows
    for (let item of this.data) {
      for (let e of item.data) {
        let rowItem: any = rows.find( o => o[rowIndex.key] === e[rowIndex.name])
        if (rowItem) {
          rowItem[item.title] = e[options['prop'] || 'person']
        }
      }
    }
    this.chartData.rows = rows
  }

  handleInitialize () {
    let rows: Array<{}> = []
    for (let item of <Array<channel.ColumnItem>> this.$props.columns) {
      this.$data.rowIndex = { key: item.key, name: item.name }
      if (item['default']) {
        let { begin, end, step } = item['default']
        for (let i: number = begin; i <= end; i = i + this.step) {
          if (item.format) {
            let func: string = item.format.function || ''
            let opts: string[] = item.format.options
            rows.push({ [item.key]: utils[func](i, ...opts) })
          }
          else {
            rows.push({ [item.key]: i })
          }
        }
        let _row: {} = last(rows) || {}
        if (item.format) {
          let func: string = item.format.function || ''
          let opts: string[] = item.format.options
          if (_row[item.key] != utils[func](end, ...opts)) {
            rows.push({ [item.key]: utils[func](end, ...opts) })
          }
        }
        else {
          if (_row[item.key] != end) {
            rows.push({ [item.key]: end })
          }
        }
      }
      break
    }
    this.$data.chartData.rows = clone(rows)
  }
  
}
</script>