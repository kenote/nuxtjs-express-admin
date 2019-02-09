import * as mongoose from 'mongoose'

const schema: mongoose.Schema = new mongoose.Schema({
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

export default mongoose.model('team', schema)