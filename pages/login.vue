<template>
  <page>
    <div class="landing-activity">
      <p class="main-title">又拍云 DDoS 防护，</p>
      <p class="main-title">超稳定护航 2019 </p>
      <p class="secondary-title">3T 带宽保障源站业务，弹性计费、限时低至 7.2 折</p>
    </div>
    <account-login class="landing-body" :submit="handleLogin" v-loading="loading" :loading="loading">
      <p class="service-terms">
        <a href="javascript:;">忘记密码</a>
        <nuxt-link to="/register" class="ng-hide">立即注册</nuxt-link>
      </p>
    </account-login>
  </page>
</template>

<script lang="ts">
import 'vue-router'
import Component from 'nuxt-class-component'
import { Provide, Vue } from 'vue-property-decorator'
import accountLogin from '~/components/account/login.vue'
import account from '~/server/types/account'
import http, { resufulInfo } from '~/utils/http'
import * as auth from '~/store/modules/auth'

@Component({
  layout: 'account',
  components: {
    accountLogin
  },
})
export default class  extends Vue {

  @Provide() loading: boolean = false

  handleLogin (values: account.Login): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let result: resufulInfo = await http.post('/account/login', values)
        this.loading = false
        if (result.Status.code === 0) {
          this.$store.commit(`${auth.name}/${auth.types.SET}`, result.data)
          this.$router.push({ path: '/' })
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