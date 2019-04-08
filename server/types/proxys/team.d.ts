import * as mongoose from 'mongoose'

export interface createDocument extends updateDocument {
  name           : string
}

export interface responseDocument extends mongoose.Document {
  id             : number
  name           : string
  description   ?: string
  platform       : Array<number>
  access         : Array<string>
  super          : boolean
}

export interface updateDocument {
  name          ?: string
  description   ?: string
  super         ?: boolean
  platform       : Array<number>
}

export interface editDocument {
  conditions   : any
  data         : createDocument
}

export interface accessDocument {
  conditions   : any
  data         : {
    access       : Array<string>
  }
}