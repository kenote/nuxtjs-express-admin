import { Request, Response, NextFunction } from 'express'
import { Router, RouterMethods, Filter } from 'kenote-express-helper'
import { IRequest, IResponse } from '../../types/resuful'
import { CustomError, __ErrorCode } from '../../error'
import * as passport from 'passport'
import teamProxy from '../../proxys/team'
import { responseDocument as responseTeamDocument, createDocument as createTeamDocument, accessDocument as accessTeamDocument, editDocument as editTeamDocument } from '../../types/proxys/team'
import { permission } from '../../middlewares/auth'
import teamFilter from '../../filters/api_v1/team'
import * as mongoose from 'mongoose'
import { QueryOptions } from 'kenote-mongoose-helper'

export default class Team extends RouterMethods {

  /**
   * 团队列表
   */
  @Router({ method: 'post', path: '/ucenter/team/list' })
  @Filter( passport.authenticate('jwt', { session: false }), permission('/ucenter/team', 'list') )
  public async list (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let teams: responseTeamDocument[] = <responseTeamDocument[]> await teamProxy.Dao.find()
      return res.api(teams)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 创建团队
   * @param name  <String> 名称
   * @param description  <String> 描述 
   * @param platform <Number[]> 频道入口
   */
  @Router({ method: 'post', path: '/ucenter/team/create' })
  @Filter( passport.authenticate('jwt', { session: false }), permission('/ucenter/team', 'create'), teamFilter.create )
  public async create (document: createTeamDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let team: responseTeamDocument | {} = await teamProxy.Dao.insert(document)
      return res.api(team)
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
  @Router({ method: 'post', path: '/ucenter/team/access/:_id' })
  @Filter( passport.authenticate('jwt', { session: false }), permission('/ucenter/team', 'edit'), teamFilter.access )
  public async access (document: accessTeamDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let result: mongoose.Query<any> = await teamProxy.Dao.updateOne(document.conditions, document.data)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 编辑团队
   * @param name  <String> 名称
   * @param description  <String> 描述 
   * @param platform <Number[]> 频道入口
   */
  @Router({ method: 'post', path: '/ucenter/team/edit/:_id' })
  @Filter( passport.authenticate('jwt', { session: false }), permission('/ucenter/team', 'edit'), teamFilter.edit )
  public async edit (document: editTeamDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let result: mongoose.Query<any> = await teamProxy.Dao.updateOne(document.conditions, document.data)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 删除团队
   */
  @Router({ method: 'delete', path: '/ucenter/team/:_id' })
  @Filter( passport.authenticate('jwt', { session: false }), permission('/ucenter/team', 'remove'), teamFilter.remove )
  public async remove (conditions: any, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let result: mongoose.Query<any> = await teamProxy.Dao.remove(conditions)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}