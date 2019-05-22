import { TaskHelper, TaskSetting, TaskSpinner } from 'kenote-task-helper'
import * as inquirer from 'inquirer'
import * as path from 'path'
import * as fs from 'fs-extra'
import { trim } from 'lodash'
import runscript from 'runscript'

const deployPath = path.resolve(__dirname, 'deploy')

@TaskSetting({
  title: '选择操作类型:',
  tasks: [
    { 
      name: '导出配置到部署目录', 
      value: 'export-deploy',
      script: exportDeplay
    },
    {
      name: '导入部署目录配置',
      value: 'import-deploy',
      script: importDeplay
    },
    {
      name: '退出',
      value: 'exit',
      script: () => TaskSpinner(Promise.resolve(`Exit Finished.`))
    }
  ]
})
class Task extends TaskHelper {}

new Task().start()

// 导出配置到部署目录
async function exportDeplay () {
  try {
    let options = await inquirer.prompt([
      {
        type: 'list',
        name: 'name',
        message: '选择部署目录:',
        choices: dirChoices(deployPath, { name: '新目录', value: 'create' })
      }
    ])
    if (options.name === 'create') {
      let noptions = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: '请填写新目录名称',
          validate: function (val) {
            if (!trim(val)) {
              return '请填写新目录名称'
            }
            return true
          }
        }
      ])
      options.name = noptions.name
    }
    let exportPath = path.resolve(deployPath, options.name)
    let coptions = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'runing',
        message: '您确定要导出配置到部署目录吗？',
        default: false
      }
    ])
    if (!coptions.runing) {
      return TaskSpinner(Promise.resolve(`ExportDeplay Suspended.`))
    }
    // 如果需要创建目录
    if (!fs.existsSync(exportPath)) {
      fs.mkdirSync(exportPath)
    }
    // 拷贝 channel 目录
    console.log('> 拷贝 channels/')
    fs.removeSync(path.resolve(exportPath, 'channels'))
    fs.copySync(path.resolve(__dirname, 'channels'), path.resolve(exportPath, 'channels'))
    // 拷贝 data 目录
    console.log('> 拷贝 data/alicloud')
    fs.removeSync(path.resolve(exportPath, 'data/alicloud'))
    fs.copySync(path.resolve(__dirname, 'data/alicloud'), path.resolve(exportPath, 'data/alicloud'))
    console.log('> 拷贝 data/channels/')
    fs.removeSync(path.resolve(exportPath, 'data/channels'))
    fs.copySync(path.resolve(__dirname, 'data/channels'), path.resolve(exportPath, 'data/channels'))
    console.log('> 拷贝 data/flags/')
    fs.removeSync(path.resolve(exportPath, 'data/flags'))
    fs.copySync(path.resolve(__dirname, 'data/flags'), path.resolve(exportPath, 'data/flags'))
    console.log('> 拷贝 data/register.yml')
    fs.copySync(path.resolve(__dirname, 'data/register.yml'), path.resolve(exportPath, 'data/register.yml'))
    // 备份数据库
    console.log('> 备份数据库')
    fs.removeSync(path.resolve(exportPath, 'mongodb'))
    await runscript(`mongodump -h 127.0.0.1 --port 27017 -d kenote_nuxtjs_admin -o ${exportPath}/mongodb/`)
    return TaskSpinner(Promise.resolve(`ExportDeplay Finished.`))
  } catch (error) {
    console.log(``)
    console.error(error)
  }
}

// 导入部署目录配置
async function importDeplay () {
  try {
    let options = await inquirer.prompt([
      {
        type: 'list',
        name: 'name',
        message: '选择部署目录:',
        choices: dirChoices(deployPath)
      }
    ])
    console.log(options)
    let importPath = path.resolve(deployPath, options.name)
    // 还原 channel 目录
    console.log('> 还原 channels/')
    fs.removeSync(path.resolve(__dirname, 'channels'))
    fs.copySync(path.resolve(importPath, 'channels'), path.resolve(__dirname, 'channels'))
    // 还原 data 目录
    console.log('> 还原 data/alicloud')
    fs.removeSync(path.resolve(__dirname, 'data/alicloud'))
    fs.copySync(path.resolve(importPath, 'data/alicloud'), path.resolve(__dirname, 'data/alicloud'))
    console.log('> 还原 data/channels/')
    fs.removeSync(path.resolve(__dirname, 'data/channels'))
    fs.copySync(path.resolve(importPath, 'data/channels'), path.resolve(__dirname, 'data/channels'))
    console.log('> 还原 data/flags/')
    fs.removeSync(path.resolve(__dirname, 'data/flags'))
    fs.copySync(path.resolve(importPath, 'data/flags'), path.resolve(__dirname, 'data/flags'))
    console.log('> 还原 data/register.yml')
    fs.copySync(path.resolve(importPath, 'data/register.yml'), path.resolve(__dirname, 'data/register.yml'))
    // 恢复数据库
    console.log('> 恢复数据库')
    await runscript(`mongorestore -h 127.0.0.1 --port 27017 -d kenote_nuxtjs_admin --drop ${importPath}/mongodb/kenote_nuxtjs_admin`)
    return TaskSpinner(Promise.resolve(`ImportDeplay Finished.`))
  } catch (error) {
    console.log(``)
    console.error(error)
  }
}

function dirChoices (dir, opts) {
  let choices = []
  let dirs = fs.readdirSync(dir)
  for (let item of dirs) {
    let stat = fs.statSync(path.resolve(dir, item))
    if (stat.isDirectory() && !/^(\.)/.test(item)) {
      choices.push({ name: item, value: item })
    }
  }
  opts && choices.push(opts)
  return choices
}
