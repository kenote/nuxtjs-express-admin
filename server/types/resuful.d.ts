
import { errorInfo } from 'kenote-express-helper'

export interface resufulInfo {
  data: any
  Status?: errorInfo
}

export interface Payload {
  _id: string
  iat?: number
}

export interface JwtSign {
  (payload: Payload, iat?: number): string
}