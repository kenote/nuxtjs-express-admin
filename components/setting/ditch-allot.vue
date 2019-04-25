<template>
  <div class="form-container">
    <h2>分配《{{ channel.name }}》渠道</h2>
    <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="submitForm" label-width="150px">
      <el-form-item prop="team" :rules="rules.team" label="选择团队">
         <el-select v-model="values.team" placeholder="请选择团队" filterable collapse-tags  style="width:300px;" @change="handleChangeTeam">
          <el-option v-for="item in teams" :key="item._id" :label="item.name" :value="item._id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="渠道分配" >
         <el-transfer v-model="values.ditchs" :data="ditchs" :props="{ key: '_id', label: 'name' }" filterable :titles="['可选', '已选']"></el-transfer>
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
import { allotDocument as allotDitchDocument, responseDocument as responseDitchDocument } from '~/server/types/proxys/ditch'
import channel from '~/server/types/channel'
import { Rules } from '~/types/validate'
import { clone } from 'lodash'

const values: allotDitchDocument = {
  team: undefined,
  ditchs: [],
  raw_ditchs: []
}

const validateLabel = async (rule: any, value: any, callback: (message?: string) => any): Promise<(message?: string) => any> => {
  let valid: boolean = /^[a-zA-Z0-9]+$/.test(value)
  if (!valid) {
    return callback('渠道标签只支持大小写英文字和数字')
  }
  return callback()
}

const rules: Rules = {
  team: [
    { required: true, message: '请选择团队' },
  ]
}

@Component({
  name: 'setting-ditch-allot',
  mounted () {
    this.$emit('get-teams', this.handleBackTeams)
    this.$data.values = clone(values)
  }
})
export default class  extends Vue {

  @Prop({ default: false }) loading: boolean
  @Prop({ default: {} }) channel: channel.NavMenus
  @Prop({ default: [] }) ditchs: Array<responseDitchDocument>

  @Provide() values: allotDitchDocument = values
  @Provide() rules: Rules = rules
  @Provide() teams: Array<responseTeamDocument> = []

  submitForm (): void {
    let theForm: ElForm = <ElForm> this.$refs['theForm']
    theForm.validate((valid: any): void | false => {
      if (valid) {
        this.$emit('submit', this.values)
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

  handleChangeTeam (value: string): void {
    let _ditchs: string[] = this.ditchs.filter( o => o.teams.map( t => t._id ).indexOf(value) > -1 ).map( o => o._id )
    this.values.ditchs = clone(_ditchs)
    this.values.raw_ditchs = clone(_ditchs)
  }
  
}
</script>