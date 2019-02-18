<template>
  <page v-if="status === 'invitation'">
    <account-ticket name="邀请码" :submit="handleInvitation">
      <p class="service-terms">
        系统已经关闭的注册入口，您必须拥有邀请码才能注册
      </p>
    </account-ticket>
  </page>
  <page v-else-if="status === 'submitinfo'">
    <account-register :submit="handleRegister">
      <p class="service-terms">
        请您仔细阅读并同意遵守
        <a href="javascript:;">《服务条款》</a>
        <a href="javascript:;" class="ng-hide">立即登录</a>
      </p>
    </account-register>
  </page>
  <page v-else-if="status === 'finished'">

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
import account from '~/types/account'

const Setting: BindingHelpers = namespace(setting.name)

type Status = 'invitation' | 'submitinfo' | 'validate' | 'finished'

@Component({
  layout: 'account',
  components: {
    accountTicket,
    accountRegister
  },
  mounted () {
    let { invitation } = <Register> this.register
    this.$data.status = invitation ? 'invitation' : 'submitinfo'
  }
})
export default class  extends Vue {

  @Setting.State register: Register

  @Provide() status: Status = 'invitation'
  @Provide() invitation?: string

  handleInvitation (value: string): void {
    console.log(value)
    this.status = 'submitinfo'
  }

  handleRegister (values: account.Register): void {
    console.log(values)
  }

}

</script>