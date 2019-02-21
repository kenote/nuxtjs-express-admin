<template>
  <div v-loading="loading" element-loading-text="邮箱校验中 ..." element-loading-spinner="el-icon-loading">
    <transition name="el-fade-in">
      <div class="verify-result-box" v-bind:class="status" v-if="!loading">
        <i :class="icon"></i>
        <div class="verify-result-content">
          <h1>{{ message }}</h1>
          <nuxt-link to="/">进入管理中心</nuxt-link>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import Component from 'nuxt-class-component'
import { Provide, Vue } from 'vue-property-decorator'
import http, { resufulInfo } from '~/utils/http'
import { clone } from 'lodash'

interface Icons {
  success : string
  warning : string
  error   : string
}

const icons = {
  success   : 'el-icon-success',
  warning   : 'el-icon-warning',
  error     : 'el-icon-error'
}

@Component({
  layout: 'accounts',
  mounted () {
    let { token, id } = this.$route.query
    setTimeout(async () => {
      try {
        let result: resufulInfo = await http.post('/account/verify/email', { token, id })
        this.$data.message = result.Status.code === 0 ? '邮箱验证通过' : result.Status.message
        this.$data.status = result.Status.code === 0 ? 'success' : result.data
        this.$data.icon = icons[this.$data.status]
        this.$data.loading = false
      } catch (error) {
        this.$message.warning(error.message)
      }
    }, 300)
  }
})
export default class  extends Vue {

  @Provide() loading: boolean = true
  @Provide() message: string = ''
  @Provide() status: string = 'warning'
  @Provide() icon: string = ''
}
</script>