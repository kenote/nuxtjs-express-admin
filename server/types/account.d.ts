
import { Rule } from 'kenote-validate-helper'
import { registerDocument } from './proxys/user'
import { responseDocument as responseTicketDocument } from './proxys/ticket'
import { password } from '../config/rules';

declare namespace account {

  interface Register {
    username    ?: string
    email       ?: string
    mobile      ?: string
    password    ?: string
    invitation  ?: string
  }

  interface Login {
    username    ?: string
    password    ?: string
  }

  interface ResetPwd {
    code        ?: string
    password    ?: string
    name        ?: string
  }

  interface Rules {
    username    ?: Array<Rule>
    email       ?: Array<Rule>
    mobile      ?: Array<Rule>
    password    ?: Array<Rule>
    invitation  ?: Array<Rule>
    code        ?: Array<Rule>
  }

  interface Password {
    hash      : string
    salt      : string
  }

  interface createDocument {
    document  : registerDocument
    ticket    : responseTicketDocument
  }

  interface CheckWarning {
    username  : number
    email     : number
    mobile    : number
  }

  interface VerifyWarning {
    [propsName: string] : verifyItem
  }

}

interface verifyItem {
  timeout    : number
  failed     : number
}

export = account