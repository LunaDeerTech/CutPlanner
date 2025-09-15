// Material and cutting related types

export interface Material {
  id: string
  name: string
  width: number
  height: number
  thickness: number
  unit: 'mm' | 'inch'
  materialType?: string | undefined
}

export interface CuttingItem {
  id: string
  name?: string
  width: number
  height: number
  quantity: number
  unit: 'mm' | 'inch'
  allowRotation?: boolean
}

export interface CuttingResult {
  materialId: string
  cuts: CutPiece[]
  wastePercentage: number
  totalWasteArea: number
  utilizedArea: number
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

export interface CuttingSettings {
  kerfWidth: number // 锯片厚度
  margin: number // 边距
  allowRotation: boolean
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