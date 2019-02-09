import * as mongoose from 'mongoose'

const schema: mongoose.Schema = new mongoose.Schema({
  id: {
    type: Number,
    default: 0,
    index: { unique: true }
  },
  upload_type: { 
    type: Array, 
    default: [] 
  },
  download_type: {
    type: Array, 
    default: []
  }
})

export default mongoose.model('store', schema)