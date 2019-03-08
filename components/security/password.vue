<template>
  <div class="security-container">
    <el-steps :active="stepActive" finish-status="success" align-center>
      <el-step title="验证身份"></el-step>
      <el-step title="修改密码"></el-step>
      <el-step title="完成"></el-step>
    </el-steps>
    <div v-if="stepActive === 1" class="main-content">
      <el-form ref="theForm" label-width="150px" :model="values" :rules="rules" @submit.native.prevent="submitForm">
        <el-form-item prop="password" :rules="rules.password" label="新密码">
          <el-input placeholder="请输入新密码" type="password" v-model="values.password" style="width:300px;" />
        </el-form-item>
        <el-form-item prop="repassed" :rules="rules.repassed" label="确认新密码">
          <el-input placeholder="请确认新密码" type="password" v-model="values.repassed" style="width:300px;" />
        </el-form-item>
        <el-form-item >
          <el-button type="primary" native-type="submit" :loading="loading">确 定</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div v-else-if="stepActive === 3" class="main-content">
      <div class="result">
        <i class="el-icon-success" />
        <h2>密码修改成功</h2>
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
import { Form as ElForm } from 'element-ui'
import securityVerify from './verify.vue'
import { responseDocument as responseUserDocument } from '~/server/types/proxys/user'
import { Security } from '~/types'
import { Rules } from '~/types/validate'

interface Values {
  password ?: string
  repassed ?: string
}

const values: Values = {
  password: undefined,
  repassed: undefined
}

@Component({
  name: 'security-password',
  components: {
    securityVerify
  },
  data () {
    let validatePassword = (rule: any, value: any, callback: (message?: string) => any): (message?: string) => any => {
      let valid: boolean = /^(?=.*[A-Za-z])[A-Za-z0-9$@$!%*#?&]{8,20}$/.test(value)
      if (!valid) {
        return callback('密码支持 8 - 20 位的字母、数字和英文符号')
      }
      return callback()
    }
    let validateRepassed = (rule: any, value: any, callback: (message?: string) => any): (message?: string) => any => {
      let valid: boolean = this.$data.values.password == value
      if (!valid) {
        return callback('两次输入的密码不一致')
      }
      return callback()
    }
    let rules: Rules = {
      password: [
        { required: true, message: '请设置新密码' },
        { validator: validatePassword, trigger: ['blur', 'change'] }
      ],
      repassed: [
        { required: true, message: '请确认新密码' },
        { validator: validateRepassed, trigger: ['blur', 'change'] }
      ]
    }
    return { rules }
  },
  mounted () {
    this.$data.values = { password: undefined, repassed: undefined }
  },
  watch: {
    active (active: number): void {
      this.$data.stepActive = active
    }
  }
})
export default class  extends Vue {

  @Prop({ default: null }) user: responseUserDocument | null
  @Prop({ default: 900 }) timeout: number
  @Prop({ default: 60 }) step: number
  @Prop({ default: 0 }) active: number
  @Prop({ default: 0 }) times: number
  @Prop({ default: false }) loading: boolean
  @Provide() stepActive: number = 0
  @Provide() values: Values = values

  handleClose (): void {
    this.$emit('close', null)
  }

  handleVerify (verify: Security.verifyCode): void {
    this.$emit('verifycode', verify)
  }

  handleSend (data: Security.sendCode): void {
    this.$emit('sendcode', data)
  }

  submitForm (): void {
    let theForm: ElForm = <ElForm> this.$refs['theForm']
    theForm.validate((valid: any): void | false => {
      if (valid) {
        this.$emit('submit', { password: this.values.password })
      }
      else {
        return false
      }
    })
  }

}
</script>