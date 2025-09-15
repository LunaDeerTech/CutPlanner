import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Material } from '@/models/types'
import { validateDimension, validateThickness, validateRequired } from '@/utils/validation'
import { LOCAL_STORAGE_KEYS } from '@/constants'
import { useSettingsStore } from '@/store/settings'

export const useMaterialStore = defineStore('material', () => {
  const settingsStore = useSettingsStore()
  const materials = ref<Material[]>([])
  const currentMaterial = ref<Material | null>(null)
  const selectedMaterial = ref<Material | null>(null)
  
  // 从localStorage加载数据
  const loadMaterials = () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.MATERIALS)
      if (stored) {
        materials.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load materials from localStorage:', error)
    }
  }
  
  // 保存到localStorage
  const saveMaterials = () => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.MATERIALS, JSON.stringify(materials.value))
    } catch (error) {
      console.error('Failed to save materials to localStorage:', error)
    }
  }
  
  // 验证材料数据
  const validateMaterial = (material: Omit<Material, 'id'>) => {
    const errors: Record<string, string> = {}
    
    // 验证名称
    const nameValidation = validateRequired(material.name, '材料名称')
    if (!nameValidation.isValid) {
      errors['name'] = nameValidation.error!
    }
    
    // 验证宽度
    const widthValidation = validateDimension(material.width, settingsStore.settings.unit)
    if (!widthValidation.isValid) {
      errors['width'] = widthValidation.error!
    }
    
    // 验证高度
    const heightValidation = validateDimension(material.height, settingsStore.settings.unit)
    if (!heightValidation.isValid) {
      errors['height'] = heightValidation.error!
    }
    
    // 验证厚度
    const thicknessValidation = validateThickness(material.thickness, settingsStore.settings.unit)
    if (!thicknessValidation.isValid) {
      errors['thickness'] = thicknessValidation.error!
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  const addMaterial = (material: Omit<Material, 'id'>) => {
    const validation = validateMaterial(material)
    if (!validation.isValid) {
      throw new Error(`验证失败: ${Object.values(validation.errors).join(', ')}`)
    }
    
    const newMaterial: Material = {
      ...material,
      id: `material_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    materials.value.push(newMaterial)
    saveMaterials()
    return newMaterial
  }

  const updateMaterial = (id: string, updates: Partial<Material>) => {
    const index = materials.value.findIndex(m => m.id === id)
    if (index !== -1) {
      const updatedMaterial = { ...materials.value[index], ...updates }
      const validation = validateMaterial(updatedMaterial)
      if (!validation.isValid) {
        throw new Error(`验证失败: ${Object.values(validation.errors).join(', ')}`)
      }
      materials.value[index] = updatedMaterial
      saveMaterials()
    }
  }

  const removeMaterial = (id: string) => {
    const index = materials.value.findIndex(m => m.id === id)
    if (index !== -1) {
      materials.value.splice(index, 1)
      saveMaterials()
    }
  }

  const setCurrentMaterial = (material: Material | null) => {
    currentMaterial.value = material
  }

  const setSelectedMaterial = (material: Material | null) => {
    selectedMaterial.value = material
  }

  const getMaterialById = (id: string) => {
    return materials.value.find(m => m.id === id)
  }
  
  // Computed properties
  const materialCount = computed(() => materials.value.length)
  
  // 由于所有材料现在都使用同一个单位（来自settings），不再需要按单位分组
  // 如果以后需要此功能，可以根据其他属性分组，如材料类型
  const materialsByType = computed(() => {
    const grouped: Record<string, Material[]> = {}
    materials.value.forEach(material => {
      const type = material.materialType || '未分类'
      if (!grouped[type]) {
        grouped[type] = []
      }
      grouped[type].push(material)
    })
    return grouped
  })
  
  // 初始化时加载数据
  loadMaterials()

  return {
    materials,
    currentMaterial,
    selectedMaterial,
    materialCount,
    materialsByType,
    addMaterial,
    updateMaterial,
    removeMaterial,
    setCurrentMaterial,
    setSelectedMaterial,
    getMaterialById,
    validateMaterial,
    loadMaterials,
    saveMaterials
  }
})