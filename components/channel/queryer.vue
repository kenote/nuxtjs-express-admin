<template>
  <div class="search-container">
    <el-form ref="theForm" label-width="150px">
      <template v-for="(item, key) in queryer">
        <el-form-item :key="key" :label="item.name">
          <el-date-picker v-if="item.type === 'date-picker'"
            v-model="values[item.key]"
            size="small"
            placeholder="选择日期">
          </el-date-picker>
          <el-date-picker v-else-if="item.type === 'range-picker'"
            v-model="values[item.key]"
            size="small"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
          <el-checkbox-group v-else-if="item.type === 'checkbox'" v-model="values[item.key]">
            <template v-if="item.data">
              <el-checkbox v-for="(d, i) in item.data" :key="i" :label="d.key">{{ d.name }}</el-checkbox>
            </template>
            <template v-else-if="item.options">
              <el-checkbox v-for="(d, i) in options[item.options] || []" :key="i" :label="d.key">{{ d.name }}</el-checkbox>
            </template>
          </el-checkbox-group>
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>

<script lang="ts">
import Component from 'nuxt-class-component'
import { Prop, Provide, Vue } from 'vue-property-decorator'
import channel from '~/server/types/channel'
//import '~/assets/scss/console/channel-queryer.scss'

@Component({
  name: 'channel-queryer',
  mounted () {
    let values: {} = { test: undefined }
    for (let item of this.$props.queryer) {
      if (['range-picker', 'checkbox'].indexOf(item.type) > -1) {
        let _default = (item.default || []).map(o => o === 'now' ? new Date() : o)
        values[item.key] = _default
      }
      else {
        let _default = item.default === 'now' ? new Date() : item.default
        values[item.key] = _default || undefined
      }
    }
    this.$data.values = values
  }
})
export default class  extends Vue {

  @Prop({ default: [] }) queryer: any
  @Prop({ default: {} }) options: channel.Options

  @Provide() values: {} = {}
}
</script>
