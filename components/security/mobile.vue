<template>
  <div class="security-container">
    <el-steps :active="stepActive" finish-status="success" align-center>
      <el-step title="验证身份"></el-step>
      <el-step title="设置手机"></el-step>
      <el-step title="完成"></el-step>
    </el-steps>
    <div v-if="stepActive === 1" class="main-content">
      <el-form ref="theForm" label-width="150px" :model="values" :rules="rules" @submit.native.prevent="submitForm">
        <el-form-item ref="mobile" prop="mobile" :rules="rules.mobile" label="手机号码">
          <el-input placeholder="请输入手机号码" v-model="values.mobile" style="width:300px;" />
        </el-form-item>
        <el-form-item prop="code" :rules="rules.code" label="验证码" style="margin-bottom: 42px;">
          <el-input placeholder="请输入验证码" v-model="values.code" style="width:200px;" />
          <el-button v-if="times === 0" @click="handleSendMobile">发送验证码</el-button>
          <el-button v-else disabled>({{ times }} 秒后)重新发送</el-button>
        </el-form-item>
        <el-form-item >
          <el-button type="primary" native-type="submit" :loading="loading">确 定</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div v-if="stepActive === 3" class="main-content">
      <div class="result">
        <i class="el-icon-success" />
        <h2>手机设置成功</h2>
        <p>结果已经提交到服务器，并且已经生效。</p>
      </div>
    </div>
    <security-verify v-else-if="stepActive === 0"
      :user="user" 
      @verify="handleVerify" 
      @send="handleSend"
      :step="step"
      :timeout="timeout"
      :times="times"
      :loading="loading"
      />
    <div class="close_content">
      <i class="el-icon-close" @click="handleClose" />
    </div>
  </div>
</template>

<script lang="ts">
import { Route } from 'vue-router'
import Component from 'nuxt-class-component'
import { Prop, Provide, Vue } from 'vue-property-decorator'
import { Form as ElForm, FormItem as ElFormItem } from 'element-ui'
import securityVerify from './verify.vue'
import { responseDocument as responseUserDocument } from '~/server/types/proxys/user'
import { Security } from '~/types'
import { Rules } from '~/types/validate'
import { resufulInfo } from '~/utils/http'
import { isMobilePhone } from 'validator'

const values: Security.setMobile = {
  mobile: undefined,
  code: undefined
}

@Component({
  name: 'security-mobile',
  components: {
    securityVerify
  },
  data () {
    let validateMobile = async (rule: any, value: any, callback: (message?: string) => any): Promise<(message?: string) => any> => {
      let valid: boolean = isMobilePhone(value, 'zh-CN')
      if (!valid) {
        return callback('请输入正确的手机号码，且不可使用虚拟手机号码')
      }
      valid = await this.$props.unique('mobile', value)
      if (!valid) {
        return callback('该手机已绑定其他帐号')
      }
      return callback()
    }
    const rules: Rules = {
      mobile: [
        { required: true, message: '请输入手机号码' },
        { validator: validateMobile, trigger: ['blur', 'change'] }
      ],
      code: [
        { required: true, message: '请输入验证码' }
      ]
    }
    return { rules }
  },
  mounted () {
    this.$data.values = { mobile: undefined, code: undefined }
  },
  watch: {
    active (active: number): void {
      this.$data.stepActive = active
    }
  }
})
export default class  extends Vue {

  @Prop({ default: null }) user: responseUserDocument | null
  @Prop({ default: 3600 }) timeout: number
  @Prop({ default: 60 }) step: number
  @Prop({ default: 0 }) active: number
  @Prop({ default: 0 }) times: number
  @Prop({ default: false }) loading: boolean
  @Prop({ default: (type: 'username' | 'email' | 'mobile', value: string) => {} }) unique: (type: 'username' | 'email' | 'mobile', value: string) => resufulInfo
  @Provide() stepActive: number = 0
  @Provide() values: Security.setMobile = values

  handleClose (): void {
    this.$emit('close', null)
  }

  handleVerify (verify: Security.verifyCode): void {
    this.$emit('verifycode', verify)
  }

  handleSend (data: Security.sendCode): void {
    this.$emit('sendcode', data)
  }

  handleSendMobile (): void {
    let emailItem: ElFormItem = <ElFormItem> this.$refs['mobile']
    if (emailItem.$el.className.indexOf('is-success') === -1) return
    let data: Security.sendCode = { type: 'mobile', name: this.values.mobile }
    this.$emit('sendcode', data)
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

}
</script>