import { Request, Response, NextFunction } from 'express'
import { Router, RouterMethods, Filter } from 'kenote-express-helper'
import { omit } from 'lodash'
import { CustomError, __ErrorCode } from '../../error'
import accountFilter from '../../filters/api_v1/account'
import userProxy from '../../proxys/user'
import ticketProxy from '../../proxys/ticket'
import verifyProxy from '../../proxys/verify'
import { validTicket } from '../../utils/ticket'
import mailer from '../../utils/mailer'
import config from '../../config'

import account from '../../types/account'
import { IRequest, IResponse } from '../../types/resuful'
import { responseDocument as responseTicketDocument } from '../../types/proxys/ticket'
import { responseDocument as responseUserDocument } from '../../types/proxys/user'
import { responseDocument as responseVerifyDocument } from '../../types/proxys/verify'
import * as Mail from 'nodemailer/lib/mailer'
import { MailerContext } from '../../types/mailer'

export default class Account extends RouterMethods {

  /**
   * 验证邀请码
   * @param cdkey <UUID4> 邀请码
   */
  @Router({ method: 'post', path: '/account/invitation' })
  public async invitation (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { cdkey } = req.body
    try {
      let data: responseTicketDocument = await validTicket({ cdkey }, { name: '邀请码', type: 'register', key: 'cdkey' })
      return res.api(data)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 注册帐号
   * @param invitation  <UUID4> 邀请码
   * @param username  <String> 用户名 
   * @param password  <String> 密码
   * @param email  <String> 电子邮箱
   */
  @Router({ method: 'post', path: '/account/register' })
  @Filter(accountFilter.register)
  public async register (create: account.createDocument, req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let user: responseUserDocument = <responseUserDocument> await userProxy.register(create.document)
      if (req.__register.invitation) {
        let { ticket } = create
        let used: boolean = ticket.stint <= ticket.uses + 1
        await ticketProxy.Dao.updateOne({ _id: ticket._id }, { $inc: { uses: 1 }, used })
      }
      let verify: responseVerifyDocument = <responseVerifyDocument> await verifyProxy.create({ type: 'email', user: user._id })
      let mail: Mail.Options = {
        from: `${config.site_name} <${mailer.__MailOptions.auth.user}>`,
        to: `${user.username} <${user.email}>`,
        subject: `${config.site_name}邮箱验证`
      }
      let context: MailerContext.emailVerify = {
        site_name: config.site_name,
        username: user.username,
        email_verify_url: `${config.site_url}/accounts/email/verify?token=${verify.token}&id=${verify.id}`,
        timeout: req.__register.email_verify.timeout
      }
      mailer.sendMail('email_verify.mjml', mail, context)
      return res.api(omit(user, ['encrypt', 'salt']))
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 验证名称是否占用
   * @param name  <String> 用户名 | 电子邮箱 | 手机号
   */
  @Router({ method: 'post', path: '/account/check/:type(username|email|mobile)'})
  public async check (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type } = req.params
    let { name } = req.body
    let warnings: account.CheckWarning = {
      username: __ErrorCode.ERROR_VALID_USERNAME_UNIQUE,
      email: __ErrorCode.ERROR_VALID_EMAIL_UNIQUE,
      mobile: __ErrorCode.ERROR_VALID_MOBILE_UNIQUE
    }
    try {
      let user: responseUserDocument = await userProxy.Dao.findOne({ [type]: name })
      return res.api(!user, user ? warnings[type] : null)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}