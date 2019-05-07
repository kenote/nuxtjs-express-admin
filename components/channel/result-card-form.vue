<template>
  <el-form ref="theForm" inline :model="values" @submit.native.prevent="submitForm" class="result-card-form">
    <el-form-item style="margin-bottom: 0;width:100%">
      <el-input v-if="/^(\{)|(\})$/.test(value)" v-model="values.item" style="width:100%">
        <el-select v-model="values.select" slot="prepend" placeholder="请选择" @change="handleChangeSelect">
          <el-option v-for="(v, k) in selectKeys" :key="k" :label="v" :value="v">{{v}}</el-option>
        </el-select>
        <el-button slot="append" icon="el-icon-edit" native-type="submit"></el-button>
      </el-input>
      <el-input v-else v-model="values.item" style="width:100%">
        <el-button slot="append" icon="el-icon-edit" native-type="submit"></el-button>
      </el-input>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { Route } from 'vue-router'
import Component from 'nuxt-class-component'
import { Prop, Provide, Vue, Watch } from 'vue-property-decorator'
import { Form as ElForm } from 'element-ui'
import channel from '~/server/types/channel'
import { zipObject } from 'lodash'

interface ValueObject {
  [propsName: string]: string
}

@Component({
  name: 'result-card-form',
  created () {
    if (/^(\{)|(\})$/.test(this.$props.value)) {
      let valueObject: ValueObject = toObject(this.$props.value)
      let select: string = Object.keys(valueObject)[0]
      this.$data.selectKeys = Object.keys(valueObject)
      this.$data.values = { 
        select,
        item: valueObject[select] 
      }
    }
    else {
      this.$data.values = { item: this.$props.value }
    }
  },

})
export default class  extends Vue {

  @Prop({ default: { key: '', name: '' } }) uemit: channel.EmitItem
  @Prop({ default: '' }) value: string

  @Provide() values: any = {}
  @Provide() selectKeys: string[] = []

  handleChangeSelect (value: string): void {
    let valueObject: ValueObject = toObject(this.$props.value)
    this.values['item'] = valueObject[value]
  }

  submitForm (): void {
    let theForm: ElForm = <ElForm> this.$refs['theForm']
    theForm.validate((valid: any): void | false => {
      if (valid) {
        let _values: ValueObject | {} = {
          [this.uemit.param || 'param']: Object.values(this.values).join(':'),
          ...this.uemit.options
        }
        this.$emit('submit', _values, this.uemit.api)
      }
      else {
        return false
      }
    })
  }
}

const toObject = (value: string): ValueObject | {} => {
  let valueObject: ValueObject | {} = {}
  if (!/^(\{)|(\})$/.test(value)) return valueObject
  let valueArray: string[] = value.replace(/^(\{)|(\})$/g, '').split(/\,/)
  for (let item of valueArray) {
    if (!/\:/.test(item)) continue
    let { key, val } = zipObject(['key', 'val'], item.split(/\:/))
    valueObject[key] = val
  }
  return valueObject
}
</script>

<style lang="scss">
.result-card-form {
  .el-select .el-input {
    width: 90px;
  }
  .input-with-select .el-input-group__prepend {
    background-color: #fff;
  }
}
</style>

