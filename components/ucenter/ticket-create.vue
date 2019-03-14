<template>
  <div class="form-container">
    <h2>创建邀请码</h2>
    <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="submitForm" label-width="150px">
      <el-form-item prop="group" :rules="rules.group" label="用户组/角色">
        <el-select v-model="values.group" placeholder="请选择用户组/角色" filterable>
          <el-option v-for="item in groups" :key="item._id" :label="`[${item.level}] ` + item.name" :value="item._id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="最大使用数量">
        <el-input-number size="medium" v-model="values.stint" :min="1" :max="9999"></el-input-number>
      </el-form-item>
      <el-form-item label="过期时间">
        <el-date-picker
          v-model="values.last_at"
          type="datetime"
          placeholder="选择日期时间">
        </el-date-picker>
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
import { responseDocument as responseTicketDocument } from '~/server/types/proxys/ticket'
import { responseDocument as responseGroupDocument } from '~/server/types/proxys/group'
import { Ucenter } from '~/types'
import { Rules } from '~/types/validate'

const values: Ucenter.CreateTicket = {
  group: undefined,
  stint: 1,
  last_at: new Date()
}

const rules: Rules = {
  group: [
    { required: true, message: '请选择用户组/角色' }
  ]
}

@Component({
  name: 'ucenter-ticket-create',
  mounted () {
    this.$emit('get-groups', this.handleBackGroups)
    this.$data.values = {
      group: undefined,
      stint: 1,
      last_at: new Date()
    }
  }
})
export default class  extends Vue {

  @Prop({ default: false }) loading: boolean

  @Provide() values: Ucenter.CreateTicket = values
  @Provide() rules: Rules = rules
  @Provide() groups: Array<responseGroupDocument> = []

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

  handleBackGroups (groups: Array<responseGroupDocument>): void {
    this.groups = groups
  }
  
}
</script>