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
            {{ canGenerate ? '点击右上角"生成切割方案"按钮开始规划' : '请先添加原料和切割清单' }}
          </p>
        </div>
      </div>

      <!-- 有结果时展示切割方案 -->
      <div v-else class="w-full h-full p-4">
        <!-- 统计信息栏 -->
        <div v-if="cuttingResults && cuttingResults.length > 0" class="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <h4 class="text-sm font-medium text-gray-900 mb-3">切割方案统计</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ cuttingResults.length }}</div>
              <div class="text-gray-600">料板数量</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">
                {{ (100 - (cuttingResults.reduce((sum, r) => sum + r.wastePercentage, 0) / cuttingResults.length)).toFixed(1) }}%
              </div>
              <div class="text-gray-600">平均利用率</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-orange-600">
                {{ cuttingResults.reduce((sum, r) => sum + r.cuts.length, 0) }}
              </div>
              <div class="text-gray-600">切割件数</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-red-600">
                {{ cuttingResults.reduce((sum, r) => sum + r.totalWasteArea, 0).toFixed(0) }}
              </div>
              <div class="text-gray-600">总废料面积</div>
            </div>
          </div>
        </div>

        <!-- 切割方案可视化 -->
        <div class="space-y-6">
          <div 
            v-for="(result, index) in cuttingResults" 
            :key="result.materialId" 
            class="bg-white rounded-lg p-4 shadow-sm"
          >
            <h5 class="text-lg font-medium text-gray-900 mb-3">
              料板 {{ index + 1 }} - {{ getMaterialName(result.materialId) }}
              <span class="text-sm font-normal text-gray-500 ml-2">
                (利用率: {{ (100 - result.wastePercentage).toFixed(1) }}%)
              </span>
            </h5>
            
            <!-- SVG 切割示意图 -->
            <div class="border border-gray-200 rounded bg-white overflow-auto">
              <svg
                :width="getSvgWidth(result.materialId)"
                :height="getSvgHeight(result.materialId)"
                :viewBox="`0 0 ${getSvgWidth(result.materialId)} ${getSvgHeight(result.materialId)}`"
                class="border border-gray-300"
              >
                <!-- 材料边框 -->
                <rect
                  x="2"
                  y="2"
                  :width="getSvgWidth(result.materialId) - 4"
                  :height="getSvgHeight(result.materialId) - 4"
                  fill="none"
                  stroke="#374151"
                  stroke-width="2"
                />
                
                <!-- 切割件 -->
                <g v-for="(cut, cutIndex) in result.cuts" :key="cut.id">
                  <!-- 切割件矩形 -->
                  <rect
                    :x="scaleCoordinate(cut.x)"
                    :y="scaleCoordinate(cut.y)"
                    :width="scaleDimension(cut.width)"
                    :height="scaleDimension(cut.height)"
                    :fill="getCutColor(cutIndex)"
                    :stroke="getCutBorderColor(cutIndex)"
                    stroke-width="1"
                    fill-opacity="0.7"
                  />
                  
                  <!-- 切割件标签 -->
                  <text
                    :x="scaleCoordinate(cut.x) + scaleDimension(cut.width) / 2"
                    :y="scaleCoordinate(cut.y) + scaleDimension(cut.height) / 2"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    class="text-xs font-medium"
                    fill="#1f2937"
                  >
                    {{ getCutLabel(cut) }}
                  </text>
                  
                  <!-- 尺寸标注 -->
                  <text
                    :x="scaleCoordinate(cut.x) + scaleDimension(cut.width) / 2"
                    :y="scaleCoordinate(cut.y) + scaleDimension(cut.height) / 2 + 12"
                    text-anchor="middle"
                    class="text-xs"
                    fill="#6b7280"
                  >
                    {{ cut.width }}×{{ cut.height }}
                  </text>
                </g>
                
                <!-- 材料尺寸标注 -->
                <text
                  :x="getSvgWidth(result.materialId) / 2"
                  y="20"
                  text-anchor="middle"
                  class="text-sm font-medium"
                  fill="#1f2937"
                >
                  {{ getMaterialDimensions(result.materialId) }}
                </text>
              </svg>
            </div>
            
            <!-- 切割清单 -->
            <div class="mt-4">
              <h6 class="text-sm font-medium text-gray-900 mb-2">切割清单</h6>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div 
                  v-for="(cut, cutIndex) in result.cuts" 
                  :key="cut.id"
                  class="flex items-center space-x-2 p-2 bg-gray-50 rounded"
                >
                  <div 
                    class="w-3 h-3 rounded"
                    :style="{ backgroundColor: getCutColor(cutIndex) }"
                  ></div>
                  <span class="font-medium">{{ getCutLabel(cut) }}</span>
                  <span class="text-gray-500">{{ cut.width }}×{{ cut.height }}</span>
                  <span v-if="cut.rotated" class="text-orange-600 text-xs">(已旋转)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CuttingResult, Material, CuttingItem } from '@/models/types'

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

// SVG 相关计算
const SVG_SCALE = 0.3 // 缩放比例，将实际尺寸缩放到合适的显示大小
const MIN_SVG_SIZE = 200
const MAX_SVG_SIZE = 600

const getSvgWidth = (materialId: string): number => {
  const material = props.materials?.find(m => m.id === materialId)
  if (!material) return MIN_SVG_SIZE
  const scaledWidth = material.width * SVG_SCALE
  return Math.min(Math.max(scaledWidth, MIN_SVG_SIZE), MAX_SVG_SIZE)
}

const getSvgHeight = (materialId: string): number => {
  const material = props.materials?.find(m => m.id === materialId)
  if (!material) return MIN_SVG_SIZE
  const scaledHeight = material.height * SVG_SCALE
  return Math.min(Math.max(scaledHeight, MIN_SVG_SIZE), MAX_SVG_SIZE)
}

const scaleCoordinate = (coordinate: number): number => {
  return coordinate * SVG_SCALE
}

const scaleDimension = (dimension: number): number => {
  return dimension * SVG_SCALE
}

const getMaterialName = (materialId: string): string => {
  const material = props.materials?.find(m => m.id === materialId)
  return material?.name || `材料 ${materialId}`
}

const getMaterialDimensions = (materialId: string): string => {
  const material = props.materials?.find(m => m.id === materialId)
  if (!material) return ''
  return `${material.width} × ${material.height} mm`
}

// 颜色生成
const colors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
]

const getCutColor = (index: number): string => {
  return colors[index % colors.length]
}

const getCutBorderColor = (index: number): string => {
  const color = colors[index % colors.length]
  // 返回更深的颜色作为边框
  const colorMap: Record<string, string> = {
    '#3B82F6': '#1D4ED8',
    '#EF4444': '#DC2626',
    '#10B981': '#059669',
    '#F59E0B': '#D97706',
    '#8B5CF6': '#7C3AED',
    '#EC4899': '#DB2777',
    '#14B8A6': '#0D9488',
    '#F97316': '#EA580C',
    '#6366F1': '#4F46E5',
    '#84CC16': '#65A30D'
  }
  return colorMap[color] || color
}

const getCutLabel = (cut: any): string => {
  // 从 itemId 中提取原始 item 信息
  const originalItemId = cut.itemId.split('_').slice(0, -1).join('_')
  const item = props.items?.find(i => i.id === originalItemId)
  
  if (item?.name) {
    return item.name
  }
  
  // 如果没有名称，显示序号
  const index = cut.itemId.split('_').pop()
  return `件${index}`
}
</script>