import { Request, Response, NextFunction } from 'express'
import { Router, RouterMethods, Filter } from 'kenote-express-helper'
import { CustomError, __ErrorCode } from '../../error'
import { IRequest, IResponse } from '../../types/resuful'
import * as passport from 'passport'
import planFilter from '../../filters/api_v1/plan'
import { createDocument as createPlanDocument, responseDocument as responsePlanDocument, editDocument as editPlanDocument } from '../../types/proxys/plan'
import planProxy from '../../proxys/plan'
import * as mongoose from 'mongoose'

export default class Plan extends RouterMethods {

  /**
   * 创建用户方案
   * @param name  <String> 名称
   * @param type  <String> 类型
   * @param plan  <String> 详情
   * @param channel  <String> 针对频道
   */
  @Router({ method: 'post', path: '/plan/create' })
  @Filter( passport.authenticate('jwt', { session: false }), planFilter.create )
  public async create (document: createPlanDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let plan: responsePlanDocument | {} = await planProxy.Dao.insert(document)
      return res.api(plan)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 用户方案列表
   * @param type  <String> 类型
   * @param channel  <String> 针对频道 
   */
  @Router(
    { method: 'get', path: '/plan/list' },
    { method: 'get', path: '/plan/list/:type' },
    { method: 'get', path: '/plan/list/:type/:channel' },
  )
  @Filter( passport.authenticate('jwt', { session: false }), planFilter.list )
  public async list (conditions: any, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let ditchs: responsePlanDocument[] = <responsePlanDocument[]> await planProxy.Dao.find(conditions)
      return res.api(ditchs)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 编辑用户方案
   * @param name  <String> 名称
   * @param plan  <String> 详情
   */
  @Router({ method: 'post', path: '/plan/edit/:_id' })
  @Filter( passport.authenticate('jwt', { session: false }), planFilter.edit )
  public async edit (document: editPlanDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { conditions, data } = document
    try {
      let result: mongoose.Query<any> = await planProxy.Dao.updateOne(conditions, data)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 删除用户方案
   */
  @Router(
    { method: 'delete', path: '/plan/:_id' },
    { method: 'delete', path: '/plan' }
  )
  @Filter( passport.authenticate('jwt', { session: false }), planFilter.remove )
  public async remove (conditions: any, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let result: mongoose.Query<any> = await planProxy.Dao.remove(conditions)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}