<template>
  <page ref="thePage">
    <console-breadcrumb :channel="selectedChannel" :store="channelStore" :route="$route" />
    
    <ucenter-group-create v-if="mode === 'create'" 
      @submit="handleSubmitCreate" 
      :loading="loading" 
      @goback="handleGoback" />
    <ucenter-group-edit v-else-if="mode === 'edit'" 
      :data="selected" 
      @submit="handleSubmitEdit" 
      :loading="loading" 
      @get-stores="handleGetStores"
      @goback="handleGoback" />
    <ucenter-group-list v-else :data="list" @edit="handleEdit" @remove="handleRemove" :loading="loading" @getlist="handleList">
      <el-button type="primary" @click="handleCreate">创建用户组</el-button>
    </ucenter-group-list>
    
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
import { HeaderOptions, FileStores } from '~/server/types/resuful'
import { responseDocument as responseGroupDocument } from '~/server/types/proxys/group'
import ucenterGroupList from '~/components/ucenter/group-list.vue'
import ucenterGroupCreate from '~/components/ucenter/group-create.vue'
import ucenterGroupEdit from '~/components/ucenter/group-edit.vue'
import { Ucenter } from '~/types'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)

@Component({
  layout: 'console',
  middleware: ['authenticated'],
  components: {
    consoleBreadcrumb,
    ucenterGroupList,
    ucenterGroupCreate,
    ucenterGroupEdit
  },
  mounted () {
    
  }
})
export default class  extends Vue {

  //@Auth.State user: responseUserDocument
  @Auth.State token: string | null
  @Setting.Getter selectedChannel
  @Setting.Getter channelStore

  @Provide() list: Array<responseGroupDocument> = []
  @Provide() mode: 'list' | 'create' | 'edit' = 'list'
  @Provide() selected: responseGroupDocument | null = null
  @Provide() loading: boolean = false

  handleList (): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.post(`/ucenter/group/list`, {}, options)
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

  handleEdit (index: number, row: responseGroupDocument): void {
    this.mode = 'edit'
    this.selected = row
  }

  handleRemove (index: number, row: responseGroupDocument): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.delete(`/ucenter/group/${row._id}`, {}, options)
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

  handleSubmitCreate (values: Ucenter.CreateGroup): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.post(`/ucenter/group/create`, values, options)
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

  handleSubmitEdit (_id: string, values: Ucenter.CreateGroup): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.post(`/ucenter/group/edit/${_id}`, values, options)
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

  handleGetStores (next: (stores: FileStores) => void): void {
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.get(`/store/list`, {}, options)
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