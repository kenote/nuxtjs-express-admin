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
  level: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  team: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'team'
    }
  ],
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'store'
  }
})

export default mongoose.model('group', schema)