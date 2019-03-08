import { RouterController, ControllerMount } from 'kenote-express-helper'

import Account from './account'
import Security from './security'

@ControllerMount(Account, Security)
class API_V1 extends RouterController {}

export default new API_V1()