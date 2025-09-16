<template>
  <div class="bg-white rounded-lg shadow p-6">
    <!-- 标题栏和操作按钮 -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-900">切割清单</h2>
      <div class="flex space-x-3">
        <button
          @click="addCuttingItem"
          class="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          添加
        </button>
        <TemplateDropdownMenu @download-template="handleDownloadTemplate" />
        <button
          @click="uploadTemplate"
          class="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
          </svg>
          上传清单
        </button>
      </div>
    </div>
    
    <!-- 切割清单内容 -->
    <CuttingItemsTable 
      v-if="cuttingItems.length > 0"
      :items="cuttingItems"
      :unit="settingsStore.settings.unit"
      @update-item="handleUpdateItem"
      @delete-item="handleDeleteItem"
    />
    
    <EmptyState 
      v-else
      title="暂无切割清单"
      description="点击上方按钮添加切割项目或上传模板"
    />
    
    <!-- 导入对话框 -->
    <ImportDialog 
      :is-visible="showImportDialog" 
      @close="showImportDialog = false"
      @import="handleImportItems"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSettingsStore } from '@/store/settings'
import TemplateDropdownMenu from './ui/TemplateDropdownMenu.vue'
import CuttingItemsTable from './ui/CuttingItemsTable.vue'
import EmptyState from './ui/EmptyState.vue'
import ImportDialog from './ui/ImportDialog.vue'
import type { CuttingItem } from '@/models/types'

const settingsStore = useSettingsStore()

// Props
defineProps<{
  cuttingItems: CuttingItem[]
}>()

// Emits
const emit = defineEmits<{
  addItem: []
  editItem: [item: CuttingItem]
  deleteItem: [item: CuttingItem]
  updateItem: [id: string, updates: Partial<CuttingItem>]
  importItems: [items: CuttingItem[]]
  downloadTemplate: []
  uploadTemplate: []
}>()

// 响应式状态
const showImportDialog = ref(false)

// 事件处理方法
const addCuttingItem = () => {
  emit('addItem')
}

const handleDownloadTemplate = (_type: 'sample' | 'empty') => {
  emit('downloadTemplate')
}

const handleUpdateItem = (id: string, updates: Partial<CuttingItem>) => {
  emit('updateItem', id, updates)
}

const handleDeleteItem = (item: CuttingItem) => {
  emit('deleteItem', item)
}

const uploadTemplate = () => {
  showImportDialog.value = true
}

const handleImportItems = (items: CuttingItem[]) => {
  emit('importItems', items)
}
</script>