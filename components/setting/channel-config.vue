<template>
  <div class="form-container">
    <h2>频道配置 -- {{ data && data.name }}</h2>
      
        <section class="container">
          <no-ssr placeholder="Codemirror Loading...">
            <codemirror v-model="code" style="height: 500px"
                        :options="cmOption"
                        @cursorActivity="onCmCursorActivity"
                        @ready="onCmReady"
                        @focus="onCmFocus"
                        @blur="onCmBlur">
            </codemirror>
          </no-ssr>
        </section>
    <el-form ref="theForm"  @submit.native.prevent="submitForm" >
      <el-form-item >
        <el-button type="primary" native-type="submit" :loading="loading">提 交</el-button>
        <el-button type="success" @click="handleBack">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { Route } from 'vue-router'
import Component from 'nuxt-class-component'
import { Prop, Provide, Vue } from 'vue-property-decorator'
import { Form as ElForm } from 'element-ui'
import { responseDocument as responseGroupDocument } from '~/server/types/proxys/group'
import channel from '~/server/types/channel'
import { PBSetting } from 'kenote-socket-helper'
import { Ucenter } from '~/types'
import { Rules } from '~/types/validate'
import { clone } from 'lodash'
import * as ymal from 'yaml'
import 'codemirror/theme/duotone-light.css'

const values: any = {
  id: 1000,
  name: undefined,
  description: undefined,
  default: undefined
}

const rules: Rules = {
  name: [
    { required: true, message: '请输入频道名称' },
  ],
  default: [
    { required: true, message: '请输入频道入口' },
  ],
}

@Component({
  name: 'setting-channel-config',
  mounted () {
    this.$data.values = clone(values)
    let { proto, rstp, options } = this.$props.data
    let _values = getValues(this.$props.data, ['proto', 'rstp', 'options'])
    let yamlString = ymal.stringify(_values)
    this.$data.code = yamlString
  }
})
export default class  extends Vue {

  @Prop({ default: false }) loading: boolean
  @Prop({ default: {} }) data: channel.NavMenus | {}

  @Provide() values: any = values
  @Provide() rules: Rules = rules
  @Provide() proto: PBSetting | {} = {}
  @Provide() code: string = ''

  @Provide() cmOption: any = {
    tabSize: 4,
    foldGutter: true,
    styleActiveLine: true,
    lineNumbers: true,
    line: true,
    keyMap: "sublime",
    mode: 'text/x-sass',
    theme: 'duotone-light',
    extraKeys: {
      'F11'(cm) {
        cm.setOption("fullScreen", !cm.getOption("fullScreen"))
      },
      'Esc'(cm) {
        if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false)
      }
    }
  }

  submitForm (): void {
    let theForm: ElForm = <ElForm> this.$refs['theForm']
    theForm.validate((valid: any): void | false => {
      if (valid) {
        this.$emit('submit', this.values)
      }
      else {
        return false
      }
    })
  }

  handleBack (): void {
    this.$emit('goback', null)
  }

  onCmCursorActivity(codemirror) {
    console.log('onCmCursorActivity', codemirror)
  }
  onCmReady(codemirror) {
    console.log('onCmReady', codemirror)
  }
  onCmFocus(codemirror) {
    console.log('onCmFocus', codemirror)
  }
  onCmBlur(codemirror) {
    console.log('onCmBlur', codemirror)
  }
  
}

function getValues (data: {}, keys: string[]) {
  let _values = {}
  let _data = data || {}
  for (let key of keys) {
    if (_data[key] && keys.indexOf(key) > -1) _values[key] = _data[key]
  }
  return _values
}
</script>

<style lang="scss" >
.form-container .container {
  margin-top: 30px;

  .CodeMirror {
    height: 100%;
    border: 1px #999999 solid;
  }
}
</style>
