import * as inquirer from 'inquirer'
import { TaskSpinner } from 'kenote-task-helper'
import __Models from '../models'
import Table from 'tty-table'
import inquirerDatepicker from 'inquirer-datepicker'
import inquirerNumberPlus from 'inquirer-number-plus'
import { find } from 'lodash'
import moment from 'moment'

import groupProxy from '../proxys/group'
import ticketProxy from '../proxys/ticket'

import { responseDocument as responseGroupDocument } from '../types/proxys/group'
import { responseDocument as responseTicketDocument } from '../types/proxys/ticket'
import { TableHeader, TableStyle } from '../types/tty-table'

inquirer.registerPrompt('datepicker', inquirerDatepicker)
inquirer.registerPrompt('number', inquirerNumberPlus)

const tableStyle: TableStyle = {
  borderStyle: 2,
  paddingBottom: 0,
  headerAlign: 'center',
  align: 'center',
  color: 'white',
  truncate: '...'
}

const bodyHeader: TableHeader[] = [
  {
    value: '激活码',
    width: 40
  },
  {
    value: '功能',
    width: 20
  },
  {
    value: '最大使用次数',
    width: 15
  },
  {
    value: '已使用次数',
    width: 12
  },
  {
    value: '过期时间',
    width: 24
  },
  {
    value: '失效状态',
    width: 12
  }
]

interface Options {
  group: string
  stint: number
  last_at: Date
}

interface Operate {
  type: string
}

export default async function invitation (): Promise<any> {
  try {
    let operate: Operate = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: '选择操作:',
        choices: [
          { name: '列出邀请码', value: 'list' },
          { name: '创建邀请码', value: 'create' },
        ]
      },
    ])
    switch (operate.type) {
      case 'list':
        return TaskSpinner(await invitationList())
      case 'create':
        return TaskSpinner(await createInvitation())
      default:
        break
    }
    return TaskSpinner(Promise.resolve(`Invitation Finished.`))
  } catch (error) {
    console.log(``)
    console.error(error)
  }
}

async function invitationList (): Promise<any> {
  let list: Array<responseTicketDocument | {}> = await ticketProxy.Dao.find({ type: 'register' })
  let bodyer: any[] = toBodyer(list)
  let t3: any = Table(bodyHeader, bodyer, tableStyle)
  console.log('\n', t3.render(), '\n')
  return Promise.resolve(`查询邀请码列表完成.`)
}

function toBodyer (data: Array<responseTicketDocument | {}>): Array<any> {
  let dataList: Array<any> = []
  for (let item of data) {
    let Item: responseTicketDocument = <responseTicketDocument> item
    dataList.push([
      Item.cdkey,
      Item.name,
      Item.stint,
      Item.uses || '0',
      moment(item['last_at'] || '').format('YYYY-MM-DD hh:mm:ss'),
      Item.used || Item.last_at.getTime() <= Date.now() ? '已失效' : '可使用'
    ])
  }
  return dataList
}

async function createInvitation (): Promise<any> {
    let groups: responseGroupDocument[] = <responseGroupDocument[]> await groupProxy.Dao.find({ level: { $gt: 9000 }})
    if (groups.length === 0) {
      return TaskSpinner(Promise.resolve(`没有获取到任何用户组数据，请先初始化数据.`))
    }
    let groupChoices: { key: string, name: string }[] = []
    for (let item of groups) {
      groupChoices.push({ key: item._id, name: item.name })
    }
    let options: Options = await inquirer.prompt([
      {
        type: 'list',
        name: 'group',
        message: '选择用户组:',
        choices: groupChoices
      },
      <any> {
        type: 'datepicker',
        name: 'last_at',
        message: '选择过期时间:',
        format: ['Y', '/', 'MM', '/', 'DD', ' ', 'HH', ':', 'mm', ':', 'ss']
      },
      {
        type: 'number',
        name: 'stint',
        message: '最大使用数量:',
        default: 1,
        min: -1,
        max: 9999
      }
    ])
    let ticket = await ticketProxy.create({
      name: `注册 -> ${options.group}`,
      type: 'register',
      setting: {
        group: (<responseGroupDocument> find(groups, (o: responseGroupDocument): boolean => o.name === options.group))._id.toString()
      },
      stint: options.stint,
      last_at: options.last_at
    })
    let bodyer: any[] = toBodyer([ticket])
    let t3: any = Table(bodyHeader, bodyer, tableStyle)
    console.log('\n', t3.render(), '\n')
    return Promise.resolve(`邀请码创建成功.`)
}