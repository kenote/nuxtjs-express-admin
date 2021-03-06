<template>
  <page>
    <console-breadcrumb :channel="selectedChannel" :store="channelStore" :route="$route" />

    <ucenter-user-edit v-if="mode === 'edit'"
      :data="selected"
      :auth="user"
      :loading="loading" 
      @get-groups="handleGetGroups"
      @get-teams="handleGetTeams"
      @goback="handleGoback"
      />
    <ucenter-team-access v-else-if="mode === 'access'" 
      :platforms="platforms"
      :channels="channels"
      :data="selected" 
      @submit="handleSubmitAccess" 
      :loading="loading" 
      @goback="handleGoback" />
    <ucenter-user-list v-else 
      :list="list" 
      :auth="user" 
      :loading="loading" 
      @access="handleAccess"
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
import { responseDocument as responseTeamDocument } from '~/server/types/proxys/team'
import ucenterUserList from '~/components/ucenter/user-list.vue'
//import ucenterTeamCreate from '~/components/ucenter/team-create.vue'
import ucenterUserEdit from '~/components/ucenter/user-edit.vue'
import ucenterTeamAccess from '~/components/ucenter/team-access.vue'
import { Ucenter } from '~/types'
import channel from '~/server/types/channel'
import { orderBy } from 'lodash'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)


@Component({
  layout: 'console',
  middleware: ['authenticated'],
  components: {
    consoleBreadcrumb,
    ucenterUserList,
    ucenterUserEdit,
    ucenterTeamAccess
  },
  mounted () {
    if (this.channels) {
      let platforms: Array<{ key: number, label: string }> = []
      for (let item of this.channels) {
        platforms.push({ key: item.id, label: item.name })
      }
      this.$data.platforms = orderBy(platforms, ['key'], ['asc'])
    }
  }
})
export default class  extends Vue {

  @Auth.State user: responseUserDocument | null
  @Auth.State token: string | null
  @Setting.State channels: Array<channel.NavMenus>
  @Setting.Getter selectedChannel
  @Setting.Getter channelStore

  @Provide() list: listUserDocument = { data: [], counts: 0, limit: 0 }
  @Provide() mode: 'list' | 'create' | 'edit' | 'access' = 'list'
  @Provide() selected: responseUserDocument | null = null
  @Provide() loading: boolean = false
  @Provide() conditions: Ucenter.FindUser | {} = {}
  @Provide() platforms: Array<{ key: number, label: string }> = []

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

  handleAccess (index: number, row: responseUserDocument): void {
    this.mode = 'access'
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

  handleSubmitAccess (_id: string, values: string[]): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.post(`/ucenter/user/access/${_id}`, values, options)
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

  handleGetTeams (next: (teams: Array<responseTeamDocument>) => void): void {
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.post(`/ucenter/team/list`, {}, options)
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