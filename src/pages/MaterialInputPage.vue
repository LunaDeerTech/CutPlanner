<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">添加原料板材</h1>
        <p class="text-gray-600">请输入原料板材的基本信息</p>
      </div>

      <!-- 表单区域 -->
      <div class="bg-white shadow-lg rounded-lg p-6">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- 材料名称 -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              材料名称 <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              placeholder="例如：橡木实木板"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-300 bg-red-50': errors.name }"
              @blur="validateField('name')"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
          </div>

          <!-- 单位选择 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              测量单位 <span class="text-red-500">*</span>
            </label>
            <div class="flex space-x-4">
              <label class="inline-flex items-center">
                <input
                  v-model="form.unit"
                  type="radio"
                  value="mm"
                  class="form-radio text-blue-600"
                />
                <span class="ml-2">毫米 (mm)</span>
              </label>
              <label class="inline-flex items-center">
                <input
                  v-model="form.unit"
                  type="radio"
                  value="inch"
                  class="form-radio text-blue-600"
                />
                <span class="ml-2">英寸 (inch)</span>
              </label>
            </div>
          </div>

          <!-- 尺寸输入区域 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- 长度/宽度 -->
            <div>
              <label for="width" class="block text-sm font-medium text-gray-700 mb-2">
                长度 <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  id="width"
                  v-model="form.width"
                  type="text"
                  placeholder="0"
                  class="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-300 bg-red-50': errors.width }"
                  @input="handleNumberInput('width', $event)"
                  @blur="validateField('width')"
                />
                <span class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 text-sm">
                  {{ form.unit }}
                </span>
              </div>
              <p v-if="errors.width" class="mt-1 text-sm text-red-600">{{ errors.width }}</p>
            </div>

            <!-- 宽度/高度 -->
            <div>
              <label for="height" class="block text-sm font-medium text-gray-700 mb-2">
                宽度 <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  id="height"
                  v-model="form.height"
                  type="text"
                  placeholder="0"
                  class="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-300 bg-red-50': errors.height }"
                  @input="handleNumberInput('height', $event)"
                  @blur="validateField('height')"
                />
                <span class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 text-sm">
                  {{ form.unit }}
                </span>
              </div>
              <p v-if="errors.height" class="mt-1 text-sm text-red-600">{{ errors.height }}</p>
            </div>

            <!-- 厚度 -->
            <div>
              <label for="thickness" class="block text-sm font-medium text-gray-700 mb-2">
                厚度 <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  id="thickness"
                  v-model="form.thickness"
                  type="text"
                  placeholder="0"
                  class="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-300 bg-red-50': errors.thickness }"
                  @input="handleNumberInput('thickness', $event)"
                  @blur="validateField('thickness')"
                />
                <span class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 text-sm">
                  {{ form.unit }}
                </span>
              </div>
              <p v-if="errors.thickness" class="mt-1 text-sm text-red-600">{{ errors.thickness }}</p>
            </div>
          </div>

          <!-- 材料类型 -->
          <div>
            <label for="materialType" class="block text-sm font-medium text-gray-700 mb-2">
              材料类型
            </label>
            <select
              id="materialType"
              v-model="form.materialType"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">选择材料类型...</option>
              <option v-for="type in materialTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>

          <!-- 按钮区域 -->
          <div class="flex justify-between pt-6">
            <button
              type="button"
              @click="handleCancel"
              class="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              取消
            </button>
            
            <button
              type="submit"
              :disabled="!isFormValid || isLoading"
              class="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading" class="inline-flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                保存中...
              </span>
              <span v-else>保存材料</span>
            </button>
          </div>
        </form>
      </div>

      <!-- 预览信息 -->
      <div v-if="isFormValid" class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 class="text-sm font-medium text-blue-900 mb-2">预览信息</h3>
        <div class="text-sm text-blue-800">
          <p><strong>材料：</strong>{{ form.name || '未命名' }}</p>
          <p><strong>尺寸：</strong>{{ form.width }} × {{ form.height }} × {{ form.thickness }} {{ form.unit }}</p>
          <p><strong>面积：</strong>{{ calculateArea() }} {{ form.unit }}²</p>
          <p v-if="form.materialType"><strong>类型：</strong>{{ form.materialType }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useMaterialStore } from '@/store/material'
import { MATERIAL_TYPES } from '@/constants'
import { formatNumberInput, validateDimension, validateThickness, validateRequired } from '@/utils/validation'

// Composables
const router = useRouter()
const materialStore = useMaterialStore()

// Reactive state
const form = reactive({
  name: '',
  width: '',
  height: '',
  thickness: '',
  unit: 'mm' as 'mm' | 'inch',
  materialType: ''
})

const errors = reactive({
  name: '',
  width: '',
  height: '',
  thickness: ''
})

const isLoading = ref(false)
const materialTypes = MATERIAL_TYPES

// Computed
const isFormValid = computed(() => {
  return (
    form.name.trim() !== '' &&
    form.width !== '' &&
    form.height !== '' &&
    form.thickness !== '' &&
    Object.values(errors).every(error => error === '')
  )
})

// Methods
const handleNumberInput = (field: 'width' | 'height' | 'thickness', event: Event) => {
  const target = event.target as HTMLInputElement
  const formatted = formatNumberInput(target.value, true)
  form[field] = formatted
  target.value = formatted
  
  // 清除错误状态
  if (errors[field]) {
    validateField(field)
  }
}

const validateField = (field: keyof typeof errors) => {
  errors[field] = ''
  
  switch (field) {
    case 'name':
      const nameValidation = validateRequired(form.name, '材料名称')
      if (!nameValidation.isValid) {
        errors.name = nameValidation.error!
      }
      break
      
    case 'width':
      const widthValidation = validateDimension(form.width, form.unit)
      if (!widthValidation.isValid) {
        errors.width = widthValidation.error!
      }
      break
      
    case 'height':
      const heightValidation = validateDimension(form.height, form.unit)
      if (!heightValidation.isValid) {
        errors.height = heightValidation.error!
      }
      break
      
    case 'thickness':
      const thicknessValidation = validateThickness(form.thickness, form.unit)
      if (!thicknessValidation.isValid) {
        errors.thickness = thicknessValidation.error!
      }
      break
  }
}

const validateForm = () => {
  validateField('name')
  validateField('width')
  validateField('height')
  validateField('thickness')
  return isFormValid.value
}

const calculateArea = () => {
  if (!form.width || !form.height) return 0
  const width = parseFloat(form.width)
  const height = parseFloat(form.height)
  if (isNaN(width) || isNaN(height)) return 0
  return (width * height).toFixed(2)
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  isLoading.value = true
  
  try {
    await materialStore.addMaterial({
      name: form.name.trim(),
      width: parseFloat(form.width),
      height: parseFloat(form.height),
      thickness: parseFloat(form.thickness),
      unit: form.unit,
      materialType: form.materialType || undefined
    })
    
    // 成功提示
    alert('材料添加成功！')
    
    // 跳转到下一步或返回首页
    router.push('/')
  } catch (error) {
    alert(`保存失败: ${error}`)
  } finally {
    isLoading.value = false
  }
}

const handleCancel = () => {
  if (confirm('确定要取消吗？未保存的数据将丢失。')) {
    router.push('/')
  }
}
</script>