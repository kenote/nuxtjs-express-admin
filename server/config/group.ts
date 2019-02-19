import { createDocument } from '../types/proxys/group'

export interface Groups {
  [propsName: string]: createDocument
}

export const setting: Groups = {
  ['Creator']: {
    name: '创建者',
    level: 9999,
    description: '创建者拥有系统所有权限，且只有一个帐号'
  },
  ['superAdministrator']: { 
    name: '超级管理员', 
    level: 9998, 
    description: '除创建者外的最高权力者，拥有与创建者几乎相同的权限'
  },
  ['teamAdministrator']: { 
    name: '团队管理员', 
    level: 7999, 
    description: '相关团队的最高权力者',
    store: { 
      upload_type: [],
      download_type: []
    }
  },
  ['default']: {
    name: '普通会员',
    level: 10,
    description: '普通会员 ...',
    store: { 
      upload_type: [],
      download_type: []
    }
  }
}