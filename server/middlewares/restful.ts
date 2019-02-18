import { Response } from 'express'
import { Middleware, MiddlewareSetting, RegisterMiddlewareMethod, IError, errorInfo } from 'kenote-express-helper'
import { isNumber } from 'util'
import { __ErrorCode, ErrorInfo } from '../error'
import { resufulInfo } from '../types/resuful'
import * as rules from '../config/rules'



@MiddlewareSetting({
  header: [
    ['Access-Control-Allow-Origin', '*'],
    ['Access-Control-Allow-Methods', 'GET, POST, PUT'],
    ['Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization'],
    ['X-Powered-By', 'Kenote']
  ],
  parameter: {
    __rules: rules
  }
})
class Restful extends Middleware {

  @RegisterMiddlewareMethod()
  public api (response: Response): (data: any, error?: number | IError | errorInfo, opts?: string[]) => Response {
    return (data: any, error?: number | IError | errorInfo, opts?: string[]): Response => {
      error = error || __ErrorCode.ERROR_STATUS_NULL
      let errorCode: number = isNumber(error) ? <number> error : <number> (<IError | errorInfo> error).code
      let status: errorInfo = isNumber(error) ? <errorInfo> ErrorInfo(errorCode, opts, true) : <errorInfo> error
      let info: resufulInfo = { 
        data,
        Status: status
      }
      return response.json(info)
    }
  }

  @RegisterMiddlewareMethod()
  public notfound (response: Response): () => void {
    return () => response.status(404).render('error', { message: 'This page could not be found' })
  }
}

export default new Restful()