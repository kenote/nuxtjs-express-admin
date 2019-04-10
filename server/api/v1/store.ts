import { Request, Response, NextFunction } from 'express'
import { Router, RouterMethods, Filter } from 'kenote-express-helper'
import { IResponse, FileStores } from '../../types/resuful'
import { StoreItem, ProxyResult, paeseStore } from 'kenote-store-helper'
import Upload, { formatResult } from '../../utils/store'
import config from '../../config'
import { __ErrorCode } from '../../error'
import { loadData } from '../../utils'
import * as passport from 'passport'
import storeFilter from '../../filters/api_v1/store'

export default class Store extends RouterMethods {

  @Router({ method: 'post', path: '/upload/:type' })
  @Filter( passport.authenticate('jwt', { session: false }), storeFilter.upload )
  public async upload (store: StoreItem, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type } = req.params
    try {
      let result: ProxyResult[] = await new Upload({ request: req, store }).asyncSave()
      if (result.length === 0) {
        return res.api(null, __ErrorCode.ERROR_UPLOAD_NOT_FILE)
      }
      return res.api(formatResult(result, type, store.type === 'local' && res.hasHeader('server')))
    } catch (error) {
      return res.api(null, error)
    }
  }
}