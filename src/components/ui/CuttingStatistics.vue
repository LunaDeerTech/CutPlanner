<template>
  <div class="bg-white rounded-lg p-4 mb-4 shadow-sm">
    <h4 class="text-sm font-medium text-gray-900 mb-3">切割方案统计</h4>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div class="text-center">
        <div class="text-2xl font-bold text-blue-600">{{ cuttingResults.length }}</div>
        <div class="text-gray-600">料板数量</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-green-600">{{ averageUtilization.toFixed(1) }}%</div>
        <div class="text-gray-600">平均利用率</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-orange-600">{{ totalCuts }}</div>
        <div class="text-gray-600">切割件数</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-red-600">{{ formattedWasteArea.value }}</div>
        <div class="text-gray-600">总废料面积 ({{ formattedWasteArea.unit }})</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CuttingResult } from '@/models/types'
import { computed } from 'vue'
import { useSettingsStore } from '@/store/settings'
import { formatArea, formatNumber } from '@/utils/unitFormatter'

// Props
const props = defineProps<{
  cuttingResults: CuttingResult[]
}>()

// Stores
const settingsStore = useSettingsStore()

// 计算平均利用率
const averageUtilization = computed(() => {
  if (props.cuttingResults.length === 0) return 0
  const totalWaste = props.cuttingResults.reduce((sum, r) => sum + r.wastePercentage, 0)
  return 100 - (totalWaste / props.cuttingResults.length)
})

// 计算总切割件数
const totalCuts = computed(() => {
  return props.cuttingResults.reduce((sum, r) => sum + r.cuts.length, 0)
})

// 计算总废料面积
const totalWasteArea = computed(() => {
  return props.cuttingResults.reduce((sum, r) => sum + r.totalWasteArea, 0)
})

// 格式化废料面积显示
const formattedWasteArea = computed(() => {
  const area = totalWasteArea.value
  const unit = settingsStore.settings.unit
  
  // 使用自适应单位格式化
  const formatted = formatArea(area, { 
    unit, 
    precision: 0, 
    adaptiveUnit: true 
  })
  
  // 分离数值和单位
  const match = formatted.match(/^([\d,.-]+)(.+)$/)
  if (match) {
    return {
      value: formatNumber(parseFloat(match[1].replace(/,/g, '')), 0),
      unit: match[2]
    }
  }
  
  // 回退方案
  return {
    value: formatNumber(area, 0),
    unit: `${unit}²`
  }
})
</script>