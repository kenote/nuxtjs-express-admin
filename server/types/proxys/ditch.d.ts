import * as mongoose from 'mongoose'
import { ObjectId } from 'bson'
import { responseDocument as responseTeamDocument } from './team'

export interface createDocument extends updateDocument {
  channel         : string
}

export interface responseDocument extends mongoose.Document {
  id              : number
  name            : string
  label           : string
  channel         : string
  group           : string
  teams           : Array<responseTeamDocument>
  cardinal_number : {
    [propsName: string]: number
  }
}

export interface updateDocument {
  name           ?: string
  label          ?: string
  group          ?: string
  teams          ?: Array<ObjectId | string>
  cardinal_number ?: {
    [propsName: string]: number
  }
}

export interface editDocument {
  conditions   : any
  data         : updateDocument
}

export interface allotDocument {
  team           ?: ObjectId | string
  ditchs          : Array<ObjectId | string>
  raw_ditchs      : Array<ObjectId | string>
  channel        ?: string
}