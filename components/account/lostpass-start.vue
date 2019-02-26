<template>
  <div>
    <h3 style="margin-top: 30px;">找回密码</h3>
    <el-form>
      <el-radio-group v-model="values.type" @change="handleChangeType">
        <el-radio label="mobile">通过手机号</el-radio>
        <el-radio label="email">通过邮箱</el-radio>
      </el-radio-group>
    </el-form>
    <el-form class="lostpass-start" v-if="values.type === 'mobile'" ref="mobile" :model="values.mobile" :rules="rules.mobile"  @submit.native.prevent="submitForm('mobile')">
      <el-form-item prop="name" :rules="rules.mobile.name" style="margin-bottom: 20px;">
        <el-input placeholder="请输入您的手机号码" v-model="values.mobile.name" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading">获取验证码</el-button>
      </el-form-item>
      <slot></slot>
    </el-form>
    <el-form class="lostpass-start" v-if="values.type === 'email'" ref="email" :model="values.email" :rules="rules.email" @submit.native.prevent="submitForm('email')">
      <el-form-item prop="name" :rules="rules.email.name" style="margin-bottom: 20px;">
        <el-input placeholder="请输入您的邮箱地址" v-model="values.email.name" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading">获取验证码</el-button>
      </el-form-item>
      <slot></slot>
    </el-form>
  </div>
</template>

<script lang="ts">
import Component from 'nuxt-class-component'
import { Prop, Provide, Vue } from 'vue-property-decorator'
import { Form as ElForm, FormItem as ElFormItem } from 'element-ui'
import { Rules, Rule } from '~/types/validate'
import account from '~/server/types/account'
import { pick } from 'lodash'
import { isMobilePhone } from 'validator'

type lostTypes = 'email' | 'mobile'

interface Values {
  type: lostTypes
  email: ValuesItem
  mobile: ValuesItem
}

interface ValuesItem {
  name: string
}

interface SubmitData {
  type: lostTypes
  name: string
}

interface __Rules {
  email: Rules
  mobile: Rules
}

const values: Values = {
  type: 'email',
  email: { name: '' },
  mobile: { name: '' }
}

const validateMobile = (rule: any, value: any, callback: (message?: string) => any): (message?: string) => any => {
  let valid: boolean = isMobilePhone(value, 'zh-CN')
  if (!valid) {
    return callback('请输入正确的手机号码，且不可使用虚拟手机号码')
  }
  return callback()
}

const rules: __Rules = {
  email: {
    name: [
      { required: true, message: '请输入邮箱地址' },
      { type: 'email', message: '请输入正确的邮箱地址，如 example@163.com', trigger: ['blur', 'change'] },
    ]
  },
  mobile: {
    name: [
      { required: true, message: '请输入手机号码' },
      { validator: validateMobile, trigger: ['blur', 'change'] }
    ]
  }
}

@Component({
  name: 'account-lostpass-start',
})
export default class  extends Vue {

  @Prop({ default: (value?: SubmitData) => {} }) submit: (value?: SubmitData) => void
  @Prop({ default: false }) loading: boolean

  @Provide() values: Values = values
  @Provide() rules: __Rules = rules

  handleChangeType (type: lostTypes) {
    let theForm: ElForm = <ElForm> this.$refs[type]
    theForm.resetFields()
    this.values[type].name = ''
  }

  submitForm (type: lostTypes): void {
    let theForm: ElForm = <ElForm> this.$refs[type]
    theForm.validate((valid: any): void | false => {
      if (valid) {
        this.submit({ type, name: this.values[type].name })
      }
      else {
        return false
      }
    })
  }
}

</script>

<style lang="scss" >
.account-page form.lostpass-start .el-form-item__error {
  position: absolute;
}
</style>
