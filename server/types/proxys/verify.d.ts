import * as mongoose from 'mongoose'
import { ObjectId } from 'bson'
import { responseDocument as responseUserDocument } from './user'

export interface createDocument {
  type         : 'email' | 'mobile',
  user        ?: ObjectId | string
}

export interface responseDocument extends mongoose.Document {
  id           : number
  type         : 'email' | 'mobile'
  token        : string
  create_at    : Date
  user         : responseUserDocument
  approved     : boolean
}