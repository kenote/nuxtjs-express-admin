import * as Bluebird from 'bluebird'
import * as mongoose from 'mongoose' 
import { MongooseDao, MongooseDaoSetting, QueryOptions } from 'kenote-mongoose-helper'
import __Models from '../models'
import { registerDocument } from '../types/proxys/user'

(<mongoose.Mongoose>mongoose).Promise = Bluebird
const Model: mongoose.Model<mongoose.Document, {}> = <mongoose.Model<mongoose.Document, {}>> __Models.userModel
const options: QueryOptions = {
  populate: [
    {
      path: 'group',
      select: ['id', 'name', 'level', 'description', 'store']
    },
    {
      path: 'team',
      select: ['id', 'name', 'description']
    }
  ],
  seqModel: __Models.seqModel
}

@MongooseDaoSetting({
  idName: 'id'
})
class UserDao extends MongooseDao {}

class UserProxy {

  public Dao: MongooseDao = new UserDao(Model, options)

  public async register (doc: registerDocument) {

  }

}

export default new UserProxy()