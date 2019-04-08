<template>
  <div class="form-container">
    <h2>编辑用户</h2>
    <el-form ref="theForm" @submit.native.prevent="submitForm" label-width="150px">
      <el-form-item label="用户名">
        <el-input v-model="values.username" style="width:300px;" />
      </el-form-item>
      <el-form-item label="用户组/角色">
        <el-select v-model="values.group" placeholder="请选择用户组/角色" :disabled="auth && auth.group.level < 9998">
          <el-option v-for="item in groups" :key="item._id" :label="`[${item.level}] ` + item.name" :value="item._id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="values.group && groupLevel(values.group) < 9000" label="选择团队">
         <el-select v-model="values.teams" placeholder="请选择团队" filterable multiple collapse-tags >
          <el-option v-for="item in teams" :key="item._id" :label="item.name" :value="item._id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="性别">
        <el-radio-group v-model="values.sex">
          <el-radio v-for="(item, key) in sexConfig" :key="key" :label="key">{{ item.name }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="电子邮箱">
        <el-input v-model="values.email" style="width:300px;" />
      </el-form-item>
      <el-form-item label="手机号码">
        <el-input v-model="values.mobile" style="width:300px;" />
      </el-form-item>
      <el-form-item label="绑定">
        <el-checkbox-group v-model="values.binds">
          <el-checkbox v-for="(name, key) in bindConfig" :key="key" :label="key">{{ name }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item >
        <el-button type="primary" native-type="submit" :loading="loading">提 交</el-button>
        <el-button type="success" @click="handleBack">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import Component from 'nuxt-class-component'
import { Prop, Provide, Vue } from 'vue-property-decorator'
import { Form as ElForm } from 'element-ui'
import { responseDocument as responseUserDocument, listDocument as listUserDocument, FindType, FindTypeNames } from '~/server/types/proxys/user'
import { responseDocument as responseGroupDocument } from '~/server/types/proxys/group'
import { responseDocument as responseTeamDocument } from '~/server/types/proxys/team'
import moment from 'moment'
import { Ucenter } from '~/types'
import { Rules } from '~/types/validate'
import { pick, map, filter } from 'lodash'

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

const bindConfig: any = {
  email: '电子邮箱',
  mobile: '手机号码'
}

const values: Ucenter.EditUser = {
  username: undefined,
  group: undefined,
  teams: [],
  email: undefined,
  mobile: undefined,
  binds: [],
  sex: '0'
}

@Component({
  name: 'ucenter-user-edit',
  mounted () {
    this.$emit('get-groups', 'lite', this.handleBackGroups)
    this.$emit('get-teams', this.handleBackTeams)
    let doc: responseUserDocument | null = this.$props.data
    if (!doc) return
    this.$data.values = {
      ...pick(doc, ['username', 'email', 'mobile', 'binds', 'sex']),
      group: doc.group._id,
      teams: map(doc.teams, '_id'),
      sex: doc.sex.toString()
    }
  }
})
export default class  extends Vue {

  @Prop({ default: false }) loading: boolean
  @Prop({ default: null }) data: responseUserDocument | null
  @Prop({ default: null }) auth: responseUserDocument | null

  @Provide() values: Ucenter.EditUser = values
  @Provide() rules: Rules
  @Provide() groups: Array<responseGroupDocument> = []
  @Provide() teams: Array<responseTeamDocument> = []
  @Provide() sexConfig: SexConfig = sexConfig
  @Provide() bindConfig: any = bindConfig

  submitForm (): void {
    let theForm: ElForm = <ElForm> this.$refs['theForm']
    theForm.validate((valid: any): void | false => {
      if (valid) {
        //this.$emit('submit', (<responseUserDocument> this.data)._id, this.values)
      }
      else {
        return false
      }
    })
  }

  handleBack (): void {
    this.$emit('goback', null)
  }

  handleBackGroups (groups: Array<responseGroupDocument>): void {
    this.groups = groups
  }

  handleBackTeams (teams: Array<responseTeamDocument>): void {
    //this.teams = teams
    if (!this.auth) return
    let _teams: string[] = map(this.auth.teams, '_id')
    this.teams = this.auth.group.level < 9000 ? filter(teams, o => _teams.indexOf(o._id) > -1) : teams
  }

  groupLevel (_id: string): number {
    let group: responseGroupDocument | undefined = this.groups.find( o => o._id === _id)
    if (!group) return -1
    return group.level
  }

}
</script>