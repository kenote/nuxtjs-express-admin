<template>
  <div class="search-container">
    <el-form ref="theForm" label-width="150px" :model="values" :rules="rules" @submit.native.prevent="submitForm">
      <template v-for="(item, key) in queryer" >
        <el-form-item :key="key" :label="item.name" :prop="item.key" :rules="rules[item.key]">
          <el-date-picker v-if="item.type === 'date-picker'"
            v-model="values[item.key]"
            size="small"
            placeholder="选择日期">
          </el-date-picker>
          <el-date-picker v-else-if="item.type === 'range-picker'"
            v-model="values[item.key]"
            size="small"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
          <el-checkbox-group v-else-if="item.type === 'checkbox'" v-model="values[item.key]">
            <template v-if="item.data">
              <el-checkbox v-for="(d, i) in item.data" :key="i" :label="d.key">{{ d.name }}</el-checkbox>
            </template>
            <template v-else-if="item.options">
              <el-checkbox v-for="(d, i) in options[item.options] || []" :key="i" :label="d.key">{{ d.name }}</el-checkbox>
            </template>
            <template v-else-if="item.fetch">
              <el-checkbox v-for="(d, i) in fetchData[item.key] || []" :key="i" :label="d.key">{{ d.name }}</el-checkbox>
            </template>
          </el-checkbox-group>
          <el-radio-group v-else-if="/^(radio)/.test(item.type)" v-model="values[item.key]" size="small">
            <template v-if="item.data">
              <template v-if="item.type === 'radio-button'">
                <el-radio-button v-for="(d, i) in item.data" :key="i" :label="d.key">{{ d.name }}</el-radio-button>
              </template>
              <template v-else>
                <el-radio v-for="(d, i) in item.data" :key="i" :label="d.key">{{ d.name }}</el-radio>
              </template>
            </template>
            <template v-else-if="item.options">
              <template v-if="item.type === 'radio-button'">
                <el-radio-button v-for="(d, i) in options[item.options] || []" :key="i" :label="d.key">{{ d.name }}</el-radio-button>
              </template>
              <template v-else>
                <el-radio v-for="(d, i) in options[item.options] || []" :key="i" :label="d.key">{{ d.name }}</el-radio>
              </template>
            </template>
            <template v-else-if="item.fetch">
              <template v-if="item.type === 'radio-button'">
                <el-radio-button v-for="(d, i) in fetchData[item.key] || []" :key="i" :label="d.key">{{ d.name }}</el-radio-button>
              </template>
              <template v-else>
                <el-radio v-for="(d, i) in fetchData[item.key] || []" :key="i" :label="d.key">{{ d.name }}</el-radio>
              </template>
            </template>
          </el-radio-group>
          <ditch-picker v-else-if="item.type === 'ditch-picker'" 
            :fetch="item.fetch" 
            :token="token" 
            :channel="channel"
            :value="values[item.key]" 
            @ditchs="handleGetDitchs"
            @change="handleChangeDitch">
          </ditch-picker>
          <el-select v-else-if="item.type === 'select'" v-model="values[item.key]" :multiple="item.multiple" filterable collapse-tags style="min-width: 230px">
            <template v-if="item.data">
              <el-option v-for="(d, i) in item.data" :key="i" :label="d.name" :value="d.key"></el-option>
            </template>
            <template v-else-if="item.options">
              <el-option v-for="(d, i) in options[item.options] || []" :key="i" :label="d.name" :value="d.key"></el-option>
            </template>
            <template v-else-if="item.fetch">
              <el-option v-for="(d, i) in fetchData[item.key] || []" :key="i" :label="d.name" :value="d.key"></el-option>
            </template>
          </el-select>
          <el-input v-else :placeholder="item.placeholder" v-model="values[item.key]" size="small" style="width: 220px" />
        </el-form-item>
      </template>
      <div class="footer" style="padding-left: 0; margin-left: 0">
        <el-form-item >
          <el-button type="primary" native-type="submit" :loading="loading">开始查询</el-button>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script lang="ts">
import Component from 'nuxt-class-component'
import { Prop, Provide, Vue } from 'vue-property-decorator'
import { Form as ElForm } from 'element-ui'
import { Rules } from '~/types/validate'
import channel from '~/server/types/channel'
import { responseDocument as responseDitchDocument } from '~/server/types/proxys/ditch'
import ditchPicker from './ditch-picker.vue'
import { omit, zipObject, has } from 'lodash'
import http, { resufulInfo } from '~/utils/http'
import { HeaderOptions } from '~/server/types/resuful'
import { formatDefaultValue } from '~/utils'

@Component({
  name: 'channel-queryer',
  components: {
    ditchPicker
  },
  async created () {
    let values: {} = {}
    let rules: Rules = {}
    let queryer: Array<channel.Queryer> = this.$props.queryer
    for (let item of queryer) {
      if (['radio-button', 'checkbox', 'radio', 'select'].indexOf(item.type) > -1 && item.fetch) {
        await this.handleFetchData(item)
      }
      if (['range-picker', 'checkbox', 'ditch-picker'].indexOf(item.type) > -1) {
        let _default = (<Array<any>>item.default || []).map( o => formatDefaultValue(o) )
        values[item.key] = _default
      }
      else {
        let _default = formatDefaultValue(item.default)
        values[item.key] = _default || undefined
      }
      if (item.rules && item.type !== 'ditch-picker') {
        rules[item.key] = item.rules
      }
    }
    this.$data.values = values
    this.$data.rules = rules
  },
  async mounted () {
    this.$props.autoSubmit && this.submitForm()
  }
})
export default class  extends Vue {

  @Prop({ default: [] }) queryer: Array<channel.Queryer>
  @Prop({ default: {} }) options: channel.Options
  @Prop({ default: null }) token: string | null
  @Prop({ default: false }) autoSubmit: boolean
  @Prop({ default: '' }) channel: string

  @Provide() values: {} = {}
  @Provide() rules: Rules = {}
  @Provide() loading: boolean = false
  @Provide() ditchs: Array<responseDitchDocument> = []
  @Provide() fetchData: { [propsName: string]: Array<{ key: string, name: string }> } = {}

  async handleFetchData (item: channel.Queryer): Promise<void> {
    try {
      let options: HeaderOptions = {
        token: this.token || undefined
      }
      let result: resufulInfo = await http.get(item.fetch || '', {}, options)
      this.loading = false
      if (result.Status.code === 0) {
        this.fetchData[item.key] = result.data
        return
      }
      this.$message.warning(result.Status.message || '')
    } catch (error) {
      this.loading = false
      this.$message.warning(error.message)
    }
  }

  handleChangeDitch (values: string[]): void {
    let obj: {} | undefined = this.queryer.find( o => o['type'] === 'ditch-picker')
    if (obj) {
      let _key: string = obj['key']
      this.values[_key] = values
    }
  }

  handleGetDitchs (values: Array<responseDitchDocument>) {
    this.ditchs = values
  }

  submitForm (): void {
    let theForm: ElForm = <ElForm> this.$refs['theForm']
    theForm.validate((valid: any): void | false => {
      if (valid) {
        console.log(this.values)
        let obj: channel.Queryer | undefined = this.queryer.find( o => o['type'] === 'ditch-picker')
        if (obj && obj.required) {
          let _key: string = obj.key
          if (this.values[_key].length === 0) {
            this.$message({
              message: '请选择渠道！！！',
              type: 'warning'
            })
            return
          }
        }
        let _values = omit(this.values, ['begin_end'])
        if (this.values['begin_end']) {
          _values = { ..._values, ...zipObject(['begin', 'end'], this.values['begin_end']) }
        }
        if (this.values['roleId']) {
          let _queryer: channel.Queryer = <channel.Queryer> this.queryer.find( o => !!o.cardinal )
          if (_queryer && _queryer.cardinal) {
            _values['roleId'] = this.values['roleId'].map( n => {
              let _ditch: responseDitchDocument | undefined = this.ditchs.find( o => o.label === n )
              if (has(_ditch, `cardinal_number.${_queryer.cardinal}`)) {
                return `${n}:${_ditch && _ditch.cardinal_number[_queryer.cardinal || '']}`
              }
              return `${n}:1`
            })
          }
        }
        this.$emit('submit', _values)
      }
      else {
        return false
      }
    })
  }
}
</script>
