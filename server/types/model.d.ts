import * as mongoose from 'mongoose'

export interface Models {
  seqModel       ?: mongoose.Model<mongoose.Document, {}>
  teamModel      ?: mongoose.Model<mongoose.Document, {}>
  storeModel     ?: mongoose.Model<mongoose.Document, {}>
  groupModel     ?: mongoose.Model<mongoose.Document, {}>
  ticketModel    ?: mongoose.Model<mongoose.Document, {}>
  userModel      ?: mongoose.Model<mongoose.Document, {}>
  verifyModel    ?: mongoose.Model<mongoose.Document, {}>
  ditchModel     ?: mongoose.Model<mongoose.Document, {}>
}