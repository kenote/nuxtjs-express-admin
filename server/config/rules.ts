import { isEmail, isMobilePhone } from 'validator'
import { Rule } from 'kenote-validate-helper'
import { __ErrorCode, __ErrorMessage } from '../error'



export const username: Rule = {
  pattern    : /^[a-zA-Z]{1}[a-zA-Z0-9\_\-]{4,19}$/,
  message    : __ErrorMessage.ERROR_VALID_USERNAME_FORMAT,
  code       : __ErrorCode.ERROR_VALID_USERNAME_FORMAT
}

export const password: Rule = {
  pattern    : /^(?=.*[A-Za-z])[A-Za-z0-9$@$!%*#?&]{8,20}$/,
  message    : __ErrorMessage.ERROR_VALID_PASSWORD_FORMAT,
  code       : __ErrorCode.ERROR_VALID_PASSWORD_FORMAT
}

export const email: Rule = {
  validator  : isEmail,
  message    : __ErrorMessage.ERROR_VALID_EMAIL_FORMAT,
  code       : __ErrorCode.ERROR_VALID_EMAIL_FORMAT
}

export const mobile: Rule = {
  validator  : (value: string) => isMobilePhone(value, 'zh-CN'),
  message    : __ErrorMessage.ERROR_VALID_MOBILE_FORMAT,
  code       : __ErrorCode.ERROR_VALID_MOBILE_FORMAT
}