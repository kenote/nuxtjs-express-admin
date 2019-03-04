
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
}