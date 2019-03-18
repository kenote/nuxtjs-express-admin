<template>
  <page>
    <console-breadcrumb :channel="selectedChannel" :store="channelStore" :route="$route" />

    <ucenter-user-edit v-if="mode === 'edit'"
      :data="selected"
      :loading="loading" 
      @get-groups="handleGetGroups"
      @goback="handleGoback"
      />
    <ucenter-user-list v-else 
      :list="list" 
      :auth="user" 
      :loading="loading" 
      @edit="handleEdit" 
      @getlist="handleList" 
      @get-groups="handleGetGroups" 
      :conditions="conditions">

    </ucenter-user-list>
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
import http, { resufulInfo } from '~/utils/http'
import { HeaderOptions } from '~/server/types/resuful'
import { responseDocument as responseUserDocument, listDocument as listUserDocument } from '~/server/types/proxys/user'
import { responseDocument as responseGroupDocument } from '~/server/types/proxys/group'
import ucenterUserList from '~/components/ucenter/user-list.vue'
//import ucenterTeamCreate from '~/components/ucenter/team-create.vue'
import ucenterUserEdit from '~/components/ucenter/user-edit.vue'
import { Ucenter } from '~/types'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)


@Component({
  layout: 'console',
  middleware: ['authenticated'],
  components: {
    consoleBreadcrumb,
    ucenterUserList,
    ucenterUserEdit
  },
  mounted () {
    
  }
})
export default class  extends Vue {

  @Auth.State user: responseUserDocument | null
  @Auth.State token: string | null
  @Setting.Getter selectedChannel
  @Setting.Getter channelStore

  @Provide() list: listUserDocument = { data: [], counts: 0, limit: 0 }
  @Provide() mode: 'list' | 'create' | 'edit' = 'list'
  @Provide() selected: responseUserDocument | null = null
  @Provide() loading: boolean = false
  @Provide() conditions: Ucenter.FindUser | {} = {}

  handleList (conditions: Ucenter.FindUser): void {
    this.loading = true
    this.conditions = conditions
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.post(`/ucenter/user/list`, conditions, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.list = result.data
          return
        }
        this.$message.warning(result.Status.message || '')
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 800)
  }

  handleEdit (index: number, row: responseUserDocument): void {
    this.mode = 'edit'
    this.selected = row
  }

  handleSubmitEdit (_id: string, values: Ucenter.EditUser): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.post(`/ucenter/user/edit/${_id}`, values, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.mode = 'list'
          this.selected = null
          return
        }
        this.$message.warning(result.Status.message || '')
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleGoback (): void {
    this.mode = 'list'
  }

  handleGetGroups (type: string = 'list', next: (groups: Array<responseGroupDocument>) => void): void {
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.post(`/ucenter/group/${type}`, {}, options)
        this.loading = false
        if (result.Status.code === 0) {
          next(result.data)
          return
        }
        this.$message.warning(result.Status.message || '')
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

}

</script>