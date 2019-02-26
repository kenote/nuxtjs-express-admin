
import { Request, Response, NextFunction } from 'express'
import { Rule, Filter, asyncFilterData, errorInfo, Options } from 'kenote-validate-helper'
import { format } from 'util'
import { IRequest, IResponse } from '../../types/resuful'
import { validTicket } from '../../utils/ticket'
import { responseDocument as responseTicketDocument } from '../../types/proxys/ticket'
import { registerDocument, responseDocument as responseUserDocument } from '../../types/proxys/user'
import account from '../../types/account'
import { __ErrorCode, __ErrorMessage } from '../../error'
import * as rules from '../../config/rules'
import userProxy from '../../proxys/user'
import groupProxy from '../../proxys/group'
import { responseDocument as responseGroupDocument } from '../../types/proxys/group'

const accountRules: account.Rules = {
  username: [
    { 
      required : true, 
      message  : __ErrorMessage.ERROR_VALID_USERNAME_REQUIRED, 
      code     : __ErrorCode.ERROR_VALID_USERNAME_REQUIRED 
    }
  ],
  email: [
    { 
      required : true, 
      message  : __ErrorMessage.ERROR_VALID_EMAIL_REQUIRED, 
      code     : __ErrorCode.ERROR_VALID_EMAIL_REQUIRED 
    }
  ],
  mobile: [
    { 
      required : true, 
      message  : __ErrorMessage.ERROR_VALID_MOBILE_REQUIRED, 
      code     : __ErrorCode.ERROR_VALID_MOBILE_REQUIRED 
    }
  ],
  password: [
    { 
      required : true, 
      message  : __ErrorMessage.ERROR_VALID_PASSWORD_REQUIRED, 
      code     : __ErrorCode.ERROR_VALID_PASSWORD_REQUIRED 
    }
  ],
  code: [
    {
      required : true, 
      message  : __ErrorMessage.ERROR_VERIFY_CODE_REQUIRED,
      code     : __ErrorCode.ERROR_VERIFY_CODE_REQUIRED
    }
  ]
}

class Account {

  public async register (req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { username, email, mobile, password, invitation } = <account.Register> req.body
    let filters: Array<Filter> = [
      { 
        key    : 'username', 
        rules  : (<Array<Rule>> accountRules.username).concat(rules.username), 
        value  : username 
      },
      {
        key    : 'email',
        rules  : (<Array<Rule>> accountRules.email).concat(rules.email),
        value  : email
      },
      {
        key    : 'password',
        rules  : (<Array<Rule>> accountRules.password).concat(rules.password),
        value  : password
      }
    ]
    try {
      let ticket: responseTicketDocument | undefined
      if (req.__register.invitation) {
        ticket = await validTicket({ cdkey: <string> invitation }, { name: '邀请码', type: 'register', key: 'cdkey' })
      }
      let document: registerDocument = await asyncFilterData(filters)
      if (ticket) {
        document.group = ticket.setting['group']
        if (ticket.setting['teams']) {
          document.teams = ticket.setting['teams']
        }
      }
      else {
        let group: responseGroupDocument = await groupProxy.Dao.findOne({ default: true })
        document.group = group._id
      }
      return next({ document, ticket })
    } catch (error) {
      return res.api(null, error)
    }
  }

  public async login (req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { username, password } = <account.Login> req.body
    let filters: Array<Filter> = [
      { 
        key    : 'username', 
        rules  : <Array<Rule>> accountRules.username, 
        value  : username 
      },
      {
        key    : 'password',
        rules  : <Array<Rule>> accountRules.password,
        value  : password
      }
    ]
    try {
      let document: account.Login = await asyncFilterData(filters)
      return next(document)
    } catch (error) {
      return res.api(null, error)
    }
  }

  public async resetpwd (req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type } = req.params
    let { code, password, name } = req.body
    let filters: Array<Filter> = [
      {
        key    : 'code',
        rules  : <Array<Rule>> accountRules.code,
        value  : code
      },
      {
        key    : 'password',
        rules  : (<Array<Rule>> accountRules.password).concat(rules.password),
        value  : password
      }
    ]
    if (type === 'email') {
      filters.push({
        key    : 'name',
        rules  : (<Array<Rule>> accountRules.email).concat(rules.email),
        value  : name
      })
    }
    if (type === 'mobile') {
      filters.push({
        key    : 'name',
        rules  : (<Array<Rule>> accountRules.mobile).concat(rules.mobile),
        value  : name
      })
    }
    try {
      let document: account.ResetPwd = await asyncFilterData(filters)
      return next(document)
    } catch (error) {
      return res.api(null, error)
    }
  }
}

export default new Account()