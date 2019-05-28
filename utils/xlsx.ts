import xlsx, { WorkBook, WritingOptions } from 'xlsx'
import { Execl } from '~/types'
import * as FileSaver from 'file-saver'

// 'xlsx' | 'xlsm' | 'xlsb' | 'biff8' | 'csv' | 'txt' | 'html'
 export const fileTypes: Execl.FileType[] = [
  { key: 'xlsx', name: 'Excel 工作簿(.xlsx)', suffix: '.xlsx' },
  { key: 'xlsm', name: 'Excel 宏工作簿(.xlsm)', suffix: '.xlsm' },
  { key: 'xlsb', name: 'Excel 二进制工作簿(.xlsb)', suffix: '.xlsb' },
  { key: 'biff8', name: 'Excel 97-2004 工作簿(.xls)', suffix: '.xls' },
  { key: 'csv', name: 'CVS UTF-8(.cvs)', suffix: '.csv' },
  { key: 'txt', name: 'UTF-16 Unicode 文本(.txt)', suffix: '.txt' },
  { key: 'html', name: 'HTML 文档(.html)', suffix: '.html' },
]

function s2ab (s: any): any {
  if (typeof ArrayBuffer !== 'undefined') {  
    let buf = new ArrayBuffer(s.length);  
    var view = new Uint8Array(buf);  
    for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;  
    return buf;  
  } else {  
      let buf = new Array(s.length);  
      for (var i = 0; i != s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF;  
      return buf;  
  }
}
// sheetName: string, headers: string[], data: Array<{}>
export const xlsxBlob = (options: Execl.Options): any => {
  let { header, data, sheetName, bookType, filename } = options
  sheetName = sheetName || 'mySheet'
  bookType = bookType || 'xlsx'
  let workbook: WorkBook = {
    SheetNames: [ sheetName ],
    Sheets: {
      [sheetName]: xlsx.utils.json_to_sheet(data, { header })
    },
    Props: {}
  }
  let wopts: xlsx.WritingOptions = { bookType, bookSST: false, type: 'binary' }
  let wbout: any = xlsx.write(workbook, wopts)
  let blob: Blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' })
  let fileType: Execl.FileType = fileTypes.find( o => o.key === bookType ) || fileTypes[0]
  filename = filename || 'export-file'
  FileSaver.saveAs(blob, `${filename}${fileType.suffix}`)
  //return blob
}