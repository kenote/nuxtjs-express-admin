import * as Bluebird from 'bluebird'
import * as mongoose from 'mongoose'
import { MongooseDao, MongooseDaoSetting, QueryOptions } from 'kenote-mongoose-helper'
import __Models from '../models'

(<mongoose.Mongoose>mongoose).Promise = Bluebird
const Model: mongoose.Model<mongoose.Document, {}> = <mongoose.Model<mongoose.Document, {}>>  __Models.teamModel
const options: QueryOptions = {
  populate: { path: '' },
  seqModel: __Models.seqModel
}

@MongooseDaoSetting({
  idName: 'id'
})
class TeamDao extends MongooseDao {}

class TeamProxy {

  public Dao: MongooseDao = new TeamDao(Model, options)
  
}

export default new TeamProxy()