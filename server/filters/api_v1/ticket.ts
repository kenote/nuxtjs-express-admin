import { Request, Response, NextFunction } from 'express'
import { Rule, Filter, asyncFilterData, errorInfo, Options } from 'kenote-validate-helper'
import { IRequest, IResponse } from '../../types/resuful'
import { __ErrorCode, __ErrorMessage, CustomError } from '../../error'
import { validTicket } from '../../utils/ticket'
import { createDocument as createTicketDocument, editDocument as editTicketDocument } from '../../types/proxys/ticket'
import { responseDocument as responseGroupDocument } from '../../types/proxys/group'
import { isDate } from 'lodash'
import { format } from 'util'
import { isMongoId } from 'validator'
import groupProxy from '../../proxys/group'

interface TicketRules {
  group       ?: Array<Rule>
  stint       ?: Array<Rule>
  last_at     ?: Array<Rule>
}

const ticketRules: TicketRules = {
  group: [
    {
      required: true,
      message: __ErrorMessage.ERROR_VALID_GROUP_REQUIRED,
      code: __ErrorCode.ERROR_VALID_GROUP_REQUIRED
    }
  ],
  last_at: [
    {
      required: true,
      message: format(__ErrorMessage.ERROR_VALID_DATE_REQUIRED, '过期时间'),
      code: __ErrorCode.ERROR_VALID_DATE_REQUIRED
    },
    {
      validator: (value: string) => isDate(new Date(value)),
      message: format(__ErrorMessage.ERROR_VALID_DATE_FORMAT, '过期时间'),
      code: __ErrorCode.ERROR_VALID_DATE_FORMAT
    }
  ]
}

class Ticket {

  public async create (req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { group, last_at, stint } = req.body
    let filters: Array<Filter> = [
      {
        key: 'group',
        rules: <Array<Rule>> ticketRules.group,
        value: group
      },
      {
        key: 'last_at',
        rules: <Array<Rule>> ticketRules.last_at,
        value: last_at
      }
    ]
    try {
      let document: any = await asyncFilterData(filters)
      let group: responseGroupDocument = await groupProxy.Dao.findOne({ _id: document.group })
      if (!group) {
        return res.api(null, __ErrorCode.ERROR_VALID_GROUP_NOTEXIST)
      }
      let body: createTicketDocument = await getTicketDocument({ ...document, stint, groupName: group.name })
      return next(body)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  public async edit (req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    if (!isMongoId(_id)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    let { last_at, stint } = req.body
    let filters: Array<Filter> = [
      {
        key: 'last_at',
        rules: <Array<Rule>> ticketRules.last_at,
        value: last_at
      }
    ]
    try {
      let document: any = await asyncFilterData(filters)
      let doc: editTicketDocument = {
        conditions: { _id },
        data: {
          ...document,
          stint: Number(stint)
        }
      }
      return next(doc)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  public remove (req: IRequest, res: IResponse, next: NextFunction): Response | void {
    let { _id } = req.params
    let { _ids } = req.body
    let conditions: any
    if (_id) {
      if (!isMongoId(_id)) {
        return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
      }
      conditions = { _id }
    }
    else {
      conditions = { _id: { $in: Array.isArray(_ids) ? _ids : [] } }
    }
    return next(conditions)
  }
}

export default new Ticket()

const getTicketDocument = (body: any): createTicketDocument => {
  let type: string = 'register'
  let setting: {} = { group: body.group }
  let name: string = `注册 -> ` + body.groupName
  let stint: number = Number(body.stint | 1)
  let last_at: Date = new Date(body.last_at)
  return { type, setting, name, stint, last_at }
}