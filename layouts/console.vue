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
import consoleAuthDropdown from '~/components/console/auth-dropdown.vue'
import { responseDocument as responseUserDocument } from '~/server/types/proxys/user'
import channel from '~/server/types/channel'
import { Dropdown } from '~/types'
import { getChannelId } from '~/utils/channel'
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
    //command: ''
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
    consoleAuthDropdown
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
  @Setting.Action selectChannel: (id: number) => void
  @Setting.Getter selectedChannel: channel.NavMenus

  @Provide() userEntrance: Array<Dropdown.MenuItem> = userEntrance

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
    //
    let channelId: number = getChannelId(this.channels, routerPath)
    if (this.selectedChannel.id === channelId) return
    await this.selectChannel(channelId)
  }

  handleCommand (value: string): void {
    console.log(value)
  }
}
</script>
