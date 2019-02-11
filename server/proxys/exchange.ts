import * as Bluebird from 'bluebird'
import * as mongoose from 'mongoose' 
import { MongooseDao, MongooseDaoSetting, QueryOptions } from 'kenote-mongoose-helper'
import __Models from '../models'
import { createDocument, responseDocument } from '../types/proxys/exchange'
import * as uuid from 'uuid'

(<mongoose.Mongoose>mongoose).Promise = Bluebird
const Model: mongoose.Model<mongoose.Document, {}> = <mongoose.Model<mongoose.Document, {}>> __Models.exchangeModel
const options: QueryOptions = {
  populate: { path: '' },
  seqModel: __Models.seqModel
}

@MongooseDaoSetting({
  idName: 'id'
})
class ExchangeDao extends MongooseDao {}

class ExchangeProxy {

  public Dao: MongooseDao = new ExchangeDao(Model, options)

  public async create (doc: createDocument): Bluebird<responseDocument | {}> {
    let cdkey: string = uuid.v4()
    let exchange: responseDocument | {} = await this.Dao.insert({ ...doc, cdkey })
    return exchange
  }

}

export default new ExchangeProxy()