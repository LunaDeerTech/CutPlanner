import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Material } from '@/models/types'

export const useMaterialStore = defineStore('material', () => {
  const materials = ref<Material[]>([])
  const currentMaterial = ref<Material | null>(null)

  const addMaterial = (material: Omit<Material, 'id'>) => {
    const newMaterial: Material = {
      ...material,
      id: `material_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    materials.value.push(newMaterial)
    return newMaterial
  }

  const updateMaterial = (id: string, updates: Partial<Material>) => {
    const index = materials.value.findIndex(m => m.id === id)
    if (index !== -1) {
      materials.value[index] = { ...materials.value[index], ...updates }
    }
  }

  const removeMaterial = (id: string) => {
    const index = materials.value.findIndex(m => m.id === id)
    if (index !== -1) {
      materials.value.splice(index, 1)
    }
  }

  const setCurrentMaterial = (material: Material | null) => {
    currentMaterial.value = material
  }

  const getMaterialById = (id: string) => {
    return materials.value.find(m => m.id === id)
  }

  return {
    materials,
    currentMaterial,
    addMaterial,
    updateMaterial,
    removeMaterial,
    setCurrentMaterial,
    getMaterialById
  }
})