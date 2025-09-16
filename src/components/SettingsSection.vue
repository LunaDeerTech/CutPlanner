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
        <div class="relative template-menu-container">
          <button
            @click="showRotationMenu = !showRotationMenu"
            class="w-full text-left px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white flex justify-between items-center"
          >
            <span class="text-sm text-gray-700">{{ settings.allowRotation ? '允许旋转-相邻的两块板可能存在交错' : '不允许旋转-始终按长度方向顺着木纹裁板' }}</span>
            <svg class="w-4 h-4 ml-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <div v-if="showRotationMenu" class="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10">
            <button @click="onSelectRotation(false)" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">不允许旋转-始终按长度方向顺着木纹裁板</button>
            <button @click="onSelectRotation(true)" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">允许旋转-相邻的两块板可能存在交错</button>
          </div>
        </div>
      </div>
      
      <!-- 料板方向 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">料板方向</label>
        <div class="relative template-menu-container">
          <button
            @click="showOrientationMenu = !showOrientationMenu"
            class="w-full text-left px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white flex justify-between items-center"
          >
            <span class="text-sm text-gray-700">{{ settings.materialOrientation === MaterialOrientation.VERTICAL ? '竖向 - 料板高度大于宽度' : '横向 - 料板宽度大于高度' }}</span>
            <svg class="w-4 h-4 ml-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <div v-if="showOrientationMenu" class="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10">
            <button @click="onSelectOrientation(MaterialOrientation.VERTICAL)" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">竖向 - 料板高度大于宽度</button>
            <button @click="onSelectOrientation(MaterialOrientation.HORIZONTAL)" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">横向 - 料板宽度大于高度</button>
          </div>
        </div>
      </div>
      
      <!-- 算法选择 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">优化算法</label>
        <div class="relative template-menu-container">
          <button
            @click="showOptimizationMenu = !showOptimizationMenu"
            class="w-full text-left px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white flex justify-between items-center"
          >
            <span class="text-sm text-gray-700">{{ settings.optimizationStrategy === 'first-fit' ? '原点适应' : settings.optimizationStrategy }}</span>
            <svg class="w-4 h-4 ml-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <div v-if="showOptimizationMenu" class="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10">
            <button @click="onSelectOptimization('first-fit')" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">原点适应</button>
            <button @click="onSelectOptimization('best-fit')" class="w-full text-left px-4 py-2 text-sm text-gray-400" disabled>最佳适应 (开发中)</button>
            <button @click="onSelectOptimization('bottom-left')" class="w-full text-left px-4 py-2 text-sm text-gray-400" disabled>左下角 (开发中)</button>
            <button @click="onSelectOptimization('genetic')" class="w-full text-left px-4 py-2 text-sm text-gray-400" disabled>遗传算法 (开发中)</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, onMounted, onUnmounted } from 'vue'
import type { CuttingSettings } from '@/models/types'
import { MaterialOrientation } from '@/models/types'

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

// Dropdown state and helpers (v-if based dropdowns similar to TemplateDropdownMenu.vue)
const showRotationMenu = ref(false)
const showOrientationMenu = ref(false)
const showOptimizationMenu = ref(false)

const onSelectRotation = (value: boolean) => {
  showRotationMenu.value = false
  emit('updateSettings', { allowRotation: value })
}

const onSelectOrientation = (value: MaterialOrientation) => {
  showOrientationMenu.value = false
  emit('updateSettings', { materialOrientation: value })
}

const onSelectOptimization = (value: CuttingSettings['optimizationStrategy']) => {
  showOptimizationMenu.value = false
  emit('updateSettings', { optimizationStrategy: value })
}

// click outside handler to close menus
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.template-menu-container')) {
    showRotationMenu.value = false
    showOrientationMenu.value = false
    showOptimizationMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>