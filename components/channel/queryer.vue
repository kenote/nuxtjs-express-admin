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
          </el-checkbox-group>
          <ditch-picker v-else-if="item.type === 'ditch-picker'" 
            :fetch="item.fetch" 
            :ditch_group="options.ditch_group || []" 
            :token="token" 
            :value="values[item.key]" 
            @change="handleChangeDitch">
          </ditch-picker>
        </el-form-item>
      </template>
        <div class="footer">
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
import ditchPicker from './ditch-picker.vue'
import { omit, zipObject } from 'lodash'
//import '~/assets/scss/console/channel-queryer.scss'

@Component({
  name: 'channel-queryer',
  components: {
    ditchPicker
  },
  mounted () {
    let values: {} = {}
    let rules: Rules = {}
    let queryer: Array<channel.Queryer> = this.$props.queryer
    for (let item of queryer) {
      if (['range-picker', 'checkbox', 'ditch-picker'].indexOf(item.type) > -1) {
        let _default = (<Array<any>>item.default || []).map(o => o === 'now' ? new Date() : o)
        values[item.key] = _default
      }
      else {
        let _default = item.default === 'now' ? new Date() : item.default
        values[item.key] = _default || undefined
      }
      if (item.rules && item.type !== 'ditch-picker') {
        rules[item.key] = item.rules
      }
    }
    this.$data.values = values
    this.$data.rules = rules
  }
})
export default class  extends Vue {

  @Prop({ default: [] }) queryer: Array<channel.Queryer>
  @Prop({ default: {} }) options: channel.Options
  @Prop({ default: null }) token: string | null

  @Provide() values: {} = {}
  @Provide() rules: Rules = {}
  @Provide() loading: boolean = false

  handleChangeDitch (values: string[]): void {
    let obj: {} | undefined = this.queryer.find( o => o['type'] === 'ditch-picker')
    if (obj) {
      let _key: string = obj['key']
      this.values[_key] = values
    }
  }

  submitForm (): void {
    let theForm: ElForm = <ElForm> this.$refs['theForm']
    theForm.validate((valid: any): void | false => {
      if (valid) {
        //this.$emit('getlist', this.values)
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
        //console.log(this.values)
        let _values = omit(this.values, ['begin_end'])
        if (this.values['begin_end']) {
          _values = { ..._values, ...zipObject(['begin', 'end'], this.values['begin_end']) }
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
