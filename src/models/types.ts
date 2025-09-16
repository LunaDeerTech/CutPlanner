// Material and cutting related types

export interface Material {
  id: string
  name: string
  width: number
  height: number
  thickness: number
  materialType?: string | undefined
}

export interface CuttingItem {
  id: string
  name?: string
  length: number  // 长度
  width: number   // 宽度
  quantity: number
  rotatation: string // 旋转 'auto'(根据参数配置区域由算法决定) | 'fixed-default'(固定为默认方向) | 'fixed-rotate'(固定为旋转90度方向)
}

export interface CuttingResult {
  materialId: string
  cuts: CutPiece[]
  wastePercentage: number
  totalWasteArea: number
  utilizedArea: number
  actualMaterial?: Material // 实际使用的材料尺寸（考虑料板方向调整）
}

export interface CutPiece {
  id: string
  itemId: string
  x: number
  y: number
  width: number
  height: number
  rotated: boolean
}

// 料板方向枚举
export enum MaterialOrientation {
  VERTICAL = 'vertical',   // 竖向
  HORIZONTAL = 'horizontal' // 横向
}

export interface CuttingSettings {
  unit: 'mm' | 'inch' // 默认单位
  kerfWidth: number // 锯片厚度
  margin: number // 边距
  allowRotation: boolean
  materialOrientation: MaterialOrientation // 料板方向
  optimizationStrategy: 'first-fit' | 'best-fit' | 'bottom-left' | 'genetic'
}

export interface CuttingPlan {
  id: string
  name: string
  materials: Material[]
  items: CuttingItem[]
  settings: CuttingSettings
  results?: CuttingResult[]
  createdAt: Date
  updatedAt: Date
}