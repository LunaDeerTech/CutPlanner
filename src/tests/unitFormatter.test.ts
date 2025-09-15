// 单位格式化功能测试
import { formatArea, formatLength, formatNumber, getAreaUnitText } from '@/utils/unitFormatter'

// 测试面积格式化功能
console.log('=== 面积格式化测试 ===')

// 测试毫米单位
console.log('毫米单位测试:')
console.log('5000 mm²:', formatArea(5000, { unit: 'mm', adaptiveUnit: true }))        // 应显示为 cm²
console.log('150000 mm²:', formatArea(150000, { unit: 'mm', adaptiveUnit: true }))    // 应显示为 cm²
console.log('2500000 mm²:', formatArea(2500000, { unit: 'mm', adaptiveUnit: true }))  // 应显示为 m²

console.log('\n英寸单位测试:')
console.log('50 in²:', formatArea(50, { unit: 'inch', adaptiveUnit: true }))          // 应显示为 in²
console.log('200 in²:', formatArea(200, { unit: 'inch', adaptiveUnit: true }))        // 应显示为 ft²

// 测试非自适应模式
console.log('\n非自适应模式测试:')
console.log('5000 mm² (固定单位):', formatArea(5000, { unit: 'mm', adaptiveUnit: false }))
console.log('200 in² (固定单位):', formatArea(200, { unit: 'inch', adaptiveUnit: false }))

// 测试长度格式化功能
console.log('\n=== 长度格式化测试 ===')
console.log('15 mm:', formatLength(15, { unit: 'mm', adaptiveUnit: true }))           // 应显示为 cm
console.log('1500 mm:', formatLength(1500, { unit: 'mm', adaptiveUnit: true }))      // 应显示为 m
console.log('15 inch:', formatLength(15, { unit: 'inch', adaptiveUnit: true }))      // 应显示为 ft

// 测试数字格式化
console.log('\n=== 数字格式化测试 ===')
console.log('1234567:', formatNumber(1234567, 0))                                     // 应添加千分位分隔符
console.log('1234.567:', formatNumber(1234.567, 2))                                   // 保留2位小数

// 测试单位文本获取
console.log('\n=== 单位文本测试 ===')
console.log('5000 mm² 单位文本:', getAreaUnitText('mm', 5000, true))                   // 应返回 'cm²'
console.log('2500000 mm² 单位文本:', getAreaUnitText('mm', 2500000, true))             // 应返回 'm²'
console.log('200 in² 单位文本:', getAreaUnitText('inch', 200, true))                  // 应返回 'ft²'

export default {
  formatArea,
  formatLength,
  formatNumber,
  getAreaUnitText
}