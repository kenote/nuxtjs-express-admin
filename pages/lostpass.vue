<template>
  <page v-if="status === 'start'">
    <account-lostpass-start class="landing-body" :submit="handleStart">
      <p class="service-terms">
        无法通过以上方式找回密码？ 请
        <a href="javascript:;">联系客服</a>
        <nuxt-link to="/login" class="ng-hide">立即登录</nuxt-link>
      </p>
    </account-lostpass-start>
  </page>
  <page v-else-if="status === 'submit'">
    <account-lostpass-form class="landing-body" :submit="handleSubmit" style="margin-top:0">
      <div slot="info" class="codeSent-info">
        <p>验证码已通过手机短信发送给您</p>
        <p>
          没有收到？
          <a v-if="times === 0" href="javascript:;" @click="handleStart(sendData)">重新发送</a>
          <a v-else href="javascript:;">({{ times }} 秒后)重新发送</a>
           或 
          <a href="javascript:;" @click="handleGotoStart">选择其他方式</a>
        </p>
      </div>
      <p class="service-terms">
        无法通过以上方式找回密码？ 请
        <a href="javascript:;">联系客服</a>
        <a href="javascript:;" @click="handleGotoStart" class="ng-hide">返回</a>
      </p>
    </account-lostpass-form>
  </page>
</template>

<script lang="ts">
import 'vue-router'
import Component from 'nuxt-class-component'
import { Provide, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import * as setting from '~/store/modules/setting'
import accountLostpassStart from '~/components/account/lostpass-start.vue'
import accountLostpassForm from '~/components/account/lostpass-form.vue'
import http, { resufulInfo } from '~/utils/http'
import { Register, __Rules } from '~/server/types/config'
import { setInterval, clearInterval } from 'timers'

const Setting: BindingHelpers = namespace(setting.name)

type lostTypes = 'email' | 'mobile'
type Status = 'start' | 'submit'

interface StartData {
  type: lostTypes
  name: string
}

interface SubmitData {
  code?: string
  password?: string
}

@Component({
  layout: 'account',
  components: {
    accountLostpassStart,
    accountLostpassForm
  }
})
export default class  extends Vue {

  @Setting.State register: Register

  @Provide() status: Status = 'start'
  @Provide() loading: boolean = false
  @Provide() sendData: StartData = { type: 'email', name: '' }
  @Provide() times: number = 0

  handleStart (values: StartData): void {
    if (this.times > 0) return
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let result: resufulInfo = await http.put(`/account/resetpwd/code/${values.type}`, { name: values.name })
        this.loading = false
        if (result.Status.code === 0) {
          if (this.status === 'start') {
            this.status = 'submit'
          }
          this.sendData = values
          this.mailPhoneStep()
          return
        }
        this.$message.warning(result.Status.message || '')
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleSubmit (values: SubmitData): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let result: resufulInfo = await http.post(`/account/resetpwd/${this.sendData.type}`, { ...values, name: this.sendData.name  })
        this.loading = false
        if (result.Status.code === 0) {
          this.$message.info('密码修改成功！')
          this.handleGotoLogin(3000)
          return
        }
        this.$message.warning(result.Status.message || '')
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  mailPhoneStep (): void {
    this.times = this.register.mailphone_step
    let timer: NodeJS.Timeout | null = setInterval(() => {
      this.times --
      if (this.times <= 0) {
        clearInterval(<NodeJS.Timeout> timer)
        timer = null
      }
    }, 1000)
  }

  handleGotoStart (): void {
    this.status = 'start'
  }

  handleGotoLogin (time?: number): void {
    setTimeout(() => {
      this.$router.push({ path: '/login' })
    }, time || 3000)
  }
}
</script>