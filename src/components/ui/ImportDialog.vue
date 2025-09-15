<template>
  <div v-if="isVisible" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- 背景遮罩 -->
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="close"></div>
    
    <!-- 对话框 -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
        <!-- 标题 -->
        <div class="mb-6">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold leading-6 text-gray-900">
              导入切割清单
            </h3>
            <button
              @click="close"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p class="mt-2 text-sm text-gray-600">
            上传Excel文件来批量导入切割项目。支持.xlsx格式文件。
          </p>
        </div>
        
        <!-- 文件上传区域 -->
        <div class="mb-6">
          <FileUpload
            ref="fileUpload"
            accept=".xlsx,.xls"
            description="支持 .xlsx/.xls 格式文件，最大 10MB"
            @upload="handleFileUpload"
            @error="handleError"
            @success="handleSuccess"
          />
        </div>
        
        <!-- 预览区域 -->
        <div v-if="previewData.length > 0" class="mb-6">
          <h4 class="text-base font-medium text-gray-900 mb-3">数据预览</h4>
          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <div class="max-h-80 overflow-y-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50 sticky top-0">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">长度</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">宽度</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数量</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(item, index) in previewData" :key="index">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ item.name }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ item.length }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ item.width }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ item.quantity }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="mt-3 text-sm text-gray-600">
            共 {{ previewData.length }} 个项目
          </div>
        </div>
        
        <!-- 警告信息 -->
        <div v-if="warnings.length > 0" class="mb-6">
          <div class="rounded-md bg-yellow-50 p-4">
            <div class="flex">
              <svg class="h-5 w-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <div>
                <h4 class="text-sm font-medium text-yellow-800">解析警告</h4>
                <div class="mt-2 text-sm text-yellow-700">
                  <ul class="list-disc list-inside space-y-1">
                    <li v-for="warning in warnings" :key="warning">{{ warning }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 按钮区域 -->
        <div class="flex justify-end space-x-3">
          <button
            @click="close"
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            取消
          </button>
          <button
            @click="importData"
            :disabled="previewData.length === 0 || isImporting"
            type="button"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isImporting">导入中...</span>
            <span v-else>确认导入 ({{ previewData.length }})</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FileUpload from './FileUpload.vue'
import { parseExcelFile, validateExcelFile } from '@/services/excel/excelParser'
import type { CuttingItem } from '@/models/types'

interface Props {
  isVisible: boolean
}

interface Emits {
  close: []
  import: [items: CuttingItem[]]
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// 响应式状态
const fileUpload = ref<InstanceType<typeof FileUpload> | null>(null)
const previewData = ref<CuttingItem[]>([])
const warnings = ref<string[]>([])
const isImporting = ref(false)

// 处理文件上传
const handleFileUpload = async (files: File[]) => {
  if (files.length === 0) return
  
  const file = files[0]
  
  // 验证文件
  const validation = validateExcelFile(file)
  if (!validation.valid) {
    handleError(validation.error || '文件格式无效')
    return
  }
  
  try {
    // 解析Excel文件
    const result = await parseExcelFile(file)
    
    if (result.success && result.data) {
      previewData.value = result.data
      warnings.value = result.warnings || []
      fileUpload.value?.showSuccess(`成功解析 ${result.data.length} 个切割项目`)
    } else {
      handleError(result.error || '文件解析失败')
      previewData.value = []
      warnings.value = []
    }
  } catch (error) {
    console.error('文件处理错误:', error)
    handleError('文件处理失败，请检查文件格式')
    previewData.value = []
    warnings.value = []
  }
}

// 处理错误
const handleError = (message: string) => {
  console.error('上传错误:', message)
}

// 处理成功
const handleSuccess = (message: string) => {
  console.log('上传成功:', message)
}

// 导入数据
const importData = async () => {
  if (previewData.value.length === 0) return
  
  isImporting.value = true
  
  try {
    // 延迟一下，让用户看到导入状态
    await new Promise(resolve => setTimeout(resolve, 500))
    
    emit('import', previewData.value)
    close()
  } catch (error) {
    console.error('导入失败:', error)
    fileUpload.value?.showError('数据导入失败，请重试')
  } finally {
    isImporting.value = false
  }
}

// 关闭对话框
const close = () => {
  // 重置状态
  previewData.value = []
  warnings.value = []
  isImporting.value = false
  fileUpload.value?.clearMessages()
  
  emit('close')
}
</script>