<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-900">切割示意图</h2>
      <!-- 导出按钮 -->
      <div class="flex space-x-3">
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
    <div class="border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 min-h-96 flex items-center justify-center">
      <div v-if="!hasCuttingResult" class="text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">暂无切割方案</h3>
        <p class="mt-1 text-sm text-gray-500">点击"生成切割方案"按钮开始规划</p>
      </div>
      <div v-else class="text-center w-full">
        <div class="text-gray-600 mb-4">切割示意图将在此显示</div>
        <p class="text-sm text-gray-500 mb-6">（功能开发中...）</p>
        
        <!-- 临时的结果统计信息 -->
        <div v-if="cuttingResult" class="bg-white rounded-lg p-4 max-w-md mx-auto">
          <h4 class="text-sm font-medium text-gray-900 mb-2">统计信息</h4>
          <div class="space-y-1 text-sm text-gray-600">
            <div class="flex justify-between">
              <span>原料利用率:</span>
              <span class="font-medium">{{ (cuttingResult.utilizationRate * 100).toFixed(1) }}%</span>
            </div>
            <div class="flex justify-between">
              <span>废料面积:</span>
              <span class="font-medium">{{ cuttingResult.wasteArea.toFixed(2) }} mm²</span>
            </div>
            <div class="flex justify-between">
              <span>切割次数:</span>
              <span class="font-medium">{{ cuttingResult.cutCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

// 定义切割结果类型
interface CuttingResultSummary {
  utilizationRate: number
  wasteArea: number
  cutCount: number
  // 这里可以添加更多结果属性
}

// Props
defineProps<{
  hasCuttingResult: boolean
  cuttingResult?: CuttingResultSummary
}>()

// Emits
const emit = defineEmits<{
  exportPNG: []
  exportReport: []
}>()

// 导出功能方法
const exportPNG = () => {
  emit('exportPNG')
}

const exportReport = () => {
  emit('exportReport')
}
</script>