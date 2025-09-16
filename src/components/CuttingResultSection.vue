<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-900">切割示意图</h2>
      <!-- 操作按钮组 -->
      <div class="flex space-x-3">
        <!-- 生成排版按钮 -->
        <button
          @click="generateCuttingPlan"
          :disabled="!canGenerate"
          class="inline-flex items-center px-6 py-2 text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
          </svg>
          生成切割方案
        </button>
        <!-- 导出按钮 -->
        <button
          @click="exportPNG"
          :disabled="!hasCuttingResult"
          class="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          导出PNG
        </button>
        <button
          @click="exportReport"
          :disabled="!hasCuttingResult"
          class="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          导出报告
        </button>
      </div>
    </div>
    
    <!-- 切割结果显示区域 -->
    <div class="border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 min-h-96">
      <!-- 无结果时的占位符 -->
      <div v-if="!hasCuttingResult" class="flex items-center justify-center h-96">
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">暂无切割方案</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ getPlaceholderText() }}
          </p>
        </div>
      </div>

      <!-- 有结果时展示切割方案 -->
      <div v-else class="w-full h-full p-4" id="cutting-results-container" data-container="cutting-results-container">
        <!-- 统计信息栏 -->
        <CuttingStatistics 
          v-if="cuttingResults && cuttingResults.length > 0" 
          :cuttingResults="cuttingResults" 
        />

        <!-- 切割方案可视化 -->
        <div class="space-y-6">
          <div 
            v-for="(result, index) in cuttingResults" 
            :key="result.materialId" 
            class="bg-white rounded-lg p-4 shadow-sm"
          >
            <h5 class="text-lg font-medium text-gray-900 mb-3">
              料板 {{ index + 1 }} - {{ getMaterialName(result.materialId, result) }}
              <span class="text-sm font-normal text-gray-500 ml-2">
                (利用率: {{ (100 - result.wastePercentage).toFixed(1) }}%, 切割件: {{ result.cuts.length }})
              </span>
            </h5>
            
            <!-- SVG 切割示意图 -->
            <CuttingVisualization 
              :result="result"
              :materials="materials || []"
              :items="items || []"
              :showDebugInfo="true"
            />
            
            <!-- 切割清单 -->
            <CuttingList 
              :result="result"
              :items="items || []"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CuttingResult, Material, CuttingItem } from '@/models/types'
import { useMaterialStore } from '@/store/material'
import CuttingStatistics from '@/components/ui/CuttingStatistics.vue'
import CuttingVisualization from '@/components/ui/CuttingVisualization.vue'
import CuttingList from '@/components/ui/CuttingList.vue'
import { getMaterialName as getMaterialNameUtil } from '@/utils/cuttingVisualUtils'

const materialStore = useMaterialStore()

// Props
const props = defineProps<{
  hasCuttingResult: boolean
  cuttingResults?: CuttingResult[]
  materials?: Material[]
  items?: CuttingItem[]
  canGenerate?: boolean
}>()

// Emits
const emit = defineEmits<{
  exportPNG: []
  exportReport: []
  generateCuttingPlan: []
}>()

// 生成切割方案方法
const generateCuttingPlan = () => {
  emit('generateCuttingPlan')
}

// 导出功能方法
const exportPNG = () => {
  emit('exportPNG')
}

const exportReport = () => {
  emit('exportReport')
}

// 获取占位符文本
const getPlaceholderText = (): string => {
  if (!props.materials || props.materials.length === 0) {
    return '请先添加原料板材'
  } else if (!props.items || props.items.length === 0) {
    return '请先添加切割清单'
  } else if (!materialStore.selectedMaterial) {
    return '请在"原料配置"中选择要使用的料板规格'
  } else if (props.canGenerate) {
    return '点击右上角"生成切割方案"按钮开始规划'
  } else {
    return '请完成所有配置后再进行切割规划'
  }
}

// 获取材料名称（使用工具函数）
const getMaterialName = (materialId: string, result?: CuttingResult): string => {
  return getMaterialNameUtil(materialId, props.materials || [], result)
}
</script>