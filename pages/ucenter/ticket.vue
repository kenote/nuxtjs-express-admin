<template>
  <page>
    <console-breadcrumb :channel="selectedChannel" :store="channelStore" :route="$route" />

    <ucenter-ticket-create v-if="mode === 'create'" 
      @submit="handleSubmitCreate" 
      :loading="loading" 
      @get-groups="handleGetGroups"
      @goback="handleGoback" />
    <ucenter-ticket-edit v-else-if="mode === 'edit'" 
      :data="selected" 
      @submit="handleSubmitEdit" 
      :loading="loading" 
      @get-groups="handleGetGroups"
      @goback="handleGoback" />
    <ucenter-ticket-list v-else :data="list" @edit="handleEdit" @remove="handleRemove" :loading="loading" @getlist="handleList" @selectid="handleSelectId">
      <el-button type="primary" @click="handleCreate">创建邀请码</el-button>
      <el-button @click="handleRomoveSelectId">删除选中</el-button>
    </ucenter-ticket-list>
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
import ucenterTicketList from '~/components/ucenter/ticket-list.vue'
import ucenterTicketCreate from '~/components/ucenter/ticket-create.vue'
import ucenterTicketEdit from '~/components/ucenter/ticket-edit.vue'
import { responseDocument as responseTicketDocument } from '~/server/types/proxys/ticket'
import { responseDocument as responseGroupDocument } from '~/server/types/proxys/group'
import { Ucenter } from '~/types'
import { isDate } from 'lodash'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)

interface Documents {
  groups: Array<responseGroupDocument>
}

@Component({
  layout: 'console',
  middleware: ['authenticated'],
  components: {
    consoleBreadcrumb,
    ucenterTicketList,
    ucenterTicketCreate,
    ucenterTicketEdit
  },
  mounted () {
    
  }
})
export default class  extends Vue {

  @Auth.State token: string | null
  @Setting.Getter selectedChannel
  @Setting.Getter channelStore

  @Provide() list: Array<responseTicketDocument> = []
  @Provide() loading: boolean = false
  @Provide() mode: 'list' | 'create' | 'edit' = 'list'
  @Provide() selected: responseTicketDocument | null = null
  @Provide() selectIds: string[] = []

  handleList (): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.post(`/ucenter/ticket/list`, {}, options)
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

  handleEdit (index: number, row: responseTicketDocument): void {
    this.mode = 'edit'
    this.selected = row
  }

  handleRemove (index: number, row: responseTicketDocument | string[]): void {
    console.log(index, row)
    let url: string = `/ucenter/ticket/${(<responseTicketDocument>row)._id}`
    let data: any = {}
    if (index === -1) {
      url = `/ucenter/ticket`
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
    this.$confirm('此操作将永久删除选中邀请码, 是否继续?', '提示', {
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

  handleGoback (): void {
    this.mode = 'list'
  }

  handleCreate (): void {
    this.mode = 'create'
  }

  handleSubmitCreate (values: Ucenter.CreateTicket): void {
    console.log(values, isDate(values.last_at))
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.post(`/ucenter/ticket/create`, values, options)
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

  handleSubmitEdit (_id: string, values: Ucenter.CreateTicket): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.post(`/ucenter/ticket/edit/${_id}`, values, options)
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

  handleSelectId (selectId: string[]): void {
    this.selectIds = selectId
  }

  handleGetGroups (next: (groups: Array<responseGroupDocument>) => void): void {
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.post(`/ucenter/group/lite`, {}, options)
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