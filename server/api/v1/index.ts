import { RouterController, ControllerMount } from 'kenote-express-helper'

import Account from './account'
import Security from './security'
import Group from './group'
import Ticket from './ticket'
import User from './user'
import Team from './team'

@ControllerMount(Account, Security, Group, Ticket, User, Team)
class API_V1 extends RouterController {}

export default new API_V1()