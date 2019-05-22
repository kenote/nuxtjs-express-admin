<template>
  <page>
    <div class="landing-activity">
      <p v-for="(item, key) in main_title" :key="key" class="main-title">{{ item }}</p>
      <p class="secondary-title">{{ secondary_title }}</p>
    </div>
    <account-login class="landing-body" :submit="handleLogin" v-loading="loading" :loading="loading">
      <p class="service-terms">
        <nuxt-link to="/lostpass">忘记密码</nuxt-link>
        <nuxt-link to="/register" class="ng-hide">立即注册</nuxt-link>
      </p>
    </account-login>
  </page>
</template>

<script lang="ts">
import 'vue-router'
import Component from 'nuxt-class-component'
import { Provide, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import * as setting from '~/store/modules/setting'
import { Register, Page } from '~/server/types/config'
import accountLogin from '~/components/account/login.vue'
import account from '~/server/types/account'
import http, { resufulInfo } from '~/utils/http'
import * as auth from '~/store/modules/auth'

const Setting: BindingHelpers = namespace(setting.name)

@Component({
  layout: 'account',
  middleware: ['unauthenticated'],
  components: {
    accountLogin
  },
  mounted () {
    let pages: Array<Page> = this.register.pages

    let page: Page | undefined = pages.find( o => o.key === 'login' )
    if (page) {
      this.$data.main_title = page.main_title || []
      this.$data.secondary_title = page.secondary_title || ''
    }
  }
})
export default class  extends Vue {

  @Setting.State register: Register

  @Provide() loading: boolean = false
  @Provide() main_title: string[] = []
  @Provide() secondary_title: string = ''

  handleLogin (values: account.Login): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let result: resufulInfo = await http.post('/account/login', values)
        this.loading = false
        if (result.Status.code === 0) {
          this.$store.commit(`${auth.name}/${auth.types.SET}`, result.data)
          let { url_callback } = this.$route.query
          this.$router.push(<string> url_callback || '/dashboard')
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