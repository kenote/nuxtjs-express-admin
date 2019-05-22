import xlsx, { WorkBook, WritingOptions } from 'xlsx'

const formatHeaders = (headers: string []): {} => {
  return headers
    // 为 headers 添加对应的单元格位置
    .map( (v, i) => Object.assign( {}, { v: v, position: String.fromCharCode(65+i) + 1 } ) )
    // 转换成 worksheet 需要的结构
    .reduce( (prev, next) => Object.assign( {}, prev, { [next.position]: { v: next.v } } ), {} )
}

const formatData = (data: Array<{}>, headers: string[]): {} => {
  return data
    // 匹配 headers 的位置，生成对应的单元格数据
    .map( (v, i) => headers.map( (k, j) => Object.assign( {}, { v: v[k], position: String.fromCharCode(65+j) + (i+2) } ) ) )
    // 对刚才的结果进行降维处理（二维数组变成一维数组）
    .reduce( (prev, next) => prev.concat(next) )
    // 转换成 worksheet 需要的结构
    .reduce( (prev, next) => Object.assign( {}, prev, { [next.position]: { v: next.v } } ), {} )
}

const getWorkbook = (sheetName: string, headers: {}, data: {}): WorkBook => {
  // 合并 headers 和 data
  let output: {} = Object.assign({}, headers, data)
  // 获取所有单元格的位置
  let outputPos: string[] = Object.keys(output)
  // 计算出范围
  var ref: string = outputPos[0] + ':' + outputPos[outputPos.length - 1]
  let workbook: WorkBook = {
    SheetNames: [ sheetName ],
    Sheets: {
      [sheetName]: Object.assign({}, output, { '!ref': ref })
    }
  }
  return workbook
}

function s2ab (wbout: any): ArrayBuffer {
  let buf: ArrayBuffer = new ArrayBuffer(wbout.length)
  let view: Uint8Array = new Uint8Array(buf)
  for (let i = 0; i != wbout.length; ++i) view[i] = wbout.charCodeAt(i) & 0xFF;
  return buf
}

export const xlsxBlob = (sheetName: string, headers: string[], data: Array<{}>): Blob => {
  let _headers: {} = formatHeaders(headers)
  let _data: {} = formatData(data, headers)
  let workbook: WorkBook = getWorkbook(sheetName, _headers, _data)
  let wopts: WritingOptions = { bookType:'xlsx', bookSST: false, type:'binary' }
  let wbout: any = xlsx.write(workbook, wopts)
  let blob: Blob = new Blob([s2ab(wbout)], { type: '' })
  return blob
}