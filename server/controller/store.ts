import { Request, Response, NextFunction } from 'express'
import { Router, RouterMethods, Filter } from 'kenote-express-helper'
import { IResponse, DownloadStore, FileStores } from '../types/resuful'
import { StoreItem, ProxyResult, paeseStore } from 'kenote-store-helper'
import Upload, { Download } from '../utils/store'
import config from '../config'
import { __ErrorCode } from '../error'
import * as path from 'path'
import { loadData } from '../utils'
import * as passport from 'passport'

export default class Store extends RouterMethods {

  @Router({ method: 'post', path: '/upload/:type' })
  @Filter( passport.authenticate('jwt', { session: false }) )
  public async upload (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type } = req.params
    let fileStore: FileStores = loadData('data/stores')
    paeseStore(fileStore, config.store_root)
    if (!type || Object.keys(fileStore).indexOf((<string>type).toLowerCase()) === -1) {
      return res.notfound()
    }
    let store: StoreItem = fileStore[type]
    try {
      let result: ProxyResult[] = await new Upload({ request: req, store }).asyncSave()
      if (result.length === 0) {
        return res.api(null, __ErrorCode.ERROR_UPLOAD_NOT_FILE)
      }
      return res.api(result)
    } catch (error) {
      return res.api(null, error)
    }
  }

  @Router({ method: 'get', path: '/uploadfile/:type/:filename' })
  public async download (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type, filename } = req.params
    let fileStore: FileStores = loadData('data/stores')
    paeseStore(fileStore, config.store_root)
    if (Object.keys(fileStore).indexOf((<string>type).toLowerCase()) === -1 || !filename) {
      return res.notfound()
    }
    let { sub_dir } = req.query
    let store: StoreItem = fileStore[type]
    if (store.type === 'local') {
      let rootDir: string = path.resolve(store.root_dir || process.cwd(), sub_dir)
      try {
        let download: DownloadStore | number = <DownloadStore> await Download(filename, rootDir)
        res.setHeader('Content-Type', <string> download.mimeType)
        return res.send(download.fileStream)
      } catch (error) {
        return res.notfound()
      }
    }
    return res.notfound()
  }
}