<template>
  <div>
    <div class="search-container">
      <el-form ref="theForm" label-width="100px" :inline="true" :model="values" @submit.native.prevent="submitForm">
        <el-form-item label="注册时间">
          <el-date-picker
            v-model="values.create_at"
            size="small"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="角色/用户组">
          <el-select v-model="values.groups" placeholder="请选择用户组/角色" filterable multiple collapse-tags style="width: 240px">
            <el-option v-for="item in groups" :key="item._id" :label="item.name" :value="item._id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item >
          <template slot="label">
            <el-dropdown @command="handleCommandNameType" trigger="click">
              <span class="el-dropdown-link">
                {{ findTypeNames[values.findtype]}}<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="(name, key) in findTypeNames" :key="key" :command="key">{{ name }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
          <el-input placeholder="请输入查询内容" v-model="values.findname" style="width: 300px" size="small">
          </el-input>
        </el-form-item>
        <div class="footer">
          <el-form-item >
            <el-button type="primary" native-type="submit" :loading="loading">开始查询</el-button>
          </el-form-item>
        </div>
      </el-form>
    </div>
    <el-table :data="list.data" stripe v-loading="loading">
      <el-table-column type="selection" width="40" :selectable="(row, index) => row.group.level < auth.group.level" />
      <el-table-column label="ID" width="80" fixed sortable prop="id" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户名" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="昵称" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.nickname || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="性别" width="80" align="center">
        <template slot-scope="scope">
          <span>{{ sexConfig[scope.row.sex || 0].name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色" width="120" prop="group">
        <template slot-scope="scope">
          <span>{{ scope.row.group.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="电子邮箱" width="240">
        <template slot-scope="scope">
          <el-badge is-dot :type="scope.row.binds.indexOf('email') > -1 ? 'success' : 'warning'">
            <span>{{ scope.row.email.replace(/\w{4}@/g, '****@') }}</span>
          </el-badge>
        </template>
      </el-table-column>
      <el-table-column label="手机号" width="120">
        <template slot-scope="scope">
          <el-badge is-dot :type="scope.row.binds.indexOf('mobile') > -1 ? 'success' : 'warning'">
            <span>{{ (scope.row.mobile || '--').replace(/^(\d{3})\d+(\d{4})$/, '$1****$2') }}</span>
          </el-badge>
        </template>
      </el-table-column>
      <el-table-column label="注册时间" width="160">
        <template slot-scope="scope">
          <span>{{ dateFormat(scope.row.create_at) }}</span>
        </template>
      </el-table-column>
      <el-table-column  width="280" fixed="right">
        <template slot-scope="scope">
          <div style="text-align: right; padding-right: 12px;">
            <el-button size="small" type="success" plain :disabled="scope.row.binds.indexOf('email') > -1">发送激活邮件</el-button>
            <el-button size="small" @click="handleEdit(scope.$index, scope.row)" :disabled="scope.row.group.level >= auth.group.level">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)" :disabled="scope.row.group.level >= auth.group.level">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      @current-change="handleCurrentChange"
      :current-page="conditions && conditions.page || 1"
      :page-size="list.limit"
      layout="total, prev, pager, next, jumper"
      :total="list.counts">
    </el-pagination>
  </div>
</template>

<script lang="ts">
import Component from 'nuxt-class-component'
import { Prop, Provide, Vue } from 'vue-property-decorator'
import { Form as ElForm } from 'element-ui'
import { responseDocument as responseUserDocument, listDocument as listUserDocument, FindType, FindTypeNames } from '~/server/types/proxys/user'
import { responseDocument as responseGroupDocument } from '~/server/types/proxys/group'
import moment from 'moment'
import { Ucenter } from '~/types'

interface SexConfig {
  [propsName: number]: {
    name: string
  }
}

const sexConfig: SexConfig = {
  0: { name: '未知' },
  1: { name: '男' },
  2: { name: '女' },
}

const findTypeNames: FindTypeNames = {
  username  : '用户名',
  email     : '电子邮箱',
  nickname  : '昵称',
  mobile    : '手机号'
}

const values: Ucenter.FindUser = {
  create_at: [],
  groups: [],
  findname: undefined,
  findtype: 'username'
}

@Component({
  name: 'ucenter-user-list',
  mounted () {
    this.handleList()
    setTimeout(() => {
      this.$data.showSubmit = true
    }, 1500)
    this.$emit('get-groups', 'list', this.handleBackGroups)
  }
})
export default class  extends Vue {

  @Prop({ default: { data: [], counts: 0, limit: 10 } }) list: listUserDocument
  @Prop({ default: false }) loading: boolean
  @Prop({ default: {} }) conditions: Ucenter.FindUser
  @Prop({ default: null }) auth: responseUserDocument | null

  @Provide() showSubmit: boolean = false
  @Provide() search: string = ''
  @Provide() groups: Array<responseGroupDocument> = []
  @Provide() filtersGroup: Array<{ text: string, value: string }> = []
  @Provide() sexConfig: SexConfig = sexConfig
  @Provide() values: Ucenter.FindUser = values
  //@Provide() nameType: FindType = 'username'
  @Provide() findTypeNames: FindTypeNames = findTypeNames

  handleEdit (index: number, row: responseUserDocument): void {
    this.$emit('edit', index, row)
  }

  handleDelete (index: number, row: responseUserDocument): void {
    this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
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
    this.$emit('getlist', this.conditions)
  }

  handleCurrentChange (page: number): void {
    this.$emit('getlist', { ...this.conditions, page })
  }

  submitForm (): void {
    let theForm: ElForm = <ElForm> this.$refs['theForm']
    theForm.validate((valid: any): void | false => {
      if (valid) {
        this.$emit('getlist', this.values)
      }
      else {
        return false
      }
    })
  }

  handleBackGroups (groups: Array<responseGroupDocument>): void {
    this.groups = groups
  }

  handleCommandNameType (command: FindType): void {
    this.values.findtype = command
  }

  dateFormat (date: any): string {
    return moment(date).format('YYYY-MM-DD HH:mm:ss')
  }
}
</script>