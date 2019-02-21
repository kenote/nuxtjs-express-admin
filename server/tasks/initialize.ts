import * as inquirer from 'inquirer'
import * as mongoose from 'mongoose'
import { TaskSpinner } from 'kenote-task-helper'
import { MongooseDao } from 'kenote-mongoose-helper'
import __Models from '../models'
import Table from 'tty-table'

import teamProxy from '../proxys/team'
import storeProxy from '../proxys/store'
import groupProxy from '../proxys/group'
import ticketProxy from '../proxys/ticket'
import userProxy from '../proxys/user'
import verifyProxy from '../proxys/verify'

import { setting as groupSettings } from '../config/group'
import { responseDocument } from '../types/proxys/group'
import { TableHeader, TableStyle } from '../types/tty-table'

const seqDao: MongooseDao = new MongooseDao(<mongoose.Model<mongoose.Document, {}>> __Models.seqModel)

interface Options {
  runing: boolean
}

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
    value: 'ID',
    width: 8
  },
  {
    value: '用户组',
    width: 20
  },
  {
    value: '权级',
    width: 13
  },
  {
    value: '描述',
    width: 80,
    align: 'left'
  }
]

export default async function initialize (): Promise<any> {
  try {
    let options: Options = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'runing',
        message: '您确定要初始化数据吗？',
        default: false
      }
    ])
    if (!options.runing) {
      return TaskSpinner(Promise.resolve(`Initialize Suspended.`))
    }
    await Promise.all([
      seqDao.clear(),
      teamProxy.Dao.clear(),
      storeProxy.Dao.clear(),
      groupProxy.Dao.clear(),
      ticketProxy.Dao.clear(),
      userProxy.Dao.clear(),
      verifyProxy.Dao.clear()
    ])
    await createGroups()

    return TaskSpinner(Promise.resolve(`Initialize Finished.`))
  } catch (error) {
    console.log(``)
    console.error(error)
  }
}

async function createGroups (): Promise<any> {
  let groups: responseDocument[] = []
  for (let key of Object.keys(groupSettings)) {
    groups.push(<responseDocument> await groupProxy.create(groupSettings[key]))
  }
  let bodyer: any[] = toBodyer(groups)
  let t3: any = Table(bodyHeader, bodyer, tableStyle)
  console.log('\n', t3.render(), '\n')
  return Promise.resolve(`用户组创建完成.`)
}

function toBodyer (data: Array<responseDocument>): Array<any> {
  let dataList: Array<any> = []
  for (let item of data) {
    dataList.push([
      item.id,
      item.name,
      item.level,
      item.description
    ])
  }
  return dataList
}