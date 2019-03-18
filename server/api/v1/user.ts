import { Request, Response, NextFunction } from 'express'
import { Router, RouterMethods, Filter } from 'kenote-express-helper'
import { IRequest, IResponse } from '../../types/resuful'
import { CustomError, __ErrorCode } from '../../error'
import * as passport from 'passport'
import userProxy from '../../proxys/user'
import { responseDocument as responseUserDocument, findDocument as findUserDocument } from '../../types/proxys/user'
import { permission } from '../../middlewares/auth'
import userFilter from '../../filters/api_v1/user'
import * as mongoose from 'mongoose'
import { QueryOptions } from 'kenote-mongoose-helper'

export default class User extends RouterMethods {

  @Router({ method: 'post', path: '/ucenter/user/list' })
  @Filter( passport.authenticate('jwt', { session: false }), permission('/ucenter/user', 'list'), userFilter.list )
  public async list (findUser: findUserDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { conditions, options } = findUser
    try {
      let users: any = await userProxy.Dao.list(conditions, options)
      return res.api(users)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}