import { Response, NextFunction } from 'express'
import { IRequest, IResponse } from '../../types/resuful'
import { Rule, Filter, asyncFilterData, errorInfo, Options } from 'kenote-validate-helper'
import { __ErrorCode, __ErrorMessage } from '../../error'
import { format, isDate } from 'util'
import { 
  createDocument as createPlanDocument,
  editDocument as editPlanDocument,
  updateDocument as updatePlanDocument
} from '../../types/proxys/plan'
import { responseDocument as responseUserDocument } from '../../types/proxys/user'
import { isMongoId } from 'validator'
import { formatArray } from '../../utils'

class Plan {

  public async create (req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { name, type, plan, channel } = req.body
    let filters: Array<Filter> = [
      {
        key: 'name',
        rules: [
          { required: true, message: format(__ErrorMessage.ERROR_VALID_DATE_REQUIRED, '方案名称'), code: __ErrorCode.ERROR_VALID_DATE_REQUIRED }
        ],
        value: name
      },
      {
        key: 'type',
        rules: [
          { required: true, message: format(__ErrorMessage.ERROR_VALID_DATE_REQUIRED, '方案类型'), code: __ErrorCode.ERROR_VALID_DATE_REQUIRED }
        ],
        value: type
      },
      {
        key: 'plan',
        rules: [
          { required: true, message: format(__ErrorMessage.ERROR_VALID_DATE_REQUIRED, '方案详情'), code: __ErrorCode.ERROR_VALID_DATE_REQUIRED }
        ],
        value: plan
      },
    ]
    let user: responseUserDocument = req.user
    try {
      let document: createPlanDocument = await asyncFilterData(filters)
      document.channel = channel
      document.user = user._id
      return next(document)
    } catch (error) {
      return res.api(null, error)
    }
  }

  public async list (req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type, channel } = req.params
    let user: responseUserDocument = req.user
    let conditions: any = {
      user: user._id
    }
    if (type) {
      conditions['type'] = type
    }
    if (channel) {
      conditions['channel'] = channel
    }
    return next(conditions)
  }

  public async edit (req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    let { name, plan } = req.body
    if (!isMongoId(_id)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    let filters: Array<Filter> = [
      {
        key: 'name',
        rules: [
          { required: true, message: format(__ErrorMessage.ERROR_VALID_DATE_REQUIRED, '方案名称'), code: __ErrorCode.ERROR_VALID_DATE_REQUIRED }
        ],
        value: name
      },
      {
        key: 'plan',
        rules: [
          { required: true, message: format(__ErrorMessage.ERROR_VALID_DATE_REQUIRED, '方案详情'), code: __ErrorCode.ERROR_VALID_DATE_REQUIRED }
        ],
        value: plan
      },
    ]
    let user: responseUserDocument = req.user
    try {
      let document: updatePlanDocument = await asyncFilterData(filters)
      document.update_at = new Date()
      let doc: editPlanDocument = {
        conditions: { _id, user: user._id },
        data: document
      }
      return next(doc)
    } catch (error) {
      return res.api(null, error)
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
      conditions = { _id: { $in: formatArray(_ids) } }
    }
    return next(conditions)
  }
}

export default new Plan()