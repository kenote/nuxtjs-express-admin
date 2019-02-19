import * as Bluebird from 'bluebird'
import * as mongoose from 'mongoose' 
import { MongooseDao, MongooseDaoSetting, QueryOptions } from 'kenote-mongoose-helper'
import __Models from '../models'
import { registerDocument, responseDocument, createDocument } from '../types/proxys/user'
import { __ErrorCode, ErrorInfo } from '../error'
import { bcrypt } from '../utils'
import account from '../types/account'
import { omit } from 'lodash'

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

  public async register (doc: registerDocument): Bluebird<responseDocument | {}> {
    let username: responseDocument | {} = await this.Dao.findOne({ username: doc.username })
    if (username) {
      throw ErrorInfo(__ErrorCode.ERROR_VALID_USERNAME_UNIQUE)
    }
    if (doc.email) {
      let email: responseDocument | {} = await this.Dao.findOne({ email: doc.email })
      if (email) {
        throw ErrorInfo(__ErrorCode.ERROR_VALID_EMAIL_UNIQUE)
      }
    }
    if (doc.mobile) {
      let mobile: responseDocument | {} = await this.Dao.findOne({ mobile: doc.mobile })
      if (mobile) {
        throw ErrorInfo(__ErrorCode.ERROR_VALID_MOBILE_UNIQUE)
      }
    }
    let password: account.Password = bcrypt.hash(doc.password)
    let create: createDocument = {
      ...omit(doc, ['password']),
      encrypt: password.hash,
      salt: password.salt
    }
    let user: responseDocument | {} = await this.Dao.insert(create)
    return user
  }

}

export default new UserProxy()