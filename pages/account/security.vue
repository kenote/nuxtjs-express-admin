<template>
  <page>
    <console-breadcrumb :channel="selectedChannel" :store="channelStore" :route="$route" />

    <div class="security-container">
      <div class="panel" v-for="(item, key) in overview" :key="key">
        <div class="panel-body">
          <div class="panel-content">
            <h4>
              {{ item.name }}
              <i :class="item.icon" />
            </h4>
            <p v-if="item.data">{{ item.data.name }}：{{ item.data.format && item.data.format(item.data.value) || item.data.value || '--' }}</p>
            <p v-if="isString(item.description)">{{ item.description }}</p>
            <template v-else-if="isArray(item.description)">
              <p v-for="(p, k) in item.description" :key="k">{{ p }}</p>
            </template>
            <template v-else-if="isObject(item.description)">
              <h4>{{ item.description.title }}</h4>
              <ul class="row-inline">
                <li v-for="(c, k) in item.description.context" :key="k">{{ c }}</li>
              </ul>
            </template>
          </div>
          <div class="panel-sidebar">
            <el-button v-if="item.type === 'success'" type="success" size="medium" @click="item.click && item.click()">修改</el-button>
            <el-button v-else-if="item.type === 'info'" type="warning" size="medium" @click="item.click && item.click()">设置</el-button>
            <el-button v-else type="danger" size="medium" @click="item.click && item.click()">注销</el-button>
          </div>
        </div>
      </div>
    </div>
  </page>
</template>
<script lang="ts">
import Component from 'nuxt-class-component'
import { Provide, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import * as setting from '~/store/modules/setting'
import * as auth from '~/store/modules/auth'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import consoleBreadcrumb from '~/components/console/breadcrumb.vue'
import { isString, isArray, isObject, clone } from 'lodash'
import { responseDocument as responseUserDocument } from '~/server/types/proxys/user'
import { Security } from '~/types'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)

const overview: Array<Security.Overview> = [
  {
    key: 'password',
    type: 'success',
    name: '登录密码',
    icon: 'el-icon-success success',
    description: [
      '安全性高的密码可以使账号更安全。',
      '设置一个包含字母，符号或数字中至少两项且长度超过 8 位的密码。'
    ]
  },
  {
    key: 'email',
    type: 'info',
    name: '邮箱验证',
    icon: 'el-icon-info info',
    data: {
      name: '您的邮箱',
      format: (value: string) => value && value.replace(/\w{4}@/g, '****@')
    },
    description: {
      title: '您的绑定邮箱可用于',
      context: [
        '安全管理，密码重置找回',
        '账号使用，邮箱快捷登录',
        '服务通知，反馈等'
      ]
    }
  },
  {
    key: 'mobile',
    type: 'info',
    name: '手机验证',
    icon: 'el-icon-info info',
    data: {
      name: '您的手机',
      format: (value: string) => value && value.replace(/^(\d{3})\d+(\d{4})$/, '$1****$2')
    },
    description: {
      title: '您的绑定手机号可用于',
      context: [
        '安全管理，密码重置找回',
        '账号使用，手机快捷登录',
        '服务通知，反馈等'
      ]
    }
  },
  {
    key: 'remove',
    type: 'warning',
    icon: 'el-icon-warning warning',
    name: '注销账号',
    description: '如果您不再使用此账号，可以将其注销。账号成功注销后，其下所有服务、数据及隐私信息将会被删除并将无法恢复'
  }
]

@Component({
  layout: 'console',
  middleware: ['authenticated'],
  components: {
    consoleBreadcrumb
  },
  mounted () {
    if (!this.user) return
    this.updateSecurity()
  }
})
export default class  extends Vue {

  @Auth.State user: responseUserDocument
  @Setting.Getter selectedChannel
  @Setting.Getter channelStore

  @Provide() overview: Array<Security.Overview> = overview
  @Provide() isString: (value: any) => boolean = isString
  @Provide() isArray: (value: any) => boolean = isArray
  @Provide() isObject: (value: any) => boolean = isObject

  updateSecurity (): void {
    let overview: Array<Security.Overview> = this.overview
    for (let item of overview) {
      updateOverviewItem(item, 'email', this.user)
      updateOverviewItem(item, 'mobile', this.user)
      item.click = () => this.handleOverview(item.key)
    }
    this.overview = clone(overview)
  }

  handleOverview (key: string): void {
    console.log(key)
  }

}

function updateOverviewItem (item: Security.Overview, key: string, user: responseUserDocument): void {
  if (item.key === key && item.data) {
    item.data.value = user[key]
    let isBind: boolean = user.binds.indexOf(item.key) > -1
    item.type = isBind ? 'success' : 'info'
    item.icon = isBind ? 'el-icon-success success' : 'el-icon-info info'
  }
}
</script>

<style lang="scss">
.security-container {
  padding: 0 30px;
  font-family: Lantinghei;
  color: #444242;
  max-width: 960px;
  margin: auto;

  .panel {
    //min-height: 180px;

    .panel-body {
      display: flex;
      justify-content: space-between;
      //align-items: center;
      min-height: 100px;
      padding: 44px 30px;

      .panel-content {
        padding: 0 20px 0 0;

        h4 {
          height: 26px;
          margin: 0 0 20px;
          line-height: 26px;
          font-size: 18px;
          font-weight: 400;

          i {
            font-size: 20px;

            &.success {
              color: #4CAF50;
            }

            &.info {
              color: #ffc107;
            }

            &.warning {
              color: #FF5722;
            }
          }

          &+p {
            margin-top: 20px;
          }

          &:not(:first-child) {
            margin-top: 20px;
            font-size: 1.2em;
          }
        }

        p {
          color: #747474;
          line-height: 1.8;
          margin: 0 ;
        }

        .row-inline {
          list-style: none;
          display: flex;
          padding: 0;

          &>li {
            margin: 0 30px 10px 0!important;
            color: #747474;

            &:before {
              width: 8px;
              height: 8px;
              background-color: #52acd9;
              color: #52acd9;
              display: inline-block;
              border-radius: 50%;
              margin-right: 5px;
              content: '';
            }
          }
        }
      }

      .panel-sidebar {
        display: flex;
        align-items: flex-end;
        padding: 0 30px 30px 0;

        .el-button {
          border-radius: 0;
        }
      }
    }
    
    &:not(:last-child) {
      border-bottom: 1px solid #ecedf1;
    }
  }
}
</style>
