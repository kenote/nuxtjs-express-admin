<template>
  <div class="form-container">
    <h2 v-if="/(team)$/.test($route.path)">团队访问权限 -- {{ data && data.name }}</h2>
    <h2 v-else>访问权限 -- {{ data && data.username }}</h2>
    <el-form ref="theForm" @submit.native.prevent="submitForm" label-width="150px">
      <el-form-item label-width="0">
        <el-tabs v-model="activeName"  tab-position="right">
          <el-tab-pane v-for="(channel, key) in channels" :key="key" :label="channel.name" :name="channel.id.toString()" :disabled="!isChannelOpen(channel.id)" style="margin: 10px 30px;">
            <el-tree
              :data="channel.navs"
              :props="{ id: 'index', label: 'name' }"
              show-checkbox
              node-key="index"
              :default-checked-keys="checkedKeys"
              @check-change="handleCheckChange"
              default-expand-all
              >
            </el-tree>
          </el-tab-pane>
        </el-tabs>
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
import { Form as ElForm, Tree as ElTree } from 'element-ui'
import { responseDocument as responseTeamDocument } from '~/server/types/proxys/team'
import { responseDocument as responseUserDocument } from '~/server/types/proxys/user'
import { Ucenter, Option, TreeData } from '~/types'
import { Rules } from '~/types/validate'
import { orderBy, clone, uniq, remove, map } from 'lodash'
import channel from '~/server/types/channel'

@Component({
  name: 'ucenter-team-access',
  mounted () {
    let doc: responseTeamDocument | responseUserDocument | null = this.$props.data
    if (!doc) return
    this.$data.checkedKeys = doc.access || []
  }
})
export default class  extends Vue {

  @Prop({ default: false }) loading: boolean
  @Prop({ default: null }) data: responseTeamDocument | responseUserDocument | null
  @Prop({ default: [] }) platforms: Array<Option>
  @Prop({ default: [] }) channels: Array<channel.NavMenus>

  @Provide() activeName: string = '1'
  @Provide() checkedKeys: string[] = []

  submitForm (): void {
    let checkedKeys: string[] = clone(this.checkedKeys)
    remove(checkedKeys, o => !/^(\/)/.test(o))
    this.$emit('submit', (<responseTeamDocument | responseUserDocument> this.data)._id, { access: checkedKeys })
  }

  handleBack (): void {
    this.$emit('goback', null)
  }

  handleCheckChange (data: any, checked: boolean, indeterminate: boolean): void {
    let checkedKeys: string[] = this.checkedKeys
    if (checked) {
      checkedKeys.push(data.index)
    }
    else {
      remove(checkedKeys, o => o === data.index)
    }
    this.checkedKeys = checkedKeys
  }

  isChannelOpen (value: number): boolean {
    if (!this.data) return false
    if (this.data['teams']) {
      let user: responseUserDocument = <responseUserDocument> this.data
      let platform = uniq(map(user.teams, 'platform').toString().split(',').map(Number))
      return platform.indexOf(value) > -1
    }
    else {
      let team: responseTeamDocument = <responseTeamDocument> this.data
      if (!team.platform) return false
      return team.platform.indexOf(value) > -1
    }
  }

  /*toChannel (channel: Array<channel.MenuItem>) {
    let _channel: Array<TreeData> = []
    for (let item of channel) {
      let children: Array<TreeData> | undefined
      if (item.children) {
        children = this.toChannel(item.children)
      }
      _channel.push({ id: item.index, label: ` - `+item.name, children })
    }
    return _channel
  }*/
  
}
</script>