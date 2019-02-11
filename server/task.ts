import { TaskHelper, TaskSetting } from 'kenote-task-helper'
import initialize from './tasks/initialize'
import invitation from './tasks/invitation'

@TaskSetting({
  title: '选择操作类型:',
  tasks: [
    { 
      name: '初始化数据', 
      value: 'initialize',
      script: initialize
    },
    { 
      name: '注册邀请码', 
      value: 'invitation',
      script: invitation
    },
  ]
})
class Task extends TaskHelper {}

new Task().start()