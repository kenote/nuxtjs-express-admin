<template>
  <div class="layout-account">
    <header>
      <a class="logo">
        <img src="~/assets/images/logo.png" />
      </a>
      <div class="list">
        <nuxt-link to="/login">登录</nuxt-link>
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
import '~/assets/scss/account/layout.scss'
import '~/assets/scss/account/page.scss'

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
