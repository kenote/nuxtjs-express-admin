<template>
  <div>
    <h3 style="margin-top: 30px;">注册帐号</h3>
    <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="submitForm">
      <el-form-item prop="username" :rules="rules.username">
        <el-input placeholder="请输入您的个人账号" v-model="values.username" />
      </el-form-item>
      <el-form-item prop="email" :rules="rules.email" >
        <el-input placeholder="请输入邮箱地址" v-model="values.email" />
      </el-form-item>
      <el-form-item prop="password" :rules="rules.password">
        <el-input type="password" placeholder="设置 8 - 20 位密码" v-model="values.password" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading">注 册</el-button>
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
import account from '~/server/types/account'
import { resufulInfo } from '~/utils/http'

const values: account.Register = {
  username: undefined,
  email: undefined,
  password: undefined
}

@Component({
  name: 'account-register',
  data () {
    let validateUsername = async (rule: any, value: any, callback: (message?: string) => any): Promise<(message?: string) => any> => {
      let valid: boolean = /^[a-zA-Z]{1}[a-zA-Z0-9\_\-]/.test(value)
      if (!valid) {
        return callback('英文字符开头，支持小写英文、数字、下划线和中划线组合')
      }
      if (value.length > 20 || value.length < 5) {
        return callback('账号名限定 5 - 20 位字符')
      }
      valid = await this.$props.unique('username', value)
      if (!valid) {
        return callback('该账号已注册')
      }
      return callback()
    }
    let validateEmail = async (rule: any, value: any, callback: (message?: string) => any): Promise<(message?: string) => any> => {
      let valid: boolean = await this.$props.unique('email', value)
      if (!valid) {
        return callback('该邮箱已注册')
      }
      return callback()
    }
    let validatePassword = (rule: any, value: any, callback: (message?: string) => any): (message?: string) => any => {
      let valid: boolean = /^(?=.*[A-Za-z])[A-Za-z0-9$@$!%*#?&]{8,20}$/.test(value)
      if (!valid) {
        return callback('密码支持 8 - 20 位的字母、数字和英文符号')
      }
      return callback()
    }
    let rules: Rules = {
      username: [
        { required: true, message: '请输入您的个人账号' },
        { validator: validateUsername, trigger: ['blur', 'change'] }
      ],
      email: [
        { required: true, message: '请输入邮箱地址' },
        { type: 'email', message: '请输入正确的邮箱地址，如 example@163.com', trigger: ['blur', 'change'] },
        { validator: validateEmail, trigger: ['blur', 'change'] }
      ],
      password: [
        { required: true, message: '请设置账号密码' },
        { validator: validatePassword, trigger: ['blur', 'change'] }
      ]
    }
    return { rules }
  }
})
export default class  extends Vue {

  @Prop({ default: (value?: account.Register) => {} }) submit: (value?: account.Register) => void
  @Prop({ default: false }) loading: boolean
  @Prop({ default: (type: 'username' | 'email', value: string) => {} }) unique: (type: 'username' | 'email', value: string) => resufulInfo

  @Provide() values: account.Register = values

  submitForm (): void {
    let theForm: ElForm = <ElForm> this.$refs['theForm']
    theForm.validate((valid: any): void | false => {
      if (valid) {
        this.submit(this.values)
      }
      else {
        return false
      }
    })
  }
}
</script>