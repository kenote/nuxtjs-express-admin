import * as path from 'path'
import * as fs from 'fs-extra'
import mime from 'mime-types'
import { Upload, UploadSetting, ProxyResult, parseResult, LocalProxy } from 'kenote-store-helper'
import { __ErrorCode, ErrorInfo } from '../error'
import { errorInfo, IError } from 'kenote-express-helper'
import config from '../config'
import { DownloadStore } from '../types/resuful'

export async function Download (filename: string, root_dir: string): Promise<DownloadStore | number> {
  let rootDir: string = root_dir || path.resolve(process.cwd(), config.store_root)
  let filePath: string = path.resolve(rootDir, filename)
  return new Promise((resolve: (value?: any) => void, reject: (reason?: any) => void): void => {
    if (fs.existsSync(filePath)) {
      let fileStream: Buffer = fs.readFileSync(filePath)
      let mimeType: string | false = mime.lookup(filePath)
      resolve({ filePath, fileStream, mimeType })
    }
    else {
      reject(404)
    }
  })
}

@UploadSetting(
  {
    mimetype : __ErrorCode.ERROR_UPLOAD_FILE_MIMETYPE,
    limit    : __ErrorCode.ERROR_UPLOAD_FILESIZE_LARGEMAX
  },
  {
    local: LocalProxy
  }
)
export default class  extends Upload {

  public async asyncSave (): Promise<any> {
    return new Promise((resolve: (value?: any) => void, reject: (reason?: any) => void): void => {
      this.save((err: number, doc: Array<string | ProxyResult>): any => {
        if (err) {
          let error: errorInfo | IError = ErrorInfo(err, doc, true)
          reject(error)
        }
        else {
          let data: ProxyResult[] = parseResult(<ProxyResult[]>doc, this.__Store, `${config.site_url}/${config.store_root}`)
          resolve(data)
        }
      })
    })
  }
}