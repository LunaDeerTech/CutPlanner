import { describe, it, expect, beforeEach } from 'vitest'
import type { CuttingSettings, Material, CuttingItem, CuttingResult } from '../models/types'
import { CuttingPlannerService } from '../services/cutting/CuttingPlannerService'
import { MaterialOrientation } from '../models/types'

describe('CuttingPlannerService', () => {
  let service: CuttingPlannerService
  let material: Material
  let settings: CuttingSettings

  beforeEach(() => {
    settings = {
      kerfWidth: 3,
      margin: 5,
      allowRotation: true,
      unit: 'mm',
      materialOrientation: MaterialOrientation.VERTICAL,
      optimizationStrategy: 'guillotine'
    }
    service = new CuttingPlannerService(settings)
    
    material = {
      id: 'material1',
      name: 'Test Material',
      width: 1220,
      height: 2440,
      thickness: 18
    }
  })

  describe('updateRemainingItems ID extraction', () => {
    it('should correctly extract original ID from simple expanded item ID', () => {
      const items: CuttingItem[] = [
        { id: 'item1', length: 200, width: 100, quantity: 2, rotatation: 'any' }
      ]

      // Mock result with expanded item IDs
      const mockResult: CuttingResult = {
        materialId: material.id,
        cuts: [
          {
            id: 'cut1',
            x: 0, y: 0,
            width: 200, height: 100,
            itemId: 'item1_0',  // Expanded ID format
            rotated: false
          },
          {
            id: 'cut2',
            x: 200, y: 0,
            width: 200, height: 100,
            itemId: 'item1_1',  // Expanded ID format
            rotated: false
          }
        ],
        wastePercentage: 0,
        utilizedArea: 40000,
        totalWasteArea: 0
      }

      const remainingItems = [...items]
      
      // Use reflection to access private method
      const updateRemainingItemsMethod = (service as any).updateRemainingItems.bind(service)
      updateRemainingItemsMethod(remainingItems, mockResult)

      // Should have reduced quantity from 2 to 0, and item should be removed
      expect(remainingItems).toHaveLength(0)
    })

    it('should correctly extract original ID from complex ID with underscores', () => {
      const items: CuttingItem[] = [
        { id: 'item_complex_id', length: 200, width: 100, quantity: 1, rotatation: 'any' }
      ]

      // Mock result with expanded item IDs
      const mockResult: CuttingResult = {
        materialId: material.id,
        cuts: [
          {
            id: 'cut1',
            x: 0, y: 0,
            width: 200, height: 100,
            itemId: 'item_complex_id_0',  // Complex ID with underscores + expansion suffix
            rotated: false
          }
        ],
        wastePercentage: 0,
        utilizedArea: 20000,
        totalWasteArea: 0
      }

      const remainingItems = [...items]
      
      // Use reflection to access private method
      const updateRemainingItemsMethod = (service as any).updateRemainingItems.bind(service)
      updateRemainingItemsMethod(remainingItems, mockResult)

      // Should have reduced quantity from 1 to 0, and item should be removed
      expect(remainingItems).toHaveLength(0)
    })

    it('should correctly extract original ID from double expansion format', () => {
      const items: CuttingItem[] = [
        { id: 'item_1758006416593_2xtn6c8be', length: 200, width: 100, quantity: 1, rotatation: 'any' }
      ]

      // Mock result with double expanded item IDs (like genetic algorithm produces)
      const mockResult: CuttingResult = {
        materialId: material.id,
        cuts: [
          {
            id: 'cut1',
            x: 0, y: 0,
            width: 200, height: 100,
            itemId: 'item_1758006416593_2xtn6c8be_0_0',  // Double expansion format
            rotated: false
          }
        ],
        wastePercentage: 0,
        utilizedArea: 20000,
        totalWasteArea: 0
      }

      const remainingItems = [...items]
      
      // Use reflection to access private method
      const updateRemainingItemsMethod = (service as any).updateRemainingItems.bind(service)
      updateRemainingItemsMethod(remainingItems, mockResult)

      // Should have reduced quantity from 1 to 0, and item should be removed
      expect(remainingItems).toHaveLength(0)
    })

    it('should handle IDs without numeric suffix correctly', () => {
      const items: CuttingItem[] = [
        { id: 'item_without_expansion', length: 200, width: 100, quantity: 1, rotatation: 'any' }
      ]

      // Mock result with non-expanded item IDs
      const mockResult: CuttingResult = {
        materialId: material.id,
        cuts: [
          {
            id: 'cut1',
            x: 0, y: 0,
            width: 200, height: 100,
            itemId: 'item_without_expansion',  // No expansion suffix
            rotated: false
          }
        ],
        wastePercentage: 0,
        utilizedArea: 20000,
        totalWasteArea: 0
      }

      const remainingItems = [...items]
      
      // Use reflection to access private method
      const updateRemainingItemsMethod = (service as any).updateRemainingItems.bind(service)
      updateRemainingItemsMethod(remainingItems, mockResult)

      // Should have reduced quantity from 1 to 0, and item should be removed
      expect(remainingItems).toHaveLength(0)
    })

    it('should not remove items when no matching cuts are found', () => {
      const items: CuttingItem[] = [
        { id: 'item1', length: 200, width: 100, quantity: 2, rotatation: 'any' },
        { id: 'item2', length: 300, width: 150, quantity: 1, rotatation: 'any' }
      ]

      // Mock result with only one item placed
      const mockResult: CuttingResult = {
        materialId: material.id,
        cuts: [
          {
            id: 'cut1',
            x: 0, y: 0,
            width: 200, height: 100,
            itemId: 'item1_0',
            rotated: false
          }
        ],
        wastePercentage: 0,
        utilizedArea: 20000,
        totalWasteArea: 0
      }

      const remainingItems = [...items]
      
      // Use reflection to access private method
      const updateRemainingItemsMethod = (service as any).updateRemainingItems.bind(service)
      updateRemainingItemsMethod(remainingItems, mockResult)

      // item1 should have quantity reduced from 2 to 1
      // item2 should remain unchanged
      expect(remainingItems).toHaveLength(2)
      expect(remainingItems.find(item => item.id === 'item1')?.quantity).toBe(1)
      expect(remainingItems.find(item => item.id === 'item2')?.quantity).toBe(1)
    })
  })
})