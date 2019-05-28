<template>
  <div style="margin-right: 15px" v-loading="loading">
    <div style="margin-bottom: 15px;">
      <el-switch
        v-model="is_group"
        active-text="分组"
        inactive-text="不分组">
      </el-switch>
      <el-select v-model="selectedPlan" placeholder="请选择渠道方案" size="small" filterable @change="handleChangePlan" style="margin-left:15px">
        <el-option v-for="item in plans" :key="item._id" :label="item.name" :value="item._id"></el-option>
      </el-select>
      <el-button size="small" type="success" plain @click="handleSavePlan" :disabled="values.length === 0">保存为方案</el-button>
    </div>
    <el-tabs v-if="is_group" v-model="activeGroup" @tab-click="handleClickGroup" type="card">
      <el-tab-pane v-for="group in i_ditch_group" :key="group.key" :label="group.name" :name="group.key">
        <el-checkbox :indeterminate="isIndeterminate[group.key] || false" v-model="checkAllGroup[group.key]" @change="handleCheckAllGroupChange">全选</el-checkbox>
        <el-input size="mini" v-model="search[group.key]" style="width: 150px; bor" @change="handleInputSearch" >
          <i slot="suffix" class="el-icon-error" @click="handleCleanSearch" v-if="search[group.key]"></i>
        </el-input>
        <el-checkbox-group v-model="values" @change="handleCheckChange">
          <template v-for="ditch in ditchs.filter( o => o.group === group.key )">
            <el-checkbox :label="ditch.label" :key="ditch._id" v-show="searchDitch(ditch.name)">{{ ditch.name }}</el-checkbox>
          </template>
        </el-checkbox-group>
      </el-tab-pane>
    </el-tabs>
    <div v-else>
      <el-checkbox :indeterminate="isIndeterminateAll" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
      <el-input size="mini" v-model="searchall" style="width: 150px; bor" @change="handleInputSearch" >
        <i slot="suffix" class="el-icon-error" @click="handleCleanSearchAll" v-if="searchall"></i>
      </el-input>
      <el-checkbox-group v-model="values" @change="handleCheckChange">
        <template v-for="ditch in ditchs">
          <el-checkbox :label="ditch.label" :key="ditch._id" v-show="searchAllDitch(ditch.name)">{{ ditch.name }}</el-checkbox>
        </template>
      </el-checkbox-group>
    </div>
    
    <el-dialog v-if="dialog.visible" title="选择渠道方案" :visible="dialog.visible" @close="handleDialogColse">
      
    </el-dialog>
  </div>
</template>

<script lang="ts">
import Component from 'nuxt-class-component'
import { Prop, Provide, Vue } from 'vue-property-decorator'
import channel from '~/server/types/channel'
import { responseDocument as responseDitchDocument } from '~/server/types/proxys/ditch'
import { responseDocument as responsePlanDocument, createDocument as createPlanDocument } from '~/server/types/proxys/plan'
import http, { resufulInfo } from '~/utils/http'
import { HeaderOptions } from '~/server/types/resuful'
import * as yaml from 'js-yaml'

@Component({
  name: 'ditch-picker',
  created () {
    this.handleGetDitchGroups()
  },
  mounted () {
    if (this.$props.fetch) {
      this.handleGetDitchs()
      this.handleGetPlan()
    }
  },
  watch: {
    values (ditchs: string[]): void {
      this.values = ditchs
      for (let group of this.i_ditch_group) {
        let _ditchs: Array<responseDitchDocument> = this.ditchs.filter( o => o.group === group.key )
        let m_ditchs: Array<responseDitchDocument> = _ditchs.filter( o => ditchs.indexOf(o.label) > -1 )
        this.checkAllGroup[group.key] = m_ditchs.length === _ditchs.length
        this.isIndeterminate[group.key] = m_ditchs.length > 0 && m_ditchs.length < _ditchs.length
      }
    }
  }
})
export default class  extends Vue {

  @Prop({ default: undefined }) fetch: string
  @Prop({ default: null }) token: string | null
  @Prop({ default: () => [] }) value: string[]
  @Prop({ default: '' }) channel: string

  @Provide() ditchs: Array<responseDitchDocument> = []
  @Provide() values: string[] = []
  @Provide() ditch_group: Array<{ key: string, name: string }> = []
  @Provide() i_ditch_group: Array<{ key: string, name: string }> = []

  @Provide() activeGroup: string = ''
  @Provide() loading: boolean = false
  @Provide() checkAllGroup: { [propsName: string]: boolean } = {}
  @Provide() isIndeterminate: { [propsName: string]: boolean } = {}
  @Provide() search: { [propsName: string]: string | undefined } = {}
  @Provide() is_group: boolean = true
  @Provide() searchall: string = ''
  @Provide() checkAll: boolean = false
  @Provide() isIndeterminateAll: boolean = false
  @Provide() dialog: { visible: boolean } = { visible: false }
  @Provide() plans: Array<responsePlanDocument> = []
  @Provide() selectedPlan: string = ''

  handleClickGroup (group: any, event: MouseEvent): void {
    //console.log(group, event)
  }

  handleCheckChange (values: string[]): void {
    let checkedCount = values.length
    this.checkAll = checkedCount === this.ditchs.length
    this.isIndeterminateAll = checkedCount > 0 && checkedCount < this.ditchs.length 
    this.selectedPlan = ''
    this.$emit('change', values)
  }

  handleInputSearch (value: string): void {
    console.log(value)
  }

  handleCleanSearch (): void {
    this.search[this.activeGroup] = undefined
  }

  handleCleanSearchAll (): void {
    this.searchall = ''
  }

  searchDitch (value: string): boolean {
    if (this.search[this.activeGroup] === '*') return true
    return new RegExp(this.search[this.activeGroup] || '').test(value)
  }

  searchAllDitch (value: string): boolean {
    if (this.searchall === '*') return true
    return new RegExp(this.searchall).test(value)
  }

  handleCheckAllGroupChange (value: any): void {
    let _ditchs: Array<responseDitchDocument> = this.ditchs.filter( o => o.group === this.activeGroup )
    if (value) {
      this.values = Array.from(new Set(this.values.concat(_ditchs.map( o => o.label ))))
    }
    else {
      this.values = this.values.filter( v => _ditchs.map( o => o.label ).indexOf(v) === -1 )
    }
    this.isIndeterminate[this.activeGroup] = false
    let checkedCount = this.values.length
    this.checkAll = checkedCount === this.ditchs.length
    this.isIndeterminateAll = checkedCount > 0 && checkedCount < this.ditchs.length
    this.selectedPlan = ''
    this.$emit('change', this.values)
  }

  handleCheckAllChange (value: any): void {
    let _ditchs: Array<responseDitchDocument> = this.ditchs
    if (value) {
      this.values = Array.from(new Set(this.values.concat(_ditchs.map( o => o.label ))))
    }
    else {
      this.values = this.values.filter( v => _ditchs.map( o => o.label ).indexOf(v) === -1 )
    }
    this.isIndeterminateAll = false
    this.$emit('change', this.values)
  }

  handleGetDitchGroups (): void {
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.get(`/channel/${this.channel}/ditch-group`, {}, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.ditch_group = result.data
          return
        }
        this.$message.warning(result.Status.message || '')
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleGetDitchs (): void {
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.get(this.fetch, {}, options)
        this.loading = false
        if (result.Status.code === 0) {
          let _ditchs: Array<responseDitchDocument> = result.data || []
          this.ditchs = _ditchs
          this.$emit('ditchs', _ditchs)
          let ditch_group: Array<{ key: string, name: string }> = []
          for (let group of this.ditch_group) {
            _ditchs.filter( o => o.group === group.key ).length > 0 && ditch_group.push(group)
          }
          this.i_ditch_group = ditch_group
          this.activeGroup = ditch_group.length > 0 ? ditch_group[0].key : ''
          return
        }
        this.$message.warning(result.Status.message || '')
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleGetPlan (): void {
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.get(`plan/list/ditch/${this.channel}`, {}, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.plans = result.data || []
          return
        }
        this.$message.warning(result.Status.message || '')
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleChangePlan (value: string): void {
    let plan: responsePlanDocument | undefined = this.plans.find( o => o._id === value )
    if (plan) {
      let _value: string[] = yaml.load(plan.plan)
      this.values = _value
      this.$emit('change', this.values)
    }
  }

  handleSavePlan (): void {

    this.$prompt('请输入方案名称', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
    .then(({ value }) => {
      this.handlePostPlan(value)
    })
    .catch(() => {
      this.$message({
        type: 'info',
        message: '取消输入'
      })
    })
  }

  handlePostPlan (name: string): void {
    let plan: string = yaml.dump(this.values)
    let document: createPlanDocument = {
      name,
      type: 'ditch',
      channel: this.channel,
      plan
    }
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token || undefined
        }
        let result: resufulInfo = await http.post(`plan/create`, document, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.plans.push(result.data)
          return
        }
        this.$message.warning(result.Status.message || '')
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleDialogData (): void {
    this.dialog = { visible: true }
  }

  handleDialogColse (): void {
    this.dialog = { visible: false }
  }
}
</script>