<template>
  <div 
    v-if="isVisible" 
    class="fixed inset-0 z-50 overflow-y-auto"
    @click="handleOverlayClick"
  >
    <!-- 背景遮罩 -->
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
    
    <!-- 弹窗容器 -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div 
        class="relative w-full max-w-md transform rounded-lg bg-white shadow-xl transition-all"
        @click.stop
      >
        <!-- 弹窗标题 -->
        <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 class="text-lg font-semibold text-gray-900">设置</h3>
          <button
            @click="closeModal"
            class="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 弹窗内容 -->
        <div class="px-6 py-4 space-y-6">
          
          <!-- 默认单位选择 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              默认单位
            </label>
            <div class="flex space-x-4">
              <label class="flex items-center">
                <input
                  v-model="localSettings.unit"
                  type="radio"
                  value="mm"
                  class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                >
                <span class="ml-2 text-sm text-gray-700">毫米 (mm)</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="localSettings.unit"
                  type="radio"
                  value="inch"
                  class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                >
                <span class="ml-2 text-sm text-gray-700">英寸 (inch)</span>
              </label>
            </div>
          </div>

          <!-- 锯片厚度 -->
          <div>
            <label for="kerfWidth" class="block text-sm font-medium text-gray-700 mb-2">
              默认锯片厚度
            </label>
            <div class="relative">
              <input
                id="kerfWidth"
                v-model.number="localSettings.kerfWidth"
                type="number"
                min="0"
                step="0.1"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="例如: 3"
              >
              <span class="absolute right-3 top-2 text-sm text-gray-500">
                {{ localSettings.unit }}
              </span>
            </div>
            <p class="mt-1 text-xs text-gray-500">
              切割时锯片占用的厚度，影响最终尺寸计算
            </p>
          </div>

          <!-- 边距 -->
          <div>
            <label for="margin" class="block text-sm font-medium text-gray-700 mb-2">
              默认边距
            </label>
            <div class="relative">
              <input
                id="margin"
                v-model.number="localSettings.margin"
                type="number"
                min="0"
                step="0.1"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="例如: 5"
              >
              <span class="absolute right-3 top-2 text-sm text-gray-500">
                {{ localSettings.unit }}
              </span>
            </div>
            <p class="mt-1 text-xs text-gray-500">
              切割时预留的安全边距
            </p>
          </div>

          <!-- 料板方向 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              料板方向
            </label>
            <div class="flex space-x-4">
              <label class="flex items-center">
                <input
                  v-model="localSettings.materialOrientation"
                  type="radio"
                  :value="MaterialOrientation.VERTICAL"
                  class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                >
                <span class="ml-2 text-sm text-gray-700">竖向</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="localSettings.materialOrientation"
                  type="radio"
                  :value="MaterialOrientation.HORIZONTAL"
                  class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                >
                <span class="ml-2 text-sm text-gray-700">横向</span>
              </label>
            </div>
            <p class="mt-1 text-xs text-gray-500">
              决定料板的摆放方向（竖向：高>宽，横向：宽>高）
            </p>
          </div>
        </div>

        <!-- 弹窗底部按钮 -->
        <div class="flex items-center justify-between border-t border-gray-200 px-6 py-4">
          <button
            @click="resetToDefaults"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            恢复默认
          </button>
          <div class="flex space-x-3">
            <button
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              取消
            </button>
            <button
              @click="saveSettings"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              保存设置
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSettingsStore } from '@/store/settings'
import type { CuttingSettings } from '@/models/types'
import { MaterialOrientation } from '@/models/types'

interface Props {
  isVisible: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'save', settings: CuttingSettings): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const settingsStore = useSettingsStore()

// 本地设置状态，避免直接修改 store 中的数据
const localSettings = ref<CuttingSettings>({ ...settingsStore.settings })

// 监听弹窗显示状态，重新加载设置数据
watch(() => props.isVisible, (visible) => {
  if (visible) {
    localSettings.value = { ...settingsStore.settings }
  }
})

// 关闭弹窗
const closeModal = () => {
  emit('close')
}

// 处理背景点击
const handleOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}

// 保存设置
const saveSettings = () => {
  settingsStore.updateSettings(localSettings.value)
  emit('save', localSettings.value)
  closeModal()
}

// 恢复默认设置
const resetToDefaults = () => {
  settingsStore.resetToDefaults()
  localSettings.value = { ...settingsStore.settings }
}
</script>

<style scoped>
/* 设置弹窗样式 */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  appearance: none;
  margin: 0;
}

input[type="number"] {
  appearance: textfield;
}
</style>