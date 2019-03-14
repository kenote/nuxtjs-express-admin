import { Request, Response, NextFunction } from 'express'
import { Router, RouterMethods, Filter } from 'kenote-express-helper'
import { CustomError, __ErrorCode } from '../../error'
import * as passport from 'passport'
import ticketProxy from '../../proxys/ticket'
import { permission } from '../../middlewares/auth'
import { IRequest, IResponse } from '../../types/resuful'
import { responseDocument as responseTicketDocument, createDocument as createTicketDocument, editDocument as editTicketDocument } from '../../types/proxys/ticket'
import ticketFilter from '../../filters/api_v1/ticket'
import * as mongoose from 'mongoose'

export default class Ticket extends RouterMethods {

  /**
   * 邀请码列表
   */
  @Router({ method: 'post', path: '/ucenter/ticket/list' })
  @Filter( passport.authenticate('jwt', { session: false }), permission('/ucenter/ticket', 'list') )
  public async list (req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let tickets: Array<responseTicketDocument | {}> = await ticketProxy.Dao.find({ type: 'register' })
      return res.api(tickets)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 创建邀请码
   * @param group  <String> 用户组
   * @param stint  <Number> 最大使用数量
   * @param last_at  <Date> 过期时间
   */
  @Router({ method: 'post', path: '/ucenter/ticket/create' })
  @Filter( passport.authenticate('jwt', { session: false }), permission('/ucenter/ticket', 'create'), ticketFilter.create )
  public async create (document: createTicketDocument, req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let group: responseTicketDocument | {} = await ticketProxy.create(document)
      return res.api(group)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 编辑邀请码
   * @param stint  <Number> 最大使用数量
   * @param last_at  <Date> 过期时间
   */
  @Router({ method: 'post', path: '/ucenter/ticket/edit/:_id'})
  @Filter( passport.authenticate('jwt', { session: false }), permission('/ucenter/ticket', 'edit'), ticketFilter.edit )
  public async edit (document: editTicketDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let result: mongoose.Query<any> = await ticketProxy.update(document.conditions, document.data)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 删除邀请码
   */
  @Router(
    { method: 'delete', path: '/ucenter/ticket/:_id' },
    { method: 'delete', path: '/ucenter/ticket' }
  )
  @Filter( passport.authenticate('jwt', { session: false }), permission('/ucenter/ticket', 'remove'), ticketFilter.remove )
  public async remove (conditions: any, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let result: mongoose.Query<any> = await ticketProxy.Dao.remove(conditions)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}