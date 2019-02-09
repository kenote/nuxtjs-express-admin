import { MongoDB, MongoSetting, ModelMount } from 'kenote-mongoose-helper'
import config from '../config'
import { Models } from '../types/model'

import teamModel from './team'
import storeModel from './store'
import groupModel from './group'

@MongoSetting(config.mongo)
@ModelMount({
  teamModel,
  storeModel,
  groupModel
})
class MyMongoDB extends MongoDB {}

const DB: MongoDB = new MyMongoDB()
DB.connect()

export default <Models> DB.__Models