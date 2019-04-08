import { Request, Response, NextFunction } from 'express'
import { Rule, Filter, asyncFilterData, errorInfo, Options } from 'kenote-validate-helper'
import { format } from 'util'
import { IRequest, IResponse } from '../../types/resuful'
import { __ErrorCode, __ErrorMessage } from '../../error'
import { createDocument as createTeamDocument, accessDocument as accessTeamDocument, editDocument as editTeamDocument } from '../../types/proxys/team'
import { responseDocument as responseUserDocument } from '../../types/proxys/user'
import { remove, uniq, map } from 'lodash'
import { isMongoId } from 'validator'
import { formatArray } from '../../utils'

const teamRules = {
  name: [
    { 
      required : true, 
      message  : format(__ErrorMessage.ERROR_VALID_NAME_REQUIRED, '团队'), 
      code     : __ErrorCode.ERROR_VALID_NAME_REQUIRED 
    }
  ]
}

class Team {

  public async create (req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { name, description, platform } = req.body
    let filters: Array<Filter> = [
      {
        key: 'name',
        rules: teamRules.name,
        value: name
      }
    ]
    try {
      let document: createTeamDocument = await asyncFilterData(filters)
      return next({ ...document, description, platform: uniq(formatArray(platform, 'number')) })
    } catch (error) {
      return res.api(null, error)
    }
  }

  public async access (req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    if (!isMongoId(_id)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    let { access } = req.body
    let { group, teams } = <responseUserDocument> req.user
    let doc: accessTeamDocument = {
      conditions: { _id },
      data: {
        access: uniq(formatArray(access))
      }
    }
    if (group.level < 9000) {
      let _access: string[] = uniq(map(teams, 'access').toString().split(','))
      doc.data.access = _access.filter( o => doc.data.access.indexOf(o) > -1)
    }
    return next(doc)
  }

  public async edit (req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    if (!isMongoId(_id)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    let { name, description, platform } = req.body
    let filters: Array<Filter> = [
      {
        key: 'name',
        rules: teamRules.name,
        value: name
      }
    ]
    try {
      let document: createTeamDocument = await asyncFilterData(filters)
      let doc: editTeamDocument = {
        conditions: { _id },
        data: {
          ...document,
          description, 
          platform: uniq(formatArray(platform, 'number'))
        }
      }
      return next(doc)
    } catch (error) {
      return res.api(null, error)
    }
  }

  public async remove (req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    if (!isMongoId(_id)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    let conditions: any = { _id }
    return next(conditions)
  }
}

export default new Team()