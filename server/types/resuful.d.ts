import { Request, Response } from 'express'
import { errorInfo, IError } from 'kenote-express-helper'
import { Register } from './config'

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

export interface IResponse extends Response {
  api: (data: any, error?: number | IError | errorInfo, opts?: string[]) => Response
  notfound: () => void
}

export interface IRequest extends Request {
  __register: Register
}