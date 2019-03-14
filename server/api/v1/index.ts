import { RouterController, ControllerMount } from 'kenote-express-helper'

import Account from './account'
import Security from './security'
import Group from './group'
import Ticket from './ticket'

@ControllerMount(Account, Security, Group, Ticket)
class API_V1 extends RouterController {}

export default new API_V1()