<template>
  <div class="layout-accounts">
    <header>
      <div class="container">
        <a class="logo">
          <img src="/logo.png" />
        </a>
        <div class="list">
          <nuxt-link to="/">返回首页</nuxt-link>
        </div>
      </div>
    </header>
    <nuxt class="accounts-page" />
  </div>
</template>

<script lang="ts">
import Component from 'nuxt-class-component'
import { Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import * as setting from '~/store/modules/setting'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import { Register } from '~/server/types/config'
import '~/assets/scss/accounts/layout.scss'
import '~/assets/scss/accounts/page.scss'

const Setting: BindingHelpers = namespace(setting.name)

@Component
export default class  extends Vue {

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