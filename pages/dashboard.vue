<template>
  <page>
    <!--<console-breadcrumb :channel="selectedChannel" :store="channelStore" :route="$route" />-->
  </page>
</template>
<script lang="ts">
import Component from 'nuxt-class-component'
import { Provide, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import * as setting from '~/store/modules/setting'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import consoleBreadcrumb from '~/components/console/breadcrumb.vue'

const Setting: BindingHelpers = namespace(setting.name)

@Component({
  layout: 'dashboard',
  middleware: ['authenticated'],
  components: {
    consoleBreadcrumb
  },
  mounted () {
    
  }
})
export default class  extends Vue {

  @Setting.Getter selectedChannel
  @Setting.Getter channelStore

}
</script>