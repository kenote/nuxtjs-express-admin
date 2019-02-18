import { RouterController, ControllerMount } from 'kenote-express-helper'

import Account from './account'

@ControllerMount(Account)
class API_V1 extends RouterController {}

export default new API_V1()