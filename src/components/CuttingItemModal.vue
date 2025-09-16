<template>
  <div v-if="isVisible" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- 背景遮罩 -->
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="handleCancel"></div>

      <!-- 弹窗内容 -->
      <div class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium leading-6 text-gray-900">
            {{ isEditMode ? '编辑切割项目' : '添加切割项目' }}
          </h3>
          <button
            @click="handleCancel"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- 名称字段 -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              项目名称
            </label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="例如：柜门、侧板等（可选）"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- 长度字段 -->
          <div>
            <label for="length" class="block text-sm font-medium text-gray-700">
              长度 ({{ settingsStore.settings.unit }}) *
            </label>
            <input
              id="length"
              v-model="formData.length"
              type="number"
              step="0.1"
              min="0.1"
              placeholder="输入长度"
              class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :class="errors.length ? 'border-red-500' : 'border-gray-300'"
              @blur="validateField('length')"
            />
            <p v-if="errors.length" class="mt-1 text-sm text-red-600">{{ errors.length }}</p>
          </div>

          <!-- 宽度字段 -->
          <div>
            <label for="width" class="block text-sm font-medium text-gray-700">
              宽度 ({{ settingsStore.settings.unit }}) *
            </label>
            <input
              id="width"
              v-model="formData.width"
              type="number"
              step="0.1"
              min="0.1"
              placeholder="输入宽度"
              class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :class="errors.width ? 'border-red-500' : 'border-gray-300'"
              @blur="validateField('width')"
            />
            <p v-if="errors.width" class="mt-1 text-sm text-red-600">{{ errors.width }}</p>
          </div>

          <!-- 数量字段 -->
          <div>
            <label for="quantity" class="block text-sm font-medium text-gray-700">
              数量 *
            </label>
            <input
              id="quantity"
              v-model="formData.quantity"
              type="number"
              min="1"
              placeholder="输入数量"
              class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :class="errors.quantity ? 'border-red-500' : 'border-gray-300'"
              @blur="validateField('quantity')"
            />
            <p v-if="errors.quantity" class="mt-1 text-sm text-red-600">{{ errors.quantity }}</p>
          </div>

          <!-- 按钮区域 -->
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="handleCancel"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="!isFormValid"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ isEditMode ? '保存' : '添加' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSettingsStore } from '@/store/settings'
import { validateDimension, validatePositiveNumber } from '@/utils/validation'
import type { CuttingItem } from '@/models/types'

const settingsStore = useSettingsStore()

// Props
interface Props {
  isVisible: boolean
  editItem?: CuttingItem | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  save: [item: Omit<CuttingItem, 'id'>]
  update: [id: string, updates: Partial<CuttingItem>]
}>()

// 表单数据
const formData = ref({
  name: '',
  width: '',
  length: '',
  quantity: ''
})

// 错误信息
const errors = ref({
  width: '',
  length: '',
  quantity: ''
})

// 是否为编辑模式
const isEditMode = computed(() => !!props.editItem)

// 表单验证状态
const isFormValid = computed(() => {
  return formData.value.width && 
         formData.value.length && 
         formData.value.quantity &&
         !errors.value.width && 
         !errors.value.length && 
         !errors.value.quantity
})

// 重置表单
const resetForm = () => {
  formData.value = {
    name: '',
    width: '',
    length: '',
    quantity: ''
  }
  errors.value = {
    width: '',
    length: '',
    quantity: ''
  }
}

// 监听编辑项目变化，填充表单
watch(() => props.editItem, (editItem) => {
  if (editItem) {
    formData.value = {
      name: editItem.name || '',
      width: editItem.width.toString(),
      length: editItem.length.toString(),
      quantity: editItem.quantity.toString()
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// 监听弹窗显示状态，重置错误
watch(() => props.isVisible, (visible) => {
  if (visible) {
    errors.value = { width: '', length: '', quantity: '' }
  }
})

// 验证单个字段
const validateField = (field: 'width' | 'length' | 'quantity') => {
  const value = formData.value[field]
  
  if (field === 'width' || field === 'length') {
    const validation = validateDimension(value, settingsStore.settings.unit)
    errors.value[field] = validation.error || ''
  } else if (field === 'quantity') {
    const validation = validatePositiveNumber(value)
    if (!validation.isValid) {
      errors.value.quantity = validation.error || ''
    } else {
      const num = Number(value)
      if (!Number.isInteger(num)) {
        errors.value.quantity = '数量必须为整数'
      } else {
        errors.value.quantity = ''
      }
    }
  }
}

// 处理取消
const handleCancel = () => {
  resetForm()
  emit('close')
}

// 处理提交
const handleSubmit = () => {
  // 验证所有字段
  validateField('width')
  validateField('length')
  validateField('quantity')
  
  if (!isFormValid.value) {
    return
  }
  
  const trimmedName = formData.value.name.trim()
  const itemData = {
    name: trimmedName || '未命名',
    width: Number(formData.value.width),
    length: Number(formData.value.length),
    quantity: Number(formData.value.quantity),
    rotatation: 'auto' // 默认旋转设置为 'auto'
  }
  
  if (isEditMode.value && props.editItem) {
    emit('update', props.editItem.id, itemData)
  } else {
    emit('save', itemData)
  }
  
  resetForm()
  emit('close')
}
</script>