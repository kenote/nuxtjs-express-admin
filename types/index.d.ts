import { responseDocument as responseGroupDocument } from '~/server/types/proxys/group'
import { FindType } from '~/server/types/proxys/user'

export interface Option {
  key           : number | string
  label         : string
  disabled      : boolean
}

export interface TreeData {
  id            : string
  label         : string
  children     ?: Array<TreeData>
}

export declare namespace Dropdown {

  interface MenuItem {
    name        : string
    command    ?: string
  }
}

export declare namespace Sidebar {

  interface MenuItem {
    index       : string
    name        : string
    icon       ?: string
    children   ?: Array<MenuItem>
  }
}

export declare namespace Command {

  type Type = 'command' | 'router'

  interface Value {
    type: Type
    path: string
  }
}

export declare namespace Security {

  type statusType = 'success' | 'warning' | 'info'
  type statusIcon = 'el-icon-success success' | 'el-icon-warning warning' | 'el-icon-info info'
  type viewType = 'password' | 'email' | 'mobile' | 'overview'

  interface Overview {
    key         : string
    type        : statusType
    name        : string
    icon        : statusIcon
    data       ?: OverviewData
    description : string | string[] | Description
    click      ?: () => void
  }
  
  interface Description {
    title       : string
    context     : string[]
  }

  interface OverviewData {
    name        : string
    value      ?: string
    format     ?: (value: string) => string
  }

  interface sendCode {
    type        : 'email' | 'mobile'
    name       ?: string
    verify_id  ?: string
  }

  interface verifyCode {
    code        : string
  }

  interface setEmail {
    email      ?: string
    code       ?: string
  }

  interface setMobile {
    mobile     ?: string
    code       ?: string
  }
}

export declare namespace Ucenter {

  interface CreateGroup {
    name          ?: string
    level          : number
    description   ?: string
    upload_type   ?: string[]
    download_type ?: string[]
  }

  interface CreateTicket {
    group       ?: string
    teams        : Array<string>
    stint        : number
    last_at      : Date
  }

  interface FindUser {
    create_at    : Array<Date>
    groups       : Array<string>
    findtype     : FindType
    findname    ?: string
    page        ?: number
  }

  interface EditUser {
    username    ?: string
    group       ?: string
    teams        : Array<string>
    email       ?: string
    mobile      ?: string
    binds        : Array<string>
    sex          : string
  }

  interface CreateTeam {
    name        ?: string
    description ?: string
    platform     : Array<number>
  }
}