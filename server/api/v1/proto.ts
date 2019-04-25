import { Request, Response, NextFunction } from 'express'
import { Router, RouterMethods, Filter } from 'kenote-express-helper'
import { IResponse } from '../../types/resuful'
import config from '../../config'
import { __ErrorCode, CustomError } from '../../error'
import { loadData } from '../../utils'
import * as passport from 'passport'
import ProtoUtil from '../../utils/proto'
import channel from '../../types/channel'
import { Setting, Config, API, APIS, protoDocument } from '../../types/proto'
import { PBSetting, PB } from 'kenote-socket-helper'
import { isNull, isEmpty } from 'lodash'
import protoFilter from '../../filters/api_v1/proto'

export default class Proto extends RouterMethods {

  @Router({ method: 'post', path: '/proto/:channel/:tag' })
  @Filter( protoFilter.send )
  public async send (document: protoDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { channel, setting, proto, payload, rtsp_key } = document
    console.log(`\n===== chanel: ${channel} =====\n`)
    try {
      let result: PB.Message | undefined = <PB.Message> await new ProtoUtil(setting).send(proto, payload, proto.rstp || rtsp_key)
      return res.api(result.msgbody)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}