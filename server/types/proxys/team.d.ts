import * as mongoose from 'mongoose'

export interface createDocument extends updateDocument {
  name: string
}

export interface responseDocument extends mongoose.Document {
  id: number
  name: string
  description?: string
  super: boolean
}

export interface updateDocument {
  name?: string
  description?: string
  super?: boolean
}