// 创建测试Excel文件的脚本
import * as XLSX from 'xlsx'

// 创建测试数据
const testData = [
  ['名称', '长度', '宽度', '数量', '材质'],
  ['桌面板', 1200, 600, 1, '橡木'],
  ['抽屉面板', 400, 300, 3, '橡木'],
  ['侧板', 550, 400, 2, '橡木'],
  ['背板', 1150, 500, 1, '三合板'],
  ['隔板', 550, 350, 2, '橡木']
]

// 创建工作簿
const wb = XLSX.utils.book_new()

// 创建工作表
const ws = XLSX.utils.aoa_to_sheet(testData)

// 设置列宽
const colWidths = [
  { wch: 12 },  // 名称
  { wch: 8 },   // 长度
  { wch: 8 },   // 宽度  
  { wch: 8 },   // 数量
  { wch: 10 }   // 材质
]
ws['!cols'] = colWidths

// 添加工作表到工作簿
XLSX.utils.book_append_sheet(wb, ws, '切割清单')

// 写入文件
XLSX.writeFile(wb, 'public/test-template.xlsx')

console.log('测试Excel文件已创建：public/test-template.xlsx')