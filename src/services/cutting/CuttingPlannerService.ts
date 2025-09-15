import type { Material, CuttingItem, CuttingResult, CuttingSettings } from '@/models/types'
import { FirstFitCuttingService } from './FirstFitCuttingService'

/**
 * Main cutting planner service that coordinates different cutting algorithms
 */
export class CuttingPlannerService {
  private settings: CuttingSettings

  constructor(settings: CuttingSettings) {
    this.settings = settings
  }

  /**
   * Calculate optimal cutting layout for multiple materials
   * @param materials Available material types (unlimited quantity of each type)
   * @param items Items to be cut
   * @param selectedMaterial Optional selected material to use preferentially
   * @returns Array of cutting results, one per material sheet used
   */
  async calculateOptimalLayout(
    materials: Material[],
    items: CuttingItem[],
    selectedMaterial?: Material
  ): Promise<CuttingResult[]> {
    
    if (!materials.length || !items.length) {
      return []
    }

    // 必须选择一个材料才能进行切割规划
    if (!selectedMaterial) {
      throw new Error('请先选择要使用的料板规格')
    }

    // Validate input data
    this.validateInput(materials, items)
    
    // Use the selected optimization strategy
    switch (this.settings.optimizationStrategy) {
      case 'first-fit':
        return this.calculateFirstFitLayoutUnlimited(materials, items, selectedMaterial)
      
      case 'best-fit':
        throw new Error('最佳适应算法尚未实现，请选择"首次适应"算法')
      
      case 'bottom-left':
        throw new Error('左下角算法尚未实现，请选择"首次适应"算法')
      
      case 'genetic':
        throw new Error('遗传算法尚未实现，请选择"首次适应"算法')
      
      default:
        console.warn(`未知的优化策略: ${this.settings.optimizationStrategy}，使用首次适应算法`)
        return this.calculateFirstFitLayoutUnlimited(materials, items, selectedMaterial)
    }
  }

  /**
   * Calculate layout using first-fit algorithm with unlimited materials
   * Uses the minimum number of sheets from the selected material type
   * Note: This method does NOT modify the original items array - it works with a deep copy
   */
  private calculateFirstFitLayoutUnlimited(
    _materials: Material[],  // 保留参数以维持接口一致性，但不再使用
    items: CuttingItem[],
    selectedMaterial: Material  // 不再是可选的
  ): CuttingResult[] {
    const results: CuttingResult[] = []
    // Create a deep copy of items to avoid modifying the original cutting list
    const remainingItems = items.map(item => ({ ...item }))

    // Use the provided selected material (no fallback needed since it's required)
    const chosenMaterial = selectedMaterial
    
    let sheetNumber = 1
    
    // Keep using new sheets until all items are placed
    while (remainingItems.length > 0) {
      // Create a new sheet of the selected material type
      const currentSheet: Material = {
        ...chosenMaterial,
        id: `${chosenMaterial.id}_sheet_${sheetNumber}`,
        name: `${chosenMaterial.name} - 第${sheetNumber}张`
      }

      const cuttingService = new FirstFitCuttingService(this.settings)
      const result = cuttingService.calculateLayout(currentSheet, remainingItems)
      
      if (result.cuts.length === 0) {
        // No items could be placed on this sheet
        // This might happen if remaining items are too large
        console.warn('无法在当前料板上放置任何项目，可能存在过大的切割项目')
        break
      }
      
      results.push(result)
      
      // Remove successfully placed items from remaining items
      this.updateRemainingItems(remainingItems, result)
      
      sheetNumber++
      
      // Safety check to prevent infinite loops
      if (sheetNumber > 100) {
        console.error('使用料板数量超过100张，停止计算以防无限循环')
        break
      }
    }

    // Add summary information
    this.addSummaryInformation(results, items)

    return results
  }

  /**
   * Select the best material type for cutting
   * Currently selects the largest material by area
   * @deprecated This method is no longer used since material selection is now required
   * @param materials Available materials
   * @returns The best material
   */
  // @ts-ignore - 保留此方法用于将来可能的功能扩展
  private selectBestMaterialType(materials: Material[]): Material {
    // Sort by area (largest first) and select the best one
    const sortedMaterials = [...materials].sort(
      (a, b) => (b.width * b.height) - (a.width * a.height)
    )
    
    return sortedMaterials[0]
  }

  /**
   * Update remaining items after successful placements
   * This method operates on a deep copy of the original items, so it doesn't affect the user's cutting list
   */
  private updateRemainingItems(remainingItems: CuttingItem[], result: CuttingResult) {
    // Count how many of each item were successfully placed
    const placedCounts = new Map<string, number>()
    
    result.cuts.forEach(cut => {
      // Extract original item ID (remove the "_n" suffix from expanded items)
      const originalItemId = cut.itemId.split('_').slice(0, -1).join('_')
      const currentCount = placedCounts.get(originalItemId) || 0
      placedCounts.set(originalItemId, currentCount + 1)
    })

    // Reduce quantities in remaining items
    placedCounts.forEach((placedCount, itemId) => {
      const itemIndex = remainingItems.findIndex(item => item.id === itemId)
      if (itemIndex !== -1) {
        remainingItems[itemIndex].quantity -= placedCount
        
        // Remove items with zero quantity
        if (remainingItems[itemIndex].quantity <= 0) {
          remainingItems.splice(itemIndex, 1)
        }
      }
    })
  }

  /**
   * Add summary information to results
   */
  private addSummaryInformation(results: CuttingResult[], originalItems: CuttingItem[]) {
    if (results.length === 0) return

    // Calculate totals
    const totalMaterialsUsed = results.length
    const totalUtilizedArea = results.reduce((sum, result) => sum + result.utilizedArea, 0)
    const totalWasteArea = results.reduce((sum, result) => sum + result.totalWasteArea, 0)
    const totalMaterialArea = totalUtilizedArea + totalWasteArea
    const overallWastePercentage = totalMaterialArea > 0 
      ? (totalWasteArea / totalMaterialArea) * 100 
      : 0

    // Add summary to first result (for display purposes)
    if (results[0]) {
      (results[0] as any).summary = {
        totalMaterialsUsed,
        totalUtilizedArea,
        totalWasteArea,
        totalMaterialArea,
        overallWastePercentage,
        totalItemsPlaced: results.reduce((sum, result) => sum + result.cuts.length, 0),
        totalItemsRequested: originalItems.reduce((sum, item) => sum + item.quantity, 0)
      }
    }
  }

  /**
   * Validate input data
   */
  private validateInput(materials: Material[], items: CuttingItem[]) {
    // Validate materials
    materials.forEach(material => {
      if (material.width <= 0 || material.height <= 0) {
        throw new Error(`Invalid material dimensions: ${material.name}`)
      }
    })

    // Validate cutting items
    items.forEach(item => {
      if (item.width <= 0 || item.length <= 0 || item.quantity <= 0) {
        throw new Error(`Invalid cutting item dimensions or quantity: ${item.name || 'Unnamed item'}`)
      }
    })

    // Check if any items are too large for any material
    items.forEach(item => {
      const fitsInAnyMaterial = materials.some(material => {
        const availableWidth = material.width - 2 * this.settings.margin
        const availableHeight = material.height - 2 * this.settings.margin
        
        return (item.width <= availableWidth && item.length <= availableHeight) ||
               (this.settings.allowRotation && item.length <= availableWidth && item.width <= availableHeight)
      })
      
      if (!fitsInAnyMaterial) {
        throw new Error(`Item "${item.name || 'Unnamed item'}" is too large to fit in any available material`)
      }
    })
  }

  /**
   * Get cutting efficiency report
   * Reports on sheets used and optimization suggestions
   */
  generateEfficiencyReport(results: CuttingResult[]): {
    materialsUsed: number
    totalWaste: number
    wastePercentage: number
    itemsPlaced: number
    recommendations: string[]
  } {
    if (results.length === 0) {
      return {
        materialsUsed: 0,
        totalWaste: 0,
        wastePercentage: 0,
        itemsPlaced: 0,
        recommendations: ['No cutting results to analyze']
      }
    }

    const sheetsUsed = results.length  // Number of sheets of the selected material type
    const totalWaste = results.reduce((sum, result) => sum + result.totalWasteArea, 0)
    const totalArea = results.reduce((sum, result) => 
      sum + result.utilizedArea + result.totalWasteArea, 0)
    const wastePercentage = totalArea > 0 ? (totalWaste / totalArea) * 100 : 0
    const itemsPlaced = results.reduce((sum, result) => sum + result.cuts.length, 0)

    const recommendations: string[] = []
    
    if (wastePercentage > 30) {
      recommendations.push('废料率较高，考虑调整切割尺寸或选择更大的料板规格')
    }
    
    if (sheetsUsed > 5) {
      recommendations.push('使用了较多料板，考虑选择更大规格的料板类型')
    }
    
    if (wastePercentage < 10) {
      recommendations.push('料板利用率优秀！')
    }
    
    if (sheetsUsed === 1) {
      recommendations.push('所有项目都在一张料板上完成，非常高效！')
    }

    return {
      materialsUsed: sheetsUsed,
      totalWaste,
      wastePercentage,
      itemsPlaced,
      recommendations
    }
  }
}