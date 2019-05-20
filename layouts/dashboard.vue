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
import { responseDocument as responseUserDocument } from '~/server/types/proxys/user'
import channel from '~/server/types/channel'
import { Dropdown, Command } from '~/types'
import { parseCommand } from '~/utils'
import http, { resufulInfo } from '~/utils/http'

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
    consoleHeader
  },
  async mounted () {
    //document.body.className = 'console-warpper'
    //await this.updateChannel(this.$route.path)
  },
  watch: {
    async $route (route: Route): Promise<void> {
      //await this.updateChannel(route.path)
    }
  }
})
export default class  extends Vue {

  @Auth.State user: responseUserDocument
  @Setting.State channels: Array<channel.NavMenus>
  @Setting.Getter selectedChannel: channel.NavMenus

  @Provide() userEntrance: Array<Dropdown.MenuItem> = userEntrance

  handleSelectChannel (value: number): void {
    if (this.selectedChannel.id === value) return
    let channel: channel.NavMenus = <channel.NavMenus> this.channels.find( o => o.id === value )
    this.$router.push(channel.default)
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

}

</script>