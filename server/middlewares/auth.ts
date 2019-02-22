import * as passportJWT from 'passport-jwt'
import * as jwt from 'jsonwebtoken'
import { Request } from 'express'
import { pick } from 'lodash'
import { Payload, JwtSign } from '../types/resuful'
import config from '../config'
import userProxy from '../proxys/user'
import { responseDocument } from '../types/proxys/user'

const { ExtractJwt, Strategy } = passportJWT
const jwtOptions: passportJWT.StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  passReqToCallback: true,
  secretOrKey: config.session_secret
}

const startegyVerify: passportJWT.VerifyCallbackWithRequest = async (req: Request, payload: Payload, done: passportJWT.VerifiedCallback): Promise<void> => {
  try {
    let user: responseDocument = await userProxy.Dao.findOne({ _id: payload._id })
    return done(null, pick(user, ['_id', 'id', 'username', 'email', 'mobile', 'nickname', 'avatar', 'sex', 'binds', 'group', 'teams', 'create_at', 'update_at']))
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