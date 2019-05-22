<template>
  <div class="layout-account">
    <header>
      <a class="logo">
        <img src="/logo.png" />
      </a>
      <div class="list">
        <nuxt-link v-if="user" to="/dashboard">控制台</nuxt-link>
        <nuxt-link v-else to="/login">登录</nuxt-link>
        <nuxt-link to="/">首页</nuxt-link>
      </div>
    </header>
    <div class="bodyer">
      <nuxt class="account-page" />
    </div>
    <footer>
      Copyright © 2018 Kenote 实验室出品
    </footer>
  </div>
</template>

<script lang="ts">
import Component from 'nuxt-class-component'
import { Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import * as auth from '~/store/modules/auth'
import * as setting from '~/store/modules/setting'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import { Register } from '~/server/types/config'
import { responseDocument as responseUserDocument } from '~/server/types/proxys/user'
import '~/assets/scss/account/layout.scss'
import '~/assets/scss/account/page.scss'

const Auth: BindingHelpers = namespace(auth.name)
const Setting: BindingHelpers = namespace(setting.name)

@Component({
  mounted () {
    document.body.className = 'account-warpper'
  }
})
export default class  extends Vue {

  @Auth.State user: responseUserDocument
  @Setting.State register: Register

  head () {
    return {
      title: this.register.site_name,
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no'
        }
      ]
    }
  }
}
</script>


<style lang="scss">
.account-warpper {
  overflow-x: hidden;
  overflow-y: auto;
  min-height: 708px;
}
</style>