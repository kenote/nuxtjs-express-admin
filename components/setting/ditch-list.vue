<template>
  <div>
    <el-table ref="filterTable" :data="data.filter(doc => !search || doc.name.toLowerCase().includes(search.toLowerCase()))" stripe v-loading="loading" @selection-change="handleSelectionChange">
      <el-table-column
        type="selection"
        width="55">
      </el-table-column>
      <el-table-column label="ID" width="80" fixed sortable prop="id" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" width="150" >
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标签" width="80" sortable prop="id" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.label }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分组" width="120" prop="group" :filters="group.map( o => ({ text: o.name, value: o.key }))" :filter-method="filterGroup" align="center">
        <template slot-scope="scope">
          <span>{{ groupName(scope.row.group) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="绑定团队" min-width="300" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ scope.row.teams.map( o => o.name ).join(',') || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column  width="300" fixed="right">
        <template slot="header" slot-scope="scope">
          <el-input
            :key="scope.$index"
            v-model="search"
            size="small"
            placeholder="输入关键字搜索"/>
        </template>
        <template slot-scope="scope">
          <div style="text-align: right; padding-right: 12px;">
            <el-button size="small" type="success" plain @click="handleCardinal(scope.$index, scope.row)">基数设置</el-button>
            <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div class="baseinfo" >
      <div class="submit-box" v-bind:class="showSubmit ? 'is-show' : ''">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Route } from 'vue-router'
import Component from 'nuxt-class-component'
import { Prop, Provide, Vue } from 'vue-property-decorator'
import { Table as ElTable } from 'element-ui'
import { responseDocument as responseDitchDocument } from '~/server/types/proxys/ditch'
import channel from '~/server/types/channel'

@Component({
  name: 'setting-ditch-list',
  mounted () {
    this.handleList()
    setTimeout(() => {
      this.$data.showSubmit = true
    }, 1500)
    if (this.$props.channel.options) {
      let { ditch_group } = this.$props.channel.options
      this.$data.group = ditch_group || []
    }
  },
  watch: {
    channel (value: channel.NavMenus): void {
      if (value.options) {
        let { ditch_group } = <any> value.options
        this.$data.group = ditch_group || []
      }
      this.clearFilter()
      this.$data.search = ''
    }
  }
})
export default class  extends Vue {

  @Prop({ default: [] }) data: Array<responseDitchDocument>
  @Prop({ default: false }) loading: boolean
  @Prop({ default: {} }) channel: channel.NavMenus

  @Provide() showSubmit: boolean = false
  @Provide() search: string = ''
  @Provide() group: Array<{}> = []

  handleEdit (index: number, row: responseDitchDocument): void {
    this.$emit('edit', index, row)
  }

  handleCardinal (index: number, row: responseDitchDocument): void {
    this.$emit('cardinal', index, row)
  }

  handleDelete (index: number, row: responseDitchDocument): void {
    this.$confirm('此操作将永久删除该渠道, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      this.$emit('remove', index, row)
    }).catch(() => {
      this.$message({
        type: 'info',
        message: '已取消删除'
      })         
    })
  }

  handleList (): void {
    this.$emit('getlist', null)
  }

  filterGroup (value: string, row: responseDitchDocument): boolean {
    console.log(row.group, value)
    return row.group === value
  }

  groupName (value: string): string {
    let _group: any = this.group.find( o => o['key'] === value ) || {}
    return _group['name'] || '--'
  }

  clearFilter (): void {
    let table: ElTable = <ElTable> this.$refs.filterTable
    table.clearFilter()
  }

  handleSelectionChange (values: Array<responseDitchDocument>): void {
    this.$emit('selectid', values.map( o => o._id ))
  }
}
</script>