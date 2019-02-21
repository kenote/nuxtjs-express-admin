import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'
import { HeaderOptions, Method } from '~/server/types/resuful'
export { resufulInfo } from '~/server/types/resuful'

class HttpClient {

  public __APIEntrance: string = '/api/v1'
  private __UploadEntrance: string = '/upload'
  private __UploadfileEntrance: string = '/uploadfile'

  private async sendData (method: Method, url: string, data: any, opts?: HeaderOptions): Promise<any> {
    let __APIEntrance: string = this.__APIEntrance
    let __UploadEntrance: string = this.__UploadEntrance
    let __UploadfileEntrance: string = this.__UploadfileEntrance
    if (opts && opts.entry) {
      __APIEntrance = opts.entry
    }
    let options: AxiosRequestConfig = {
      method: method,
      url: getUrl(url, __APIEntrance),
      headers: getHeaders({ ...opts })
    }
    if (method === 'get') {
      options.params = data
    }
    else {
      options.data = data
    }
    if (opts && opts.upload) {
      options.method = 'post'
      options.url = getUrl(url, this.__UploadEntrance)
      options.headers['Content-Type'] = 'multipart/form-data'
      options.transformRequest = [
        function (data: any, headers: any): any {
          return data
        }
      ]
      options.onUploadProgress = function (progressEvent: any): void {
        let percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total) || 0
        if (percentage <= 100) {
          opts.upload && opts.upload(percentage)
        }
      }
    }
    if (opts && opts.download) {
      options.method = 'get'
      options.url = getUrl(url, this.__UploadfileEntrance)
      options.responseType = 'blob'
      options.onDownloadProgress = function (progressEvent: any): void {
        let percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total) || 0
        if (percentage <= 100) {
          opts.download && opts.download(percentage)
        }
      }
    }
    return await getResponseData(options)
  }

  public async get (url: string, data: any, opts?: HeaderOptions): Promise<any> {
    return await this.sendData('get', url, data, opts)
  }

  public async post (url: string, data: any, opts?: HeaderOptions): Promise<any> {
    return await this.sendData('post', url, data, opts)
  }

  public async put (url: string, data: any, opts?: HeaderOptions): Promise<any> {
    return await this.sendData('put', url, data, opts)
  }

  public async delete (url: string, data: any, opts?: HeaderOptions): Promise<any> {
    return await this.sendData('delete', url, data, opts)
  }

  public async upload (url: string, data: any, opts?: HeaderOptions): Promise<any> {
    return await this.post(url, data, { upload: (percentage: number) => {}, ...opts })
  }

  public async download (url: string, data: any, opts?: HeaderOptions): Promise<any> {
    let fileName: string = url.substring(url.lastIndexOf('/') + 1)
    let fileBlob: Blob = await this.get(url, data, { download: (percentage: number) => {}, ...opts })
    downloadBolb(fileBlob, fileName)
  }

}

export default new HttpClient()

function downloadBolb (fileBlob: Blob, fileName: string): void {
  let link: HTMLAnchorElement = document.createElement('a')
  link.href = window.URL.createObjectURL(fileBlob)
  link.download = fileName
  link.click()
}

async function getResponseData (options: any): Promise<any> {
  try {
    let response: AxiosResponse<any> = await axios(options)
    if (response.status >=200 && response.status < 300) {
      return response.data || {}
    }
    throw new Error(response.statusText)
  } catch (error) {
    throw error
  }
}

function getHeaders (options: HeaderOptions): {} {
  let headers: {} = options.header || {}
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`
  }
  return headers
}

export function getUrl (url: string, prefix?: string): string {
  if (/^(http|https|\/\/)/.test(url) || !prefix) {
    return url
  }
  return prefix.replace(/(\/)$/, '') + '/' + url.replace(/^(\/)/, '')
}