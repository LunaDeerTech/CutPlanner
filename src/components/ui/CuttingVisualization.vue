<template>
  <div class="border border-gray-200 rounded bg-white overflow-auto">
    <!-- 调试信息 -->
    <div class="text-xs text-gray-400 mb-4 p-3 bg-gray-50 rounded" v-if="showDebugInfo">
      <div><strong>调试信息:</strong></div>
      <div>• 材料ID: {{ result.materialId }}</div>
      <div>• 切割件数: {{ result.cuts.length }}</div>
      <div>• SVG尺寸: {{ svgWidth }}×{{ svgHeight }}</div>
      <div>• 缩放比例: {{ scaleFactor.toFixed(4) }}</div>
      <div>• 材料数据: {{ material ? '✓找到' : '✗未找到' }}</div>
      <div v-if="result.cuts.length > 0">
        • 第一个切割件: {{ result.cuts[0].x }},{{ result.cuts[0].y }} {{ result.cuts[0].width }}×{{ result.cuts[0].height }}
      </div>
    </div>
    
    <!-- SVG 切割示意图 -->
    <svg
      :width="svgWidth"
      :height="svgHeight"
      :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
      class="border border-gray-300"
    >
      <!-- 材料边框 -->
      <rect
        x="2"
        y="2"
        :width="svgWidth - 4"
        :height="svgHeight - 4"
        fill="none"
        stroke="#374151"
        stroke-width="2"
      />
      
      <!-- 切割件 -->
      <g v-for="(cut, cutIndex) in result.cuts" :key="cut.id">
        <!-- 切割件矩形 -->
        <rect
          :x="scaledCuts[cutIndex].x"
          :y="scaledCuts[cutIndex].y"
          :width="scaledCuts[cutIndex].width"
          :height="scaledCuts[cutIndex].height"
          :fill="getCutColor(cutIndex)"
          :stroke="getCutBorderColor(cutIndex)"
          stroke-width="1"
          fill-opacity="0.7"
        />
        
        <!-- 切割件标签 -->
        <text
          :x="scaledCuts[cutIndex].x + scaledCuts[cutIndex].width / 2"
          :y="scaledCuts[cutIndex].y + scaledCuts[cutIndex].height / 2"
          text-anchor="middle"
          dominant-baseline="middle"
          class="text-xs font-medium"
          fill="#1f2937"
        >
          {{ getCutLabel(cut, props.items) }}
        </text>
        
        <!-- 尺寸标注 -->
        <text
          :x="scaledCuts[cutIndex].x + scaledCuts[cutIndex].width / 2"
          :y="scaledCuts[cutIndex].y + scaledCuts[cutIndex].height / 2 + 12"
          text-anchor="middle"
          class="text-xs"
          fill="#6b7280"
        >
          {{ cut.width }}×{{ cut.height }}
        </text>
      </g>
      
      <!-- 材料尺寸标注 -->
      <text
        :x="svgWidth / 2"
        y="20"
        text-anchor="middle"
        class="text-sm font-medium"
        fill="#1f2937"
      >
        {{ materialDimensions }}
      </text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import type { CuttingResult, Material, CuttingItem } from '@/models/types'
import { computed } from 'vue'
import {
  findMaterialByResultId,
  getSvgWidth,
  getSvgHeight,
  getScaleFactor,
  scaleCoordinate,
  scaleDimension,
  getMaterialDimensions,
  getCutColor,
  getCutBorderColor,
  getCutLabel
} from '@/utils/cuttingVisualUtils'

// Props
const props = defineProps<{
  result: CuttingResult
  materials: Material[]
  items?: CuttingItem[]
  showDebugInfo?: boolean
}>()

// 计算材料信息
const material = computed(() => findMaterialByResultId(props.result.materialId, props.materials))

// 计算SVG尺寸
const svgWidth = computed(() => getSvgWidth(props.result.materialId, props.materials))
const svgHeight = computed(() => getSvgHeight(props.result.materialId, props.materials))
const scaleFactor = computed(() => getScaleFactor(props.result.materialId, props.materials))

// 计算材料尺寸文本
const materialDimensions = computed(() => getMaterialDimensions(props.result.materialId, props.materials))

// 计算所有切割件的缩放坐标和尺寸
const scaledCuts = computed(() => {
  return props.result.cuts.map(cut => ({
    x: scaleCoordinate(cut.x, props.result.materialId, props.materials),
    y: scaleCoordinate(cut.y, props.result.materialId, props.materials),
    width: scaleDimension(cut.width, props.result.materialId, props.materials),
    height: scaleDimension(cut.height, props.result.materialId, props.materials)
  }))
})
</script>