import { Request, Response, NextFunction } from 'express'
import { Rule, Filter, asyncFilterData, errorInfo, Options } from 'kenote-validate-helper'
import { format } from 'util'
import { IRequest, IResponse } from '../../types/resuful'
import { responseDocument as responseUserDocument, findDocument as findUserDocument, FindType } from '../../types/proxys/user'
import { __ErrorCode, CustomError } from '../../error'
import { toPageInfo } from '../../utils'
import { zipObject } from 'lodash'

class User {

  public list (req: IRequest, res: IResponse, next: NextFunction): IResponse | void {
    let { page, limit, skip } = toPageInfo(req.body.page, req.body.size || 15)
    let { create_at, groups, findname } = req.body
    let conditions: any
    let findtype: FindType = req.body.findtype
    if (findname) {
      conditions = { ...conditions, [findtype]: new RegExp(findname) }
    }
    if (groups && Array.isArray(groups) && groups.length > 0) {
      conditions = { ...conditions, group: { $in: groups } }
    }
    if (create_at && Array.isArray(create_at) && create_at.length >= 2) {
      let { begin, end } = zipObject(['begin', 'end'], create_at)
      conditions = { ...conditions, create_at: { $gte: begin, $lt: end } }
    }
    let auth: responseUserDocument = req.user
    if (auth.group.level < 9000) {
      conditions = { ...conditions, teams: {
        $elemMatch: { $in: auth.teams }
      }}
    }
    let findUser: findUserDocument = {
      conditions,
      options: { 
        limit, 
        skip,
        select: ['_id', 'id', 'username', 'email', 'mobile', 'nickname', 'avatar', 'sex', 'binds', 'group', 'teams', 'access', 'create_at', 'update_at', 'jw_token']
      }
    }
    return next(findUser)
  }

  public edit (req: IRequest, res: IResponse, next: NextFunction): IResponse | void {

  }
}

export default new User()