import * as mongoose from 'mongoose'

export interface createDocument {
  name: string
  type: string
  setting: object
  stint: number
  last_at: Date
}

export interface responseDocument extends mongoose.Document {
  id: number
  name: string
  cdkey: string
  type: string
  setting: object
  stint: number
  uses: number
  used: boolean
  create_at: Date
  last_at: Date
}

export interface Ticket {
  cdkey: string
}

export interface TicketOptions {
  name: string
  type: string
  key: string
}