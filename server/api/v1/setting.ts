import { Request, Response, NextFunction } from 'express'
import { Router, RouterMethods, Filter } from 'kenote-express-helper'
import { IResponse } from '../../types/resuful'
import { CustomError, __ErrorCode } from '../../error'
import { loadData } from '../../utils'
import channel from '../../types/channel'
import { orderBy } from 'lodash'
import * as passport from 'passport'
import { permission } from '../../middlewares/auth'
import ditchProxy from '../../proxys/ditch'
import ditchFilter from '../../filters/api_v1/ditch'
import { 
  createDocument as createDitchDocument, 
  responseDocument as responseDitchDocument, 
  allotDocument as allotDitchDocument,
  editDocument as editDitchDocument
} from '../../types/proxys/ditch'
import * as mongoose from 'mongoose'

export default class Setting extends RouterMethods {

  /**
   * 获取频道列表
   */
  @Router({ method: 'get', path: '/setting/channel/list' })
  @Filter( passport.authenticate('jwt', { session: false }), permission('/setting/channel', 'list') )
  public async channelList (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let channels: Array<channel.NavMenus> = <Array<channel.NavMenus>> loadData('data/channels', 'array')
    return res.api(orderBy(channels, ['id'], ['asc']))
  }

  /**
   * 获取频道渠道列表
   */
  @Router({ method: 'get', path: '/setting/ditch/list/:channel' })
  @Filter( passport.authenticate('jwt', { session: false }), permission('/setting/ditch', 'list'), ditchFilter.list )
  public async ditchList (channel: string, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let ditchs: responseDitchDocument[] = <responseDitchDocument[]> await ditchProxy.Dao.find({ channel })
      return res.api(ditchs)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 添加渠道
   * @param label  <String> 渠道标签
   * @param name  <String> 渠道名称
   * @param group  <String> 分组
   * @param teams  <ObjectId[]> 绑定的团队
   */
  @Router({ method: 'post', path: '/setting/ditch/create/:channel' })
  @Filter( passport.authenticate('jwt', { session: false }), permission('/setting/ditch', 'create'), ditchFilter.create )
  public async ditchCreate (document: createDitchDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let ditch: responseDitchDocument | {} = await ditchProxy.Dao.insert(document)
      return res.api(ditch)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 删除渠道
   */
  @Router(
    { method: 'delete', path: '/setting/ditch/:channel/:_id' },
    { method: 'delete', path: '/setting/ditch/:channel' }
  )
  @Filter( passport.authenticate('jwt', { session: false }), permission('/setting/ditch', 'remove'), ditchFilter.remove )
  public async ditchRemove (conditions: any, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let result: mongoose.Query<any> = await ditchProxy.Dao.remove(conditions)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 编辑渠道
   * @param label  <String> 渠道标签
   * @param name  <String> 渠道名称
   * @param group  <String> 分组
   * @param teams  <ObjectId[]> 绑定的团队
   */
  @Router({ method: 'post', path: '/setting/ditch/edit/:channel/:_id' })
  @Filter( passport.authenticate('jwt', { session: false }), permission('/setting/ditch', 'edit'), ditchFilter.edit )
  public async ditchEdit (document: editDitchDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { conditions, data } = document
    try {
      let result: mongoose.Query<any> = await ditchProxy.Dao.updateOne(conditions, data)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 编辑渠道基数
   */
  @Router({ method: 'post', path: '/setting/ditch/cardinal/:channel/:_id' })
  @Filter( passport.authenticate('jwt', { session: false }), permission('/setting/ditch', 'edit'), ditchFilter.cardinal )
  public async ditchCardinal (document: editDitchDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { conditions, data } = document
    try {
      let result: mongoose.Query<any> = await ditchProxy.Dao.updateOne(conditions, data)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 渠道分配
   * @param team  <ObjectId> 团队ID
   * @param ditchs  <ObjectId[]> 要分配的渠道ID
   * @param raw_ditchs  <ObjectId[]> 该团队原来的渠道ID
   */
  @Router({ method: 'post', path: '/setting/ditch/allot/:channel' })
  @Filter( passport.authenticate('jwt', { session: false }), permission('/setting/ditch', 'edit'), ditchFilter.allot )
  public async ditchAllot (document: allotDitchDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { channel, team, ditchs, raw_ditchs } = document
    let remove_ditchs: string[] = <string[]> raw_ditchs.filter( o => ditchs.indexOf(o) === -1 )
    let create_ditchs: string[] = <string[]> ditchs.filter( o => raw_ditchs.indexOf(o) === -1 )
    try {
      let remove_ditchs_result: mongoose.Query<any> = await ditchProxy.Dao.update({ _id: { $in: remove_ditchs }, channel }, { $pull: { teams: team } })
      let create_ditchs_result: mongoose.Query<any> = await ditchProxy.Dao.update({ _id: { $in: create_ditchs }, channel }, { $addToSet: { teams: { $each: [team] } } })
      return res.api({ remove_ditchs_result, create_ditchs_result })
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

}