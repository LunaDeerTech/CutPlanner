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
  cuttingSteps?: CuttingStep[] // 切割步骤序列
  cuttingTree?: CuttingTreeNode // 切割树结构
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

/**
 * 切割步骤 - 描述每一刀的具体操作
 */
export interface CuttingStep {
  id: string
  stepNumber: number
  direction: 'horizontal' | 'vertical' // 切割方向
  position: number // 切割位置（沿着切割方向的坐标）
  startPoint: { x: number, y: number } // 切割起始点
  endPoint: { x: number, y: number } // 切割结束点
  description: string // 切割描述，如"在X=100处垂直切割"
}

/**
 * 切割树节点 - 表示递归切割过程
 */
export interface CuttingTreeNode {
  id: string
  rect: Rectangle // 当前区域
  isLeaf: boolean // 是否为叶子节点（最终的切割件或废料）
  cutPieceId?: string // 如果是叶子节点，关联的切割件ID
  isWaste?: boolean // 是否为废料区域
  
  // 如果不是叶子节点，包含切割信息
  cutDirection?: 'horizontal' | 'vertical'
  cutPosition?: number
  leftChild?: CuttingTreeNode
  rightChild?: CuttingTreeNode
  
  // 切割步骤引用
  cuttingStepId?: string
}

/**
 * 矩形区域
 */
export interface Rectangle {
  x: number
  y: number
  width: number
  height: number
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
  optimizationStrategy: 'first-fit' | 'best-fit' | 'bottom-left' | 'genetic' | 'guillotine'
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