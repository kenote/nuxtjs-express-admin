<template>
  <page v-if="status === 'invitation'">
    <account-ticket name="邀请码" :submit="handleInvitation" v-loading="loading" :loading="loading">
      <p class="service-terms">
        系统已经关闭的注册入口，您必须拥有邀请码才能注册
      </p>
    </account-ticket>
  </page>
  <page v-else-if="status === 'submitinfo'">
    <account-register :submit="handleRegister" v-loading="loading" :loading="loading">
      <p class="service-terms">
        请您仔细阅读并同意遵守
        <a href="javascript:;">《服务条款》</a>
        <a href="javascript:;" class="ng-hide">立即登录</a>
      </p>
    </account-register>
  </page>
  <page v-else-if="status === 'finished'">
    <account-register-finished 
      email="thondery@163.com" 
      :timeout="register.email_verify.timeout"
      />
  </page>
</template>

<script lang="ts">
import Component from 'nuxt-class-component'
import { Provide, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import * as setting from '~/store/modules/setting'
import { Register, __Rules } from '~/server/types/config'
import accountTicket from '~/components/account/ticket.vue'
import accountRegister from '~/components/account/register.vue'
import accountRegisterFinished from '~/components/account/register-finished.vue'
import account from '~/server/types/account'
import http, { resufulInfo } from '~/utils/http'
import { responseDocument as responseTicketDocument } from '~/server/types/proxys/ticket'
import { responseDocument as responseUserDocument } from '~/server/types/proxys/user'

const Setting: BindingHelpers = namespace(setting.name)

type Status = 'invitation' | 'submitinfo' | 'validate' | 'finished'

@Component({
  layout: 'account',
  components: {
    accountTicket,
    accountRegister,
    accountRegisterFinished
  },
  mounted () {
    let { invitation } = <Register> this.register
    this.$data.status = invitation ? 'invitation' : 'submitinfo'
    //this.$data.status = 'finished'
  }
})
export default class  extends Vue {

  @Setting.State register: Register

  @Provide() status: Status = 'invitation'
  @Provide() invitation: string = ''
  @Provide() loading: boolean = false
  @Provide() email: string = ''

  handleInvitation (value: string): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let result: resufulInfo = await http.post('/account/invitation', { cdkey: value })
        this.loading = false
        if (result.Status.code === 0) {
          this.invitation = (<responseTicketDocument> result.data).cdkey
          this.status = 'submitinfo'
          return
        }
        this.$message.warning(result.Status.message || '')
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleRegister (values: account.Register): void {
    if (this.register.invitation) {
      values.invitation = this.invitation
    }
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let result: resufulInfo = await http.post('/account/register', values)
        this.loading = false
        if (result.Status.code === 0) {
          this.email = (<responseUserDocument> result.data).email
          this.status = 'finished'
          return
        }
        this.$message.warning(result.Status.message || '')
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

}

</script>