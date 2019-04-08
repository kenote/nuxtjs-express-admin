<template>
  <div class="form-container">
    <h2>创建团队</h2>
    <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="submitForm" label-width="150px">
      <el-form-item prop="name" :rules="rules.name" label="团队名称">
        <el-input placeholder="请输入团队名称" v-model="values.name" style="width:300px;" />
      </el-form-item>
      <el-form-item label="描 述">
        <el-input
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 4 }"
          placeholder="请输入内容"
          style="width:450px;"
          resize="none"
          v-model="values.description">
        </el-input>
      </el-form-item>
      <el-form-item label="开放入口">
        <el-transfer 
          filterable
          :filter-method="filterMethod"
          v-model="values.platform" 
          :titles="['可选入口', '已选入口']"
          :data="platforms">
        </el-transfer>
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
import { responseDocument as responseGroupDocument } from '~/server/types/proxys/group'
import { Ucenter, Option } from '~/types'
import { Rules } from '~/types/validate'
import { orderBy, clone } from 'lodash'

const values: Ucenter.CreateTeam = {
  name: undefined,
  description: undefined,
  platform: [ 1 ]
}

const rules: Rules = {
  name: [
    { required: true, message: '请输入团队名称' },
  ]
}

@Component({
  name: 'ucenter-team-create',
  mounted () {
    this.$data.values = clone(values)
  }
})
export default class  extends Vue {

  @Prop({ default: false }) loading: boolean
  @Prop({ default: [] }) platforms: Array<Option>

  @Provide() values: Ucenter.CreateTeam = values
  @Provide() rules: Rules = rules

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

  filterMethod (query: string, item: Option): boolean {
    return item.label.indexOf(query) > -1
  }
  
}
</script>