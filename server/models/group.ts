import { Schema, model } from 'mongoose'

const schema: Schema = new Schema({
  id: {
    type: Number,
    default: 0,
    index: { unique: true }
  },
  name: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: 'store'
  }
})

export default model('group', schema)