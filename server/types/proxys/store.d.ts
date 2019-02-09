import * as mongoose from 'mongoose'

export interface createDocument {
  upload_type: string[]
  download_type: string[]
}

export interface responseDocument extends mongoose.Document {
  id: number
  upload_type: string[]
  download_type: string[]
}