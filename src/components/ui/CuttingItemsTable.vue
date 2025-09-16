<template>
  <div class="overflow-hidden">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">长度</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">宽度</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数量</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div class="flex items-center">
              <span>旋转方向</span>
              <div
                class="ml-2 relative"
                @mouseenter="showRotationTip = true"
                @mouseleave="showRotationTip = false"
              >
                <!-- info icon -->
                <svg class="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>

                <div v-if="showRotationTip" class="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-20 flex flex-col items-center pointer-events-none">
                  <!-- arrow pointing up -->
                  <svg class="w-3 h-2 text-gray-800" viewBox="0 0 6 4" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M0 4 L3 0 L6 4 Z" fill="currentColor"></path>
                  </svg>
                  <div class="bg-gray-800 text-white text-sm rounded py-2 px-3 max-w-2xl min-w-[220px] text-left leading-tight whitespace-normal mt-1">
                    自动则取决于下方的参数配置，由算法决定是否旋转；固定默认方向则始终按默认方向排版，不受算法影响；固定90°则将目标板旋转90°后排版。
                  </div>
                </div>
              </div>
            </div>
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <InlineEditRow
          v-for="item in items"
          :key="item.id"
          :item="item"
          :unit="unit"
          :is-editing="editingItemId === item.id"
          @edit="handleEdit"
          @save="handleSave"
          @cancel="handleCancel"
          @delete="handleDelete"
        />
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import InlineEditRow from './InlineEditRow.vue'
import type { CuttingItem } from '@/models/types'

// Props
defineProps<{
  items: CuttingItem[]
  unit: 'mm' | 'inch'
}>()

// Events
const emit = defineEmits<{
  updateItem: [id: string, updates: Partial<CuttingItem>]
  deleteItem: [item: CuttingItem]
}>()

// 编辑状态
const editingItemId = ref<string | null>(null)
// tooltip state for rotation info in header
const showRotationTip = ref(false)

// 处理方法
const handleEdit = (item: CuttingItem) => {
  editingItemId.value = item.id
}

const handleSave = (id: string, updates: Partial<CuttingItem>) => {
  emit('updateItem', id, updates)
  editingItemId.value = null
}

const handleCancel = () => {
  editingItemId.value = null
}

const handleDelete = (item: CuttingItem) => {
  emit('deleteItem', item)
}
</script>