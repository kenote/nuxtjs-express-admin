import { RouterController, ControllerMount } from 'kenote-express-helper'

import Account from './account'
import Security from './security'
import Group from './group'
import Ticket from './ticket'
import User from './user'

@ControllerMount(Account, Security, Group, Ticket, User)
class API_V1 extends RouterController {}

export default new API_V1()