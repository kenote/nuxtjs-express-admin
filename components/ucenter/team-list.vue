<template>
  <div>
    <el-table :data="data.filter(doc => !search || doc.name.toLowerCase().includes(search.toLowerCase()))" stripe v-loading="loading">
      <el-table-column label="ID" width="80" fixed sortable prop="id" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="团队名称" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="描述" min-width="300" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ scope.row.description || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column  width="280" fixed="right">
        <template slot="header" slot-scope="scope">
          <el-input
            :key="scope.$index"
            v-model="search"
            size="small"
            placeholder="输入关键字搜索"/>
        </template>
        <template slot-scope="scope">
          <div style="text-align: right; padding-right: 12px;">
            <el-button size="small" type="success" plain @click="handleAccess(scope.$index, scope.row)" >访问权限</el-button>
            <el-button size="small" @click="handleEdit(scope.$index, scope.row)" >编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)" >删除</el-button>
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
import { responseDocument as responseTeamDocument } from '~/server/types/proxys/team'

@Component({
  name: 'ucenter-team-list',
  mounted () {
    this.handleList()
    setTimeout(() => {
      this.$data.showSubmit = true
    }, 1500)
  }
})
export default class  extends Vue {

  @Prop({ default: [] }) data: Array<responseTeamDocument>
  @Prop({ default: false }) loading: boolean

  @Provide() showSubmit: boolean = false
  @Provide() search: string = ''

  handleAccess (index: number, row: responseTeamDocument): void {
    this.$emit('access', index, row)
  }

  handleEdit (index: number, row: responseTeamDocument): void {
    this.$emit('edit', index, row)
  }

  handleDelete (index: number, row: responseTeamDocument): void {
    this.$confirm('此操作将永久删除该团队, 是否继续?', '提示', {
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
}
</script>