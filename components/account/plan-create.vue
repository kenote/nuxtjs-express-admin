<template>
  <div class="form-container">
    <h2>添加方案</h2>
    <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="submitForm" label-width="150px">
      <el-form-item prop="name" :rules="rules.name" label="方案名称">
        <el-input placeholder="请输入方案名称" v-model="values.name" style="width:300px;" />
      </el-form-item>
      <el-form-item prop="type" :rules="rules.type" label="方案类型">
        <el-select v-model="values.type" placeholder="请选择类型" filterable >
          <el-option v-for="item in plan_type" :key="item.key" :label="item.name" :value="item.key"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="针对频道">
        <el-select v-model="values.channel" placeholder="请选择频道" filterable >
          <el-option label="无" value=""></el-option>
          <el-option v-for="item in platforms.filter( o => o.id > 1000 )" :key="item.id" :label="item.name" :value="item.label"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="plan" :rules="rules.plan" label="方案详情">
        <section class="container">
          <no-ssr placeholder="Codemirror Loading...">
            <codemirror v-model="values.plan" style="height: 300px"
                        :options="cmOption"
                        @cursorActivity="onCmCursorActivity"
                        @ready="onCmReady"
                        @focus="onCmFocus"
                        @blur="onCmBlur">
            </codemirror>
          </no-ssr>
        </section>
      </el-form-item>
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
import { createDocument as createPlanDocument } from '~/server/types/proxys/plan'
import channel from '~/server/types/channel'
import { Rules } from '~/types/validate'
import { clone } from 'lodash'
import 'codemirror/theme/duotone-light.css'

const values: createPlanDocument = {
  name: '',
  type: '',
  plan: '',
  channel: ''
}

const rules: Rules = {
  name: [
    { required: true, message: '请输入方案名称' },
  ],
  type: [
    { required: true, message: '请选择方案类型' },
  ],
  plan: [
    { required: true, message: '请填写方案详情' },
  ],
}

@Component({
  name: 'account-plan-create',
  mounted () {
    this.$data.values = clone(values)
  }
})
export default class  extends Vue {

  @Prop({ default: false }) loading: boolean
  @Prop({ default: [] }) plan_type: Array<{}>
  @Prop({ default: [] }) platforms: Array<channel.NavMenus>

  @Provide() values: createPlanDocument = values
  @Provide() rules: Rules = rules
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

</script>

<style lang="scss" >
.form-container .container {
  margin-top: 0;
  line-height: 24px;

  .CodeMirror {
    height: 100%;
    border: 1px #999999 solid;
  }
}
</style>