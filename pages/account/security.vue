<template>
  <page>
    <console-breadcrumb :channel="selectedChannel" :store="channelStore" :route="$route" />
    <transition name="el-zoom-in-top">
      <security-password v-if="viewtype === 'password'" 
        @close="handleClose" 
        :user="user" 
        :step="register.mailphone_step" 
        :timeout="register.lost_pass.timeout"
        @sendcode="handleSendcode"
        @verifycode="handleVerifycode"
        :active="active"
        :times="times"
        :loading="loading"
        @submit="handleSubmitPassword"
        />
      <security-email v-else-if="viewtype === 'email'"
        @close="handleClose" 
        :user="user" 
        :step="register.mailphone_step" 
        :timeout="register.lost_pass.timeout"
        @sendcode="handleSendcode"
        @verifycode="handleVerifycode"
        :active="active"
        :times="times"
        :unique="handleUnique"
        @submit="handleSubmitEmail"
        />
      <security-mobile v-else-if="viewtype === 'mobile'"
        @close="handleClose" 
        :user="user" 
        :step="register.mailphone_step" 
        :timeout="register.lost_pass.timeout"
        @sendcode="handleSendcode"
        @verifycode="handleVerifycode"
        :active="active"
        :times="times"
        :unique="handleUnique"
        @submit="handleSubmitMobile"
        />
      <div v-else-if="viewtype === 'overview'" class="security-container">
        <div class="panel" v-for="(item, key) in overview" :key="key">
          <div class="panel-body">
            <div class="panel-content">
              <h4>
                {{ item.name }}
                <i :class="item.icon" />
              </h4>
              <p v-if="item.data">{{ item.data.name }}：{{ item.data.format && item.data.format(item.data.value) || item.data.value || '--' }}</p>
              <p v-if="isString(item.description)">{{ item.description }}</p>
              <template v-else-if="isArray(item.description)">
                <p v-for="(p, k) in item.description" :key="k">{{ p }}</p>
              </template>
              <template v-else-if="isObject(item.description)">
                <h4>{{ item.description.title }}</h4>
                <ul class="row-inline">
                  <li v-for="(c, k) in item.description.context" :key="k">{{ c }}</li>
                </ul>
              </template>
            </div>
            <div class="panel-sidebar">
              <el-button v-if="item.type === 'success'" type="success" size="medium" @click="item.click && item.click()">修改</el-button>
              <el-button v-else-if="item.type === 'info'" type="warning" size="medium" @click="item.click && item.click()">设置</el-button>
              <el-button v-else type="danger" size="medium" @click="item.click && item.click()" :disabled="user && user.group.level > 1000">注销</el-button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </page>
</template>
<script lang="ts">
import Component from 'nuxt-class-component'
import { Provide, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import * as setting from '~/store/modules/setting'
import * as auth from '~/store/modules/auth'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import consoleBreadcrumb from '~/components/console/breadcrumb.vue'
import securityPassword from '~/components/security/password.vue'
import securityEmail from '~/components/security/email.vue'
import securityMobile from '~/components/security/mobile.vue'
import { isString, isArray, isObject, clone, pick, uniq } from 'lodash'
import { setInterval, clearInterval } from 'timers'
import http, { resufulInfo } from '~/utils/http'
import { HeaderOptions } from '~/server/types/resuful'
import { responseDocument as responseUserDocument } from '~/server/types/proxys/user'
import { Register } from '~/server/types/config'
import { Security } from '~/types'
import '~/assets/scss/console/security.scss'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)

const overview: Array<Security.Overview> = [
  {
    key: 'password',
    type: 'success',
    name: '登录密码',
    icon: 'el-icon-success success',
    description: [
      '安全性高的密码可以使账号更安全。',
      '设置一个包含字母，符号或数字中至少两项且长度超过 8 位的密码。'
    ]
  },
  {
    key: 'email',
    type: 'info',
    name: '邮箱验证',
    icon: 'el-icon-info info',
    data: {
      name: '您的邮箱',
      format: (value: string) => value && value.replace(/\w{4}@/g, '****@')
    },
    description: {
      title: '您的绑定邮箱可用于',
      context: [
        '安全管理，密码重置找回',
        '账号使用，邮箱快捷登录',
        '服务通知，反馈等'
      ]
    }
  },
  {
    key: 'mobile',
    type: 'info',
    name: '手机验证',
    icon: 'el-icon-info info',
    data: {
      name: '您的手机',
      format: (value: string) => value && value.replace(/^(\d{3})\d+(\d{4})$/, '$1****$2')
    },
    description: {
      title: '您的绑定手机号可用于',
      context: [
        '安全管理，密码重置找回',
        '账号使用，手机快捷登录',
        '服务通知，反馈等'
      ]
    }
  },
  {
    key: 'remove',
    type: 'warning',
    icon: 'el-icon-warning warning',
    name: '注销账号',
    description: '如果您不再使用此账号，可以将其注销。账号成功注销后，其下所有服务、数据及隐私信息将会被删除并将无法恢复'
  }
]

@Component({
  layout: 'console',
  middleware: ['authenticated'],
  components: {
    consoleBreadcrumb,
    securityPassword,
    securityEmail,
    securityMobile
  },
  mounted () {
    if (!this.user) return
    this.updateSecurity()
  }
})
export default class  extends Vue {

  @Auth.State user: responseUserDocument
  @Auth.State token: string | null
  @Setting.State register: Register
  @Setting.Getter selectedChannel
  @Setting.Getter channelStore

  @Provide() overview: Array<Security.Overview> = overview
  @Provide() isString: (value: any) => boolean = isString
  @Provide() isArray: (value: any) => boolean = isArray
  @Provide() isObject: (value: any) => boolean = isObject
  @Provide() viewtype: Security.viewType = 'overview'
  @Provide() active: number = 0
  @Provide() loading: boolean = false
  @Provide() times: number = 0
  @Provide() verify_id: string | null = null

  updateSecurity (user?: responseUserDocument): void {
    let overview: Array<Security.Overview> = this.overview
    for (let item of overview) {
      updateOverviewItem(item, 'email', user || this.user)
      updateOverviewItem(item, 'mobile', user || this.user)
      item.click = () => this.handleOverview(item.key)
    }
    this.overview = clone(overview)
  }

  handleOverview (key: string): void {
    this.active = 0
    this.viewtype = ['password', 'email', 'mobile'].indexOf(key) > -1 ? <Security.viewType> key : 'overview'
  }

  handleClose (): void {
    this.active = 0
    this.viewtype = 'overview'
  }

  handleSendcode (values: Security.sendCode): void {
    if (values.name) {
      values.verify_id = this.verify_id || ''
    }
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.put(`/security/sendcode/${values.type}`, values, options)
        if (result.Status.code === 0) {
          this.mailPhoneStep()
          return
        }
        this.$message.warning(result.Status.message || '')
      } catch (error) {
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleVerifycode (verify: Security.verifyCode): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.post(`/security/verifycode`, verify, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.verify_id = result.data._id
          this.active = 1
          return
        }
        this.$message.warning(result.Status.message || '')
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleSubmitPassword (values: any): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.post(`/security/setpassword`, { ...values, verify_id: this.verify_id }, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.active = 3
          return
        }
        this.$message.warning(result.Status.message || '')
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleSubmitEmail (values: Security.setEmail): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.post(`/security/setemail`, { ...values, verify_id: this.verify_id }, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.$store.commit(`${auth.name}/${auth.types.EMAIL}`, values.email)
          let user: responseUserDocument = <responseUserDocument> {
            ...this.user,
            email: values.email,
            binds: uniq(this.user.binds.concat('email'))
          }
          this.updateSecurity(user)
          this.active = 3
          return
        }
        this.$message.warning(result.Status.message || '')
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleSubmitMobile (values: Security.setMobile): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.post(`/security/setmobile`, { ...values, verify_id: this.verify_id }, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.$store.commit(`${auth.name}/${auth.types.MOBILE}`, values.mobile)
          let user: responseUserDocument = <responseUserDocument> {
            ...this.user,
            mobile: values.mobile,
            binds: uniq(this.user.binds.concat('mobile'))
          }
          this.updateSecurity(user)
          this.active = 3
          return
        }
        this.$message.warning(result.Status.message || '')
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  async handleUnique (type: 'username' | 'email' | 'mobile', value: string): Promise<boolean | undefined> {
    try {
      let options: HeaderOptions = {
        token: this.token || undefined
      }
      let result: resufulInfo = await http.put(`/security/check/${type}`, { name: value }, options)
      return <boolean> result.data
    } catch (error) {
      this.$message.warning(error.message)
    }
  }

  mailPhoneStep (): void {
    this.times = this.register.mailphone_step
    let timer: NodeJS.Timeout | null = setInterval(() => {
      this.times --
      if (this.times <= 0) {
        clearInterval(<NodeJS.Timeout> timer)
        timer = null
      }
    }, 1000)
  }

}

function updateOverviewItem (item: Security.Overview, key: string, user: responseUserDocument): void {
  if (item.key === key && item.data) {
    item.data.value = user[key]
    let isBind: boolean = user.binds.indexOf(item.key) > -1
    item.type = isBind ? 'success' : 'info'
    item.icon = isBind ? 'el-icon-success success' : 'el-icon-info info'
  }
}
</script>