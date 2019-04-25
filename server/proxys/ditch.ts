import * as Bluebird from 'bluebird'
import * as mongoose from 'mongoose' 
import { MongooseDao, MongooseDaoSetting, QueryOptions } from 'kenote-mongoose-helper'
import __Models from '../models'

(<mongoose.Mongoose>mongoose).Promise = Bluebird
const Model: mongoose.Model<mongoose.Document, {}> = <mongoose.Model<mongoose.Document, {}>> __Models.ditchModel
const options: QueryOptions = {
  populate: [
    {
      path: 'teams',
      select: ['id', 'name', 'description']
    }
  ],
  seqModel: __Models.seqModel
}

@MongooseDaoSetting({
  idName: 'id'
})
class DitchDao extends MongooseDao {}

class DitchProxy {

  public Dao: MongooseDao = new DitchDao(Model, options)
  
}

export default new DitchProxy()