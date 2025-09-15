import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CuttingItem, CuttingResult, CuttingPlan } from '@/models/types'

export const useCuttingStore = defineStore('cutting', () => {
  const items = ref<CuttingItem[]>([])
  const results = ref<CuttingResult[]>([])
  const currentPlan = ref<CuttingPlan | null>(null)
  const isCalculating = ref(false)

  const addItem = (item: Omit<CuttingItem, 'id'>) => {
    const newItem: CuttingItem = {
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    items.value.push(newItem)
    return newItem
  }

  const updateItem = (id: string, updates: Partial<CuttingItem>) => {
    const index = items.value.findIndex(item => item.id === id)
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...updates }
    }
  }

  const removeItem = (id: string) => {
    const index = items.value.findIndex(item => item.id === id)
    if (index !== -1) {
      items.value.splice(index, 1)
    }
  }

  const clearItems = () => {
    items.value = []
  }

  const setResults = (newResults: CuttingResult[]) => {
    results.value = newResults
  }

  const clearResults = () => {
    results.value = []
  }

  const setCurrentPlan = (plan: CuttingPlan | null) => {
    currentPlan.value = plan
  }

  const setCalculating = (calculating: boolean) => {
    isCalculating.value = calculating
  }

  // Computed properties
  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const totalArea = computed(() => {
    return items.value.reduce((sum, item) => {
      return sum + (item.width * item.length * item.quantity)
    }, 0)
  })

  const hasItems = computed(() => items.value.length > 0)
  const hasResults = computed(() => results.value.length > 0)

  return {
    items,
    results,
    currentPlan,
    isCalculating,
    addItem,
    updateItem,
    removeItem,
    clearItems,
    setResults,
    clearResults,
    setCurrentPlan,
    setCalculating,
    totalItems,
    totalArea,
    hasItems,
    hasResults
  }
})