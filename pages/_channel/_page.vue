<template>
  <page ref="thePage">
    <console-breadcrumb :channel="selectedChannel" :store="channelStore" :route="$route" />
    
    <channel-queryer v-if="pageSetting.queryer" :queryer="pageSetting.queryer" :options="selectedChannel && selectedChannel.options">
      aaa
    </channel-queryer>
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
import channelQueryer from '~/components/channel/queryer.vue'
import channel from '~/server/types/channel'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)

@Component({
  layout: 'console',
  middleware: ['authenticated'],
  components: {
    consoleBreadcrumb,
    channelQueryer
  },
  mounted () {
    let pageSetting: channel.MenuItem = this.channelStore.find(this.$route.path)
    this.$data.pageSetting = pageSetting
  }
})
export default class  extends Vue {

  @Auth.State token: string | null
  @Setting.Getter selectedChannel
  @Setting.Getter channelStore

  @Provide() pageSetting: any = {}

}
</script>