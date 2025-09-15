<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面标题 -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 class="text-3xl font-bold text-gray-900">CutPlanner</h1>
        <p class="mt-2 text-gray-600">专业木板切割规划工具</p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <!-- 1. 原料配置区域 -->
      <MaterialSection />

      <!-- 2. 切割清单区域 -->
      <CuttingListSection
        :cutting-items="cuttingItems"
        @add-item="handleAddCuttingItem"
        @edit-item="handleEditCuttingItem"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMaterialStore } from '@/store/material'
import { useSettingsStore } from '@/store/settings'
import MaterialSection from '@/components/MaterialSection.vue'
import CuttingListSection from '@/components/CuttingListSection.vue'
import SettingsSection from '@/components/SettingsSection.vue'
import CuttingResultSection from '@/components/CuttingResultSection.vue'
import type { CuttingItem, CuttingSettings } from '@/models/types'

const materialStore = useMaterialStore()
const settingsStore = useSettingsStore()

// 切割清单数据（临时模拟数据，后续会从store获取）
const cuttingItems = ref<CuttingItem[]>([])

// 切割结果状态
const hasCuttingResult = ref(false)
const cuttingResult = ref<{
  utilizationRate: number
  wasteArea: number
  cutCount: number
}>()

// 计算属性：是否可以生成切割方案
const canGenerate = computed(() => {
  return materialStore.materials.length > 0 && cuttingItems.value.length > 0
})

// 切割清单相关方法
const handleAddCuttingItem = () => {
  // TODO: 弹出表单输入目标板尺寸与数量
  alert('添加切割项目功能开发中...')
}

const handleEditCuttingItem = (item: CuttingItem) => {
  // TODO: 编辑切割项目
  console.log('编辑切割项目:', item)
  alert('编辑切割项目功能开发中...')
}

const handleDeleteCuttingItem = (item: CuttingItem) => {
  const index = cuttingItems.value.findIndex(ci => ci.id === item.id)
  if (index > -1) {
    cuttingItems.value.splice(index, 1)
    console.log(`切割项目 "${item.name || '未命名'}" 已删除`)
  }
}

const handleDownloadTemplate = () => {
  // TODO: 下载Excel模板
  alert('下载模板功能开发中...')
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