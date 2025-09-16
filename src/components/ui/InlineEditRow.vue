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
      <div v-if="isEditing" class="flex items-center rotation-menu-container relative">
        <button
          type="button"
          ref="rotationBtn"
          @click.stop="toggleRotationMenu()"
          class="flex items-center w-40 justify-between px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center">
            <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 3v4h-4M9 21v-4h4"/>
            </svg>
            <span class="truncate">
              <span v-if="editForm.rotatation === 'auto'">自动（跟随算法）</span>
              <span v-else-if="editForm.rotatation === 'fixed-default'">固定-默认</span>
              <span v-else-if="editForm.rotatation === 'fixed-rotate'">固定-旋转90°</span>
            </span>
          </div>
          <svg class="w-4 h-4 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>

        <teleport to="body" v-if="showRotationMenu">
          <div
            ref="rotationMenu"
            :style="menuStyle"
            class="w-40 bg-white border border-gray-200 rounded-md shadow-lg"
          >
          <button
            @click.prevent="setRotation('auto')"
            class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v4m0 12v4m9-9h-4M7 12H3"/>
            </svg>
            自动（跟随算法）
          </button>
          <button
            @click.prevent="setRotation('fixed-default')"
            class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <svg class="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16M10 11v6m4-6v6"/>
            </svg>
            固定-默认
          </button>
          <button
            @click.prevent="setRotation('fixed-rotate')"
            class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <svg class="w-4 h-4 mr-2 text-orange-500 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16M10 11v6m4-6v6"/>
            </svg>
            固定-旋转90°
          </button>
          </div>
        </teleport>
      </div>
      <div v-else class="text-sm text-gray-900">
        <template v-if="item.rotatation === 'auto'">
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v4m0 12v4m9-9h-4M7 12H3m12.364-6.364l-2.828 2.828M9.464 14.536l-2.828 2.828M20.485 20.485l-2.828-2.828M6.343 6.343L3.515 3.515"/>
            </svg>
            自动
          </span>
        </template>
        <template v-else-if="item.rotatation === 'fixed-default'">
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-800">
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16M10 11v6m4-6v6"/>
            </svg>
            固定
          </span>
        </template>
        <template v-else-if="item.rotatation === 'fixed-rotate'">
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-800">
            <svg class="w-3 h-3 mr-1 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16M10 11v6m4-6v6"/>
            </svg>
            旋转90°
          </span>
        </template>
        <template v-else>
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
            未设置
          </span>
        </template>
      </div>
    </td>

    <!-- 操作列 -->
    <td class="px-6 py-4 whitespace-nowrap">
      <div v-if="isEditing" class="flex items-center space-x-2">
        <button 
          @click="handleSave"
          :disabled="!isFormValid"
          class="inline-flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          :class="!isFormValid ? 'text-gray-400' : 'text-green-600 hover:text-green-700'"
          title="保存"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </button>
        <button 
          @click="handleCancel"
          class="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-500 transition-all duration-200 hover:bg-gray-50 hover:text-gray-700"
          title="取消"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div v-else class="flex items-center space-x-1">
        <button 
          @click="handleEdit"
          class="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-blue-600 rounded-md transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
          编辑
        </button>
        <button 
          @click="handleDelete"
          class="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-red-600 rounded-md transition-all duration-200 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          删除
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
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

// 旋转下拉菜单显示状态（用于 v-if 菜单）
const showRotationMenu = ref(false)

// refs to measure placement
const rotationBtn = ref<HTMLElement | null>(null)
const rotationMenu = ref<HTMLElement | null>(null)
const menuAbove = ref(false)
const menuStyle = ref<Record<string, string>>({})

const setRotation = (value: string) => {
  editForm.value.rotatation = value as any
  showRotationMenu.value = false
}

// 切换菜单并计算放置位置（如果下面空间不足则置于上方）
const toggleRotationMenu = async () => {
  showRotationMenu.value = !showRotationMenu.value
  if (showRotationMenu.value) {
    await nextTick()
    const btnRect = rotationBtn.value?.getBoundingClientRect()
    if (!btnRect) return

    // set initial menu width equal to button to get stable measurement
    const scrollX = window.scrollX || window.pageXOffset || 0
    const scrollY = window.scrollY || window.pageYOffset || 0
    menuStyle.value = {
      position: 'absolute',
      left: `${btnRect.left + scrollX}px`,
      top: `${btnRect.bottom + 4 + scrollY}px`,
      width: `${btnRect.width}px`,
      zIndex: '1000'
    }

    // allow DOM to render with the width before measuring height
    await nextTick()
    const menuEl = rotationMenu.value
    const menuHeight = menuEl ? menuEl.offsetHeight : 0

    const spaceBelow = window.innerHeight - btnRect.bottom
    menuAbove.value = spaceBelow < (menuHeight + 8)

    // compute final left (prevent right overflow)
    let left = btnRect.left
    if (left + btnRect.width + 8 > window.innerWidth) {
      left = Math.max(8, window.innerWidth - btnRect.width - 8)
    }

    const top = menuAbove.value ? (btnRect.top - menuHeight - 4) : (btnRect.bottom + 4)

    menuStyle.value = {
      position: 'absolute',
      left: `${left + scrollX}px`,
      top: `${top + scrollY}px`,
      width: `${btnRect.width}px`,
      zIndex: '1000'
    }
  } else {
    // closing, clear styles
    menuStyle.value = {}
  }
}

// 点击外部关闭旋转菜单
const handleClickOutsideRotation = (event: Event) => {
  const target = event.target as Element
  // if click is inside button or inside menu, ignore
  if (rotationBtn.value?.contains(target) || rotationMenu.value?.contains(target)) {
    return
  }
  showRotationMenu.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutsideRotation)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutsideRotation)
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