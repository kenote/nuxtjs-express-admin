<template>
  <div class="form-container">
    <h2>添加方案</h2>
    <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="submitForm" label-width="150px">
      <el-form-item prop="name" :rules="rules.name" label="方案名称">
        <el-input placeholder="请输入方案名称" v-model="values.name" style="width:300px;" />
      </el-form-item>
      <el-form-item prop="type" :rules="rules.type" label="方案类型">
        <span>{{ getPlanTypeName(data.type) }}</span>
      </el-form-item>
      <el-form-item label="针对频道">
        {{ getChannelName(data.channel) }}
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
import { updateDocument as updatePlanDocument, responseDocument as responsePlanDocument } from '~/server/types/proxys/plan'
import channel from '~/server/types/channel'
import { Rules } from '~/types/validate'
import 'codemirror/theme/duotone-light.css'

const values: updatePlanDocument = {
  name: '',
  plan: '',
}

const rules: Rules = {
  name: [
    { required: true, message: '请输入方案名称' },
  ],
  plan: [
    { required: true, message: '请填写方案详情' },
  ],
}

@Component({
  name: 'account-plan-edit',
  mounted () {

    let doc: responsePlanDocument = this.$props.data
    if (!doc) return
    this.$data.values = {
      name: doc.name,
      plan: doc.plan,
    }
  }
})
export default class  extends Vue {

  @Prop({ default: false }) loading: boolean
  @Prop({ default: [] }) plan_type: Array<{}>
  @Prop({ default: [] }) platforms: Array<channel.NavMenus>
  @Prop({ default: null }) data: responsePlanDocument | null

  @Provide() values: updatePlanDocument = values
  @Provide() rules: Rules = rules
  @Provide() type_name: string = ''
  @Provide() channel_name: string = ''
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

  getPlanTypeName (value: string): string {
    let type: any = this.plan_type.find( o => o['key'] === value )
    return type ? type.name : '--'
  }

  getChannelName (value: string): string {
    let channel: channel.NavMenus | undefined = this.platforms.find( o => o.label === value )
    return channel ? channel.name : '--'
  }

  submitForm (): void {
    let theForm: ElForm = <ElForm> this.$refs['theForm']
    theForm.validate((valid: any): void | false => {
      if (valid) {
        this.$emit('submit', (<responsePlanDocument> this.data)._id, this.values)
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