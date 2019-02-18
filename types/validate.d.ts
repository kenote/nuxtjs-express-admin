
export interface Rules {
  [propsName: string]: Rule[]
}

export interface Rule {
  required?: boolean
  message?: string
  trigger?: 'blur' | 'change' | Array<'blur' | 'change'>
  type?: 'string' | 'number' | 'boolean' | 'method' | 'regexp' | 'integer' | 'float' | 'array' | 'object' | 'enum' | 'data' | 'url' | 'hex' | 'email'
  validator?: (rule: any, value: any, done: (message?: string) => any) => (message?: string) => any
}