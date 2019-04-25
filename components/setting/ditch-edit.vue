<template>
  <div class="form-container">
    <h2>编辑《{{ channel.name }}》渠道</h2>
    <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="submitForm" label-width="150px">
      <el-form-item prop="label" :rules="rules.label" label="渠道标签">
        <el-input placeholder="请输入渠道标签" v-model="values.label" style="width:300px;" />
      </el-form-item>
      <el-form-item prop="name" :rules="rules.name" label="渠道名称">
        <el-input placeholder="请输入渠道名称" v-model="values.name" style="width:300px;" />
      </el-form-item>
      <el-form-item label="绑定团队">
         <el-select v-model="values.teams" placeholder="请选择团队" filterable multiple collapse-tags  style="width:300px;">
          <el-option v-for="item in teams" :key="item._id" :label="item.name" :value="item._id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="group" :rules="rules.group" label="划分组">
         <el-select v-model="values.group" placeholder="请选择组" filterable collapse-tags  style="width:300px;">
          <el-option v-for="item in group" :key="item.key" :label="item.name" :value="item.key"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item >
        <el-button type="primary" native-type="submit" :loading="loading">提 交</el-button>
        <el-button type="success" @click="handleBack">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { Route } from 'vue-router'
import Component from 'nuxt-class-component'
import { Prop, Provide, Vue } from 'vue-property-decorator'
import { Form as ElForm } from 'element-ui'
import { responseDocument as responseTeamDocument } from '~/server/types/proxys/team'
import { updateDocument as updateDitchDocument, responseDocument as responseDitchDocument } from '~/server/types/proxys/ditch'
import channel from '~/server/types/channel'
import { Rules } from '~/types/validate'
import { clone } from 'lodash'

const values: updateDitchDocument = {
  label: undefined,
  name: undefined,
  group: undefined,
  teams: []
}

const validateLabel = async (rule: any, value: any, callback: (message?: string) => any): Promise<(message?: string) => any> => {
  let valid: boolean = /^[a-zA-Z0-9]+$/.test(value)
  if (!valid) {
    return callback('渠道标签只支持大小写英文字和数字')
  }
  return callback()
}

const rules: Rules = {
  label: [
    { required: true, message: '请输入渠道标签' },
    { validator: validateLabel, trigger: ['blur', 'change'] }
  ],
  name: [
    { required: true, message: '请输入渠道名称' },
  ],
  group: [
    { required: true, message: '请选择一个组' },
  ]
}

@Component({
  name: 'setting-ditch-edit',
  mounted () {
    this.$emit('get-teams', this.handleBackTeams)
    if (this.$props.channel.options) {
      let { ditch_group } = this.$props.channel.options
      this.$data.group = ditch_group || []
    }
    let doc: responseDitchDocument | null = this.$props.data
    if (!doc) return
    this.$data.values = {
      label: doc.label,
      name: doc.name,
      group: doc.group,
      teams: doc.teams.map( o => o._id )
    }
  }
})
export default class  extends Vue {

  @Prop({ default: false }) loading: boolean
  @Prop({ default: {} }) channel: channel.NavMenus
  @Prop({ default: null }) data: responseDitchDocument | null

  @Provide() values: updateDitchDocument = values
  @Provide() rules: Rules = rules
  @Provide() teams: Array<responseTeamDocument> = []
  @Provide() group: Array<{}> = []

  submitForm (): void {
    let theForm: ElForm = <ElForm> this.$refs['theForm']
    theForm.validate((valid: any): void | false => {
      if (valid) {
        this.$emit('submit', (<responseDitchDocument> this.data)._id, this.values)
      }
      else {
        return false
      }
    })
  }

  handleBack (): void {
    this.$emit('goback', null)
  }

  handleBackTeams (teams: Array<responseTeamDocument>): void {
    this.teams = teams.filter( o => o.platform.indexOf(this.channel.id) > -1 )
  }
  
}
</script>