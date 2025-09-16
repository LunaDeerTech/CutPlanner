import type { Material, CuttingItem, CuttingResult, CutPiece, CuttingSettings } from '@/models/types'
import { MaterialOrientation } from '@/models/types'

/**
 * Rectangle representation for placement calculation
 */
interface Rectangle {
  x: number
  y: number
  width: number
  height: number
}

/**
 * First-fit cutting algorithm implementation
 * Places cutting items sequentially in the first available space
 */
export class FirstFitCuttingService {
  private settings: CuttingSettings

  constructor(settings: CuttingSettings) {
    this.settings = settings
  }

  /**
   * Calculate cutting layout for a single material
   * @param material The material sheet to cut from
   * @param items The items to cut
   * @returns Cutting result with piece placements
   */
  calculateLayout(material: Material, items: CuttingItem[]): CuttingResult {
    const cuts: CutPiece[] = []
    const placedRectangles: Rectangle[] = []
    
    // 根据料板方向调整料板尺寸
    const adjustedMaterial = this.adjustMaterialOrientation(material)
    
    // Expand items by quantity
    const expandedItems = this.expandItemsByQuantity(items)
    
    // Sort items by area (largest first) for better efficiency
    expandedItems.sort((a, b) => (b.length * b.width) - (a.length * a.width))
    
    let placedCount = 0
    
    for (const item of expandedItems) {
      const placement = this.findBestPlacement(
        adjustedMaterial,
        item,
        placedRectangles
      )
      
      if (placement) {
        const cutPiece: CutPiece = {
          id: `cut_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          itemId: item.id,
          x: placement.x,
          y: placement.y,
          width: placement.width,
          height: placement.height,
          rotated: placement.rotated
        }
        
        cuts.push(cutPiece)
        placedRectangles.push({
          x: placement.x,
          y: placement.y,
          width: placement.width,
          height: placement.height
        })
        placedCount++
      }
    }
    
    // Calculate waste and utilization using adjusted material dimensions
    const totalMaterialArea = adjustedMaterial.width * adjustedMaterial.height
    const utilizedArea = cuts.reduce((sum, cut) => sum + (cut.width * cut.height), 0)
    const totalWasteArea = totalMaterialArea - utilizedArea
    const wastePercentage = (totalWasteArea / totalMaterialArea) * 100

    return {
      materialId: material.id,
      cuts,
      wastePercentage,
      totalWasteArea,
      utilizedArea,
      actualMaterial: adjustedMaterial // 包含调整后的材料尺寸
    }
  }

  /**
   * 根据料板方向调整料板尺寸
   */
  private adjustMaterialOrientation(material: Material): Material {
    // 如果设置为横向，且当前料板是竖向的（高度 > 宽度），则交换长宽
    if (this.settings.materialOrientation === MaterialOrientation.HORIZONTAL) {
      if (material.height > material.width) {
        return {
          ...material,
          width: material.height,
          height: material.width
        }
      }
    }
    // 如果设置为竖向，且当前料板是横向的（宽度 > 高度），则交换长宽
    else if (this.settings.materialOrientation === MaterialOrientation.VERTICAL) {
      if (material.width > material.height) {
        return {
          ...material,
          width: material.height,
          height: material.width
        }
      }
    }
    
    // 其他情况保持原尺寸
    return material
  }

  /**
   * Expand cutting items by their quantities
   */
  private expandItemsByQuantity(items: CuttingItem[]): Array<CuttingItem & { originalIndex: number }> {
    const expandedItems: Array<CuttingItem & { originalIndex: number }> = []
    
    items.forEach((item, originalIndex) => {
      for (let i = 0; i < item.quantity; i++) {
        expandedItems.push({
          ...item,
          id: `${item.id}_${i}`,
          originalIndex,
          quantity: 1
        })
      }
    })
    
    return expandedItems
  }

  /**
   * Find the best placement for an item on the material
   */
  private findBestPlacement(
    material: Material,
    item: CuttingItem,
    placedRectangles: Rectangle[]
  ): { x: number; y: number; width: number; height: number; rotated: boolean } | null {
    
    // Try both orientations if rotation is allowed
    const orientations = [
      { width: item.width, height: item.length, rotated: false },
    ]
    
    if (this.settings.allowRotation && item.width !== item.length) {
      orientations.push({ width: item.length, height: item.width, rotated: true })
    }
    
    for (const orientation of orientations) {
      // Try to place at each possible position
      const placement = this.findFirstFitPosition(
        material,
        orientation.width,
        orientation.height,
        placedRectangles
      )
      
      if (placement) {
        return {
          x: placement.x,
          y: placement.y,
          width: orientation.width,
          height: orientation.height,
          rotated: orientation.rotated
        }
      }
    }
    
    return null
  }

  /**
   * Find the first position where a rectangle can fit
   */
  private findFirstFitPosition(
    material: Material,
    width: number,
    height: number,
    placedRectangles: Rectangle[]
  ): { x: number; y: number } | null {
    
    // Consider margin and kerf width
    const effectiveWidth = material.width - 2 * this.settings.margin
    const effectiveHeight = material.height - 2 * this.settings.margin
    
    // Start from margin offset
    const startX = this.settings.margin
    const startY = this.settings.margin
    
    // Try grid positions with kerf width spacing
    const stepSize = Math.max(1, this.settings.kerfWidth)
    
    // 简单的从左到右，从上到下搜索
    for (let y = startY; y <= effectiveHeight - height + this.settings.margin; y += stepSize) {
      for (let x = startX; x <= effectiveWidth - width + this.settings.margin; x += stepSize) {
        
        const candidateRect: Rectangle = {
          x,
          y,
          width: width + this.settings.kerfWidth,
          height: height + this.settings.kerfWidth
        }
        
        // Check if this position overlaps with any existing pieces
        const overlaps = placedRectangles.some(placed => 
          this.rectanglesOverlap(candidateRect, {
            x: placed.x,
            y: placed.y,
            width: placed.width + this.settings.kerfWidth,
            height: placed.height + this.settings.kerfWidth
          })
        )
        
        if (!overlaps) {
          return { x, y }
        }
      }
    }
    
    return null
  }

  /**
   * Check if two rectangles overlap
   */
  private rectanglesOverlap(rect1: Rectangle, rect2: Rectangle): boolean {
    return !(
      rect1.x + rect1.width <= rect2.x ||
      rect2.x + rect2.width <= rect1.x ||
      rect1.y + rect1.height <= rect2.y ||
      rect2.y + rect2.height <= rect1.y
    )
  }
}