import { ExpressError, ErrorSetting } from 'kenote-express-helper'
import { CodeTypes } from '../types/error/code'
import { MessageTypes } from '../types/error/message'
import Code from './code'
import Message from './message/zh-cn'

@ErrorSetting({
  code: Code,
  message: Message
})
class MyError extends ExpressError {
  public __ErrorCode: CodeTypes
  public __ErrorMessage: MessageTypes
}

const { __ErrorCode, __ErrorMessage, CustomError, ErrorInfo } = new MyError()

export { __ErrorCode, __ErrorMessage, CustomError, ErrorInfo }