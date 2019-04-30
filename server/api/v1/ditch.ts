import { Request, Response, NextFunction } from 'express'
import { Router, RouterMethods, Filter } from 'kenote-express-helper'
import { IResponse } from '../../types/resuful'
import { CustomError, __ErrorCode } from '../../error'
import * as passport from 'passport'
import ditchProxy from '../../proxys/ditch'
import ditchFilter from '../../filters/api_v1/ditch'
import { 
  responseDocument as responseDitchDocument, 
} from '../../types/proxys/ditch'

export default class Ditch extends RouterMethods {

  /**
   * 获取用户渠道列表
   */
  @Router({ method: 'get', path: '/ditch/list/:channel' })
  @Filter( passport.authenticate('jwt', { session: false }), ditchFilter.list )
  public async ditchList (conditions: any, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let ditchs: responseDitchDocument[] = <responseDitchDocument[]> await ditchProxy.Dao.find(conditions)
      return res.api(ditchs)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}