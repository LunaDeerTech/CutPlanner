<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面标题 -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
        <h1 class="text-3xl font-bold text-gray-900">CutPlanner</h1>
        <p class="mt-2 text-gray-600">板材切割规划工具 - 减少废料，提升效率</p>
        
        <!-- 设置按钮 -->
        <button
          @click="showSettingsModel = true"
          class="absolute top-6 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="设置"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <!-- 1. 原料配置区域 -->
      <MaterialSection />

      <!-- 2. 切割清单区域 -->
      <CuttingListSection
        :cutting-items="cuttingStore.items"
        @add-item="handleAddCuttingItem"
        @edit-item="handleEditCuttingItem"
        @update-item="handleUpdateCuttingItem"
        @delete-item="handleDeleteCuttingItem"
        @download-template="handleDownloadTemplate"
        @upload-template="handleUploadTemplate"
      />

      <!-- 3. 参数配置区域 -->
      <SettingsSection
        :settings="settingsStore.settings"
        @update-settings="handleUpdateSettings"
      />

      <!-- 4. 生成排版按钮 -->
      <div class="text-center">
        <button
          @click="generateCuttingPlan"
          :disabled="!canGenerate"
          class="inline-flex items-center px-8 py-4 text-lg font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
          </svg>
          生成切割方案
        </button>
        <p v-if="!canGenerate" class="mt-2 text-sm text-gray-500">
          请先添加原料和切割清单
        </p>
      </div>

      <!-- 5. 切割示意图区域 -->
      <CuttingResultSection
        :has-cutting-result="hasCuttingResult"
        v-bind="hasCuttingResult && cuttingResult ? { cuttingResult } : {}"
        @export-p-n-g="handleExportPNG"
        @export-report="handleExportReport"
      />
    </div>

    <!-- 设置弹窗 -->
    <SettingsModel
      :is-visible="showSettingsModel"
      @close="showSettingsModel = false"
      @save="handleSettingsSaved"
    />

    <!-- 切割项目弹窗 -->
    <CuttingItemModel
      :is-visible="showCuttingItemModel"
      :edit-item="editingCuttingItem"
      @close="showCuttingItemModel = false"
      @save="handleSaveCuttingItem"
      @update="handleUpdateCuttingItem"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMaterialStore } from '@/store/material'
import { useCuttingStore } from '@/store/cutting'
import { useSettingsStore } from '@/store/settings'
import MaterialSection from '@/components/MaterialSection.vue'
import CuttingListSection from '@/components/CuttingListSection.vue'
import SettingsSection from '@/components/SettingsSection.vue'
import CuttingResultSection from '@/components/CuttingResultSection.vue'
import SettingsModel from '@/components/SettingsModel.vue'
import CuttingItemModel from '@/components/CuttingItemModel.vue'
import type { CuttingItem, CuttingSettings } from '@/models/types'

const materialStore = useMaterialStore()
const cuttingStore = useCuttingStore()
const settingsStore = useSettingsStore()

// 设置弹窗显示状态
const showSettingsModel = ref(false)

// 切割项目弹窗状态
const showCuttingItemModel = ref(false)
const editingCuttingItem = ref<CuttingItem | null>(null)

// 切割结果状态
const hasCuttingResult = ref(false)
const cuttingResult = ref<{
  utilizationRate: number
  wasteArea: number
  cutCount: number
}>()

// 计算属性：是否可以生成切割方案
const canGenerate = computed(() => {
  return materialStore.materials.length > 0 && cuttingStore.items.length > 0
})

// 切割清单相关方法
const handleAddCuttingItem = () => {
  editingCuttingItem.value = null
  showCuttingItemModel.value = true
}

const handleEditCuttingItem = (item: CuttingItem) => {
  editingCuttingItem.value = item
  showCuttingItemModel.value = true
}

const handleUpdateCuttingItem = (id: string, updates: Partial<CuttingItem>) => {
  cuttingStore.updateItem(id, updates)
  console.log('切割项目已更新:', updates)
}

const handleDeleteCuttingItem = (item: CuttingItem) => {
  cuttingStore.removeItem(item.id)
  console.log(`切割项目 "${item.name || '未命名'}" 已删除`)
}

const handleSaveCuttingItem = (item: Omit<CuttingItem, 'id'>) => {
  const newItem = cuttingStore.addItem(item)
  console.log('切割项目已添加:', newItem)
}

const handleDownloadTemplate = () => {
}

const handleUploadTemplate = () => {
  // TODO: 上传模板解析
  alert('上传模板功能开发中...')
}

// 参数配置相关方法
const handleUpdateSettings = (updatedSettings: Partial<CuttingSettings>) => {
  settingsStore.updateSettings(updatedSettings)
  console.log('设置已更新:', settingsStore.settings)
}

// 设置保存处理
const handleSettingsSaved = (settings: CuttingSettings) => {
  console.log('设置已保存:', settings)
}

// 生成切割方案
const generateCuttingPlan = () => {
  if (!canGenerate.value) {
    alert('请先添加原料和切割清单')
    return
  }
  
  // TODO: 执行切割算法
  alert('生成切割方案功能开发中...')
  // 模拟生成结果
  hasCuttingResult.value = true
  cuttingResult.value = {
    utilizationRate: 0.85,
    wasteArea: 15000,
    cutCount: 12
  }
}

// 导出功能
const handleExportPNG = () => {
  if (!hasCuttingResult.value) {
    alert('请先生成切割方案')
    return
  }
  // TODO: 导出PNG
  alert('导出PNG功能开发中...')
}

const handleExportReport = () => {
  if (!hasCuttingResult.value) {
    alert('请先生成切割方案')
    return
  }
  // TODO: 导出报告
  alert('导出报告功能开发中...')
}
</script>

<style scoped>
/* Enhanced homepage with navigation and material preview */
</style>