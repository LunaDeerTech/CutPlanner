import type { 
  Material, 
  CuttingItem, 
  CuttingResult, 
  CutPiece, 
  CuttingSettings,
  CuttingStep,
  CuttingTreeNode,
  Rectangle
} from '@/models/types'
import { MaterialOrientation } from '@/models/types'

/**
 * 自由矩形 - 表示材料上可用的空白区域
 */
interface FreeRectangle extends Rectangle {
  id: string
}

/**
 * 放置信息 - 描述如何将一个切割件放置在自由矩形中
 */
interface Placement {
  rect: FreeRectangle
  item: CuttingItem & { originalIndex: number }
  itemWidth: number
  itemHeight: number
  rotated: boolean
  fitness: number // 适合度评分
}

/**
 * Guillotine 切割算法实现
 * 基于断头台约束，确保每次切割都是一刀切断
 * 使用 Maximal Rectangles 变种算法寻找最优放置位置
 */
export class GuillotineCuttingService {
  private settings: CuttingSettings
  private stepCounter: number = 0
  private cuttingSteps: CuttingStep[] = []

  constructor(settings: CuttingSettings) {
    this.settings = settings
  }

  /**
   * 计算单个材料的切割布局
   */
  calculateLayout(material: Material, items: CuttingItem[]): CuttingResult {
    // 重置状态
    this.stepCounter = 0
    this.cuttingSteps = []

    const cuts: CutPiece[] = []
    
    // 根据料板方向调整料板尺寸
    const adjustedMaterial = this.adjustMaterialOrientation(material)
    
    // 展开数量，每个数量作为单独的item处理
    const expandedItems = this.expandItemsByQuantity(items)
    
    // 按面积降序排序，大的优先放置
    expandedItems.sort((a, b) => (b.length * b.width) - (a.length * a.width))
    
    // 初始化自由矩形列表，整个材料作为第一个自由矩形
    const freeRectangles: FreeRectangle[] = [{
      id: 'root',
      x: this.settings.margin,
      y: this.settings.margin,
      width: adjustedMaterial.width - 2 * this.settings.margin,
      height: adjustedMaterial.height - 2 * this.settings.margin
    }]

    // 创建切割树的根节点
    const cuttingTree: CuttingTreeNode = {
      id: 'root',
      rect: {
        x: 0,
        y: 0,
        width: adjustedMaterial.width,
        height: adjustedMaterial.height
      },
      isLeaf: false
    }

    // 逐个放置切割件
    for (const item of expandedItems) {
      const placement = this.findBestPlacement(item, freeRectangles)
      
      if (placement) {
        // 创建切割件
        const cutPiece: CutPiece = {
          id: `cut_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          itemId: item.id,
          x: placement.rect.x,
          y: placement.rect.y,
          width: placement.itemWidth,
          height: placement.itemHeight,
          rotated: placement.rotated
        }
        
        cuts.push(cutPiece)

        // 执行 Guillotine 切割，更新自由矩形列表
        this.performGuillotineCut(
          placement.rect,
          placement.itemWidth,
          placement.itemHeight,
          freeRectangles
        )
      }
    }

    // 计算利用率统计
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
      actualMaterial: adjustedMaterial,
      cuttingSteps: this.cuttingSteps,
      cuttingTree
    }
  }

  /**
   * 根据料板方向调整料板尺寸
   */
  private adjustMaterialOrientation(material: Material): Material {
    if (this.settings.materialOrientation === MaterialOrientation.HORIZONTAL) {
      if (material.height > material.width) {
        return {
          ...material,
          width: material.height,
          height: material.width
        }
      }
    } else if (this.settings.materialOrientation === MaterialOrientation.VERTICAL) {
      if (material.width > material.height) {
        return {
          ...material,
          width: material.height,
          height: material.width
        }
      }
    }
    
    return material
  }

  /**
   * 按数量展开切割件
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
   * 获取切割件允许的方向
   */
  private getOrientationsForItem(item: CuttingItem): Array<{ width: number; height: number; rotated: boolean }> {
    const orientations: Array<{ width: number; height: number; rotated: boolean }> = []
    
    switch (item.rotatation) {
      case 'fixed-default':
        orientations.push({ width: item.width, height: item.length, rotated: false })
        break
      
      case 'fixed-rotate':
        orientations.push({ width: item.length, height: item.width, rotated: true })
        break
      
      case 'auto':
      default:
        orientations.push({ width: item.width, height: item.length, rotated: false })
        if (this.settings.allowRotation && item.width !== item.length) {
          orientations.push({ width: item.length, height: item.width, rotated: true })
        }
        break
    }
    
    return orientations
  }

  /**
   * 为切割件寻找最佳放置位置
   */
  private findBestPlacement(
    item: CuttingItem & { originalIndex: number }, 
    freeRectangles: FreeRectangle[]
  ): Placement | null {
    let bestPlacement: Placement | null = null
    const orientations = this.getOrientationsForItem(item)
    
    // 尝试每个自由矩形
    for (const rect of freeRectangles) {
      // 尝试每个方向
      for (const orientation of orientations) {
        const itemWidth = orientation.width + this.settings.kerfWidth
        const itemHeight = orientation.height + this.settings.kerfWidth
        
        // 检查是否能放入这个矩形
        if (itemWidth <= rect.width && itemHeight <= rect.height) {
          // 计算适合度（优先选择浪费最少的位置）
          const wasteArea = (rect.width * rect.height) - (itemWidth * itemHeight)
          const fitness = -wasteArea // 负数，浪费越少fitness越高
          
          const placement: Placement = {
            rect,
            item,
            itemWidth: orientation.width, // 不包含kerf的实际尺寸
            itemHeight: orientation.height,
            rotated: orientation.rotated,
            fitness
          }
          
          // 选择最佳适合度的位置
          if (!bestPlacement || placement.fitness > bestPlacement.fitness) {
            bestPlacement = placement
          }
        }
      }
    }
    
    return bestPlacement
  }

  /**
   * 执行 Guillotine 切割
   * 在放置切割件后，将剩余的自由矩形按 Guillotine 原则分割
   */
  private performGuillotineCut(
    usedRect: FreeRectangle,
    itemWidth: number,
    itemHeight: number,
    freeRectangles: FreeRectangle[]
  ): void {
    // 从自由矩形列表中移除已使用的矩形
    const index = freeRectangles.findIndex(r => r.id === usedRect.id)
    if (index !== -1) {
      freeRectangles.splice(index, 1)
    }

    const itemWithKerf = {
      width: itemWidth + this.settings.kerfWidth,
      height: itemHeight + this.settings.kerfWidth
    }

    // 决定切割方向 - 选择产生较大剩余面积的方向
    const rightRemainingArea = (usedRect.width - itemWithKerf.width) * usedRect.height
    const bottomRemainingArea = usedRect.width * (usedRect.height - itemWithKerf.height)
    
    const splitVertically = rightRemainingArea >= bottomRemainingArea

    if (splitVertically) {
      // 垂直分割：在切割件右侧创建新的自由矩形
      if (usedRect.width > itemWithKerf.width) {
        const rightRect: FreeRectangle = {
          id: `right_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          x: usedRect.x + itemWithKerf.width,
          y: usedRect.y,
          width: usedRect.width - itemWithKerf.width,
          height: usedRect.height
        }
        freeRectangles.push(rightRect)

        // 生成切割步骤
        this.addCuttingStep(
          'vertical',
          usedRect.x + itemWithKerf.width,
          { x: usedRect.x + itemWithKerf.width, y: usedRect.y },
          { x: usedRect.x + itemWithKerf.width, y: usedRect.y + usedRect.height },
          `垂直切割，在 X=${usedRect.x + itemWithKerf.width} 处切断`
        )
      }

      // 在切割件下方创建新的自由矩形
      if (usedRect.height > itemWithKerf.height) {
        const bottomRect: FreeRectangle = {
          id: `bottom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          x: usedRect.x,
          y: usedRect.y + itemWithKerf.height,
          width: itemWithKerf.width,
          height: usedRect.height - itemWithKerf.height
        }
        freeRectangles.push(bottomRect)

        // 生成切割步骤
        this.addCuttingStep(
          'horizontal',
          usedRect.y + itemWithKerf.height,
          { x: usedRect.x, y: usedRect.y + itemWithKerf.height },
          { x: usedRect.x + itemWithKerf.width, y: usedRect.y + itemWithKerf.height },
          `水平切割，在 Y=${usedRect.y + itemWithKerf.height} 处切断`
        )
      }
    } else {
      // 水平分割：在切割件下方创建新的自由矩形
      if (usedRect.height > itemWithKerf.height) {
        const bottomRect: FreeRectangle = {
          id: `bottom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          x: usedRect.x,
          y: usedRect.y + itemWithKerf.height,
          width: usedRect.width,
          height: usedRect.height - itemWithKerf.height
        }
        freeRectangles.push(bottomRect)

        // 生成切割步骤
        this.addCuttingStep(
          'horizontal',
          usedRect.y + itemWithKerf.height,
          { x: usedRect.x, y: usedRect.y + itemWithKerf.height },
          { x: usedRect.x + usedRect.width, y: usedRect.y + itemWithKerf.height },
          `水平切割，在 Y=${usedRect.y + itemWithKerf.height} 处切断`
        )
      }

      // 在切割件右侧创建新的自由矩形
      if (usedRect.width > itemWithKerf.width) {
        const rightRect: FreeRectangle = {
          id: `right_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          x: usedRect.x + itemWithKerf.width,
          y: usedRect.y,
          width: usedRect.width - itemWithKerf.width,
          height: itemWithKerf.height
        }
        freeRectangles.push(rightRect)

        // 生成切割步骤
        this.addCuttingStep(
          'vertical',
          usedRect.x + itemWithKerf.width,
          { x: usedRect.x + itemWithKerf.width, y: usedRect.y },
          { x: usedRect.x + itemWithKerf.width, y: usedRect.y + itemWithKerf.height },
          `垂直切割，在 X=${usedRect.x + itemWithKerf.width} 处切断`
        )
      }
    }

    // 清理重叠和包含关系的矩形
    this.cleanupFreeRectangles(freeRectangles)
  }

  /**
   * 添加切割步骤
   */
  private addCuttingStep(
    direction: 'horizontal' | 'vertical',
    position: number,
    startPoint: { x: number, y: number },
    endPoint: { x: number, y: number },
    description: string
  ): void {
    this.stepCounter++
    
    const step: CuttingStep = {
      id: `step_${this.stepCounter}`,
      stepNumber: this.stepCounter,
      direction,
      position,
      startPoint,
      endPoint,
      description
    }
    
    this.cuttingSteps.push(step)
  }

  /**
   * 清理自由矩形列表，移除被包含的矩形
   */
  private cleanupFreeRectangles(freeRectangles: FreeRectangle[]): void {
    // 移除面积为0的矩形
    for (let i = freeRectangles.length - 1; i >= 0; i--) {
      const rect = freeRectangles[i]
      if (rect.width <= 0 || rect.height <= 0) {
        freeRectangles.splice(i, 1)
      }
    }

    // 移除被其他矩形完全包含的矩形
    for (let i = freeRectangles.length - 1; i >= 0; i--) {
      const rect1 = freeRectangles[i]
      
      for (let j = 0; j < freeRectangles.length; j++) {
        if (i === j) continue
        
        const rect2 = freeRectangles[j]
        
        // 如果 rect1 被 rect2 完全包含，则移除 rect1
        if (this.isRectangleContained(rect1, rect2)) {
          freeRectangles.splice(i, 1)
          break
        }
      }
    }
  }

  /**
   * 检查矩形1是否被矩形2完全包含
   */
  private isRectangleContained(rect1: Rectangle, rect2: Rectangle): boolean {
    return rect1.x >= rect2.x &&
           rect1.y >= rect2.y &&
           rect1.x + rect1.width <= rect2.x + rect2.width &&
           rect1.y + rect1.height <= rect2.y + rect2.height
  }
}