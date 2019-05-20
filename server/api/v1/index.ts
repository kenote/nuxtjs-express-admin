import { RouterController, ControllerMount } from 'kenote-express-helper'

import Account from './account'
import Security from './security'
import Group from './group'
import Ticket from './ticket'
import User from './user'
import Team from './team'
import Store from './store'
import Proto from './proto'
import Setting from './setting'
import Ditch from './ditch'
import Plan from './plan'

@ControllerMount(Account, Security, Group, Ticket, User, Team, Store, Proto, Setting, Ditch, Plan)
class API_V1 extends RouterController {}

export default new API_V1()