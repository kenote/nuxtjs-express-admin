import { MongoDB, MongoSetting, ModelMount } from 'kenote-mongoose-helper'
import config from '../config'
import { Models } from '../types/model'

import teamModel from './team'
import storeModel from './store'
import groupModel from './group'
import ticketModel from './ticket'
import userModel from './user'
import verifyModel from './verify'
import ditchModel from './ditch'
import planModel from './plan'

@MongoSetting(config.mongo)
@ModelMount({
  teamModel,
  storeModel,
  groupModel,
  ticketModel,
  userModel,
  verifyModel,
  ditchModel,
  planModel
})
class MyMongoDB extends MongoDB {}

const DB: MongoDB = new MyMongoDB()
DB.connect()

export default <Models> DB.__Models