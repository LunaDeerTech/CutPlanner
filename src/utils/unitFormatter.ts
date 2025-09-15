/**
 * 单位格式化工具
 * 提供自适应单位显示和友好的数值格式化功能
 */

export interface FormatOptions {
  unit: 'mm' | 'inch'
  precision?: number
  adaptiveUnit?: boolean
}

/**
 * 格式化面积数值，自动选择合适的单位
 * @param area - 面积值（基础单位为mm²或inch²）
 * @param options - 格式化选项
 * @returns 格式化后的面积字符串（包含单位）
 */
export function formatArea(area: number, options: FormatOptions): string {
  const { unit, precision = 0, adaptiveUnit = true } = options
  
  if (!adaptiveUnit) {
    return `${area.toFixed(precision)}${unit}²`
  }
  
  if (unit === 'mm') {
    return formatAreaMM(area, precision)
  } else {
    return formatAreaInch(area, precision)
  }
}

/**
 * 格式化毫米单位的面积
 */
function formatAreaMM(area: number, precision: number): string {
  if (area >= 1000000) {
    // 大于1平方米，显示为m²
    const areaInM2 = area / 1000000
    return `${areaInM2.toFixed(precision + 2)}m²`
  } else if (area >= 10000) {
    // 大于100cm²，显示为cm²
    const areaInCM2 = area / 100
    return `${areaInCM2.toFixed(precision)}cm²`
  } else {
    // 显示为mm²
    return `${area.toFixed(precision)}mm²`
  }
}

/**
 * 格式化英寸单位的面积
 */
function formatAreaInch(area: number, precision: number): string {
  if (area >= 144) {
    // 大于1平方英尺，显示为ft²
    const areaInFt2 = area / 144
    return `${areaInFt2.toFixed(precision + 2)}ft²`
  } else {
    // 显示为in²
    return `${area.toFixed(precision)}in²`
  }
}

/**
 * 格式化长度数值，自动选择合适的单位
 * @param length - 长度值（基础单位为mm或inch）
 * @param options - 格式化选项
 * @returns 格式化后的长度字符串（包含单位）
 */
export function formatLength(length: number, options: FormatOptions): string {
  const { unit, precision = 1, adaptiveUnit = true } = options
  
  if (!adaptiveUnit) {
    return `${length.toFixed(precision)}${unit}`
  }
  
  if (unit === 'mm') {
    return formatLengthMM(length, precision)
  } else {
    return formatLengthInch(length, precision)
  }
}

/**
 * 格式化毫米单位的长度
 */
function formatLengthMM(length: number, precision: number): string {
  if (length >= 1000) {
    // 大于1米，显示为m
    const lengthInM = length / 1000
    return `${lengthInM.toFixed(precision + 2)}m`
  } else if (length >= 10) {
    // 大于1厘米，显示为cm
    const lengthInCM = length / 10
    return `${lengthInCM.toFixed(precision)}cm`
  } else {
    // 显示为mm
    return `${length.toFixed(precision)}mm`
  }
}

/**
 * 格式化英寸单位的长度
 */
function formatLengthInch(length: number, precision: number): string {
  if (length >= 12) {
    // 大于1英尺，显示为ft
    const lengthInFt = length / 12
    return `${lengthInFt.toFixed(precision + 2)}ft`
  } else {
    // 显示为in
    return `${length.toFixed(precision)}in`
  }
}

/**
 * 格式化数值，添加千分位分隔符
 * @param value - 数值
 * @param precision - 小数位数
 * @returns 格式化后的数值字符串
 */
export function formatNumber(value: number, precision: number = 0): string {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  })
}

/**
 * 获取面积单位的显示文本
 * @param unit - 基础单位
 * @param area - 面积值
 * @param adaptiveUnit - 是否使用自适应单位
 * @returns 单位文本
 */
export function getAreaUnitText(unit: 'mm' | 'inch', area: number, adaptiveUnit: boolean = true): string {
  if (!adaptiveUnit) {
    return `${unit}²`
  }
  
  if (unit === 'mm') {
    if (area >= 1000000) return 'm²'
    if (area >= 10000) return 'cm²'
    return 'mm²'
  } else {
    if (area >= 144) return 'ft²'
    return 'in²'
  }
}