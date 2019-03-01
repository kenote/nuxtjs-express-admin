
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