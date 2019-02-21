<template>
  <div>
    <h3 style="margin-top: 30px;">{{ name }}</h3>
    <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="submitForm">
      <el-form-item prop="cdkey" :rules="rules.cdkey">
        <el-input :placeholder="`请输入您的${name}`" v-model="values.cdkey" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm" :loading="loading">下一步</el-button>
      </el-form-item>
      <slot></slot>
    </el-form>
  </div>
</template>

<script lang="ts">
import Component from 'nuxt-class-component'
import { Prop, Provide, Vue } from 'vue-property-decorator'
import { Form as ElForm } from 'element-ui'
import { Rules } from '~/types/validate'
import { isUUID } from 'validator'

interface Values {
  cdkey: string | undefined
}

@Component({
  name: 'account-ticket',
  data () {
    let validateCDKey = (rule: any, value: any, callback: (message?: string) => any): (message?: string) => any => {
      let valid: boolean = isUUID(value, 4)
      if (!valid) {
        return callback(`请输入正确的${ this.$props.name }`)
      }
      return callback()
    }
    let rules: Rules = {
      cdkey: [
        { required: true, message: `请输入${ this.$props.name }` },
        { validator: validateCDKey }
      ]
    }
    return { rules }
  },
})
export default class  extends Vue {

  @Prop({ default: '兑换码' }) name: string
  @Prop({ default: (value?: string) => {} }) submit: (value?: string) => void
  @Prop({ default: false }) loading: boolean

  @Provide() values: Values = { cdkey: undefined }

  submitForm (): void {
    let theForm: ElForm = <ElForm> this.$refs['theForm']
    theForm.validate((valid: any): void | false => {
      if (valid) {
        let { cdkey } = this.values
        this.submit(cdkey)
      }
      else {
        return false
      }
    })
  }
}
</script>
