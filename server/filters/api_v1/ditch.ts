import { Request, Response, NextFunction } from 'express'
import { Rule, Filter, asyncFilterData, errorInfo, Options } from 'kenote-validate-helper'
import { format, isDate } from 'util'
import { IRequest, IResponse } from '../../types/resuful'
import { __ErrorCode, __ErrorMessage } from '../../error'
import { 
  createDocument as createDitchDocument, 
  responseDocument as responseDitchDocument, 
  allotDocument as allotDitchDocument, 
  editDocument as editDitchDocument,
  updateDocument as updateDitchDocument
} from '../../types/proxys/ditch'
import { responseDocument as responseTeamDocument } from '../../types/proxys/team'
import { responseDocument as responseUserDocument } from '../../types/proxys/user'
import channel from '../../types/channel'
import { loadData, formatArray } from '../../utils'
import teamProxy from '../../proxys/team'
import ditchProxy from '../../proxys/ditch'
import { isMongoId } from 'validator'
import { isString, isNumber } from 'lodash'

class Ditch {

  public list (req: IRequest, res: IResponse, next: NextFunction): Response | void {
    let { channel } = req.params
    let channels: Array<channel.NavMenus> = (<Array<channel.NavMenus>> loadData('data/channels', 'array')).filter( o => o.id > 1000 && o.id < 2000 )
    let _channel: channel.NavMenus | undefined = channels.find( o => o.label === channel )
    if (!_channel) {
      return res.api(null, __ErrorCode.ERROR_CHANNEL_NOTEXIST)
    }
    let conditions: any = {
      channel: _channel.label
    }
    let user: responseUserDocument = req.user
    if (user.group.level < 8000) {
      conditions = { ...conditions, teams: { $elemMatch: { $in: user.teams } } }
    }
    return next(conditions)
  }

  public async create (req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { channel } = req.params
    let { label, name, teams, group } = req.body
    let channels: Array<channel.NavMenus> = (<Array<channel.NavMenus>> loadData('data/channels', 'array')).filter( o => o.id > 1000 && o.id < 2000 )
    let _channel: channel.NavMenus | undefined = channels.find( o => o.label === channel )
    if (!_channel) {
      return res.api(null, __ErrorCode.ERROR_CHANNEL_NOTEXIST)
    }
    let filters: Array<Filter> = [
      {
        key: 'label',
        rules: [
          { required: true, message: format(__ErrorMessage.ERROR_VALID_DATE_REQUIRED, '渠道标签'), code: __ErrorCode.ERROR_VALID_DATE_REQUIRED }
        ],
        value: label
      },
      {
        key: 'name',
        rules: [
          { required: true, message: format(__ErrorMessage.ERROR_VALID_DATE_REQUIRED, '渠道名称'), code: __ErrorCode.ERROR_VALID_DATE_REQUIRED }
        ],
        value: name
      },
      {
        key: 'group',
        rules: [
          { required: true, message: format(__ErrorMessage.ERROR_VALID_DATE_REQUIRED, '组'), code: __ErrorCode.ERROR_VALID_DATE_REQUIRED }
        ],
        value: group
      },
    ]
    try {
      let document: createDitchDocument = await asyncFilterData(filters)
      document.teams = []
      document.channel = _channel.label
      for (let _id of formatArray(teams)) {
        if (isMongoId(_id)) {
          let _team: responseTeamDocument = await teamProxy.Dao.findOne({ _id })
          _team && document.teams.push(_team._id)
        }
      }
      return next(document)
    } catch (error) {
      return res.api(null, error)
    }
  }

  public async edit (req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { channel, _id } = req.params
    let { label, name, teams, group } = req.body
    let channels: Array<channel.NavMenus> = (<Array<channel.NavMenus>> loadData('data/channels', 'array')).filter( o => o.id > 1000 && o.id < 2000 )
    let _channel: channel.NavMenus | undefined = channels.find( o => o.label === channel )
    if (!_channel) {
      return res.api(null, __ErrorCode.ERROR_CHANNEL_NOTEXIST)
    }
    if (!isMongoId(_id)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    let filters: Array<Filter> = [
      {
        key: 'label',
        rules: [
          { required: true, message: format(__ErrorMessage.ERROR_VALID_DATE_REQUIRED, '渠道标签'), code: __ErrorCode.ERROR_VALID_DATE_REQUIRED }
        ],
        value: label
      },
      {
        key: 'name',
        rules: [
          { required: true, message: format(__ErrorMessage.ERROR_VALID_DATE_REQUIRED, '渠道名称'), code: __ErrorCode.ERROR_VALID_DATE_REQUIRED }
        ],
        value: name
      },
      {
        key: 'group',
        rules: [
          { required: true, message: format(__ErrorMessage.ERROR_VALID_DATE_REQUIRED, '组'), code: __ErrorCode.ERROR_VALID_DATE_REQUIRED }
        ],
        value: group
      },
    ]
    try {
      let document: updateDitchDocument = await asyncFilterData(filters)
      document.teams = []
      for (let _id of formatArray(teams)) {
        if (isMongoId(_id)) {
          let _team: responseTeamDocument = await teamProxy.Dao.findOne({ _id })
          _team && document.teams.push(_team._id)
        }
      }
      let doc: editDitchDocument = {
        conditions: { _id, channel: _channel.label },
        data: document
      }
      return next(doc)
    } catch (error) {
      return res.api(null, error)
    }
  }

  public cardinal (req: IRequest, res: IResponse, next: NextFunction): Response | void {
    let { channel, _id } = req.params
    let channels: Array<channel.NavMenus> = (<Array<channel.NavMenus>> loadData('data/channels', 'array')).filter( o => o.id > 1000 && o.id < 2000 )
    let _channel: channel.NavMenus | undefined = channels.find( o => o.label === channel )
    if (!_channel) {
      return res.api(null, __ErrorCode.ERROR_CHANNEL_NOTEXIST)
    }
    if (!isMongoId(_id)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    let doc: editDitchDocument = {
      conditions: { _id, channel: _channel.label },
      data: { cardinal_number: req.body }
    }
    return next(doc)
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

  public async allot (req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { channel } = req.params
    let { team, ditchs, raw_ditchs } = req.body
    let channels: Array<channel.NavMenus> = (<Array<channel.NavMenus>> loadData('data/channels', 'array')).filter( o => o.id > 1000 && o.id < 2000 )
    let _channel: channel.NavMenus | undefined = channels.find( o => o.label === channel )
    if (!_channel) {
      return res.api(null, __ErrorCode.ERROR_CHANNEL_NOTEXIST)
    }
    let filters: Array<Filter> = [
      {
        key: 'team',
        rules: [
          { required: true, message: format(__ErrorMessage.ERROR_VALID_DATE_REQUIRED, '团队'), code: __ErrorCode.ERROR_VALID_DATE_REQUIRED }
        ],
        value: team
      }
    ]
    try {
      let document: allotDitchDocument = await asyncFilterData(filters)
      document.channel = _channel.label
      let _ditchs: string[] = []
      for (let _id of formatArray(ditchs)) {
        if (isMongoId(_id)) {
          let _ditch: responseDitchDocument = await ditchProxy.Dao.findOne({ _id })
          _ditch && _ditchs.push(_ditch._id)
        }
      }
      let _raw_ditchs: string[] = []
      for (let _id of formatArray(raw_ditchs)) {
        if (isMongoId(_id)) {
          let _ditch: responseDitchDocument = await ditchProxy.Dao.findOne({ _id })
          _ditch && _raw_ditchs.push(_ditch._id)
        }
      }
      document.ditchs = _ditchs
      document.raw_ditchs = _raw_ditchs
      return next(document)
    } catch (error) {
      return res.api(null, error)
    }
  }
}

export default new Ditch()