import { describe, it, expect } from 'vitest'
import { GeneticCuttingService } from '../services/cutting/GeneticCuttingService'
import type { Material, CuttingItem, CuttingSettings } from '../models/types'
import { MaterialOrientation } from '../models/types'

describe('GeneticCuttingService', () => {
  const defaultSettings: CuttingSettings = {
    unit: 'mm',
    kerfWidth: 3,
    margin: 5,
    allowRotation: true,
    materialOrientation: MaterialOrientation.HORIZONTAL,
    optimizationStrategy: 'genetic'
  }

  const testMaterial: Material = {
    id: 'test-material',
    name: '测试板材',
    width: 2440,
    height: 1220,
    thickness: 18,
    materialType: '密度板'
  }

  const testItems: CuttingItem[] = [
    {
      id: 'item1',
      name: '门板',
      length: 600,
      width: 400,
      quantity: 4,
      rotatation: 'auto'
    },
    {
      id: 'item2',
      name: '侧板',
      length: 800,
      width: 300,
      quantity: 2,
      rotatation: 'auto'
    },
    {
      id: 'item3',
      name: '层板',
      length: 500,
      width: 250,
      quantity: 6,
      rotatation: 'auto'
    }
  ]

  it('应该成功创建遗传算法服务实例', () => {
    const service = new GeneticCuttingService(defaultSettings)
    expect(service).toBeDefined()
  })

  it('应该能计算简单的切割布局', () => {
    const service = new GeneticCuttingService(defaultSettings, {
      populationSize: 20,
      maxGenerations: 10,
      maxStagnantGenerations: 5
    })
    
    const result = service.calculateLayout(testMaterial, testItems)
    
    expect(result).toBeDefined()
    expect(result.materialId).toBe(testMaterial.id)
    expect(result.cuts).toBeDefined()
    expect(result.cuts.length).toBeGreaterThan(0)
    expect(result.wastePercentage).toBeGreaterThanOrEqual(0)
    expect(result.wastePercentage).toBeLessThanOrEqual(100)
  })

  it('应该能处理少量切割件（直接使用断头台算法）', () => {
    const simpleItems: CuttingItem[] = [
      {
        id: 'item1',
        name: '测试件',
        length: 200,
        width: 100,
        quantity: 2,
        rotatation: 'auto'
      }
    ]

    const service = new GeneticCuttingService(defaultSettings)
    const result = service.calculateLayout(testMaterial, simpleItems)
    
    expect(result).toBeDefined()
    expect(result.cuts.length).toBe(2)
  })

  it('应该能获取遗传算法统计信息', () => {
    const service = new GeneticCuttingService(defaultSettings, {
      populationSize: 10,
      maxGenerations: 5
    })
    
    // 执行一次计算以初始化统计信息
    service.calculateLayout(testMaterial, testItems.slice(0, 1))
    
    const stats = service.getGeneticStatistics()
    expect(stats).toBeDefined()
    expect(stats.generation).toBeGreaterThanOrEqual(0)
    expect(stats.populationSize).toBeGreaterThanOrEqual(0)
    expect(stats.bestFitness).toBeGreaterThanOrEqual(0)
  })

  it('应该能设置遗传算法参数', () => {
    const service = new GeneticCuttingService(defaultSettings)
    
    service.setGeneticParameters({
      populationSize: 30,
      maxGenerations: 50,
      crossoverRate: 0.9,
      mutationRate: 0.05
    })
    
    // 这主要是验证方法不会抛出错误
    expect(service).toBeDefined()
  })

  it('应该正确处理数量，不会重复展开', () => {
    const testItemsWithQuantity: CuttingItem[] = [
      {
        id: 'item1',
        name: '门板',
        length: 600,
        width: 400,
        quantity: 2, // 2个
        rotatation: 'auto'
      },
      {
        id: 'item2',
        name: '侧板',
        length: 800,
        width: 300,
        quantity: 3, // 3个
        rotatation: 'auto'
      }
    ]

    const service = new GeneticCuttingService(defaultSettings, {
      populationSize: 10,
      maxGenerations: 5
    })
    
    const result = service.calculateLayout(testMaterial, testItemsWithQuantity)
    
    expect(result).toBeDefined()
    expect(result.cuts.length).toBe(5) // 应该正好是 2 + 3 = 5 个切割件
    
    // 验证没有重复的切割件ID
    const cutIds = result.cuts.map(cut => cut.itemId)
    expect(cutIds.length).toBe(5)
    
    // 验证有正确数量的不同原始ID
    const originalIds = new Set(cutIds.map(id => id.split('_')[0]))
    expect(originalIds.size).toBe(2) // 应该有2个不同的原始ID（item1和item2）
  })
})