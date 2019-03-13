import * as Bluebird from 'bluebird'
import * as mongoose from 'mongoose' 
import { MongooseDao, MongooseDaoSetting, QueryOptions } from 'kenote-mongoose-helper'
import __Models from '../models'
import { createDocument, responseDocument, updateDocument } from '../types/proxys/group'
import storeProxy from './store'
import { responseDocument as responseStoreDocument } from '../types/proxys/store'
import { pick } from 'lodash'
import userProxy from './user'

(<mongoose.Mongoose>mongoose).Promise = Bluebird
const Model: mongoose.Model<mongoose.Document, {}> = <mongoose.Model<mongoose.Document, {}>> __Models.groupModel
const options: QueryOptions = {
  populate: {
    path: 'store',
    select: ['upload_type', 'download_type']
  },
  seqModel: __Models.seqModel
}

@MongooseDaoSetting({
  idName: 'id'
})
class GroupDao extends MongooseDao {}

class GroupProxy {

  public Dao: MongooseDao = new GroupDao(Model, options)

  public async create (doc: createDocument): Bluebird<responseDocument | {}> {
    let store: responseStoreDocument = <responseStoreDocument> await storeProxy.Dao.insert(doc.store)
    let group: responseDocument | {} = await this.Dao.insert({ ...doc, store: store._id })
    return group
  }

  public async update (conditions: any, doc: updateDocument): Bluebird<mongoose.Query<any>> {
    let query: mongoose.Query<any> = await this.Dao.updateOne(conditions, pick(doc, ['name', 'level', 'description', 'default']))
    if (doc.store) {
      let group: responseDocument = await this.Dao.findOne(conditions)
      query = await storeProxy.Dao.updateOne({ _id: group.store._id }, doc.store)
    }
    return query
  }

  public async remove (conditions: any): Bluebird<mongoose.Query<any>> {
    let group: responseDocument = await this.Dao.findOne(conditions)
    if (group && group.store) {
      await storeProxy.Dao.remove({ _id: group.store._id })
    }
    if (group) {
      await userProxy.remove({ group: group._id })
    }
    let query: mongoose.Query<any> = await this.Dao.remove(conditions)
    return query
  }

}

export default new GroupProxy()