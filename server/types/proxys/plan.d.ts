import * as mongoose from 'mongoose'
import { ObjectId } from 'bson'
import { responseDocument as responseUserDocument } from './user'

export interface createDocument {
  name         : string
  type         : string
  plan         : string
  channel     ?: string
  user        ?: ObjectId | string
}

export interface responseDocument extends mongoose.Document {
  id           : number
  name         : string
  type         : string
  plan         : string
  channel      : string
  create_at    : Date
  user         : responseUserDocument
  update_at    : Date
}

export interface updateDocument {
  name        ?: string
  plan        ?: string
  user        ?: ObjectId | string
  update_at   ?: Date
}

export interface editDocument {
  conditions   : any
  data         : updateDocument
}