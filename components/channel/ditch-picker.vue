<template>
  <div style="margin-right: 15px" v-loading="loading">
    <el-tabs v-model="activeGroup" @tab-click="handleClickGroup" type="card">
      <el-tab-pane v-for="group in i_ditch_group" :key="group.key" :label="group.name" :name="group.key">
        <el-checkbox :indeterminate="isIndeterminate[group.key] || false" v-model="checkAll[group.key]" @change="handleCheckAllChange">全选</el-checkbox>
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
  </div>
</template>

<script lang="ts">
import Component from 'nuxt-class-component'
import { Prop, Provide, Vue } from 'vue-property-decorator'
import channel from '~/server/types/channel'
import { responseDocument as responseDitchDocument } from '~/server/types/proxys/ditch'
import http, { resufulInfo } from '~/utils/http'
import { HeaderOptions } from '~/server/types/resuful'

@Component({
  name: 'ditch-picker',
  mounted () {
    if (this.$props.fetch) {
      this.handleGetDitchs()
    }
  },
  watch: {
    values (ditchs: string[]): void {
      this.values = ditchs
      for (let group of this.i_ditch_group) {
        let _ditchs: Array<responseDitchDocument> = this.ditchs.filter( o => o.group === group.key )
        let m_ditchs: Array<responseDitchDocument> = _ditchs.filter( o => ditchs.indexOf(o.label) > -1 )
        this.checkAll[group.key] = m_ditchs.length === _ditchs.length
        this.isIndeterminate[group.key] = m_ditchs.length > 0 && m_ditchs.length < _ditchs.length
      }
    }
  }
})
export default class  extends Vue {

  @Prop({ default: undefined }) fetch: string
  @Prop({ default: [] }) ditch_group: Array<{ key: string, name: string }>
  @Prop({ default: null }) token: string | null
  @Prop({ default: () => [] }) value: string[]

  @Provide() ditchs: Array<responseDitchDocument> = []
  @Provide() values: string[] = []
  @Provide() i_ditch_group: Array<{ key: string, name: string }> = []

  @Provide() activeGroup: string = ''
  @Provide() loading: boolean = false
  @Provide() checkAll: { [propsName: string]: boolean } = {}
  @Provide() isIndeterminate: { [propsName: string]: boolean } = {}
  @Provide() search: { [propsName: string]: string | undefined } = {}

  handleClickGroup (group: any, event: MouseEvent): void {
    //console.log(group, event)
  }

  handleCheckChange (values: string[]): void {
    this.$emit('change', values)
  }

  handleInputSearch (value: string): void {
    console.log(value)
  }

  handleCleanSearch (): void {
    this.search[this.activeGroup] = undefined
  }

  searchDitch (value: string): boolean {
    if (this.search[this.activeGroup] === '*') return true
    return new RegExp(this.search[this.activeGroup] || '').test(value)
  }

  handleCheckAllChange (value: any): void {
    let _ditchs: Array<responseDitchDocument> = this.ditchs.filter( o => o.group === this.activeGroup )
    if (value) {
      this.values = Array.from(new Set(this.values.concat(_ditchs.map( o => o.label ))))
    }
    else {
      this.values = this.values.filter( v => _ditchs.map( o => o.label ).indexOf(v) === -1 )
    }
    this.isIndeterminate[this.activeGroup] = false
    this.$emit('change', this.values)
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
}
</script>