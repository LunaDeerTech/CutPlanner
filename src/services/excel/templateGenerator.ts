import * as XLSX from 'xlsx';

export interface CuttingItemTemplate {
  名称: string;
  长度: string;
  宽度: string;
  数量: string;
}

/**
 * 生成切割清单Excel模板
 * 包含列头和示例数据
 */
export function generateCuttingListTemplate(): void {
  // 创建工作簿
  const workbook = XLSX.utils.book_new();
  
  // 定义列头
  const headers = ['名称', '长度', '宽度', '数量'];
  
  // 创建示例数据
  const sampleData: CuttingItemTemplate[] = [
    {
      名称: '柜门板',
      长度: '600',
      宽度: '400',
      数量: '2'
    },
    {
      名称: '侧板',
      长度: '800',
      宽度: '350',
      数量: '2'
    },
    {
      名称: '顶板',
      长度: '580',
      宽度: '350',
      数量: '1'
    },
    {
      名称: '底板',
      长度: '580',
      宽度: '350',
      数量: '1'
    },
    {
      名称: '背板',
      长度: '600',
      宽度: '800',
      数量: '1'
    }
  ];
  
  // 准备工作表数据
  const worksheetData = [
    headers,
    ...sampleData.map(item => [
      item.名称,
      item.长度,
      item.宽度,
      item.数量
    ])
  ];
  
  // 创建工作表
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // 设置列宽
  const columnWidths = [
    { wch: 15 }, // 名称列
    { wch: 10 }, // 长度列
    { wch: 10 }, // 宽度列
    { wch: 8 }   // 数量列
  ];
  worksheet['!cols'] = columnWidths;
  
  // 设置单元格样式（标题行加粗）
  const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:D1');
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) continue;
    
    worksheet[cellAddress].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: 'E6F3FF' } },
      alignment: { horizontal: 'center' }
    };
  }
  
  // 添加工作表到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, '切割清单');
  
  // 生成Excel文件并触发下载
  const fileName = `切割清单模板_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * 创建空白模板（只有列头）
 */
export function generateEmptyTemplate(): void {
  const workbook = XLSX.utils.book_new();
  const headers = ['名称', '长度', '宽度', '数量'];
  
  // 添加一些空行供用户填写
  const emptyRows = Array(10).fill(null).map(() => ['', '', '', '']);
  const worksheetData = [headers, ...emptyRows];
  
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // 设置列宽
  worksheet['!cols'] = [
    { wch: 15 },
    { wch: 10 },
    { wch: 10 },
    { wch: 8 }
  ];
  
  // 设置标题行样式
  const headerCells = ['A1', 'B1', 'C1', 'D1'];
  headerCells.forEach(cell => {
    if (worksheet[cell]) {
      worksheet[cell].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'E6F3FF' } },
        alignment: { horizontal: 'center' }
      };
    }
  });
  
  XLSX.utils.book_append_sheet(workbook, worksheet, '切割清单');
  
  const fileName = `空白切割清单_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * 验证模板数据格式
 */
export function validateTemplateData(data: any[][]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!data || data.length === 0) {
    errors.push('模板数据为空');
    return { isValid: false, errors };
  }
  
  // 检查列头
  const headers = data[0];
  const expectedHeaders = ['名称', '长度', '宽度', '数量'];
  
  expectedHeaders.forEach((header, index) => {
    if (headers[index] !== header) {
      errors.push(`第${index + 1}列应为"${header}"，但找到"${headers[index]}"`);
    }
  });
  
  // 检查数据行
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length < 4) continue;
    
    const [name, length, width, quantity] = row;
    
    // 检查必填字段
    if (!name || name.toString().trim() === '') {
      errors.push(`第${i + 1}行：名称不能为空`);
    }
    
    // 检查数值字段
    if (length && isNaN(Number(length))) {
      errors.push(`第${i + 1}行：长度必须是有效数字`);
    }
    
    if (width && isNaN(Number(width))) {
      errors.push(`第${i + 1}行：宽度必须是有效数字`);
    }
    
    if (quantity && isNaN(Number(quantity))) {
      errors.push(`第${i + 1}行：数量必须是有效数字`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}