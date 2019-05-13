import { Request, Response, NextFunction } from 'express'
import { Router, RouterMethods, Filter } from 'kenote-express-helper'
import { CustomError, __ErrorCode } from '../../error'
import * as passport from 'passport'
import userProxy from '../../proxys/user'
import verifyProxy from '../../proxys/verify'
import securityFilter from '../../filters/api_v1/security'
import mailer from '../../utils/mailer'
import config from '../../config'
import { uniq } from 'lodash'
import Alicloud from '../../utils/alicloud'
import { loadData } from '../../utils'

import { IRequest, IResponse } from '../../types/resuful'
import { responseDocument as responseUserDocument } from '../../types/proxys/user'
import { responseDocument as responseVerifyDocument, createDocument as createVerifyDocument } from '../../types/proxys/verify'
import { alicloud } from '../../types/alicloud'
import * as Mail from 'nodemailer/lib/mailer'
import { MailerContext } from '../../types/mailer'
import account from '../../types/account'
import * as mongoose from 'mongoose'

export default class Security extends RouterMethods {

  /**
   * 发送验证码
   * @param name  <String> 电子邮箱 | 手机号
   */
  @Router( { method: 'put', path: '/security/sendcode/:type(email|mobile)'} )
  @Filter( passport.authenticate('jwt', { session: false }), securityFilter.sendCode )
  public async sendCode (document: any, req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type } = req.params
    let { name, verify_id } = document
    let user: responseUserDocument = req.user
    try {
      let verify: responseVerifyDocument = await verifyProxy.Dao.findOne(verify_id ? { type: 'code', _id: verify_id } : { type: 'code', user: user._id })
      if (!verify && verify_id) {
        return res.api(null, __ErrorCode.ERROR_VERIFY_ID_FAILED)
      }
      if (verify) {
        let updateTime: Date = verify_id ? verify.update_at : verify.create_at
        let difftime: number = Date.now() - updateTime.getTime()
        let timeout: number = Number(req.__register.mailphone_step) * 1000
        if (difftime < timeout) {
          return res.api(null, __ErrorCode.ERROR_SEND_MAILPHONE_STEP)
        }
        !verify_id && await verifyProxy.Dao.remove({ _id: verify._id })
      }
      
      if (verify_id) {
        verify = await verifyProxy.update({ _id: verify_id }, { application: name })
      }
      else {
        verify = <responseVerifyDocument> await verifyProxy.create({ type: 'code', user: user._id })
      }
      
      if (type === 'email') {
        let title: string = verify_id ? '邮箱校验' : '帐号身份校验'
        let mail: Mail.Options = {
          from: `${config.site_name} <${mailer.__MailOptions.auth.user}>`,
          to: `${user.username} <${verify_id ? name : user.email}>`,
          subject: `${config.site_name}${title}`
        }
        let context: MailerContext.sendCode = {
          title: title,
          site_name: config.site_name,
          username: user.username,
          code: verify.token,
          timeout: req.__register.lost_pass.timeout / 60
        }
        mailer.sendMail('send_code.mjml', mail, context)
      }
      if (type === 'mobile') {
        let alicloudStores: Array<alicloud.Store> = <Array<alicloud.Store>> loadData('data/alicloud', 'array')
        let store: alicloud.Store | undefined = alicloudStores.find( o => o && o.key === req.__register.sms.alicound )
        if (store && store.SMS) {
          await new Alicloud(store).SendSms(verify_id ? name : user.mobile, verify_id ? 'setinfos' : 'verifyid', { code: verify.token })
        }
      }
      return res.api({ result: true })
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 校验验证码
   * @param code  <String> 验证码
   */
  @Router({ method: 'post', path: '/security/verifycode' })
  @Filter( passport.authenticate('jwt', { session: false }) )
  public async verifyCode (req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { code } = req.body
    let user: responseUserDocument = req.user
    try {
      let verify: responseVerifyDocument = await verifyProxy.Dao.findOne({ type: 'code', user: user._id, token: code })
      if (!verify) {
        return res.api(null, __ErrorCode.ERROR_VERIFY_CODE_FAILED)
      }
      let difftime: number = Date.now() - verify.create_at.getTime()
      let timeout: number = Number(req.__register.lost_pass.timeout) * 1000
      if (difftime > timeout) {
        return res.api(null, __ErrorCode.ERROR_VERIFY_CODE_TIMEOUT)
      }
      return res.api({ _id: verify._id })
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 修改密码
   * @param passport  <String> 新密码
   * @param verify_id  <String> 身份验证 ID
   */
  @Router({ method: 'post', path: '/security/setpassword' })
  @Filter( passport.authenticate('jwt', { session: false }), securityFilter.setPassword )
  public async setPassword (document: account.setPassword, req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { verify_id } = document
    let user: responseUserDocument = req.user
    try {
      let verify: responseVerifyDocument = await verifyProxy.Dao.findOne({ type: 'code', user: user._id, _id: verify_id })
      if (!verify) {
        return res.api(null, __ErrorCode.ERROR_VERIFY_ID_FAILED)
      }
      let difftime: number = Date.now() - verify.create_at.getTime()
      let timeout: number = Number(req.__register.lost_pass.timeout) * 1000
      if (difftime > timeout) {
        return res.api(null, __ErrorCode.ERROR_VERIFY_ID_TIMEOUT)
      }
      let result: mongoose.Query<any> = await userProxy.setPassword({ _id: user._id }, document)
      await verifyProxy.Dao.remove({ _id: verify._id })
      return res.api(result)
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
  @Router({ method: 'put', path: '/security/check/:type(username|email|mobile)'})
  @Filter( passport.authenticate('jwt', { session: false }) )
  public async check (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type } = req.params
    let { name } = req.body
    let auth: responseUserDocument = req.user
    let warnings: account.CheckWarning = {
      username: __ErrorCode.ERROR_VALID_USERNAME_UNIQUE,
      email: __ErrorCode.ERROR_VALID_EMAIL_UNIQUE,
      mobile: __ErrorCode.ERROR_VALID_MOBILE_UNIQUE
    }
    try {
      let user: responseUserDocument = await userProxy.Dao.findOne({ [type]: { $eq: name, $ne: auth[type] } })
      return res.api(!user, user ? warnings[type] : null)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 修改邮箱
   * @param email  <String> 新邮箱
   * @param code  <String> 邮箱验证码
   * @param verify_id  <String> 身份验证 ID
   */
  @Router({ method: 'post', path: '/security/setemail' })
  @Filter( passport.authenticate('jwt', { session: false }), securityFilter.setEmail )
  public async setEmail (document: account.setEmail, req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { verify_id, code, email } = document
    let user: responseUserDocument = req.user
    try {
      let verify: responseVerifyDocument = await verifyProxy.Dao.findOne({ type: 'code', user: user._id, _id: verify_id })
      if (!verify) {
        return res.api(null, __ErrorCode.ERROR_VERIFY_ID_FAILED)
      }
      let difftime: number = Date.now() - verify.create_at.getTime()
      let timeout: number = Number(req.__register.lost_pass.timeout) * 1000
      if (difftime > timeout) {
        return res.api(null, __ErrorCode.ERROR_VERIFY_ID_TIMEOUT)
      }
      if (verify.token !== code) {
        return res.api(null, __ErrorCode.ERROR_VERIFY_CODE_FAILED)
      }
      let result: mongoose.Query<any> = await userProxy.Dao.updateOne({ _id: user._id }, { email, binds: uniq(user.binds.concat('email')) })
      await verifyProxy.Dao.remove({ _id: verify._id })
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 修改手机
   * @param mobile  <String> 新手机
   * @param code  <String> 手机验证码
   * @param verify_id  <String> 身份验证 ID
   */
  @Router({ method: 'post', path: '/security/setmobile' })
  @Filter( passport.authenticate('jwt', { session: false }), securityFilter.setMobile )
  public async setMobile (document: account.setMobile, req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { verify_id, code, mobile } = document
    let user: responseUserDocument = req.user
    try {
      let verify: responseVerifyDocument = await verifyProxy.Dao.findOne({ type: 'code', user: user._id, _id: verify_id })
      if (!verify) {
        return res.api(null, __ErrorCode.ERROR_VERIFY_ID_FAILED)
      }
      let difftime: number = Date.now() - verify.create_at.getTime()
      let timeout: number = Number(req.__register.lost_pass.timeout) * 1000
      if (difftime > timeout) {
        return res.api(null, __ErrorCode.ERROR_VERIFY_ID_TIMEOUT)
      }
      if (verify.token !== code) {
        return res.api(null, __ErrorCode.ERROR_VERIFY_CODE_FAILED)
      }
      let result: mongoose.Query<any> = await userProxy.Dao.updateOne({ _id: user._id }, { mobile, binds: uniq(user.binds.concat('mobile')) })
      await verifyProxy.Dao.remove({ _id: verify._id })
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 发送当前用户验证邮件
   */
  @Router({ method: 'get', path: '/security/email_verify' })
  @Filter( passport.authenticate('jwt', { session: false }) )
  public async emailVerify (req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id, username, email } = <responseUserDocument> req.user
    try {
      let verify: responseVerifyDocument = await verifyProxy.Dao.findOne({ type: 'email', user: _id })
      if (verify) {
        await verifyProxy.Dao.remove({ _id: verify._id })
      }
      verify = <responseVerifyDocument> await verifyProxy.create({ type: 'email', user: _id })
      let mail: Mail.Options = {
        from: `${config.site_name} <${mailer.__MailOptions.auth.user}>`,
        to: `${username} <${email}>`,
        subject: `${config.site_name}邮箱验证`
      }
      let context: MailerContext.emailVerify = {
        site_name: config.site_name,
        username: username,
        email_verify_url: `${config.site_url}/accounts/email_verify?token=${verify.token}&id=${verify.id}`,
        timeout: req.__register.email_verify.timeout / 3600
      }
      mailer.sendMail('email_verify.mjml', mail, context)
      return res.api(null)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}