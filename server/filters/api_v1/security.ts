
import { Request, Response, NextFunction } from 'express'
import { Rule, Filter, asyncFilterData, errorInfo, Options } from 'kenote-validate-helper'

import { IRequest, IResponse } from '../../types/resuful'
import account from '../../types/account'
import { __ErrorCode, __ErrorMessage } from '../../error'
import * as rules from '../../config/rules'

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
  verify_id: [
    {
      required : true,
      message  : __ErrorMessage.ERROR_VERIFY_ID_REQUIRED,
      code     : __ErrorCode.ERROR_VERIFY_ID_REQUIRED
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

class Security {

  public async sendCode (req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type } = req.params
    let { name, verify_id } = req.body
    let document: account.sendCode = {}
    if (!verify_id) return next(document)
    let filters: Array<Filter> = [
      {
        key    : 'name',
        rules  : (<Array<Rule>> accountRules[type]).concat(rules[type]),
        value  : name
      },
      {
        key    : 'verify_id',
        rules  : <Array<Rule>> accountRules.verify_id,
        value  : verify_id
      }
    ]
    try {
      document = await asyncFilterData(filters)
      return next(document)
    } catch (error) {
      return res.api(null, error)
    }
  }

  public async setPassword (req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { password, verify_id } = req.body
    let filters: Array<Filter> = [
      {
        key    : 'password',
        rules  : (<Array<Rule>> accountRules.password).concat(rules.password),
        value  : password
      },
      {
        key    : 'verify_id',
        rules  : <Array<Rule>> accountRules.verify_id,
        value  : verify_id
      }
    ]
    try {
      let document: account.setPassword = await asyncFilterData(filters)
      return next(document)
    } catch (error) {
      return res.api(null, error)
    }
  }

  public async setEmail (req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { email, verify_id, code } = req.body
    let filters: Array<Filter> = [
      {
        key    : 'email',
        rules  : (<Array<Rule>> accountRules.email).concat(rules.email),
        value  : email
      },
      {
        key    : 'verify_id',
        rules  : <Array<Rule>> accountRules.verify_id,
        value  : verify_id
      },
      {
        key    : 'code',
        rules  : <Array<Rule>> accountRules.code,
        value  : code
      }
    ]
    try {
      let document: account.setEmail = await asyncFilterData(filters)
      return next(document)
    } catch (error) {
      return res.api(null, error)
    }
  }

  public async setMobile (req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { mobile, verify_id, code } = req.body
    let filters: Array<Filter> = [
      {
        key    : 'mobile',
        rules  : (<Array<Rule>> accountRules.mobile).concat(rules.mobile),
        value  : mobile
      },
      {
        key    : 'verify_id',
        rules  : <Array<Rule>> accountRules.verify_id,
        value  : verify_id
      },
      {
        key    : 'code',
        rules  : <Array<Rule>> accountRules.code,
        value  : code
      }
    ]
    try {
      let document: account.setMobile = await asyncFilterData(filters)
      return next(document)
    } catch (error) {
      return res.api(null, error)
    }
  }
}

export default new Security()