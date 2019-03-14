import { Request, Response, NextFunction } from 'express'
import { Router, RouterMethods, Filter } from 'kenote-express-helper'
import { IRequest, IResponse } from '../../types/resuful'
import { CustomError, __ErrorCode } from '../../error'
import * as passport from 'passport'
import groupProxy from '../../proxys/group'
import { responseDocument as responseGroupDocument, createDocument as createGroupDocument, editDocument as editGroupDocument } from '../../types/proxys/group'
import { permission } from '../../middlewares/auth'
import groupFilter from '../../filters/api_v1/group'
import * as mongoose from 'mongoose'
import { QueryOptions } from 'kenote-mongoose-helper'

export default class Group extends RouterMethods {

  /**
   * 用户组列表
   * @param name  <String> 名称
   */
  @Router(
    { method: 'post', path: '/ucenter/group/list' },
    { method: 'post', path: '/ucenter/group/lite' }
  )
  @Filter( passport.authenticate('jwt', { session: false }), permission('/ucenter/group', 'list') )
  public async list (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { name } = req.body
    let conditions: any = {}
    let options: QueryOptions = {}
    if (name) {
      conditions = { ...conditions, name: new RegExp(name) }
    }
    if (req.path === '/ucenter/group/lite') {
      options = {
        select: ['_id', 'name', 'level'],
        populate: { path: '' }
      }
      let userLevel: number = req.user.group.level
      conditions = { ...conditions, level: { $lt: userLevel }}
    }
    try {
      let groups: responseGroupDocument[] = <responseGroupDocument[]> await groupProxy.Dao.find(conditions, options)
      return res.api(groups)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 创建用户组
   * @param name  <String> 名称
   * @param level  <Number> 权级
   * @param description  <String> 描述
   */
  @Router({ method: 'post', path: '/ucenter/group/create' })
  @Filter( passport.authenticate('jwt', { session: false }), permission('/ucenter/group', 'create'), groupFilter.create )
  public async create (document: createGroupDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let group: responseGroupDocument | {} = await groupProxy.create(document)
      return res.api(group)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 编辑用户组
   * @param name  <String> 名称
   * @param level  <Number> 权级
   * @param description  <String> 描述
   */
  @Router({ method: 'post', path: '/ucenter/group/edit/:_id'})
  @Filter( passport.authenticate('jwt', { session: false }), permission('/ucenter/group', 'edit'), groupFilter.edit )
  public async edit (document: editGroupDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let result: mongoose.Query<any> = await groupProxy.update(document.conditions, document.data)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 删除用户组
   */
  @Router({ method: 'delete', path: '/ucenter/group/:_id' })
  @Filter( passport.authenticate('jwt', { session: false }), permission('/ucenter/group', 'remove'), groupFilter.remove )
  public async remove (conditions: any, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let result: mongoose.Query<any> = await groupProxy.remove(conditions)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}