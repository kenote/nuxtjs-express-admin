import { RouterController, ControllerMount } from 'kenote-express-helper'
import Store from './store'

@ControllerMount(Store)
class Controller extends RouterController {}

export default new Controller()