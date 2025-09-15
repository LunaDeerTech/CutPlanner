<template>
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
        <span class="font-medium">{{ getCutLabel(cut, props.items) }}</span>
        <span class="text-gray-500">{{ cut.width }}×{{ cut.height }}</span>
        <span v-if="cut.rotated" class="text-orange-600 text-xs">(已旋转)</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CuttingResult, CuttingItem } from '@/models/types'
import { getCutColor, getCutLabel } from '@/utils/cuttingVisualUtils'

// Props
const props = defineProps<{
  result: CuttingResult
  items?: CuttingItem[]
}>()
</script>