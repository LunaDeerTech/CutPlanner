import * as XLSX from 'xlsx'
import type { CuttingItem } from '@/models/types'

export interface ParseResult {
  success: boolean
  data?: CuttingItem[]
  error?: string
  warnings?: string[]
}

export interface ColumnMapping {
  length?: number
  width?: number  
  quantity?: number
  name?: number
  material?: number
  thickness?: number
}

/**
 * 解析Excel文件，提取切割项目数据
 * @param file Excel文件
 * @returns 解析结果
 */
export const parseExcelFile = async (file: File): Promise<ParseResult> => {
  try {
    // 读取文件内容
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    
    // 获取第一个工作表
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) {
      return {
        success: false,
        error: '文件中没有找到工作表'
      }
    }
    
    const worksheet = workbook.Sheets[sheetName]
    
    // 将工作表转换为JSON数据
    const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1, // 使用数组格式，第一行作为列索引
      defval: '' // 默认值为空字符串
    })
    
    if (rawData.length === 0) {
      return {
        success: false,
        error: '文件内容为空'
      }
    }
    
    // 查找标题行并解析数据
    const parseResult = parseExcelData(rawData)
    return parseResult
    
  } catch (error) {
    console.error('Excel文件解析失败:', error)
    return {
      success: false,
      error: `文件解析失败: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }
}

/**
 * 解析Excel数据
 * @param rawData 原始数据数组
 * @returns 解析结果
 */
const parseExcelData = (rawData: any[][]): ParseResult => {
  const warnings: string[] = []
  const items: CuttingItem[] = []
  
  // 查找标题行
  const headerRowIndex = findHeaderRow(rawData)
  if (headerRowIndex === -1) {
    return {
      success: false,
      error: '未找到有效的标题行。请确保Excel文件包含"长度"、"宽度"、"数量"等列标题。'
    }
  }
  
  const headers = rawData[headerRowIndex] as string[]
  const columnMapping = mapColumns(headers)
  
  // 验证必要列是否存在
  if (columnMapping['length'] === undefined || columnMapping['width'] === undefined || columnMapping['quantity'] === undefined) {
    const missingColumns = []
    if (columnMapping['length'] === undefined) missingColumns.push('长度')
    if (columnMapping['width'] === undefined) missingColumns.push('宽度') 
    if (columnMapping['quantity'] === undefined) missingColumns.push('数量')
    
    return {
      success: false,
      error: `缺少必要的列: ${missingColumns.join(', ')}。请检查Excel文件格式。`
    }
  }
  
  // 解析数据行
  for (let i = headerRowIndex + 1; i < rawData.length; i++) {
    const row = rawData[i]
    if (!row || row.length === 0) continue
    
    // 检查是否为空行
    const hasData = row.some(cell => cell !== '' && cell != null)
    if (!hasData) continue
    
    try {
      const item = parseRowData(row, columnMapping, i + 1)
      if (item) {
        items.push(item)
      }
    } catch (error) {
      warnings.push(`第 ${i + 1} 行数据解析失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }
  
  if (items.length === 0) {
    return {
      success: false,
      error: '没有解析到有效的切割项目数据',
      warnings
    }
  }
  
  return {
    success: true,
    data: items,
    ...(warnings.length > 0 && { warnings })
  }
}

/**
 * 查找标题行索引
 * @param data 原始数据
 * @returns 标题行索引，-1表示未找到
 */
const findHeaderRow = (data: any[][]): number => {
  const requiredHeaders = ['长度', '宽度', '数量']
  const alternativeHeaders = ['length', 'width', 'quantity', '长', '宽', '个数', '件数']
  
  for (let i = 0; i < Math.min(data.length, 10); i++) { // 只检查前10行
    const row = data[i]
    if (!row) continue
    
    const rowStr = row.map(cell => String(cell).toLowerCase().trim()).join('|')
    
    // 检查是否包含必要的标题
    const hasRequiredHeaders = requiredHeaders.some(header => 
      rowStr.includes(header.toLowerCase())
    ) || alternativeHeaders.some(header =>
      rowStr.includes(header.toLowerCase())
    )
    
    if (hasRequiredHeaders) {
      return i
    }
  }
  
  return -1
}

/**
 * 映射列索引
 * @param headers 标题行数据
 * @returns 列映射对象
 */
const mapColumns = (headers: string[]): ColumnMapping => {
  const mapping: ColumnMapping = {}
  
  headers.forEach((header, index) => {
    const headerStr = String(header).toLowerCase().trim()
    
    // 长度列
    if (headerStr.includes('长度') || headerStr.includes('length') || headerStr === '长') {
      mapping['length'] = index
    }
    // 宽度列  
    else if (headerStr.includes('宽度') || headerStr.includes('width') || headerStr === '宽') {
      mapping['width'] = index
    }
    // 数量列
    else if (headerStr.includes('数量') || headerStr.includes('quantity') || 
             headerStr.includes('个数') || headerStr.includes('件数')) {
      mapping['quantity'] = index
    }
    // 名称列
    else if (headerStr.includes('名称') || headerStr.includes('name') || 
             headerStr.includes('品名') || headerStr.includes('描述')) {
      mapping['name'] = index
    }
    // 材质列
    else if (headerStr.includes('材质') || headerStr.includes('material') || 
             headerStr.includes('材料')) {
      mapping['material'] = index
    }
    // 厚度列
    else if (headerStr.includes('厚度') || headerStr.includes('thickness')) {
      mapping['thickness'] = index
    }
  })
  
  return mapping
}

/**
 * 解析单行数据
 * @param row 行数据
 * @param columnMapping 列映射
 * @param rowNumber 行号（用于错误提示）
 * @returns 切割项目对象或null
 */
const parseRowData = (
  row: any[], 
  columnMapping: ColumnMapping, 
  rowNumber: number
): CuttingItem | null => {
  // 提取数据
  const lengthValue = row[columnMapping['length']!]
  const widthValue = row[columnMapping['width']!]  
  const quantityValue = row[columnMapping['quantity']!]
  const nameValue = columnMapping['name'] !== undefined ? row[columnMapping['name']!] : undefined
  const materialValue = columnMapping['material'] !== undefined ? row[columnMapping['material']!] : undefined
  const thicknessValue = columnMapping['thickness'] !== undefined ? row[columnMapping['thickness']!] : undefined
  
  // 验证必要字段
  if (lengthValue == null || lengthValue === '' || 
      widthValue == null || widthValue === '' ||
      quantityValue == null || quantityValue === '') {
    throw new Error('缺少必要字段值')
  }
  
  // 转换数值
  const length = parseNumber(lengthValue)
  const width = parseNumber(widthValue)
  const quantity = parseNumber(quantityValue)
  
  if (length <= 0 || width <= 0 || quantity <= 0) {
    throw new Error('数值必须大于0')
  }
  
  // 创建切割项目对象
  const item: CuttingItem = {
    id: `imported-${Date.now()}-${rowNumber}`,
    length,
    width,
    quantity: Math.floor(quantity), // 数量必须是整数
    name: nameValue ? String(nameValue).trim() : `项目${rowNumber}`,
  }
  
  return item
}

/**
 * 解析数值
 * @param value 原始值
 * @returns 数值
 */
const parseNumber = (value: any): number => {
  if (typeof value === 'number') {
    return value
  }
  
  if (typeof value === 'string') {
    // 移除非数字字符（保留小数点和负号）
    const cleanValue = value.replace(/[^\d.-]/g, '')
    const num = parseFloat(cleanValue)
    
    if (isNaN(num)) {
      throw new Error(`无法解析数值: ${value}`)
    }
    
    return num
  }
  
  throw new Error(`无效的数值类型: ${typeof value}`)
}

/**
 * 验证Excel文件格式
 * @param file 文件对象
 * @returns 是否为有效的Excel文件
 */
export const validateExcelFile = (file: File): { valid: boolean; error?: string } => {
  // 检查文件类型
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
  ]
  
  const validExtensions = ['.xlsx', '.xls']
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
  
  if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
    return {
      valid: false,
      error: '请上传 .xlsx 或 .xls 格式的Excel文件'
    }
  }
  
  // 检查文件大小（限制10MB）
  if (file.size > 10 * 1024 * 1024) {
    return {
      valid: false,
      error: '文件大小不能超过 10MB'
    }
  }
  
  return { valid: true }
}