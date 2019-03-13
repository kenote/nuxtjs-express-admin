import * as passportJWT from 'passport-jwt'
import * as jwt from 'jsonwebtoken'
import { Request, NextFunction } from 'express'
import { pick } from 'lodash'
import { Payload, JwtSign } from '../types/resuful'
import config from '../config'
import userProxy from '../proxys/user'
import { responseDocument } from '../types/proxys/user'
import { FlagTag, IResponse } from '../types/resuful'
import { isFlag } from '../utils'
import { __ErrorCode } from '../error'

const { ExtractJwt, Strategy } = passportJWT
const jwtOptions: passportJWT.StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  passReqToCallback: true,
  secretOrKey: config.session_secret
}

const startegyVerify: passportJWT.VerifyCallbackWithRequest = async (req: Request, payload: Payload, done: passportJWT.VerifiedCallback): Promise<void> => {
  try {
    let user: responseDocument = await userProxy.Dao.findOne({ _id: payload._id })
    return done(null, pick(user, ['_id', 'id', 'username', 'email', 'mobile', 'nickname', 'avatar', 'sex', 'binds', 'group', 'teams', 'create_at', 'update_at', 'jw_token']))
  } catch (error) {
    return done(error, false)
  }
}

export const startegy: passportJWT.Strategy = new Strategy(jwtOptions, startegyVerify)

export const setToken: JwtSign = (payload: Payload, iat?: number): string => jwt.sign(
  {
    _id: payload._id,
    ...iat ? { iat } : null
  },
  <jwt.Secret> jwtOptions.secretOrKey
)

export const tokentoInfo = async (token: string): Promise<responseDocument> => {
  let payload: Payload = <Payload> jwt.decode(token)
  return await userProxy.Dao.findOne({ _id: payload._id })
}

export const permission = (key: string, tag: FlagTag): (req: Request, res: IResponse, next: NextFunction) => any => {
  return function (req: Request, res: IResponse, next: NextFunction): any {
    let user: responseDocument = req.user
    if (!isFlag(user.group.level, key, tag)) {
      return res.api(null, tag === 'access' ? __ErrorCode.ERROR_AUTH_FLAG_ACCESS : __ErrorCode.ERROR_AUTH_FLAG_OPERATE)
    }
    return next()
  }
}