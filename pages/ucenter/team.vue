<template>
  <page ref="thePage">
    <console-breadcrumb :channel="selectedChannel" :store="channelStore" :route="$route" />
    
    <ucenter-team-create v-if="mode === 'create'" 
      :platforms="platforms"
      @submit="handleSubmitCreate" 
      :loading="loading" 
      @goback="handleGoback" />
    <ucenter-team-edit v-else-if="mode === 'edit'" 
      :platforms="platforms"
      :data="selected" 
      @submit="handleSubmitEdit" 
      :loading="loading" 
      @goback="handleGoback" />
    <ucenter-team-access v-else-if="mode === 'access'" 
      :platforms="platforms"
      :channels="channels"
      :data="selected" 
      @submit="handleSubmitAccess" 
      :loading="loading" 
      @goback="handleGoback" />
    <ucenter-team-list v-else :data="list" @access="handleAccess" @edit="handleEdit" @remove="handleRemove" :loading="loading" @getlist="handleList">
      <el-button type="primary" @click="handleCreate">创建团队</el-button>
    </ucenter-team-list>
    
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
import { responseDocument as responseGroupDocument } from '~/server/types/proxys/group'
import { responseDocument as responseTeamDocument } from '~/server/types/proxys/team'
import ucenterTeamList from '~/components/ucenter/team-list.vue'
import ucenterTeamCreate from '~/components/ucenter/team-create.vue'
import ucenterTeamEdit from '~/components/ucenter/team-edit.vue'
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
    ucenterTeamList,
    ucenterTeamCreate,
    ucenterTeamEdit,
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

  //@Auth.State user: responseUserDocument
  @Auth.State token: string | null
  @Setting.State channels: Array<channel.NavMenus>
  @Setting.Getter selectedChannel
  @Setting.Getter channelStore

  @Provide() list: Array<responseTeamDocument> = []
  @Provide() mode: 'list' | 'create' | 'edit' | 'access' = 'list'
  @Provide() selected: responseTeamDocument | null = null
  @Provide() loading: boolean = false
  @Provide() platforms: Array<{ key: number, label: string }> = []

  handleList (): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.post(`/ucenter/team/list`, {}, options)
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

  handleAccess (index: number, row: responseTeamDocument): void {
    this.mode = 'access'
    this.selected = row
  }

  handleEdit (index: number, row: responseTeamDocument): void {
    this.mode = 'edit'
    this.selected = row
  }

  handleRemove (index: number, row: responseTeamDocument): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.delete(`/ucenter/team/${row._id}`, {}, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.handleList()
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

  handleCreate (): void {
    this.mode = 'create'
  }

  handleSubmitCreate (values: Ucenter.CreateTeam): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.post(`/ucenter/team/create`, values, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.mode = 'list'
          return
        }
        this.$message.warning(result.Status.message || '')
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleSubmitEdit (_id: string, values: Ucenter.CreateTeam): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.post(`/ucenter/team/edit/${_id}`, values, options)
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
        let result: resufulInfo = await http.post(`/ucenter/team/access/${_id}`, values, options)
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

}
</script>