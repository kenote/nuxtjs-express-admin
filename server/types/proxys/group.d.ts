import * as mongoose from 'mongoose'
import { createDocument as createStoreDocument, responseDocument as responseStoreDocument } from './store'
import { responseDocument as responseTeamDocument } from './team'
import { ObjectID } from 'bson'

export interface createDocument extends updateDocument {
  name: string
  level: number
  store: createStoreDocument
  team: ObjectID[]
}

export interface responseDocument extends mongoose.Document {
  id: number
  name: string
  level: number
  description: string
  store: responseStoreDocument
  team: responseTeamDocument[]
}

export interface updateDocument {
  name?: string
  level?: number
  description?: string
  store?: createStoreDocument
  team?: ObjectID[]
}

export interface editDocument {
  conditions: any
  data: createDocument
}