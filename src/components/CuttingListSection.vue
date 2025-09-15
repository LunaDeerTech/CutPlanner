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
        <div class="template-menu-container relative">
          <button
            @click="showTemplateMenu = !showTemplateMenu"
            class="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            下载模板
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
            
          <!-- 下拉菜单 -->
          <div v-if="showTemplateMenu" class="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
            <button
              @click="downloadTemplate('sample')"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              示例模板
            </button>
            <button
              @click="downloadTemplate('empty')"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              空白模板
            </button>
          </div>
        </div>
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
            <!-- 名称列 -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div v-if="editingItem?.id === item.id">
                <input
                  v-model="editForm.name"
                  type="text"
                  placeholder="项目名称"
                  class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  @keydown.enter="saveEdit"
                  @keydown.escape="cancelEdit"
                />
              </div>
              <div v-else class="text-sm font-medium text-gray-900">
                {{ item.name || '未命名' }}
              </div>
            </td>

            <!-- 长度列 -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div v-if="editingItem?.id === item.id">
                <div class="flex items-center">
                  <input
                    v-model="editForm.width"
                    type="number"
                    step="0.1"
                    min="0.1"
                    class="w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    :class="editErrors.width ? 'border-red-500' : 'border-gray-300'"
                    @keydown.enter="saveEdit"
                    @keydown.escape="cancelEdit"
                    @blur="validateEditField('width')"
                  />
                  <span class="ml-1 text-sm text-gray-500">{{ settingsStore.settings.unit }}</span>
                </div>
                <p v-if="editErrors.width" class="mt-1 text-xs text-red-600">{{ editErrors.width }}</p>
              </div>
              <div v-else class="text-sm text-gray-900">
                {{ item.width }}{{ settingsStore.settings.unit }}
              </div>
            </td>

            <!-- 宽度列 -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div v-if="editingItem?.id === item.id">
                <div class="flex items-center">
                  <input
                    v-model="editForm.height"
                    type="number"
                    step="0.1"
                    min="0.1"
                    class="w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    :class="editErrors.height ? 'border-red-500' : 'border-gray-300'"
                    @keydown.enter="saveEdit"
                    @keydown.escape="cancelEdit"
                    @blur="validateEditField('height')"
                  />
                  <span class="ml-1 text-sm text-gray-500">{{ settingsStore.settings.unit }}</span>
                </div>
                <p v-if="editErrors.height" class="mt-1 text-xs text-red-600">{{ editErrors.height }}</p>
              </div>
              <div v-else class="text-sm text-gray-900">
                {{ item.height }}{{ settingsStore.settings.unit }}
              </div>
            </td>

            <!-- 数量列 -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div v-if="editingItem?.id === item.id">
                <div>
                  <input
                    v-model="editForm.quantity"
                    type="number"
                    min="1"
                    class="w-16 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    :class="editErrors.quantity ? 'border-red-500' : 'border-gray-300'"
                    @keydown.enter="saveEdit"
                    @keydown.escape="cancelEdit"
                    @blur="validateEditField('quantity')"
                  />
                </div>
                <p v-if="editErrors.quantity" class="mt-1 text-xs text-red-600">{{ editErrors.quantity }}</p>
              </div>
              <div v-else class="text-sm text-gray-900">
                {{ item.quantity }}
              </div>
            </td>

            <!-- 操作列 -->
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <div v-if="editingItem?.id === item.id" class="flex space-x-2">
                <button 
                  @click="saveEdit"
                  :disabled="!isEditFormValid"
                  class="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="保存"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </button>
                <button 
                  @click="cancelEdit"
                  class="text-gray-600 hover:text-gray-900"
                  title="取消"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <div v-else class="flex space-x-4">
                <button 
                  @click="startEdit(item)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  编辑
                </button>
                <button 
                  @click="deleteCuttingItem(item)"
                  class="text-red-600 hover:text-red-900"
                >
                  删除
                </button>
              </div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from '@/store/settings'
import { validateDimension, validatePositiveNumber } from '@/utils/validation'
import { generateCuttingListTemplate, generateEmptyTemplate } from '@/services/excel'
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
  downloadTemplate: []
  uploadTemplate: []
}>()

// 内联编辑状态
const editingItem = ref<CuttingItem | null>(null)
const editForm = ref({
  name: '',
  width: '',
  height: '',
  quantity: ''
})
const editErrors = ref({
  width: '',
  height: '',
  quantity: ''
})

// 模板下载菜单状态
const showTemplateMenu = ref(false)

// 编辑表单验证状态
const isEditFormValid = computed(() => {
  return editForm.value.width && 
         editForm.value.height && 
         editForm.value.quantity &&
         !editErrors.value.width && 
         !editErrors.value.height && 
         !editErrors.value.quantity
})

// 验证编辑字段
const validateEditField = (field: 'width' | 'height' | 'quantity') => {
  const value = editForm.value[field]
  
  if (field === 'width' || field === 'height') {
    const validation = validateDimension(value, settingsStore.settings.unit)
    editErrors.value[field] = validation.error || ''
  } else if (field === 'quantity') {
    const validation = validatePositiveNumber(value)
    if (!validation.isValid) {
      editErrors.value.quantity = validation.error || ''
    } else {
      const num = Number(value)
      if (!Number.isInteger(num)) {
        editErrors.value.quantity = '数量必须为整数'
      } else {
        editErrors.value.quantity = ''
      }
    }
  }
}

// 开始编辑
const startEdit = (item: CuttingItem) => {
  editingItem.value = item
  editForm.value = {
    name: item.name || '',
    width: item.width.toString(),
    height: item.height.toString(),
    quantity: item.quantity.toString()
  }
  editErrors.value = {
    width: '',
    height: '',
    quantity: ''
  }
}

// 取消编辑
const cancelEdit = () => {
  editingItem.value = null
  editForm.value = {
    name: '',
    width: '',
    height: '',
    quantity: ''
  }
  editErrors.value = {
    width: '',
    height: '',
    quantity: ''
  }
}

// 保存编辑
const saveEdit = () => {
  if (!editingItem.value) return
  
  // 验证所有字段
  validateEditField('width')
  validateEditField('height')
  validateEditField('quantity')
  
  if (!isEditFormValid.value) {
    return
  }
  
  const updates = {
    name: editForm.value.name.trim() || '未命名',
    width: Number(editForm.value.width),
    height: Number(editForm.value.height),
    quantity: Number(editForm.value.quantity)
  }
  
  emit('updateItem', editingItem.value.id, updates)
  cancelEdit()
}

// 切割清单相关方法
const addCuttingItem = () => {
  emit('addItem')
}

const deleteCuttingItem = (item: CuttingItem) => {
  const confirmMessage = `确定要删除切割项目"${item.name || '未命名'}"吗？\n\n尺寸：${item.width} × ${item.height} ${settingsStore.settings.unit}\n数量：${item.quantity}\n\n此操作不可撤销。`
  
  if (confirm(confirmMessage)) {
    emit('deleteItem', item)
  }
}

const downloadTemplate = (type: 'sample' | 'empty') => {
  showTemplateMenu.value = false
  
  try {
    if (type === 'sample') {
      generateCuttingListTemplate()
    } else {
      generateEmptyTemplate()
    }
    
    // 显示成功提示
    console.log(`${type === 'sample' ? '示例' : '空白'}模板下载成功`)
  } catch (error) {
    console.error('模板下载失败:', error)
    alert('模板下载失败，请重试')
  }
}

const uploadTemplate = () => {
  emit('uploadTemplate')
}

// 点击外部关闭菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.template-menu-container')) {
    showTemplateMenu.value = false
  }
}

// 监听点击事件
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>