import * as mongoose from 'mongoose'
import { createDocument as createStoreDocument, responseDocument as responseStoreDocument } from './store'

export interface createDocument extends updateDocument {
  name: string
  level: number
}

export interface responseDocument extends mongoose.Document {
  id: number
  name: string
  level: number
  description: string
  store: responseStoreDocument
}

export interface updateDocument {
  name?: string
  level?: number
  description?: string
  store?: createStoreDocument
}

export interface editDocument {
  conditions: any
  data: createDocument
}