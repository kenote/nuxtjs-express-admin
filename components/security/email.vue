<template>
  <div class="security-container">
    <el-steps :active="stepActive" finish-status="success" align-center>
      <el-step title="验证身份"></el-step>
      <el-step title="设置邮箱"></el-step>
      <el-step title="完成"></el-step>
    </el-steps>
    <div v-if="stepActive === 1" class="main-content">
      <el-form ref="theForm" label-width="150px" :model="values" :rules="rules" @submit.native.prevent="submitForm">
        <el-form-item ref="email" prop="email" :rules="rules.email" label="邮箱地址">
          <el-input placeholder="请输入邮箱地址" v-model="values.email" style="width:300px;" />
        </el-form-item>
        <el-form-item prop="code" :rules="rules.code" label="验证码" style="margin-bottom: 42px;">
          <el-input placeholder="请输入验证码" v-model="values.code" style="width:200px;" />
          <el-button v-if="times === 0" @click="handleSendEmail">发送验证码</el-button>
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
        <h2>邮箱设置成功</h2>
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

const values: Security.setEmail = {
  email: undefined,
  code: undefined
}

@Component({
  name: 'security-email',
  components: {
    securityVerify
  },
  data () {
    let validateEmail = async (rule: any, value: any, callback: (message?: string) => any): Promise<(message?: string) => any> => {
      let valid: boolean = await this.$props.unique('email', value)
      if (!valid) {
        return callback('该邮箱已绑定其他帐号')
      }
      return callback()
    }
    const rules: Rules = {
      email: [
        { required: true, message: '请输入邮箱地址' },
        { type: 'email', message: '请输入正确的邮箱地址，如 example@163.com', trigger: ['blur', 'change'] },
        { validator: validateEmail, trigger: ['blur', 'change'] }
      ],
      code: [
        { required: true, message: '请输入验证码' }
      ]
    }
    return { rules }
  },
  mounted () {
    this.$data.values = { email: undefined, code: undefined }
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
  @Provide() values: Security.setEmail = values

  handleClose (): void {
    this.$emit('close', null)
  }

  handleVerify (verify: Security.verifyCode): void {
    this.$emit('verifycode', verify)
  }

  handleSend (data: Security.sendCode): void {
    this.$emit('sendcode', data)
  }

  handleSendEmail (): void {
    let emailItem: ElFormItem = <ElFormItem> this.$refs['email']
    if (emailItem.$el.className.indexOf('is-success') === -1) return
    let data: Security.sendCode = { type: 'email', name: this.values.email }
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