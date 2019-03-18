import * as path from 'path'
import * as fs from 'fs-extra'
import * as ini from 'ini'
import * as crypto from 'crypto'
import account from '../types/account' 
import { FlagTag } from '../types/resuful'
import channel from '../types/channel'
import { toInteger, isNaN } from 'lodash'
import { PageInfo } from '../types/resuful'

export const md5 = (text: string): string => crypto.createHash('md5').update(text).digest('hex')

export const sha1 = (text: string): string => crypto.createHash('sha1').update(text).digest('hex')

class Bcrypt {

  public hash (value: string, salt?: string): account.Password {
    salt = salt || Math.random().toString(36).substr(8)
    let password: account.Password = { salt, hash: sha1(`${md5(value)}^${salt}`) }
    return password
  }

  public compare (value: string, hash: string, salt: string): boolean {
    let password: account.Password = this.hash(value, salt)
    return password.hash === hash
  }
}

export const bcrypt: Bcrypt = new Bcrypt()

export const loadDataFile = (file: string): {} => {
  let filePath: string = path.resolve(process.cwd(), file)
  let data: {} = {}
  let isExists: boolean = fs.existsSync(filePath)
  if (!isExists) return data
  let fileStr: string = fs.readFileSync(filePath, 'utf-8')
  try {
    data = JSON.parse(fileStr)
  } catch (error) {
    data = ini.parse(fileStr)
  }
  return data
}

export const loadData = (file: string, type: 'object' | 'array' = 'object'): {} => {
  let filePath: string = path.resolve(process.cwd(), file)
  let data: Array<{}> | {} = type === 'array' ? [] : {}
  let isExists: boolean = fs.existsSync(filePath)
  if (!isExists) return data
  let fileStat: fs.Stats = fs.statSync(filePath)
  if (fileStat.isFile()) return loadDataFile(file)
  if (fileStat.isDirectory()) {
    let files: string[] = fs.readdirSync(filePath)
    for (let item of files) {
      let itemData: {} = loadData(path.resolve(filePath, item))
      if (type === 'array') {
        (<Array<{}>>data).push(itemData)
      }
      else {
        data = { ...data, ...itemData }
      }
    }
  }
  return data
}

export const isFlag = (level: number, key: string, tag: FlagTag = 'access'): boolean => {
  let __flags: channel.Flags = loadData('data/flags')
  if (__flags[key] && __flags[key][tag]) {
    let __level: number = Number(__flags[key][tag])
    return level >= __level
  }
  return true
}

export const toPageInfo = (page: number, size: number = 10): PageInfo => {
  let parseVal: number = toInteger(page || 1)
  let val: number = parseVal === NaN ? 1 : parseVal
  let pageCode: number = isNaN(val) || val < 1 ? 1 : parseVal
  let skipVal: number = (pageCode - 1) * size
  return { page: pageCode, limit: size, skip: skipVal }
}