import type { Material, CuttingItem, CuttingResult } from '@/models/types'

// SVG 相关常量
export const MIN_SVG_SIZE = 300
export const MAX_SVG_SIZE = 800
export const PREFERRED_SVG_WIDTH = 600 // 期望的SVG宽度

// 颜色配置
export const CUTTING_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
]

export const CUTTING_BORDER_COLORS = {
  '#3B82F6': '#1D4ED8',
  '#EF4444': '#DC2626', 
  '#10B981': '#059669',
  '#F59E0B': '#D97706',
  '#8B5CF6': '#7C3AED',
  '#EC4899': '#DB2777',
  '#14B8A6': '#0D9488',
  '#F97316': '#EA580C',
  '#6366F1': '#4F46E5',
  '#84CC16': '#65A30D'
}

/**
 * 根据材料ID查找对应的材料信息，优先使用切割结果中的实际材料尺寸
 */
export function findMaterialByResultId(materialId: string, materials: Material[], result?: CuttingResult): Material | undefined {
  // 优先使用切割结果中的实际材料尺寸
  if (result && result.actualMaterial) {
    return result.actualMaterial
  }
  
  // 首先尝试精确匹配
  let material = materials.find(m => m.id === materialId)
  if (material) return material
  
  // 如果没找到，尝试匹配原始ID（去掉_sheet_X后缀）
  const originalId = materialId.replace(/_sheet_\d+$/, '')
  material = materials.find(m => m.id === originalId)
  
  return material
}

/**
 * 计算SVG宽度，支持使用切割结果中的实际材料
 */
export function getSvgWidth(materialId: string, materials: Material[], result?: CuttingResult): number {
  const material = findMaterialByResultId(materialId, materials, result)
  if (!material) return MIN_SVG_SIZE
  
  // 根据材料的宽高比来决定显示尺寸
  const aspectRatio = material.width / material.height
  
  if (aspectRatio >= 1) {
    // 宽度更大，以宽度为准
    return Math.min(Math.max(PREFERRED_SVG_WIDTH, MIN_SVG_SIZE), MAX_SVG_SIZE)
  } else {
    // 高度更大，根据比例计算宽度
    const height = Math.min(Math.max(PREFERRED_SVG_WIDTH, MIN_SVG_SIZE), MAX_SVG_SIZE)
    return height * aspectRatio
  }
}

/**
 * 计算SVG高度，支持使用切割结果中的实际材料
 */
export function getSvgHeight(materialId: string, materials: Material[], result?: CuttingResult): number {
  const material = findMaterialByResultId(materialId, materials, result)
  if (!material) return MIN_SVG_SIZE
  
  // 根据材料的宽高比来决定显示尺寸
  const aspectRatio = material.width / material.height
  
  if (aspectRatio >= 1) {
    // 宽度更大，根据比例计算高度
    const width = Math.min(Math.max(PREFERRED_SVG_WIDTH, MIN_SVG_SIZE), MAX_SVG_SIZE)
    return width / aspectRatio
  } else {
    // 高度更大，以高度为准
    return Math.min(Math.max(PREFERRED_SVG_WIDTH, MIN_SVG_SIZE), MAX_SVG_SIZE)
  }
}

/**
 * 计算缩放比例，支持使用切割结果中的实际材料
 */
export function getScaleFactor(materialId: string, materials: Material[], result?: CuttingResult): number {
  const material = findMaterialByResultId(materialId, materials, result)
  if (!material) {
    console.warn('找不到材料，使用默认缩放:', materialId)
    return 0.5 // 默认缩放比例
  }
  
  const svgWidth = getSvgWidth(materialId, materials, result)
  const scaleFactor = svgWidth / material.width
  
  console.log(`材料 ${materialId} 缩放信息:`, {
    materialWidth: material.width,
    materialHeight: material.height,
    svgWidth: svgWidth,
    svgHeight: getSvgHeight(materialId, materials),
    scaleFactor: scaleFactor
  })
  
  return scaleFactor
}

/**
 * 缩放坐标，支持使用切割结果中的实际材料
 */
export function scaleCoordinate(coordinate: number, materialId: string, materials: Material[], result?: CuttingResult): number {
  return coordinate * getScaleFactor(materialId, materials, result)
}

/**
 * 缩放尺寸，支持使用切割结果中的实际材料
 */
export function scaleDimension(dimension: number, materialId: string, materials: Material[], result?: CuttingResult): number {
  return dimension * getScaleFactor(materialId, materials, result)
}

/**
 * 获取材料名称，支持使用切割结果中的实际材料
 */
export function getMaterialName(materialId: string, materials: Material[], result?: CuttingResult): string {
  const material = findMaterialByResultId(materialId, materials, result)
  
  // 调试信息
  console.log('查找材料:', materialId, '找到:', material?.name)
  
  return material?.name || `材料 ${materialId}`
}

/**
 * 获取材料尺寸文本，支持使用切割结果中的实际材料
 */
export function getMaterialDimensions(materialId: string, materials: Material[], result?: CuttingResult): string {
  const material = findMaterialByResultId(materialId, materials, result)
  if (!material) {
    console.log('找不到材料尺寸:', materialId)
    return ''
  }
  return `${material.width} × ${material.height} mm`
}

/**
 * 获取切割件颜色
 */
export function getCutColor(index: number): string {
  return CUTTING_COLORS[index % CUTTING_COLORS.length]
}

/**
 * 获取切割件边框颜色
 */
export function getCutBorderColor(index: number): string {
  const color = CUTTING_COLORS[index % CUTTING_COLORS.length]
  return CUTTING_BORDER_COLORS[color as keyof typeof CUTTING_BORDER_COLORS] || color
}

/**
 * 获取切割件标签
 */
export function getCutLabel(cut: any, items?: CuttingItem[]): string {
  // 从 itemId 中提取原始 item 信息
  const originalItemId = cut.itemId.split('_').slice(0, -1).join('_')
  const item = items?.find(i => i.id === originalItemId)
  
  if (item?.name) {
    return item.name
  }
  
  // 如果没有名称，显示序号
  const index = cut.itemId.split('_').pop()
  return `件${index}`
}