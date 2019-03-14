import * as Bluebird from 'bluebird'
import * as mongoose from 'mongoose' 
import { MongooseDao, MongooseDaoSetting, QueryOptions } from 'kenote-mongoose-helper'
import __Models from '../models'
import { createDocument, responseDocument, updateDocument } from '../types/proxys/ticket'
import * as uuid from 'uuid'

(<mongoose.Mongoose>mongoose).Promise = Bluebird
const Model: mongoose.Model<mongoose.Document, {}> = <mongoose.Model<mongoose.Document, {}>> __Models.ticketModel
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

  public async update (conditions: any, doc: updateDocument): Bluebird<mongoose.Query<any>> {
    let ticket: responseDocument = await this.Dao.findOne(conditions)
    let used: boolean = doc.stint <= ticket.uses
    let query: mongoose.Query<any> = await this.Dao.updateOne(conditions, { ...doc, used })
    return query
  }

}

export default new ExchangeProxy()