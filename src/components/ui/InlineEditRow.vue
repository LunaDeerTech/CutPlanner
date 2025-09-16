<template>
  <tr>
    <!-- 名称列 -->
    <td class="px-6 py-4 whitespace-nowrap">
      <div v-if="isEditing">
        <input
          v-model="editForm.name"
          type="text"
          placeholder="项目名称"
          class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          @keydown.enter="handleSave"
          @keydown.escape="handleCancel"
        />
      </div>
      <div v-else class="text-sm font-medium text-gray-900">
        {{ item.name || '未命名' }}
      </div>
    </td>

    <!-- 长度列 -->
     <td class="px-6 py-4 whitespace-nowrap">
      <div v-if="isEditing">
        <div class="flex items-center">
          <input
            v-model="editForm.length"
            type="number"
            step="0.1"
            min="0.1"
            class="w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            :class="errors.length ? 'border-red-500' : 'border-gray-300'"
            @keydown.enter="handleSave"
            @keydown.escape="handleCancel"
            @blur="validateField('length')"
          />
          <span class="ml-1 text-sm text-gray-500">{{ unit }}</span>
        </div>
        <p v-if="errors.length" class="mt-1 text-xs text-red-600">{{ errors.length }}</p>
      </div>
      <div v-else class="text-sm text-gray-900">
        {{ item.length }}{{ unit }}
      </div>
    </td>

    <!-- 宽度列 -->
    <td class="px-6 py-4 whitespace-nowrap">
      <div v-if="isEditing">
        <div class="flex items-center">
          <input
            v-model="editForm.width"
            type="number"
            step="0.1"
            min="0.1"
            class="w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            :class="errors.width ? 'border-red-500' : 'border-gray-300'"
            @keydown.enter="handleSave"
            @keydown.escape="handleCancel"
            @blur="validateField('width')"
          />
          <span class="ml-1 text-sm text-gray-500">{{ unit }}</span>
        </div>
        <p v-if="errors.width" class="mt-1 text-xs text-red-600">{{ errors.width }}</p>
      </div>
      <div v-else class="text-sm text-gray-900">
        {{ item.width }}{{ unit }}
      </div>
    </td>

    <!-- 数量列 -->
    <td class="px-6 py-4 whitespace-nowrap">
      <div v-if="isEditing">
        <div>
          <input
            v-model="editForm.quantity"
            type="number"
            min="1"
            class="w-16 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            :class="errors.quantity ? 'border-red-500' : 'border-gray-300'"
            @keydown.enter="handleSave"
            @keydown.escape="handleCancel"
            @blur="validateField('quantity')"
          />
        </div>
        <p v-if="errors.quantity" class="mt-1 text-xs text-red-600">{{ errors.quantity }}</p>
      </div>
      <div v-else class="text-sm text-gray-900">
        {{ item.quantity }}
      </div>
    </td>

    <!-- 旋转方向列 -->
    <td class="px-6 py-4 whitespace-nowrap">
      <div v-if="isEditing">
        <select
          v-model="editForm.rotatation"
          class="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="auto">自动（跟随算法）</option>
          <option value="fixed-default">固定-默认</option>
          <option value="fixed-rotate">固定-旋转90°</option>
        </select>
      </div>
      <div v-else class="text-sm text-gray-900">
        <span v-if="item.rotatation === 'auto'" class="text-blue-600">自动（跟随算法）</span>
        <span v-else-if="item.rotatation === 'fixed-default'" class="text-green-600">固定-默认</span>
        <span v-else-if="item.rotatation === 'fixed-rotate'" class="text-orange-600">固定-旋转90°</span>
        <span v-else class="text-gray-400">未设置</span>
      </div>
    </td>

    <!-- 操作列 -->
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      <div v-if="isEditing" class="flex space-x-2">
        <button 
          @click="handleSave"
          :disabled="!isFormValid"
          class="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
          title="保存"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </button>
        <button 
          @click="handleCancel"
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
          @click="handleEdit"
          class="text-blue-600 hover:text-blue-900"
        >
          编辑
        </button>
        <button 
          @click="handleDelete"
          class="text-red-600 hover:text-red-900"
        >
          删除
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { validateDimension, validatePositiveNumber } from '@/utils/validation'
import type { CuttingItem } from '@/models/types'

// Props
const props = defineProps<{
  item: CuttingItem
  unit: 'mm' | 'inch'
  isEditing?: boolean
}>()

// Events
const emit = defineEmits<{
  edit: [item: CuttingItem]
  save: [id: string, updates: Partial<CuttingItem>]
  cancel: []
  delete: [item: CuttingItem]
}>()

// 编辑表单状态
const editForm = ref({
  name: '',
  width: '',
  length: '',
  quantity: '',
  rotatation: 'auto'
})

// 错误状态
const errors = ref({
  width: '',
  length: '',
  quantity: ''
})

// 表单验证状态
const isFormValid = computed(() => {
  return editForm.value.width && 
         editForm.value.length && 
         editForm.value.quantity &&
         !errors.value.width && 
         !errors.value.length && 
         !errors.value.quantity
})

// 监听编辑状态变化，初始化表单
watch(() => props.isEditing, (isEditing) => {
  if (isEditing) {
    editForm.value = {
      name: props.item.name || '',
      width: props.item.width.toString(),
      length: props.item.length.toString(),
      quantity: props.item.quantity.toString(),
      rotatation: props.item.rotatation || 'auto'
    }
    errors.value = {
      width: '',
      length: '',
      quantity: ''
    }
  }
})

// 验证字段
const validateField = (field: 'width' | 'length' | 'quantity') => {
  const value = editForm.value[field]
  
  if (field === 'width' || field === 'length') {
    const validation = validateDimension(value, props.unit)
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

// 处理方法
const handleEdit = () => {
  emit('edit', props.item)
}

const handleSave = () => {
  // 验证所有字段
  validateField('width')
  validateField('length')
  validateField('quantity')
  
  if (!isFormValid.value) {
    return
  }
  
  const updates = {
    name: editForm.value.name.trim() || '未命名',
    width: Number(editForm.value.width),
    length: Number(editForm.value.length),
    quantity: Number(editForm.value.quantity),
    rotatation: editForm.value.rotatation as 'auto' | 'fixed-default' | 'fixed-rotate'
  }
  
  emit('save', props.item.id, updates)
}

const handleCancel = () => {
  emit('cancel')
}

const handleDelete = () => {
  const confirmMessage = `确定要删除切割项目"${props.item.name || '未命名'}"吗？\n\n尺寸：${props.item.width} × ${props.item.length} ${props.unit}\n数量：${props.item.quantity}\n\n此操作不可撤销。`
  
  if (confirm(confirmMessage)) {
    emit('delete', props.item)
  }
}
</script>