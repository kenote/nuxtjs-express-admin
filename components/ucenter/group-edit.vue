<template>
  <div class="form-container">
    <h2>编辑用户组</h2>
    <el-form ref="theForm" :model="values" @submit.native.prevent="submitForm" label-width="150px">
      <el-form-item prop="name" :rules="rules.name" label="角色名称">
        <el-input placeholder="请输入角色名称" v-model="values.name" :rules="rules" style="width:300px;" />
      </el-form-item>
      <el-form-item label="权 级">
        <el-input-number size="medium" v-model="values.level" :min="minLevel" :max="maxLevel"></el-input-number>
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
  name: 'ucenter-group-edit',
  mounted () {
    let doc: responseGroupDocument | null = this.$props.data
    if (!doc) return
    this.$data.values = {
      name: doc.name,
      level: doc.level,
      description: doc.description
    }
    if (doc.level > 9997) {
      this.$data.minLevel = doc.level
      this.$data.maxLevel = doc.level
    }
  }
})
export default class  extends Vue {

  @Prop({ default: false }) loading: boolean
  @Prop({ default: null }) data: responseGroupDocument | null

  @Provide() values: Ucenter.CreateGroup = values
  @Provide() rules: Rules = rules
  @Provide() minLevel: number = 1001
  @Provide() maxLevel: number = 9997

  submitForm (): void {
    let theForm: ElForm = <ElForm> this.$refs['theForm']
    theForm.validate((valid: any): void | false => {
      if (valid) {
        this.$emit('submit', (<responseGroupDocument> this.data)._id, this.values)
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