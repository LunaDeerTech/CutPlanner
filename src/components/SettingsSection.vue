<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h2 class="text-xl font-semibold text-gray-900 mb-6">参数配置</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- 锯片厚度 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">锯片厚度</label>
        <div class="relative">
          <input
            :value="settings.kerfWidth"
            @input="updateKerfWidth"
            type="number"
            min="0"
            step="0.1"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="3.0"
          />
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span class="text-gray-500 sm:text-sm">mm</span>
          </div>
        </div>
      </div>
      
      <!-- 留边距 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">留边距</label>
        <div class="relative">
          <input
            :value="settings.margin"
            @input="updateMargin"
            type="number"
            min="0"
            step="0.1"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="5.0"
          />
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span class="text-gray-500 sm:text-sm">mm</span>
          </div>
        </div>
      </div>
      
      <!-- 允许旋转 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">旋转</label>
        <select
          :value="settings.allowRotation ? 'true' : 'false'"
          @change="updateAllowRotation"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="false">不允许旋转-始终按长度方向顺着木纹裁板</option>
          <option value="true">允许旋转-相邻的两块板可能存在交错</option>
        </select>
      </div>
      
      <!-- 算法选择 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">优化算法</label>
        <select
          :value="settings.optimizationStrategy"
          @change="updateOptimizationStrategy"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="first-fit">首次适应</option>
          <option value="best-fit">最佳适应</option>
          <option value="bottom-left">左下角</option>
          <option value="genetic">遗传算法</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { CuttingSettings } from '@/models/types'

// Props
defineProps<{
  settings: CuttingSettings
}>()

// Emits
const emit = defineEmits<{
  updateSettings: [settings: Partial<CuttingSettings>]
}>()

// 设置更新方法
const updateKerfWidth = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseFloat(target.value) || 0
  emit('updateSettings', { kerfWidth: value })
}

const updateMargin = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseFloat(target.value) || 0
  emit('updateSettings', { margin: value })
}

const updateAllowRotation = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('updateSettings', { allowRotation: target.value === 'true' })
}

const updateOptimizationStrategy = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('updateSettings', { optimizationStrategy: target.value as CuttingSettings['optimizationStrategy'] })
}
</script>