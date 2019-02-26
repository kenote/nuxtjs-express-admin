<template>
  <div>
    <h3 style="margin-top: 30px;">找回密码</h3>
    <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="submitForm">
      <slot name="info"></slot>
      <el-form-item prop="code" :rules="rules.code">
        <el-input placeholder="请输入验证码" v-model="values.code" />
      </el-form-item>
      <el-form-item prop="password" :rules="rules.password">
        <el-input type="password" placeholder="设置 8 - 20 位密码" v-model="values.password" />
      </el-form-item>
      <el-form-item prop="repassword" :rules="rules.repassword">
        <el-input type="password" placeholder="请确认新密码" v-model="values.repassword" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading">重置密码</el-button>
      </el-form-item>
      <slot></slot>
    </el-form>
  </div>
</template>

<script lang="ts">
import Component from 'nuxt-class-component'
import { Prop, Provide, Vue } from 'vue-property-decorator'
import { Form as ElForm } from 'element-ui'
import { Rules } from '~/types/validate'
import { pick } from 'lodash'

interface Values {
  code?: string
  password?: string
  repassword?: string
}

const values: Values = {
  code: undefined,
  password: undefined,
  repassword: undefined
}


@Component({
  name: 'account-lostpass-form',
  data () {
    let validatePassword = (rule: any, value: any, callback: (message?: string) => any): (message?: string) => any => {
      let valid: boolean = /^(?=.*[A-Za-z])[A-Za-z0-9$@$!%*#?&]{8,20}$/.test(value)
      if (!valid) {
        return callback('密码支持 8 - 20 位的字母、数字和英文符号')
      }
      return callback()
    }
    let validaterRepassword = (rule: any, value: any, callback: (message?: string) => any): (message?: string) => any => {
      let valid: boolean = this.$data.values.password == value
      if (!valid) {
        return callback('两次输入的密码不一致')
      }
      return callback()
    }
    let rules: Rules = {
      code: [
        { required: true, message: '请输入验证码' }
      ],
      password: [
        { required: true, message: '请设置新密码' },
        { validator: validatePassword, trigger: ['blur', 'change'] }
      ],
      repassword: [
        { required: true, message: '请确认新密码' },
        { validator: validaterRepassword, trigger: ['blur', 'change'] }
      ]
    }
    return { rules }
  }
})
export default class  extends Vue {

  @Prop({ default: (value?: Values) => {} }) submit: (value?: Values) => void
  @Prop({ default: false }) loading: boolean

  @Provide() values: Values = values

  submitForm (): void {
    let theForm: ElForm = <ElForm> this.$refs['theForm']
    theForm.validate((valid: any): void | false => {
      if (valid) {
        this.submit(pick(this.values, ['code', 'password']))
      }
      else {
        return false
      }
    })
  }
}
</script>