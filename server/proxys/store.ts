import * as Bluebird from 'bluebird'
import * as mongoose from 'mongoose' 
import { MongooseDao, MongooseDaoSetting, QueryOptions } from 'kenote-mongoose-helper'
import __Models from '../models'

(<mongoose.Mongoose>mongoose).Promise = Bluebird
const Model: mongoose.Model<mongoose.Document, {}> = <mongoose.Model<mongoose.Document, {}>> __Models.storeModel
const options: QueryOptions = {
  populate: { path: '' },
  seqModel: __Models.seqModel
}

@MongooseDaoSetting({
  idName: 'id'
})
class StoreDao extends MongooseDao {}

class storeProxy {

  public Dao: MongooseDao = new StoreDao(Model, options)

}

export default new storeProxy()