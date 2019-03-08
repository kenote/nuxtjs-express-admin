<template>
  <div class="main-content">
    <p>{{ type === 'mobile' ? '手机' : '邮箱' }}验证码验证<span>账户 <b>{{ user && user.username }}</b> 为确认是你本人操作，请完成以下验证</span></p>
    <el-form ref="theForm" label-width="150px" :model="values" :rules="rules" @submit.native.prevent="submitForm">
      <el-form-item v-if="type === 'mobile'" label="手机号码">
        <span>{{ user && user.mobile && user.mobile.replace(/^(\d{3})\d+(\d{4})$/, '$1****$2') }}</span>
      </el-form-item>
      <el-form-item v-else label="电子邮箱">
        <span>{{ user && user.email.replace(/\w{4}@/g, '****@') }}</span>
      </el-form-item>
      <el-form-item prop="code" :rules="rules.code" label="验证码" style="margin-bottom: 42px;">
        <el-input placeholder="请输入验证码" v-model="values.code" style="width:200px;" />
        <el-button v-if="times === 0" @click="handleSend">发送验证码</el-button>
        <el-button v-else disabled>({{ times }} 秒后)重新发送</el-button>
      </el-form-item>
      <el-form-item >
        <el-button type="primary" native-type="submit" :loading="loading">下一步</el-button>
        <el-dropdown style="margin-left: 30px;" trigger="click" placement="bottom-start" @command="handleCommand">
          <span class="el-dropdown-link">
            验证方式<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="email">电子邮箱</el-dropdown-item>
            <el-dropdown-item command="mobile" :disabled="user && user.binds.indexOf('mobile') === -1">手机号码</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-form-item>
    </el-form>
    <div class="footer">
      <h2>获取验证码</h2>
      <p>1、验证码获取间隔为 {{ step }} 秒。</p>
      <p>2、验证码 {{ timeout / 60 }} 分钟内输入有效，验证码等同于密码，打死也不能告诉别人。</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Route } from 'vue-router'
import Component from 'nuxt-class-component'
import { Prop, Provide, Vue } from 'vue-property-decorator'
import { Form as ElForm } from 'element-ui'
import { Rules } from '~/types/validate'
import { responseDocument as responseUserDocument } from '~/server/types/proxys/user'

const values: any = {
  code: undefined
}

const rules: Rules = {
  code: [
    { required: true, message: '请输入验证码' }
  ]
}

@Component({
  name: 'security-verify',
  mounted () {
    this.$data.values = { code: undefined }
  }
})
export default class  extends Vue {

  @Prop({ default: null }) user: responseUserDocument | null
  @Prop({ default: 900 }) timeout: number
  @Prop({ default: 60 }) step: number
  @Prop({ default: 0 }) times: number
  @Prop({ default: false }) loading: boolean
  @Provide() type: 'email' | 'mobile' = 'email'
  @Provide() values: any = values
  @Provide() rules: Rules = rules

  handleCommand (value: 'email' | 'mobile'): void {
    if (value === this.type) return
    this.type = value
  }

  handleSend (): void {
    if (this.times > 0) return
    this.$emit('send', { type: this.type })
  }

  submitForm (): void {
    let theForm: ElForm = <ElForm> this.$refs['theForm']
    theForm.validate((valid: any): void | false => {
      if (valid) {
        this.$emit('verify', { ...this.values, type: this.type })
      }
      else {
        return false
      }
    })
    
  }
}
</script>