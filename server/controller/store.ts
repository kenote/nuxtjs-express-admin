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

  @Router(
    { method: 'get', path: '/uploadfile/:type/:filename' },
    { method: 'get', path: '/uploadfile/:type/:sub_dir([0-9a-zA-Z\/\-\_]+)/:filename' },
  )
  public async download (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type, filename } = req.params
    let fileStore: FileStores = loadData('data/stores')
    paeseStore(fileStore, config.store_root)
    if (Object.keys(fileStore).indexOf((<string>type).toLowerCase()) === -1 || !filename) {
      return res.notfound()
    }
    let sub_dir: string = req.params.sub_dir || req.query.sub_dir
    let store: StoreItem = fileStore[type]
    if (store.type === 'local') {
      let rootDir: string = path.resolve(store.root_dir || process.cwd(), sub_dir || '')
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