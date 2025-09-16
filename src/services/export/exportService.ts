/**
 * 导出服务 - 处理PNG和报告导出功能
 */
import * as XLSX from 'xlsx'
import type { CuttingResult, Material, CuttingItem } from '@/models/types'
import { formatLength, formatArea, formatNumber } from '@/utils/unitFormatter'

// 创建格式化器对象，默认使用毫米单位
const formatters = {
  length: (value: number) => formatLength(value, { unit: 'mm' }),
  area: (value: number) => formatArea(value, { unit: 'mm' }),
  thickness: (value: number) => formatLength(value, { unit: 'mm' }),
  number: formatNumber
}

/**
 * 将SVG转换为PNG并下载
 * @param svgElement SVG DOM元素
 * @param filename 文件名
 */
export async function exportSVGToPNG(svgElement: SVGElement, filename: string = 'cutting-plan'): Promise<void> {
  try {
    // 获取SVG的尺寸
    const svgRect = svgElement.getBoundingClientRect()
    let svgData = new XMLSerializer().serializeToString(svgElement)
    
    // 添加xmlns属性确保SVG可以独立渲染
    if (!svgData.includes('xmlns="http://www.w3.org/2000/svg"')) {
      svgData = svgData.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
    }
    
    // 创建Canvas元素
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('无法创建Canvas上下文')
    }
    
    // 设置Canvas尺寸，增加一些边距，同时确保最小尺寸
    const padding = 40
    const minWidth = 800
    const minHeight = 600
    canvas.width = Math.max(svgRect.width + padding * 2, minWidth)
    canvas.height = Math.max(svgRect.height + padding * 2, minHeight)
    
    // 设置白色背景
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // 创建Image对象来加载SVG
    const img = new Image()
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          // 计算居中位置
          const x = (canvas.width - svgRect.width) / 2
          const y = (canvas.height - svgRect.height) / 2
          
          // 绘制SVG到Canvas，居中显示
          ctx.drawImage(img, x, y, svgRect.width, svgRect.height)
          
          // 转换为PNG并下载
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('无法生成PNG图片'))
              return
            }
            
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${filename}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
            resolve()
          }, 'image/png', 0.95)
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = () => {
        reject(new Error('SVG图像加载失败'))
      }
      
      // 将SVG数据编码为data URI
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)
      img.src = svgUrl
      
      // 清理URL对象（延迟执行以确保图像能正常加载）
      setTimeout(() => {
        URL.revokeObjectURL(svgUrl)
      }, 1000)
    })
  } catch (error) {
    console.error('导出PNG时发生错误:', error)
    throw error
  }
}

/**
 * 导出多个切割方案的PNG图片
 * @param containerId 包含所有切割方案的容器ID
 * @param filename 文件名前缀
 */
export async function exportAllCuttingPlansToPNG(containerId: string, filename: string = 'cutting-plans'): Promise<void> {
  try {
    // 尝试通过多种方式查找容器
    let container = document.getElementById(containerId)
    if (!container) {
      container = document.querySelector(`[data-container="${containerId}"]`)
    }
    if (!container) {
      container = document.querySelector('.cutting-results-container')
    }
    if (!container) {
      // 最后一次尝试：查找包含SVG的任何容器
      const svgs = document.querySelectorAll('svg')
      if (svgs.length > 0) {
        container = svgs[0].closest('div')
      }
    }
    
    if (!container) {
      throw new Error('找不到切割方案容器，请确保已生成切割方案')
    }
    
    const svgElements = container.querySelectorAll('svg')
    if (svgElements.length === 0) {
      throw new Error('没有找到切割方案图表，请确保已生成切割方案并包含图形')
    }
    
    console.log(`找到 ${svgElements.length} 个切割方案图表，开始导出...`)
    
    // 如果只有一个SVG，直接导出
    if (svgElements.length === 1) {
      await exportSVGToPNG(svgElements[0] as SVGElement, filename)
      console.log('单个切割方案导出完成')
      return
    }
    
    // 多个SVG，分别导出
    for (let i = 0; i < svgElements.length; i++) {
      const svgElement = svgElements[i] as SVGElement
      const currentFilename = `${filename}-料板${i + 1}`
      console.log(`导出第 ${i + 1} 个切割方案...`)
      await exportSVGToPNG(svgElement, currentFilename)
      // 添加小延迟，避免浏览器阻塞
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    console.log('所有切割方案导出完成')
  } catch (error) {
    console.error('批量导出PNG时发生错误:', error)
    throw error
  }
}

/**
 * 生成切割报告Excel文件
 * @param cuttingResults 切割结果
 * @param materials 材料列表
 * @param items 切割项目列表
 */
export function generateCuttingReport(
  cuttingResults: CuttingResult[],
  materials: Material[],
  items: CuttingItem[]
): void {
  try {
    const workbook = XLSX.utils.book_new()
    
    // 1. 汇总信息工作表
    const summaryData = generateSummarySheet(cuttingResults, materials, items)
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, '汇总信息')
    
    // 2. 材料使用清单工作表
    const materialUsageData = generateMaterialUsageSheet(cuttingResults, materials)
    const materialUsageSheet = XLSX.utils.aoa_to_sheet(materialUsageData)
    XLSX.utils.book_append_sheet(workbook, materialUsageSheet, '材料使用清单')
    
    // 3. 详细切割清单工作表
    const cuttingListData = generateDetailedCuttingListSheet(cuttingResults, materials, items)
    const cuttingListSheet = XLSX.utils.aoa_to_sheet(cuttingListData)
    XLSX.utils.book_append_sheet(workbook, cuttingListSheet, '详细切割清单')
    
    // 4. 废料统计工作表
    const wasteData = generateWasteAnalysisSheet(cuttingResults, materials)
    const wasteSheet = XLSX.utils.aoa_to_sheet(wasteData)
    XLSX.utils.book_append_sheet(workbook, wasteSheet, '废料分析')
    
    // 生成文件名
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const filename = `切割方案报告_${timestamp}.xlsx`
    
    // 下载文件
    XLSX.writeFile(workbook, filename)
  } catch (error) {
    console.error('生成切割报告时发生错误:', error)
    throw error
  }
}

/**
 * 生成汇总信息工作表数据
 */
function generateSummarySheet(cuttingResults: CuttingResult[], _materials: Material[], items: CuttingItem[]): any[][] {
  const totalMaterialsUsed = cuttingResults.length
  const totalCuts = cuttingResults.reduce((sum, result) => sum + result.cuts.length, 0)
  const totalWastePercentage = cuttingResults.reduce((sum, result) => sum + result.wastePercentage, 0) / cuttingResults.length
  const totalUtilizationRate = 100 - totalWastePercentage
  
  const data = [
    ['切割方案汇总报告'],
    ['生成时间', new Date().toLocaleString('zh-CN')],
    [''],
    ['项目统计'],
    ['使用料板数量', totalMaterialsUsed, '张'],
    ['总切割件数', totalCuts, '件'],
    ['平均利用率', `${totalUtilizationRate.toFixed(2)}%`],
    ['平均损耗率', `${totalWastePercentage.toFixed(2)}%`],
    [''],
    ['目标件统计'],
    ['项目名称', '规格(长×宽)', '需求数量', '已安排数量'],
  ]
  
  // 添加目标件统计
  items.forEach(item => {
    const scheduledCount = cuttingResults.reduce((sum, result) => {
      return sum + result.cuts.filter(cut => cut.itemId === item.id).length
    }, 0)
    
    data.push([
      item.name || '未命名项目',
      `${formatters.length(item.length)} × ${formatters.length(item.width)}`,
      item.quantity,
      scheduledCount
    ])
  })
  
  return data
}

/**
 * 生成材料使用清单工作表数据
 */
function generateMaterialUsageSheet(cuttingResults: CuttingResult[], materials: Material[]): any[][] {
  const data = [
    ['材料使用清单'],
    ['料板编号', '规格(宽×高×厚)', '材质', '使用数量', '利用率', '损耗率'],
  ]
  
  // 统计每种材料的使用情况
  const materialUsage = new Map<string, { material: Material, count: number, totalUtilization: number }>()
  
  cuttingResults.forEach(result => {
    const material = materials.find(m => m.id === result.materialId)
    if (material) {
      const key = `${material.width}-${material.height}-${material.thickness}-${material.materialType || 'default'}`
      const existing = materialUsage.get(key)
      const utilization = 100 - result.wastePercentage
      
      if (existing) {
        existing.count++
        existing.totalUtilization += utilization
      } else {
        materialUsage.set(key, {
          material,
          count: 1,
          totalUtilization: utilization
        })
      }
    }
  })
  
  let index = 1
  materialUsage.forEach(({ material, count, totalUtilization }) => {
    const avgUtilization = totalUtilization / count
    const avgWaste = 100 - avgUtilization
    
    data.push([
      `料板${index}`,
      `${formatters.length(material.width)} × ${formatters.length(material.height)} × ${formatters.thickness(material.thickness)}`,
      material.materialType || '未指定',
      `${count}张`,
      `${avgUtilization.toFixed(2)}%`,
      `${avgWaste.toFixed(2)}%`
    ])
    index++
  })
  
  return data
}

/**
 * 生成详细切割清单工作表数据
 */
function generateDetailedCuttingListSheet(cuttingResults: CuttingResult[], _materials: Material[], items: CuttingItem[]): any[][] {
  const data = [
    ['详细切割清单'],
    ['料板编号', '件名称', '规格(长×宽)', '位置(X,Y)', '数量'],
  ]
  
  cuttingResults.forEach((result, resultIndex) => {
    const materialName = `料板${resultIndex + 1}`
    
    // 按项目分组切割件
    const cutsByItem = new Map<string, { item: CuttingItem, cuts: typeof result.cuts }>()
    
    result.cuts.forEach(cut => {
      const item = items.find(i => i.id === cut.itemId)
      if (item) {
        const existing = cutsByItem.get(item.id)
        if (existing) {
          existing.cuts.push(cut)
        } else {
          cutsByItem.set(item.id, { item, cuts: [cut] })
        }
      }
    })
    
    cutsByItem.forEach(({ item, cuts }) => {
      cuts.forEach(cut => {
        data.push([
          materialName,
          item.name || '未命名项目',
          `${formatters.length(cut.width)} × ${formatters.length(cut.height)}`,
          `(${formatters.length(cut.x)}, ${formatters.length(cut.y)})`,
          '1件'
        ])
      })
    })
  })
  
  return data
}

/**
 * 生成废料分析工作表数据
 */
function generateWasteAnalysisSheet(cuttingResults: CuttingResult[], materials: Material[]): any[][] {
  const data = [
    ['废料分析'],
    ['料板编号', '料板规格', '总面积', '使用面积', '废料面积', '损耗率', '优化建议'],
  ]
  
  cuttingResults.forEach((result, index) => {
    const material = materials.find(m => m.id === result.materialId)
    if (material) {
      const totalArea = material.width * material.height
      const wasteArea = (totalArea * result.wastePercentage) / 100
      const usedArea = totalArea - wasteArea
      
      let optimization = ''
      if (result.wastePercentage > 20) {
        optimization = '损耗率较高，建议重新优化切割方案'
      } else if (result.wastePercentage > 10) {
        optimization = '损耗率适中，可考虑微调'
      } else {
        optimization = '利用率良好'
      }
      
      data.push([
        `料板${index + 1}`,
        `${formatters.length(material.width)} × ${formatters.length(material.height)}`,
        `${formatters.area(totalArea)}`,
        `${formatters.area(usedArea)}`,
        `${formatters.area(wasteArea)}`,
        `${result.wastePercentage.toFixed(2)}%`,
        optimization
      ])
    }
  })
  
  return data
}