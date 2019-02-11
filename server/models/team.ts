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
  super: {
    type: Boolean,
    default: false
  },
  platform: {
    type: Array,
    default: []
  },
  access: {
    type: Array,
    default: []
  },
  description: {
    type: String,
    default: ''
  }
})

export default model('team', schema)