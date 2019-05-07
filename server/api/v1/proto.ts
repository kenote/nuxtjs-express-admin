import { Request, Response, NextFunction } from 'express'
import { Router, RouterMethods, Filter } from 'kenote-express-helper'
import { IResponse } from '../../types/resuful'
import config from '../../config'
import { __ErrorCode, CustomError } from '../../error'
import * as utils from '../../utils'
import * as passport from 'passport'
import ProtoUtil from '../../utils/proto'
import channel from '../../types/channel'
import { Setting, Config, API, APIS, protoDocument } from '../../types/proto'
import { PBSetting, PB } from 'kenote-socket-helper'
import { isNull, isEmpty, zipObject, map, orderBy } from 'lodash'
import protoFilter from '../../filters/api_v1/proto'

export default class Proto extends RouterMethods {

  @Router({ method: 'post', path: '/proto/:channel/:tag' })
  @Filter( protoFilter.send )
  public async send (document: protoDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { channel, setting, proto, payload, rtsp_key, parse } = document
    console.log(`\n===== chanel: ${channel} =====\n`)
    try {
      let result: PB.Message | undefined = <PB.Message> await new ProtoUtil(setting).send(proto, payload, proto.rstp || rtsp_key)
      if (!result.msgbody) {
        return res.api(null)
      }
      if (parse) {
        let _result: any = {}
        for (let item of parse) {
          let { key, collection, separator, int } = item
          let data: string | string[] = result.msgbody[key]
          if (Array.isArray(data)) {
            let _data: any[] = []
            for (let values of data) {
              let value: any = zipObject(map(collection, 'key'), values.split(separator))
              if (int && value[int.key]) {
                value.int =  utils[int.function](value[int.key], ...int.options)
              }
              _data.push(value)
            }
            if (item.orderBy) {
              let { iteratees, orders } = item.orderBy
              _data = orderBy(_data, iteratees, orders)
            }
            _result[key] = _data
          }
          else {
            _result[key] = data
          }
        }
        return res.api(_result)
      }
      else {
        return res.api(result.msgbody)
      }
      
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}