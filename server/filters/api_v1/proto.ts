import { Response, NextFunction } from 'express'
import { IRequest, IResponse } from '../../types/resuful'
import { loadData, formatArray } from '../../utils'
import config from '../../config'
import { responseDocument as responseUserDocument } from '../../types/proxys/user'
import { __ErrorCode } from '../../error'
import channel from '../../types/channel'
import { Setting, Config, API, APIS, protoDocument, Send } from '../../types/proto'
import { PBSetting, PB } from 'kenote-socket-helper'
import { isNull, isEmpty, uniq } from 'lodash'
import * as moment from 'moment'

class Proto {

  public async send (req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { channel, tag } = req.params
    let { rtsp_key } = req.headers
    let setting: channel.NavMenus = <channel.NavMenus> loadData(`data/channels/gm-${channel}.yml`)
    if (isEmpty(setting)) {
      // 没找到 channel 配置
      return res.api('没找到 channel 配置')
    }
    let rstps: channel.Rstps | {} = setting.rstp || {}
    let protoSetting: Config = { rstps, proto: <PBSetting> setting.proto }

    let apis: APIS = loadData(`channels/${channel}/api`)
    console.log(apis)
    if (isEmpty(apis) || Object.keys(apis).indexOf(tag) === -1) {
      // 没找到 api 接口
      return res.api('没找到 api 接口')
    }
    console.log(apis[tag])
    let { proto, request, parse, alias, autoFields } = apis[tag]
    let payload: {} = formatPayload(req.body, request, alias)
    if (autoFields) {
      for (let field in autoFields) {
        let { reference, subtract, add } = autoFields[field]
        let fieldValue: any = payload[reference]
        if (subtract) {
          payload[field] = moment(fieldValue).subtract(...subtract).format('x')
        }
        else if (add) {
          payload[field] = moment(fieldValue).add(...add).format('x')
        }
      }
    }
    return next(<protoDocument> { channel: setting.name, setting: protoSetting, proto, parse, payload, rtsp_key })
  }
}

export default new Proto()

function formatPayload (body: {}, request: Send.Request, alias?: Send.Alias): {} {
  let payload: {} = {}
  for (let key in request) {
    if (body[key]) {
      let value: any = body[key]
      if (request[key] === 'date') {
        value = new Date(value).getTime()
      }
      else if (request[key] === 'string') {
        value = uniq(formatArray(value, 'any')).join(',')
        if (alias && alias[key]) {
          let _alias: Send.AliasItem | undefined = alias[key].find( o => o.key === value )
          if (_alias) {
            value = _alias.value
          }
        }
        value = value.replace(/^(0)$/, '')
      }
      else if (request[key] === 'number') {
        value = Number(value)
      }
      payload[key] = value
    }
  }
  return payload
}