<template>
  <div>
    <el-row :gutter="20" v-loading="loading">
      <el-col :span="8" v-for="(col, key) in data" :key="key">
        <el-card v-if="options && options.type === 'user-info'">
          <div slot="header" class="clearfix">
            <span>{{ col.name }}</span>
            <result-card-edit 
              :column="columns.find( o => o.key === col.name )" 
              :iscancel="emititem.key === 'edit' && edited == col.name"
              @uemit="handleUemit"
              style="float: right;">

            </result-card-edit>
          </div>
          <div style="min-height: 50px">
            <div v-if="emititem.key === 'edit' && edited == col.name">
              <result-card-form :uemit="emititem" :value="col.value" @submit="handleSubmitEdit">
                
                
              </result-card-form>
            </div>
            <el-button v-else-if="/^(\{)/.test(col.value)" 
              size="small" 
              type="success" plain 
              @click="handleDialogData(col.name, col.value)">点击查看</el-button>
            <span v-else style="font-size:23px;font-weigth:500;">{{ formatString(col.value, columns.find( o => o.key === col.name )) }}</span>
          </div>
        </el-card>
        <el-card v-else>
          <div slot="header" class="clearfix">
            <span>{{ col.title }}</span>
          </div>
          <el-form label-width="100px" label-position="left" label-suffix=" ：">
            <el-form-item v-for="(c, k) in columns" :key="k" :label="c.name">
              <span>{{ col.data[c.key] }}</span>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
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
import channel, { EmitItem } from '~/server/types/channel'
import { chunk, clone } from 'lodash'
import 'codemirror/theme/duotone-light.css'
import resultCardEdit from './result-card-edit.vue'
import resultCardForm from './result-card-form.vue'

interface Edited {
  key: string,
  emit: EmitItem
}

@Component({
  name: 'channel-result-cards',
  components: {
    resultCardEdit,
    resultCardForm
  },
  mounted () {
    //this.$data.edited = undefined
  },

})
export default class  extends Vue {

  @Prop({ default: [] }) data: Array<{ name: string, value: string }>
  @Prop({ default: false }) loading: boolean
  @Prop({ default: [] }) columns: Array<channel.ColumnItem>
  //@Prop({ default: 'default' }) type: 'default' | 'user-info'
  @Prop({ default: undefined }) options: channel.Cards
  
  @Provide() edited: string = ''
  @Provide() emititem: channel.EmitItem = { key: '', name: '' }
  //@Provide() pdata: Array<{}> = []
  @Provide() showSubmit: boolean = false
  @Provide() dialog: { title?: string, data?: string, visible: boolean } = { visible: false }

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
    this.edited = ''
    this.emititem = { key: '', name: '' }
    setTimeout(() => {
      this.showSubmit = val.length > 0
    }, 1500)
  }

  async handleUemit (uemit: channel.EmitItem, key: string): Promise<void> {
    if (key === this.edited) {
      this.edited = ''
      this.emititem = { key: '', name: '' }
      return
    }
    this.edited = key
    this.emititem = uemit
    if (uemit.key != 'edit') {
      this.$message(uemit.name)
    }
  }

  async handleSubmitEdit (values: any, api: string): Promise<void> {
    let { key, param } = this.options.emit || { key: '用户id', param: 'roleId' }
    let obj: { name: string, value: string } = <{ name: string, value: string }> this.data.find( o => o.name === key ) 
    let _values: {} = {
      ...values,
      [param]: obj.value
    }
    console.log(_values, api, )
  }

  formatString (value: string | number, column?: channel.ColumnItem): string {
    if (!column) return String(value)
    let { format } = column
    if (!format) return String(value)
    if (format.regexp) {
      return String(value).replace(format.regexp, format.substr || '')
    }
    if (format.function) {
      let _value: string | number = format.type === 'number' ? Number(String(value).replace(/[^0-9\.]/g, '')) : String(value)
      return (format.prefix || '') + _value[format.function](...format.options) + (format.suffix || '')
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

<style lang="scss">
  .el-row {
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .el-col {
    border-radius: 4px;
    margin-bottom: 20px;
  }
  .bg-purple-dark {
    background: #99a9bf;
  }
  .bg-purple {
    background: #d3dce6;
  }
  .bg-purple-light {
    background: #e5e9f2;
  }
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
  .row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
  }
</style>
