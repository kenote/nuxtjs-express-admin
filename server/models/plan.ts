import { Schema, model } from 'mongoose'

const schema: Schema = new Schema({
  id: {
    type: Number,
    default: 0,
    index: { unique: true }
  },
  name: {
    type: String
  },
  type: {
    type: String
  },
  plan: {
    type: String
  },
  channel: {
    type: String
  },
  create_at: {
    type: Date,
    default: Date.now
  }, 
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  update_at: {
    type: Date,
    default: Date.now
  }
})

export default model('plan', schema)