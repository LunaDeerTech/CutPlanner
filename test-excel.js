import { generateCuttingListTemplate, generateEmptyTemplate, validateTemplateData } from '../src/services/excel/templateGenerator'

// 测试Excel模板生成功能
console.log('Testing Excel template generation...')

try {
  // 测试示例模板生成
  console.log('Generating sample template...')
  generateCuttingListTemplate()
  console.log('✓ Sample template generated successfully')
  
  // 测试空白模板生成
  console.log('Generating empty template...')
  generateEmptyTemplate()
  console.log('✓ Empty template generated successfully')
  
  // 测试数据验证
  const testData = [
    ['名称', '长度', '宽度', '数量'],
    ['测试板', '600', '400', '2'],
    ['', '800', '350', '1'], // 名称为空的测试
    ['测试板3', 'abc', '350', '1'], // 长度为非数字的测试
  ]
  
  const validation = validateTemplateData(testData)
  console.log('Validation result:', validation)
  console.log('✓ Data validation test completed')
  
} catch (error) {
  console.error('❌ Test failed:', error)
}