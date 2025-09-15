<template>
  <div class="bg-white rounded-lg shadow p-6">
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
        <button
          @click="downloadTemplate"
          class="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          下载模板
        </button>
        <button
          @click="uploadTemplate"
          class="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
          </svg>
          上传模板
        </button>
      </div>
    </div>
    
    <!-- 切割清单列表 -->
    <div v-if="cuttingItems.length > 0" class="overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">长度</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">宽度</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数量</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="item in cuttingItems" :key="item.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.name || '未命名' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.width }}{{ settingsStore.settings.unit }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.height }}{{ settingsStore.settings.unit }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.quantity }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <button 
                @click="editCuttingItem(item)"
                class="text-blue-600 hover:text-blue-900 mr-4"
              >
                编辑
              </button>
              <button 
                @click="deleteCuttingItem(item)"
                class="text-red-600 hover:text-red-900"
              >
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-else class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">暂无切割清单</h3>
      <p class="mt-1 text-sm text-gray-500">点击上方按钮添加切割项目或上传模板</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/store/settings'
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
  downloadTemplate: []
  uploadTemplate: []
}>()

// 切割清单相关方法
const addCuttingItem = () => {
  emit('addItem')
}

const editCuttingItem = (item: CuttingItem) => {
  emit('editItem', item)
}

const deleteCuttingItem = (item: CuttingItem) => {
  const confirmMessage = `确定要删除切割项目"${item.name || '未命名'}"吗？\n\n尺寸：${item.width} × ${item.height} ${settingsStore.settings.unit}\n数量：${item.quantity}\n\n此操作不可撤销。`
  
  if (confirm(confirmMessage)) {
    emit('deleteItem', item)
  }
}

const downloadTemplate = () => {
  emit('downloadTemplate')
}

const uploadTemplate = () => {
  emit('uploadTemplate')
}
</script>