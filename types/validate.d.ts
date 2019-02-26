
export interface Rules {
  [propsName: string]  : Rule[]
}

export interface Rule {
  required      ?: boolean
  message       ?: string
  trigger       ?: 'blur' | 'change' | Array<'blur' | 'change'>
  type          ?: 'string' | 'number' | 'boolean' | 'method' | 'regexp' | 'integer' | 'float' | 'array' | 'object' | 'enum' | 'data' | 'url' | 'hex' | 'email'
  validator     ?: Validator | PromiseValidtor
  min           ?: number
  max           ?: number
}

type Validator = (rule: any, value: any, done: (message?: string) => any) => (message?: string) => any
type PromiseValidtor = (rule: any, value: any, done: (message?: string) => any) => Promise<(message?: string) => any>