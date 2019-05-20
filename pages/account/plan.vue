<template>
  <page>
    <console-breadcrumb :channel="selectedChannel" :store="channelStore" :route="$route" />
    
    <account-plan-create v-if="mode === 'create'" 
      :plan_type="plan_type"
      :platforms="platforms"
      @submit="handleSubmitCreate" 
      @goback="handleGoback" />
    <account-plan-edit v-else-if="mode === 'edit'" 
      :plan_type="plan_type"
      :platforms="platforms"
      :data="selected" 
      @submit="handleSubmitEdit"
      @goback="handleGoback" />
    <div v-else>
      <account-plan-list
        :data="list"
        :loading="loading"
        :plan_type="plan_type"
        :platforms="platforms"
        @edit="handleEdit"
        @remove="handleRemove"
        @selectid="handleSelectId"
        @getlist="handleList" >
        <el-button type="primary" @click="handleCreate">添加新方案</el-button>
        <el-button @click="handleRomoveSelectId">删除选中</el-button>
      </account-plan-list>
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
import accountPlanList from '~/components/account/plan-list.vue'
import accountPlanCreate from '~/components/account/plan-create.vue'
import accountPlanEdit from '~/components/account/plan-edit.vue'
import { responseDocument as responsePlanDocument, createDocument as createPlanDocument, updateDocument as updatePlanDocument } from '~/server/types/proxys/plan'
import { responseDocument as responseUserDocument } from '~/server/types/proxys/user'
import channel from '~/server/types/channel'
import http, { resufulInfo } from '~/utils/http'
import { HeaderOptions } from '~/server/types/resuful'
import { map, uniq, chunk } from 'lodash'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)

@Component({
  layout: 'console',
  middleware: ['authenticated'],
  components: {
    consoleBreadcrumb,
    accountPlanList,
    accountPlanCreate,
    accountPlanEdit
  },
  mounted () {
    if (this.selectedChannel.options) {
      let options = this.selectedChannel.options || {}
      this.$data.plan_type = options.plan_type || []
    }
    if (!this.user) return
    let platform: Array<number> | undefined
    if (this.user.group.level < 9000) {
      platform = uniq(map(this.user.teams, 'platform').toString().split(',')).map(Number)
    }
    this.$data.platforms = this.filterChannels(platform)
  }
})
export default class  extends Vue {

  @Auth.State token: string | null
  @Auth.State user: responseUserDocument
  @Setting.State channels: Array<channel.NavMenus>
  @Setting.Getter selectedChannel
  @Setting.Getter channelStore

  @Provide() list: Array<responsePlanDocument> = []
  @Provide() mode: 'list' | 'create' | 'edit' = 'list'
  @Provide() selected: responsePlanDocument | null = null
  @Provide() selectIds: string[] = []
  @Provide() loading: boolean = false
  @Provide() plan_type: Array<{}> = []
  @Provide() platforms: Array<channel.NavMenus> = []

  handleList (): void {
    this.loading = true
    this.list = []
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.get(`/plan/list`, {}, options)
        this.loading = false
        if (result.Status.code === 0) {
          let chunkData: Array<Array<any>> = chunk(result.data, 10)
          for (let item of chunkData) {
            await this.pollingSetData(item)
          }
          return
        }
        this.$message.warning(result.Status.message || '')
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 800)
  }

  async pollingSetData (data: Array<responsePlanDocument>): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.list.length > 0) {
        let setData: any = setTimeout(() => {
          this.list.push(...data)
          clearTimeout(setData)
          resolve(1)
        }, 300)
      }
      else {
        this.list = data
        resolve(1)
      }
    })
  }

  handleGoback (): void {
    this.mode = 'list'
  }

  handleCreate (): void {
    this.mode = 'create'
  }

  handleEdit (index: number, row: responsePlanDocument): void {
    this.mode = 'edit'
    this.selected = row
  }

  handleSelectId (selectId: string[]): void {
    this.selectIds = selectId
  }

  handleSubmitCreate (values: createPlanDocument): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.post(`/plan/create`, values, options)
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

  handleSubmitEdit (_id: string, values: updatePlanDocument): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.post(`/plan/edit/${_id}`, values, options)
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

  handleRemove (index: number, row: responsePlanDocument | string[]): void {
    let url: string = `/plan/${(<responsePlanDocument>row)._id}`
    let data: any = {}
    if (index === -1) {
      url = `/plan`
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
    this.$confirm('此操作将永久删除选中方案, 是否继续?', '提示', {
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

  filterChannels (platform: Array<number> | undefined): Array<channel.NavMenus> {
    if (!platform) return this.channels
    return this.channels.filter( o => platform.indexOf(o.id) > -1 )
  }

}
</script>