<template>
  <page v-if="status === 'invitation'">

  </page>
  <page v-else-if="status === 'submitinfo'">

  </page>
  <page v-else-if="status === 'finished'">

  </page>
</template>

<script lang="ts">
import Component from 'nuxt-class-component'
import { Provide, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import * as setting from '~/store/modules/setting'
import { Register } from '~/server/types/config'

const Setting: BindingHelpers = namespace(setting.name)

type Status = 'invitation' | 'submitinfo' | 'validate' | 'finished'

@Component({
  layout: 'account',
  mounted () {
    let { invitation } = <Register> this.register
    this.$data.status = <Status> (invitation ? 'invitation' : 'submitinfo')
  }
})
export default class  extends Vue {

  @Setting.State register: Register

  @Provide() status: Status = 'invitation'
  @Provide() invitation?: string

  handleInvitation (value: string): void {

  }

  handleSubmit (value: any): void {

  }

}

</script>