import * as mongoose from 'mongoose'
import { QueryOptions } from 'kenote-mongoose-helper'
import { ObjectId } from 'bson'
import { responseDocument as responseGroupDocument } from './group'
import { responseDocument as responseTeamDocument } from './team'

export interface registerDocument {
  username     : string
  password     : string
  email       ?: string
  mobile      ?: string
  group        : ObjectId | string
  teams       ?: Array<ObjectId | string>
}

export interface createDocument {
  username     : string
  encrypt      : string
  salt         : string
  email       ?: string
  mobile      ?: string
  group        : ObjectId | string
  teams       ?: Array<ObjectId | string>
}

export interface responseDocument extends mongoose.Document {
  id           : number
  username     : string
  nickname    ?: string
  avatar      ?: string
  sex          : number
  email        : string
  mobile      ?: string
  jw_token    ?: string
  binds        : string[]
  group        : responseGroupDocument
  teams        : Array<responseTeamDocument>
  access       : Array<string>
  create_at    : Date
  update_at    : Date
}

export interface responseAllDocument extends responseDocument {
  encrypt      : string
  salt         : string
}

export interface findDocument {
  conditions   : any
  options      : QueryOptions
}

export interface listDocument {
  data         : Array<responseDocument>
  counts       : number
  limit        : number
}

export type FindType = 'username' | 'email' | 'nickname' | 'mobile'

export interface FindTypeNames {
  username    ?: string
  email       ?: string
  nickname    ?: string
  mobile      ?: string
}