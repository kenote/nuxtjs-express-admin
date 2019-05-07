<template>
  <page ref="thePage">
    <console-breadcrumb :channel="selectedChannel" :store="channelStore" :route="$route" />
    <setting-ditch-create v-if="mode === 'create'" 
      @submit="handleSubmitCreate" 
      :channel="channels.find( o => o.id === channel )"
      :loading="loading" 
      @get-teams="handleGetTeams"
      @goback="handleGoback" />
    <setting-ditch-allot v-else-if="mode === 'allot'" 
      @submit="handleSubmitAllot" 
      :channel="channels.find( o => o.id === channel )"
      :ditchs="list"
      :loading="loading" 
      @get-teams="handleGetTeams"
      @goback="handleGoback" />
    <setting-ditch-edit v-else-if="mode === 'edit'" 
      :data="selected" 
      @submit="handleSubmitEdit" 
      :channel="channels.find( o => o.id === channel )"
      :loading="loading" 
      @get-teams="handleGetTeams"
      @goback="handleGoback" />
    <setting-ditch-cardinal v-else-if="mode === 'cardinal'" 
      :data="selected" 
      @submit="handleSubmitCardinal" 
      :channel="channels.find( o => o.id === channel )"
      :loading="loading" 
      @goback="handleGoback" />
    <div v-else>
      <setting-ditch-list 
        :data="list" 
        :channel="channels.find( o => o.id === channel )"
        :loading="loading" 
        @edit="handleEdit"
        @remove="handleRemove"
        @cardinal="handleCardinal"
        @selectid="handleSelectId"
        @getlist="handleList" >
        <el-select v-model="channel" placeholder="请选择" style="margin-right: 10px" @change="handleChangeChannel">
          <el-option
            v-for="item in channels.filter( o => o.id > 1000 && o.id < 2000 )"
            :key="item.id"
            :label="`[${item.id}] ${item.name}`"
            :value="item.id">
          </el-option>
        </el-select>
        <el-button type="primary" @click="handleCreate" :disabled="channels.filter( o => o.id > 1000 && o.id < 2000 ).length < 1">添加新渠道</el-button>
        <el-button type="success" @click="handleAllot" :disabled="channels.filter( o => o.id > 1000 && o.id < 2000 ).length < 1">渠道分配</el-button>
        <el-button @click="handleRomoveSelectId">删除选中</el-button>
      </setting-ditch-list>
    </div>
    
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
import settingDitchList from '~/components/setting/ditch-list.vue'
import settingDitchCreate from '~/components/setting/ditch-create.vue'
import settingDitchAllot from '~/components/setting/ditch-allot.vue'
import settingDitchEdit from '~/components/setting/ditch-edit.vue'
import settingDitchCardinal from '~/components/setting/ditch-cardinal.vue'
import { responseDocument as responseDitchDocument, updateDocument as updateDitchDocument, allotDocument as allotDitchDocument } from '~/server/types/proxys/ditch'
import { responseDocument as responseTeamDocument } from '~/server/types/proxys/team'
import channel from '~/server/types/channel'
import http, { resufulInfo } from '~/utils/http'
import { HeaderOptions } from '~/server/types/resuful'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)

@Component({
  layout: 'console',
  middleware: ['authenticated'],
  components: {
    consoleBreadcrumb,
    settingDitchList,
    settingDitchCreate,
    settingDitchAllot,
    settingDitchEdit,
    settingDitchCardinal
  },
  mounted () {
    
  }
})
export default class  extends Vue {

  @Auth.State token: string | null
  @Setting.State channels: Array<channel.NavMenus>
  @Setting.Getter selectedChannel
  @Setting.Getter channelStore

  @Provide() list: Array<responseDitchDocument> = []
  @Provide() mode: 'list' | 'create' | 'edit' | 'allot' | 'cardinal' = 'list'
  @Provide() selected: responseDitchDocument | null = null
  @Provide() selectIds: string[] = []
  @Provide() loading: boolean = false
  @Provide() channel: number = 1001

  handleList (): void {
    let _channel: channel.NavMenus = <channel.NavMenus> this.channels.find( o => o.id === this.channel )
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.get(`/setting/ditch/list/${_channel.label}`, {}, options)
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

  handleGoback (): void {
    this.mode = 'list'
  }

  handleCreate (): void {
    this.mode = 'create'
  }

  handleAllot (): void {
    this.mode = 'allot'
  }

  handleEdit (index: number, row: responseDitchDocument): void {
    this.mode = 'edit'
    this.selected = row
  }

  handleCardinal (index: number, row: responseDitchDocument): void {
    this.mode = 'cardinal'
    this.selected = row
  }

  handleSelectId (selectId: string[]): void {
    this.selectIds = selectId
  }

  handleSubmitCreate (values: updateDitchDocument): void {
    let _channel: channel.NavMenus = <channel.NavMenus> this.channels.find( o => o.id === this.channel )
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.post(`/setting/ditch/create/${_channel.label}`, values, options)
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

  handleSubmitAllot (values: allotDitchDocument): void {
    let _channel: channel.NavMenus = <channel.NavMenus> this.channels.find( o => o.id === this.channel )
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.post(`/setting/ditch/allot/${_channel.label}`, values, options)
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

  handleSubmitEdit (_id: string, values: updateDitchDocument): void {
    let _channel: channel.NavMenus = <channel.NavMenus> this.channels.find( o => o.id === this.channel )
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.post(`/setting/ditch/edit/${_channel.label}/${_id}`, values, options)
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

  handleSubmitCardinal (_id: string, values: any): void {
    let _channel: channel.NavMenus = <channel.NavMenus> this.channels.find( o => o.id === this.channel )
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.post(`/setting/ditch/cardinal/${_channel.label}/${_id}`, values, options)
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

  handleRemove (index: number, row: responseDitchDocument | string[]): void {
    let _channel: channel.NavMenus = <channel.NavMenus> this.channels.find( o => o.id === this.channel )
    let url: string = `/setting/ditch/${_channel.label}/${(<responseDitchDocument>row)._id}`
    let data: any = {}
    if (index === -1) {
      url = `/setting/ditch/${_channel.label}`
      data = { _ids: row }
    }
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.delete(url, data, options)
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

  handleRomoveSelectId (): void {
    if (this.selectIds.length === 0) return
    this.$confirm('此操作将永久删除选中渠道, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      this.handleRemove(-1, this.selectIds)
    }).catch(() => {
      this.$message({
        type: 'info',
        message: '已取消删除'
      })         
    })
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

  handleChangeChannel (value: number): void {
    this.channel = value
    this.handleList()
  }

}
</script>