<template>
  <div class="layout-console">
    <console-header
      :channels="channels"
      :current-channel="selectedChannel"
      :selectChannel="handleSelectChannel"
      :auth="user"
      :user-entrance="userEntrance"
      :command="handleCommand"
      >
      
    </console-header>
    <div class="bodyer">
      <div class="sidebar-nav" v-bind:style="collapse ? 'flex: 0 0 65px' : 'flex: 0 0 260px'" >
        <div style="height: calc(100% - 24px);overflow-y:auto;" v-loading="loading.channel">
          <template v-for="(channel, index) in channels" >
            <el-collapse-transition :key="index" v-if="channel.id === selectedChannel.id">
              <console-sidebar
                v-if="!loading.channel"
                class="auth-sider-menu"
                :sidebar="channel.navs" 
                :defaultActive="$route.path"
                backgroundColor="#444c54"
                textColor="#fff"
                activeTextColor="#ffd04b"
                :collapse="collapse"
                :router="true"
                />
            </el-collapse-transition>
          </template>
        </div>
        <div class="menu-collapsed" @click="handleCollapse">
          <i class="iconfont" v-bind:class="collapse ? 'icon-menu-unfold' : 'icon-menu-fold'"></i>
        </div>
      </div>
      <div class="console-page" >
        <nuxt v-if="permission"></nuxt>
        <error-page v-else :statusCode="403" message="Forbidden" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Route } from 'vue-router'
import Component from 'nuxt-class-component'
import { Vue, Provide } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import * as auth from '~/store/modules/auth'
import * as setting from '~/store/modules/setting'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import consoleHeader from '~/components/console/header.vue'
import consoleSidebar from '~/components/console/sidebar.vue'
import { responseDocument as responseUserDocument } from '~/server/types/proxys/user'
import channel from '~/server/types/channel'
import { Dropdown, Command } from '~/types'
import { getChannelId } from '~/utils/channel'
import { parseCommand } from '~/utils'
import http, { resufulInfo } from '~/utils/http'
import '~/assets/scss/console/layout.scss'
import '~/assets/scss/console/page.scss'

const Auth: BindingHelpers = namespace(auth.name)
const Setting: BindingHelpers = namespace(setting.name)

const userEntrance: Array<Dropdown.MenuItem> = [
  {
    name: '基本资料',
    command: 'router:/account/baseinfo'
  },
  {
    name: '实名认证',
    //command: ''
  },
  {
    name: '安全设置',
    command: 'router:/account/security'
  },
  {
    name: '我的主页',
    //command: ''
  },
  {
    name: '我的收藏',
    //command: ''
  },
  {
    name: '访问控制',
    //command: ''
  },
  {
    name: 'Accesskeys',
    //command: ''
  },
]

@Component({
  components: {
    consoleHeader,
    consoleSidebar
  },
  async mounted () {
    await this.updateChannel(this.$route.path)
  },
  watch: {
    async $route (route: Route): Promise<void> {
      await this.updateChannel(route.path)
    }
  }
})
export default class  extends Vue {

  @Auth.State user: responseUserDocument
  @Setting.State loading: setting.Loading
  @Setting.State channels: Array<channel.NavMenus>
  @Setting.State flags: channel.Flags
  @Setting.Action selectChannel: (id: number) => void
  @Setting.Getter selectedChannel: channel.NavMenus

  @Provide() userEntrance: Array<Dropdown.MenuItem> = userEntrance
  @Provide() collapse: boolean = false
  @Provide() permission: boolean = true

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

  handleSelectChannel (value: number): void {
    if (this.selectedChannel.id === value) return
    let channel: channel.NavMenus = <channel.NavMenus> this.channels.find( o => o.id === value )
    this.$router.push(channel.default)
  }

  async updateChannel (routerPath: string): Promise<void> {
    if (!this.user) return
    let level: number = this.user.group.level
    let pageFlag: channel.FlagItem = this.flags[routerPath]
    this.permission = !(pageFlag && pageFlag.access > level)
    let channelId: number = getChannelId(this.channels, routerPath)
    if (this.selectedChannel.id === channelId) return
    await this.selectChannel(channelId)
    this.collapse = false
  }

  handleCommand (value: string): void {
    let command: Command.Value | null = parseCommand(value)
    if (!command) return
    if (command.type === 'command') {
      switch (command.path) {
        case 'logout':
          this.logout()
          break
        default:
          break
      }
    }
    else if (command.type === 'router') {
      this.$router.push(command.path)
    }
  }

  logout (): void {
    setTimeout(async (): Promise<void> => {
      try {
        let result: resufulInfo = await http.get('/account/logout', null)
        if (result.Status.code === 0) {
          this.$store.commit(`${auth.name}/${auth.types.SET}`, null)
          this.$router.push(`/login?url_callback=${this.$route.path}`)
          return
        }
        this.$message.warning(result.Status.message || '')
      } catch (error) {
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleCollapse () {
    this.collapse = !this.collapse
  }
}
</script>
