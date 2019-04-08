import { Request, Response, NextFunction } from 'express'
import { Router, RouterMethods, Filter } from 'kenote-express-helper'
import { IRequest, IResponse } from '../../types/resuful'
import { CustomError, __ErrorCode } from '../../error'
import * as passport from 'passport'
import userProxy from '../../proxys/user'
import { responseDocument as responseUserDocument, findDocument as findUserDocument } from '../../types/proxys/user'
import { accessDocument as accessTeamDocument } from '../../types/proxys/team'
import { permission } from '../../middlewares/auth'
import userFilter from '../../filters/api_v1/user'
import teamFilter from '../../filters/api_v1/team'
import * as mongoose from 'mongoose'
import { QueryOptions } from 'kenote-mongoose-helper'

export default class User extends RouterMethods {// create_at, groups, findname

  /**
   * 用户列表
   * @param create_at  <Date[]> 注册时间段
   * @param groups  <String[]> 用户组
   * @param findtype  <String> 查询名称类型；‘username' | 'nickname' | 'email' |'mobile'
   * @param findname  <String> 查询名称，可模糊
   * @param page  <Number> 当前页
   */
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

  /**
   * 访问权限
   * @param access <String[]> 访问权限页面
   */
  @Router({ method: 'post', path: '/ucenter/user/access/:_id' })
  @Filter( passport.authenticate('jwt', { session: false }), permission('/ucenter/user', 'edit'), teamFilter.access )
  public async access (document: accessTeamDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let result: mongoose.Query<any> = await userProxy.Dao.updateOne(document.conditions, document.data)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}