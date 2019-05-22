<template>
  <page>
    <div class="landing-activity">
      <p v-for="(item, key) in main_title" :key="key" class="main-title">{{ item }}</p>
      <p class="secondary-title">{{ secondary_title }}</p>
    </div>
  </page>
</template>

<script lang="ts">
import Component from 'nuxt-class-component'
import { Provide, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import * as auth from '~/store/modules/auth'
import * as setting from '~/store/modules/setting'
import { Register, Page } from '~/server/types/config'

import { responseDocument as responseUserDocument } from '~/server/types/proxys/user'

const Auth: BindingHelpers = namespace(auth.name)
const Setting: BindingHelpers = namespace(setting.name)

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    layout?: string | Function,
    middleware?: string | string[]
  }
}

@Component({
  layout: 'account',
  mounted () {
    let pages: Array<Page> = this.register.pages

    let page: Page | undefined = pages.find( o => o.key === 'index' )
    if (page) {
      this.$data.main_title = page.main_title || []
      this.$data.secondary_title = page.secondary_title || ''
    }
  }
})
export default class  extends Vue {

  @Auth.State user: responseUserDocument
  @Setting.State register: Register

  @Provide() main_title: string[] = []
  @Provide() secondary_title: string = ''
}

</script>

<style lang="scss">

</style>
