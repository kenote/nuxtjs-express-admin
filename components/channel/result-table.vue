<template>
  <div>
    <el-table ref="filterTable" :data="pdata && pdata.filter(doc => !search || doc[searchOptions && searchOptions.field].toLowerCase().includes(search.toLowerCase()))" v-loading="loading" stripe>
      <el-table-column v-for="(column, key) in columns" 
        :key="key" 
        :label="column.name" 
        :prop="column.key" 
        :fixed="column.fixed" 
        :width="column.width" 
        :min-width="column.minwidth || 100" 
        :align="column.align || 'center'" >
        <template slot="header" slot-scope="scope">
          <el-input v-if="column.key === (searchOptions && searchOptions.field) && !pagination"
            :key="scope.$index"
            v-model="search"
            size="small"
            :placeholder="`输入${column.name}搜索`"/>
          <span v-else>{{ column.name }}</span>
        </template>
        <template slot-scope="scope">
          <span v-if="column.format">{{ formatString(scope.row[column.key], column.format) }}</span>
          <el-button v-else-if="/^(\{)/.test(scope.row[column.key])" 
            size="small" 
            type="success" plain 
            @click="handleDialogData(column.name, scope.row[column.key])">点击查看</el-button>
          <span v-else>{{ scope.row[column.key] }}</span>
        </template>
      </el-table-column>
    </el-table>
    
    <el-pagination v-if="total > pagesize && pagination"
      background
      @current-change="handleCurrentChange"
      :current-page="current || 1"
      :page-size="pagesize"
      layout="total, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    <div class="baseinfo" >
      <div class="submit-box" v-bind:class="showSubmit ? 'is-show' : ''">
        <slot></slot>
      </div>
    </div>

    <el-dialog v-if="dialog.visible" :title="dialog.title" :visible="dialog.visible" @close="handleDialogColse">
      <section class="dialog_container">
        <no-ssr placeholder="Codemirror Loading...">
          <codemirror v-model="dialog.data" style="height: 300px"
                      :options="cmOption">
          </codemirror>
        </no-ssr>
      </section>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Route } from 'vue-router'
import Component from 'nuxt-class-component'
import { Prop, Provide, Vue, Watch } from 'vue-property-decorator'
import { Table as ElTable } from 'element-ui'
import channel from '~/server/types/channel'
import { chunk } from 'lodash'
import 'codemirror/theme/duotone-light.css'

@Component({
  name: 'channel-result-table',
  mounted () {
    
  },

})
export default class  extends Vue {

  @Prop({ default: [] }) data: Array<{}>
  @Prop({ default: false }) loading: boolean
  @Prop({ default: [] }) columns: Array<channel.ColumnItem>
  @Prop({ default: 10 }) pagesize: number
  @Prop({ default: true }) pagination: boolean
  @Prop({ default: undefined }) searchOptions: channel.Search

  @Provide() current: number = 1
  @Provide() total: number = 0
  @Provide() pdata: Array<{}> = []
  @Provide() showSubmit: boolean = false
  @Provide() dialog: { title?: string, data?: string, visible: boolean } = { visible: false }
  @Provide() search: string = ''

  @Provide() cmOption: any = {
    tabSize: 4,
    foldGutter: true,
    styleActiveLine: true,
    lineNumbers: true,
    line: true,
    keyMap: "sublime",
    mode: 'text/x-sass',
    theme: 'duotone-light',
    readOnly: true,
    extraKeys: {
      'F11'(cm) {
        cm.setOption("fullScreen", !cm.getOption("fullScreen"))
      },
      'Esc'(cm) {
        if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false)
      }
    }
  }

  @Watch('data')
  onDataChange (val: Array<{}>, oldVal: Array<{}>): void {
    this.total = val.length
    this.current = 1
    this.handleCurrentChange(1)
    setTimeout(() => {
      this.showSubmit = val.length > 0
    }, 1500)
  }

  @Watch('pagination')
  onPaginationChange (val: boolean): void {
    this.current = 1
    if (val) this.search = ''
    this.handleCurrentChange(1)
  }

  handleCurrentChange (page: number): void {
    if (this.pagination) {
      this.pdata = chunk(this.data, this.pagesize)[page-1]
    }
    else {
      this.pdata = this.data
    }
  }

  formatString (value: string | number, fmt: channel.Format): string {
    if (fmt.regexp) {
      return String(value).replace(fmt.regexp, fmt.substr || '')
    }
    if (fmt.function) {
      let _value: string | number = fmt.type === 'number' ? Number(String(value).replace(/[^0-9\.]/g, '')) : String(value)
      return (fmt.prefix || '') + _value[fmt.function](...fmt.options) + (fmt.suffix || '')
    }
    return String(value)
  }

  handleDialogData (title: string, data: string): void {
    this.dialog = { title, data: this.parseData(data), visible: true }
  }

  handleDialogColse (): void {
    this.dialog = { title: undefined, data: undefined, visible: false }
  }

  parseData (value: string | undefined) {
    let _value: string = (value || '').replace(/(\{|\})/g, '')

    return _value.replace(/\,/g, '\n').replace(/\:/g, ': ').replace(/\#/g, '\n\n# ')
  }
  
}
</script>

<style lang="scss" >
.dialog_container {
  .CodeMirror {
    height: 100%;
    border: 1px #999999 solid;
  }
}
</style>