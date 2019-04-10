import { Response, NextFunction } from 'express'
import { IRequest, IResponse, FileStores } from '../../types/resuful'
import { StoreItem, paeseStore } from 'kenote-store-helper'
import { loadData } from '../../utils'
import config from '../../config'
import { responseDocument as responseUserDocument } from '../../types/proxys/user'
import { __ErrorCode } from '../../error'

class Store {

  public async upload (req: IRequest, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type } = req.params
    let fileStore: FileStores = loadData('data/stores')
    paeseStore(fileStore, config.store_root)
    if (!type || Object.keys(fileStore).indexOf((<string>type).toLowerCase()) === -1) {
      return res.notfound()
    }
    let store: StoreItem = fileStore[type]
    let auth: responseUserDocument = req.user
    if (auth.group.level < 9000) {
      let { upload_type } = auth.group.store
      if (upload_type.indexOf(type.toLowerCase()) === -1) {
        return res.api(null, __ErrorCode.ERROR_UPLOAD_TYPE_FLAG, [store.name || ''])
      }
    }
    if (store.user_dir) {
      req.query['dir'] = `${store.user_dir}/${auth.username}`
    }
    
    return next(store)
  }
}

export default new Store()