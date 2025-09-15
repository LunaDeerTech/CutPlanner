import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CuttingSettings } from '@/models/types'

export const useSettingsStore = defineStore('settings', () => {
  // Default cutting settings
  const defaultSettings: CuttingSettings = {
    unit: 'mm', // 默认使用毫米
    kerfWidth: 3, // 3mm default kerf width
    margin: 5, // 5mm default margin
    allowRotation: true,
    optimizationStrategy: 'first-fit' // 使用已实现的算法
  }

  const settings = ref<CuttingSettings>({ ...defaultSettings })

  const updateSettings = (newSettings: Partial<CuttingSettings>) => {
    settings.value = { ...settings.value, ...newSettings }
    saveToLocalStorage()
  }

  const resetToDefaults = () => {
    settings.value = { ...defaultSettings }
    saveToLocalStorage()
  }

  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('cutplanner-settings', JSON.stringify(settings.value))
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('cutplanner-settings')
      if (saved) {
        const parsedSettings = JSON.parse(saved)
        settings.value = { ...defaultSettings, ...parsedSettings }
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error)
      settings.value = { ...defaultSettings }
    }
  }

  // Load settings on initialization
  loadFromLocalStorage()

  return {
    settings,
    updateSettings,
    resetToDefaults,
    saveToLocalStorage,
    loadFromLocalStorage
  }
})