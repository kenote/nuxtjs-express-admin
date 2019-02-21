<template>
  <div class="layout-accounts">
    <header>
      <div class="container">
        <a class="logo">
          <img src="~/assets/images/logo.png" />
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
import '~/assets/scss/accounts/layout.scss'
import '~/assets/scss/accounts/page.scss'

@Component
export default class  extends Vue {

  head () {
    return {
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