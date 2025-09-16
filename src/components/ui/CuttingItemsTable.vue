<template>
  <div class="overflow-hidden">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">长度</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">宽度</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数量</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">旋转方向</th>
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