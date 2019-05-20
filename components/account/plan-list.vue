<template>
  <div>
    <el-table ref="filterTable" :data="data.filter(doc => !search || doc.name.toLowerCase().includes(search.toLowerCase()))" stripe v-loading="loading" @selection-change="handleSelectionChange">
      <el-table-column
        type="selection"
        width="55">
      </el-table-column>
      <el-table-column label="ID" width="80" fixed prop="id" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" width="150" >
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="120" prop="id" align="center">
        <template slot-scope="scope">
          <span>{{ getPlanTypeName(scope.row.type) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="频道" width="120" prop="id" align="center">
        <template slot-scope="scope">
          <span>{{ getChannelName(scope.row.channel) }}</span>
        </template>
      </el-table-column>
      <el-table-column >
        
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
import { responseDocument as responsePlanDocument } from '~/server/types/proxys/plan'
import channel from '~/server/types/channel'

@Component({
  name: 'account-plan-list',
  mounted () {
    this.handleList()
    setTimeout(() => {
      this.$data.showSubmit = true
    }, 1500)
  }
})
export default class  extends Vue {

  @Prop({ default: [] }) data: Array<responsePlanDocument>
  @Prop({ default: false }) loading: boolean
  @Prop({ default: [] }) plan_type: Array<{}>
  @Prop({ default: [] }) platforms: Array<channel.NavMenus>

  @Provide() showSubmit: boolean = false
  @Provide() search: string = ''

  handleEdit (index: number, row: responsePlanDocument): void {
    this.$emit('edit', index, row)
  }

  handleDelete (index: number, row: responsePlanDocument): void {
    this.$confirm('此操作将永久删除该方案, 是否继续?', '提示', {
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

  handleSelectionChange (values: Array<responsePlanDocument>): void {
    this.$emit('selectid', values.map( o => o._id ))
  }

  getPlanTypeName (value: string): string {
    let type: any = this.plan_type.find( o => o['key'] === value )
    return type ? type.name : '--'
  }

  getChannelName (value: string): string {
    let channel: channel.NavMenus | undefined = this.platforms.find( o => o.label === value )
    return channel ? channel.name : '--'
  }

}
</script>