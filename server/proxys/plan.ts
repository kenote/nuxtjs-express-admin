import * as Bluebird from 'bluebird'
import * as mongoose from 'mongoose' 
import { MongooseDao, MongooseDaoSetting, QueryOptions } from 'kenote-mongoose-helper'
import __Models from '../models'

(<mongoose.Mongoose>mongoose).Promise = Bluebird
const Model: mongoose.Model<mongoose.Document, {}> = <mongoose.Model<mongoose.Document, {}>> __Models['planModel']
const options: QueryOptions = {
  populate: {
    path: 'user',
    select: ['id', 'username', 'email', 'mobile', 'nickname', 'avatar', 'sex', 'group', 'teams', 'binds']
  },
  seqModel: __Models.seqModel
}

@MongooseDaoSetting({
  idName: 'id'
})
class PlanDao extends MongooseDao {}

class PlanProxy {

  public Dao: MongooseDao = new PlanDao(Model, options)

}

export default new PlanProxy()