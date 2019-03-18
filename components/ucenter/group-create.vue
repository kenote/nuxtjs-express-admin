<template>
  <div class="form-container">
    <h2>创建用户组</h2>
    <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="submitForm" label-width="150px">
      <el-form-item prop="name" :rules="rules.name" label="角色名称">
        <el-input placeholder="请输入角色名称" v-model="values.name" style="width:300px;" />
      </el-form-item>
      <el-form-item label="权 级">
        <el-input-number size="medium" v-model="values.level" :min="1001" :max="9997"></el-input-number>
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
import { Ucenter } from '~/types'
import { Rules } from '~/types/validate'

const values: Ucenter.CreateGroup = {
  name: undefined,
  level: 1001,
  description: undefined
}

const rules: Rules = {
  name: [
    { required: true, message: '请输入角色名称' },
  ]
}

@Component({
  name: 'ucenter-group-create',
  mounted () {
    
  }
})
export default class  extends Vue {

  @Prop({ default: false }) loading: boolean

  @Provide() values: Ucenter.CreateGroup = values
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
  
}
</script>