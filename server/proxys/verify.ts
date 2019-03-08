import * as Bluebird from 'bluebird'
import * as mongoose from 'mongoose' 
import * as uuid from 'uuid'
import { MongooseDao, MongooseDaoSetting, QueryOptions } from 'kenote-mongoose-helper'
import __Models from '../models'
import { createDocument, responseDocument } from '../types/proxys/verify'

(<mongoose.Mongoose>mongoose).Promise = Bluebird
const Model: mongoose.Model<mongoose.Document, {}> = <mongoose.Model<mongoose.Document, {}>> __Models.verifyModel
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
class VerifyDao extends MongooseDao {}

class VerifyProxy {

  public Dao: MongooseDao = new VerifyDao(Model, options)

  public async create (doc: createDocument): Bluebird<responseDocument | {}> {
    let token: string = ''
    if (doc.type === 'email') {
      token = uuid.v4().replace(/\-/g, '')
    }
    if (doc.type === 'mobile' || doc.type === 'code') {
      token = Math.random().toFixed(6).replace(/^(0\.)/i, '')
    }
    let verify: responseDocument | {} = await this.Dao.insert({ ...doc, token })
    return verify
  }

  public async update (conditions: any, doc: any): Bluebird<mongoose.Query<any>> {
    let token: string = Math.random().toFixed(6).replace(/^(0\.)/i, '')
    let updateTime: Date = new Date()
    let result: mongoose.Query<any> = await this.Dao.updateOne(conditions, { ...doc, token, updtae_at: updateTime })
    return { ...result, token }
  }

}

export default new VerifyProxy()