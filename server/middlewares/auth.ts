import * as passportJWT from 'passport-jwt'
import * as jwt from 'jsonwebtoken'
import { Request } from 'express'
import { Payload, JwtSign } from '../types/resuful'
import config from '../config'

const { ExtractJwt, Strategy } = passportJWT
const jwtOptions: passportJWT.StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  passReqToCallback: true,
  secretOrKey: config.session_secret
}

const startegyVerify: passportJWT.VerifyCallbackWithRequest = async (req: Request, payload: Payload, done: passportJWT.VerifiedCallback): Promise<void> => {
  return done(null, false)
}

export const startegy: passportJWT.Strategy = new Strategy(jwtOptions, startegyVerify)

export const setToken: JwtSign = (payload: Payload, iat?: number): string => jwt.sign(
  {
    _id: payload._id,
    ...iat ? { iat } : null
  },
  <jwt.Secret> jwtOptions.secretOrKey
)