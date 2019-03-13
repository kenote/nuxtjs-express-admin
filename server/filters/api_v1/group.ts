import { Request, Response, NextFunction } from 'express'
import { Rule, Filter, asyncFilterData, errorInfo, Options } from 'kenote-validate-helper'
import { format } from 'util'
import { IRequest, IResponse } from '../../types/resuful'
import { createDocument as createGroupDocument, editDocument as editGroupDocument, responseDocument as responseGroupDocument } from '../../types/proxys/group'
import { createDocument as createStoreDocument } from '../../types/proxys/store'
import { __ErrorCode, CustomError } from '../../error'
import groupProxy from '../../proxys/group'

class Group {

  public create (req: IRequest, res: IResponse, next: NextFunction): Response | void {
    let body: createGroupDocument = getGroupDocument(req.body)
    let userLevevl: number = req.user.group.level
    if (body.level >= userLevevl && userLevevl < 9999) {
      return res.api(null, __ErrorCode.ERROR_BYLOND_LEVEL_OPERATE)
    }
    return next(body)
  }

  public async edit (req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    let doc: editGroupDocument = {
      conditions: { _id },
      data: getGroupDocument(req.body)
    }
    let userLevel: number = req.user.group.level
    if (doc.data.level >= userLevel && userLevel < 9999) {
      return res.api(null, __ErrorCode.ERROR_BYLOND_LEVEL_OPERATE)
    }
    if (!/^[a-f0-9]{24}$/.test(_id)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    try {
      let group: responseGroupDocument = await groupProxy.Dao.findOne(doc.conditions)
      if (!group) {
        return res.api(null, __ErrorCode.ERROR_AUTH_OPERATE_GROUP_NULL)
      }
      if (group.level >= userLevel && userLevel < 9999) {
        return res.api(null, __ErrorCode.ERROR_BYLOND_LEVEL_OPERATE)
      }
      return next(doc)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  public async remove (req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    if (!/^[a-f0-9]{24}$/.test(_id)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    let conditions: any = { _id }
    let userLevel: number = req.user.group.level
    try {
      let group: responseGroupDocument = await groupProxy.Dao.findOne(conditions)
      if (!group) {
        return res.api(null, __ErrorCode.ERROR_AUTH_OPERATE_GROUP_NULL)
      }
      if (group.level >= userLevel && userLevel < 9999) {
        return res.api(null, __ErrorCode.ERROR_BYLOND_LEVEL_OPERATE)
      }
      return next(conditions)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}

export default new Group()

const getGroupDocument = (body: any): createGroupDocument => {
  let name: string = body.name
  let level: number = Number(body.level)
  let description: string = body.description
  let download_type: string[] | undefined = body.download_type || []
  let upload_type: string[] | undefined = body.upload_type || []
  let store: createStoreDocument = { 
    download_type: Array.isArray(download_type) ? download_type : Array(download_type), 
    upload_type: Array.isArray(upload_type) ? upload_type : Array(upload_type)
  }
  return { name, level, description, store }
}