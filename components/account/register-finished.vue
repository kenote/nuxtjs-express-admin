<template>
  <div>
    <h3 style="margin-top: 30px;">注册成功</h3>
    <h5>验证邮件已发送至您的注册邮箱</h5>
    <h5>{{ email.replace(/\w{4}@/g, '****@') }}</h5>
    <div class="content" style="text-align: center;">
      <p>请在 {{ timeout / 3600 }} 小时内进行邮箱验证</p>
      <p>您还可以操作，<nuxt-link to="/">登录后台</nuxt-link></p>
      <a class="el-button el-button--primary" :href="`https://mail.${email.replace(/^(\S+)\@/, '')}`" target="_blank">登录邮箱</a>
    </div>
    <div class="content">
      <p>没有收到邮件 ？</p>
      <ul>
        <li>登录后台，验证邮箱</li>
        <li>检查您的邮件垃圾箱、广告邮件等</li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import Component from 'nuxt-class-component'
import { Prop, Provide, Vue } from 'vue-property-decorator'

@Component({
  name: 'account-register-finished'
})
export default class  extends Vue {

  @Prop({ default: '' }) email: string
  @Prop({ default: 0 }) timeout: number
  
}
</script>