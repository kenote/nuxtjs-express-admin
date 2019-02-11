
export interface TableStyle {
  borderStyle: number
  paddingBottom: number
  headerAlign: 'left' | 'center' | 'right'
  align: 'left' | 'center' | 'right'
  color: string
  truncate: string
}

export interface TableHeader {
  value: string
  width: number
  align?: 'left' | 'center' | 'right'
}