<template>
  <div class="form-container">
    <h2>配置《{{ channel.name }}》渠道基数</h2>
    <section class="container">
      <no-ssr placeholder="Codemirror Loading...">
        <codemirror v-model="values" style="height: 500px"
                    :options="cmOption"
                    @cursorActivity="onCmCursorActivity"
                    @ready="onCmReady"
                    @focus="onCmFocus"
                    @blur="onCmBlur">
        </codemirror>
      </no-ssr>
    </section>
    <el-form ref="theForm"  @submit.native.prevent="submitForm" label-width="150px">
      
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
import { responseDocument as responseTeamDocument } from '~/server/types/proxys/team'
import { updateDocument as updateDitchDocument, responseDocument as responseDitchDocument } from '~/server/types/proxys/ditch'
import channel from '~/server/types/channel'
import { Rules } from '~/types/validate'
import { clone, isObject, isArray } from 'lodash'
import * as ymal from 'js-yaml'

import 'codemirror/theme/duotone-light.css'

const values: updateDitchDocument = {
  label: undefined,
  name: undefined,
  group: undefined,
  teams: []
}

const validateLabel = async (rule: any, value: any, callback: (message?: string) => any): Promise<(message?: string) => any> => {
  let valid: boolean = /^[a-zA-Z0-9]+$/.test(value)
  if (!valid) {
    return callback('渠道标签只支持大小写英文字和数字')
  }
  return callback()
}

const rules: Rules = {
  label: [
    { required: true, message: '请输入渠道标签' },
    { validator: validateLabel, trigger: ['blur', 'change'] }
  ],
  name: [
    { required: true, message: '请输入渠道名称' },
  ],
  group: [
    { required: true, message: '请选择一个组' },
  ]
}

@Component({
  name: 'setting-ditch-cardinal',
  mounted () {
    let doc: responseDitchDocument | null = this.$props.data
    if (!doc) return
    this.$data.values = doc.cardinal_number && ymal.dump(doc.cardinal_number)
  }
})
export default class  extends Vue {

  @Prop({ default: false }) loading: boolean
  @Prop({ default: {} }) channel: channel.NavMenus
  @Prop({ default: null }) data: responseDitchDocument | null

  @Provide() values: string = ''

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
    let _values: any = {}
    try {
      _values = ymal.load(this.values)
    } catch (error) {
      _values = {}
    }
    if (isArray(_values) || !isObject(_values)) _values = {}
    this.$emit('submit', (<responseDitchDocument> this.data)._id, _values)
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