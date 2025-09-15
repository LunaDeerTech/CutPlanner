// Validation utilities for input forms

/**
 * 验证数值是否为正数
 * @param value - 要验证的值
 * @param allowZero - 是否允许为0，默认false
 * @returns 验证结果和错误信息
 */
export const validatePositiveNumber = (value: any, allowZero = false) => {
  const num = Number(value)
  
  if (isNaN(num)) {
    return { isValid: false, error: '请输入有效的数字' }
  }
  
  if (!allowZero && num <= 0) {
    return { isValid: false, error: '数值必须大于0' }
  }
  
  if (allowZero && num < 0) {
    return { isValid: false, error: '数值不能为负数' }
  }
  
  return { isValid: true, error: null }
}

/**
 * 验证材料尺寸是否在合理范围内
 * @param value - 尺寸值
 * @param unit - 单位
 * @param maxSize - 最大尺寸限制
 * @returns 验证结果和错误信息
 */
export const validateDimension = (value: any, unit: 'mm' | 'inch', maxSize?: number) => {
  const basicValidation = validatePositiveNumber(value)
  if (!basicValidation.isValid) {
    return basicValidation
  }
  
  const num = Number(value)
  const maxLimit = maxSize || (unit === 'mm' ? 10000 : 400) // mm: 10m, inch: 400inch
  
  if (num > maxLimit) {
    return { 
      isValid: false, 
      error: `尺寸不能超过 ${maxLimit}${unit}` 
    }
  }
  
  return { isValid: true, error: null }
}

/**
 * 验证厚度是否合理
 * @param value - 厚度值
 * @param unit - 单位
 * @returns 验证结果和错误信息
 */
export const validateThickness = (value: any, unit: 'mm' | 'inch') => {
  const basicValidation = validatePositiveNumber(value)
  if (!basicValidation.isValid) {
    return basicValidation
  }
  
  const num = Number(value)
  const maxThickness = unit === 'mm' ? 200 : 8 // mm: 200mm, inch: 8inch
  const minThickness = unit === 'mm' ? 1 : 0.04 // mm: 1mm, inch: 0.04inch
  
  if (num > maxThickness) {
    return { 
      isValid: false, 
      error: `厚度不能超过 ${maxThickness}${unit}` 
    }
  }
  
  if (num < minThickness) {
    return { 
      isValid: false, 
      error: `厚度不能小于 ${minThickness}${unit}` 
    }
  }
  
  return { isValid: true, error: null }
}

/**
 * 验证字符串是否非空
 * @param value - 要验证的字符串
 * @param fieldName - 字段名称
 * @returns 验证结果和错误信息
 */
export const validateRequired = (value: string, fieldName = '此字段') => {
  const trimmedValue = (value || '').trim()
  if (!trimmedValue) {
    return { isValid: false, error: `${fieldName}不能为空` }
  }
  return { isValid: true, error: null }
}

/**
 * 格式化数字输入，移除非数字字符
 * @param value - 输入值
 * @param allowDecimal - 是否允许小数
 * @returns 格式化后的字符串
 */
export const formatNumberInput = (value: string, allowDecimal = true) => {
  if (!value) return ''
  
  // 只保留数字和小数点
  let formatted = value.replace(/[^\d.]/g, '')
  
  if (!allowDecimal) {
    formatted = formatted.replace(/\./g, '')
  } else {
    // 确保只有一个小数点
    const parts = formatted.split('.')
    if (parts.length > 2) {
      formatted = parts[0] + '.' + parts.slice(1).join('')
    }
  }
  
  return formatted
}