<template>
  <div class="relative">
    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      @change="handleFileChange"
      class="hidden"
      :multiple="multiple"
    />
    
    <!-- 拖拽上传区域 -->
    <div
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @dragenter.prevent
      :class="[
        'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400',
        disabled ? 'cursor-not-allowed opacity-50' : ''
      ]"
      @click="triggerFileSelect"
    >
      <!-- 上传图标 -->
      <div class="mb-4">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      
      <div class="space-y-2">
        <p class="text-sm text-gray-600">
          <span class="font-medium text-blue-600">点击上传</span>
          或拖拽文件到此处
        </p>
        <p class="text-xs text-gray-500">{{ description }}</p>
      </div>
    </div>
    
    <!-- 上传进度 -->
    <div v-if="isUploading" class="mt-4">
      <div class="flex items-center justify-between text-sm text-gray-600 mb-1">
        <span>正在处理...</span>
        <span>{{ uploadProgress }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${uploadProgress}%` }"
        ></div>
      </div>
    </div>
    
    <!-- 错误信息 -->
    <div v-if="errorMessage" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
      <div class="flex">
        <svg
          class="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        <div class="text-sm text-red-800">{{ errorMessage }}</div>
      </div>
    </div>
    
    <!-- 成功信息 -->
    <div v-if="successMessage" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
      <div class="flex">
        <svg
          class="h-5 w-5 text-green-400 mt-0.5 mr-2 flex-shrink-0"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        <div class="text-sm text-green-800">{{ successMessage }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

interface Props {
  accept?: string
  multiple?: boolean
  disabled?: boolean
  maxSize?: number // 文件大小限制，单位为字节
  description?: string
}

interface Emits {
  upload: [files: File[]]
  error: [message: string]
  success: [message: string]
}

const props = withDefaults(defineProps<Props>(), {
  accept: '.xlsx,.xls',
  multiple: false,
  disabled: false,
  maxSize: 10 * 1024 * 1024, // 10MB
  description: '支持 .xlsx 格式文件，最大 10MB'
})

const emit = defineEmits<Emits>()

// 响应式状态
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const errorMessage = ref('')
const successMessage = ref('')

// 触发文件选择
const triggerFileSelect = () => {
  if (props.disabled) return
  clearMessages()
  fileInput.value?.click()
}

// 处理文件选择
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  handleFiles(files)
  // 清空input，允许重复选择同一文件
  target.value = ''
}

// 处理拖拽文件
const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  if (props.disabled) return
  
  clearMessages()
  const files = Array.from(event.dataTransfer?.files || [])
  handleFiles(files)
}

// 文件处理逻辑
const handleFiles = async (files: File[]) => {
  if (files.length === 0) return
  
  const validFiles: File[] = []
  
  // 验证文件
  for (const file of files) {
    if (!validateFile(file)) {
      return // validateFile 会设置错误信息
    }
    validFiles.push(file)
  }
  
  if (validFiles.length === 0) return
  
  // 开始上传处理
  isUploading.value = true
  uploadProgress.value = 0
  
  try {
    // 模拟进度更新
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 100)
    
    // 触发上传事件
    emit('upload', validFiles)
    
    // 完成进度
    clearInterval(progressInterval)
    uploadProgress.value = 100
    
    await nextTick()
    
    // 延迟隐藏进度条
    setTimeout(() => {
      isUploading.value = false
      uploadProgress.value = 0
    }, 500)
    
  } catch (error) {
    isUploading.value = false
    uploadProgress.value = 0
    showError('文件处理失败，请重试')
  }
}

// 文件验证
const validateFile = (file: File): boolean => {
  // 检查文件大小
  if (file.size > props.maxSize) {
    const maxSizeMB = (props.maxSize / (1024 * 1024)).toFixed(1)
    showError(`文件大小不能超过 ${maxSizeMB}MB`)
    return false
  }
  
  // 检查文件类型
  const acceptedTypes = props.accept.split(',').map(type => type.trim().toLowerCase())
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
  const isValidType = acceptedTypes.some(type => {
    if (type.startsWith('.')) {
      return fileExtension === type
    }
    return file.type === type
  })
  
  if (!isValidType) {
    showError(`不支持的文件格式，请上传 ${props.accept} 格式的文件`)
    return false
  }
  
  return true
}

// 清除消息
const clearMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

// 显示错误信息
const showError = (message: string) => {
  errorMessage.value = message
  successMessage.value = ''
  emit('error', message)
}

// 显示成功信息
const showSuccess = (message: string) => {
  successMessage.value = message
  errorMessage.value = ''
  emit('success', message)
}

// 暴露方法给父组件
defineExpose({
  showError,
  showSuccess,
  clearMessages
})
</script>