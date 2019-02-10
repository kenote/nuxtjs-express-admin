import * as path from 'path'
import * as fs from 'fs-extra'
import * as ini from 'ini'

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