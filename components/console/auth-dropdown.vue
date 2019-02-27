<template>
  <el-dropdown @command="command" trigger="click" @visible-change="handleVisible">
    <a class="header-link" v-bind:class="visible ? 'active' : ''">
      <span class="el-dropdown-link">
        {{ auth.username || '' }}
      </span>
    </a>
    <el-dropdown-menu slot="dropdown" class="header-link-dropdown">
      <div class="header-link-dropdown-head">
        <h3><span>{{ auth.username || '' }}</span></h3>
        <el-row>
          <template v-for="(entrance, key) in userEntrance">
            <el-col :span="8"  v-if="key < 3" :key="key">
              <el-dropdown-item :command="entrance.command">{{ entrance.name }}</el-dropdown-item>
            </el-col>
          </template>
        </el-row>
      </div>
      <el-dropdown-item divided></el-dropdown-item>
      <template v-for="(entrance, key) in userEntrance">
        <el-dropdown-item v-if="key >= 3" :key="key" :command="entrance.command">{{ entrance.name }}</el-dropdown-item>
      </template>
      <el-dropdown-item divided style="text-align: center" command="command:logout">退出控制台</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script lang="ts">
import Component from 'nuxt-class-component'
import { Prop, Vue, Provide } from 'vue-property-decorator'
import { Dropdown } from '~/types'

@Component({
  name: 'auth-dropdown'
})
export default class  extends Vue {

  @Prop({ default: undefined }) auth: any
  @Prop({ default: (value: string): void => {} }) command: (value: string) => void
  @Prop({ default: [] }) userEntrance: Dropdown.MenuItem

  @Provide() visible: boolean = false

  handleVisible (visible: boolean): void {
    this.visible = visible
  }

}
</script>