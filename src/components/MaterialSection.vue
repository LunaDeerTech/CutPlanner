<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-3">
        <h2 class="text-xl font-semibold text-gray-900">原料配置</h2>
        <!-- 显示当前选择的原料信息 -->
        <div v-if="materialStore.selectedMaterial" class="flex items-center flex-wrap gap-2">
          <!-- 名称标签 -->
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {{ materialStore.selectedMaterial.name }}
          </span>
          
          <!-- 尺寸标签 -->
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            尺寸：{{ materialStore.selectedMaterial.width }} × {{ materialStore.selectedMaterial.height }}{{ materialStore.selectedMaterial.unit }}
          </span>
          
          <!-- 厚度标签 -->
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
            厚度：{{ materialStore.selectedMaterial.thickness }}{{ materialStore.selectedMaterial.unit }}
          </span>
          
          <!-- 类型标签（如果有的话） -->
          <span 
            v-if="materialStore.selectedMaterial.materialType"
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800"
          >
            类型：{{ materialStore.selectedMaterial.materialType }}
          </span>
        </div>
      </div>
      <div class="flex items-center space-x-3">
        <button
          @click="navigateToMaterialInput"
          class="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          添加原料
        </button>
        <button
          @click="toggleExpanded"
          class="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          :title="isExpanded ? '折叠列表' : '展开列表'"
        >
          <svg 
            class="w-4 h-4 transition-transform duration-200" 
            :class="{ 'rotate-180': !isExpanded }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- 原料列表 -->
    <transition name="slide-fade">
      <div v-show="isExpanded">
        <div v-if="materialStore.materials.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="material in materialStore.materials"
            :key="material.id"
            @click="selectMaterial(material)"
            :class="[
              'flex items-center justify-between p-4 border rounded-lg transition-all cursor-pointer',
              materialStore.selectedMaterial?.id === material.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            ]"
          >
            <div class="flex-1">
              <div class="flex items-center space-x-2">
                <h3 class="font-medium text-gray-900">{{ material.name }}</h3>
                <!-- 当前选择标签 -->
                <span 
                  v-if="materialStore.selectedMaterial?.id === material.id"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  当前选择
                </span>
              </div>
              <p class="text-sm text-gray-600 mt-1">
                {{ material.width }} × {{ material.height }} × {{ material.thickness }} {{ material.unit }}
              </p>
              <p v-if="material.materialType" class="text-xs text-gray-500 mt-1">
                {{ material.materialType }}
              </p>
            </div>
            <div class="flex space-x-2">
              <button
                @click.stop="editMaterial(material)"
                class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="编辑材料"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button
                @click.stop="deleteMaterial(material)"
                class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="删除材料"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">暂无原料</h3>
          <p class="mt-1 text-sm text-gray-500">点击上方按钮添加原料板材</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMaterialStore } from '@/store/material'
import type { Material } from '@/models/types'

const router = useRouter()
const materialStore = useMaterialStore()
const isExpanded = ref(true)

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

// 原料相关方法
const navigateToMaterialInput = () => {
  router.push('/material/input')
}

const editMaterial = (material: Material) => {
  // 设置当前编辑的材料到store中
  materialStore.setCurrentMaterial(material)
  // 导航到材料输入页面进行编辑
  router.push('/material/input')
}

const selectMaterial = (material: Material) => {
  // 如果点击的是已选择的材料，则取消选择
  if (materialStore.selectedMaterial?.id === material.id) {
    materialStore.setSelectedMaterial(null)
  } else {
    materialStore.setSelectedMaterial(material)
  }
}

const deleteMaterial = (material: Material) => {
  const confirmMessage = `确定要删除材料"${material.name}"吗？\n\n尺寸：${material.width} × ${material.height} × ${material.thickness} ${material.unit}\n${material.materialType ? `类型：${material.materialType}\n` : ''}\n此操作不可撤销。`
  
  if (confirm(confirmMessage)) {
    try {
      // 如果删除的是当前选中的材料，则清除选中状态
      if (materialStore.selectedMaterial?.id === material.id) {
        materialStore.setSelectedMaterial(null)
      }
      materialStore.removeMaterial(material.id)
      // 可以添加一个简单的成功提示
      console.log(`材料 "${material.name}" 已删除`)
    } catch (error) {
      alert(`删除失败: ${error}`)
    }
  }
}
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition:
    opacity 0.6s cubic-bezier(0.34, 1.56, 0.64, 1),
    transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1),
    max-height 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    filter 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    box-shadow 0.3s ease;
  overflow: hidden;
  will-change: opacity, transform, max-height, filter;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translate3d(0, -20px, 0) scale3d(0.95, 0.95, 1);
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
  filter: blur(3px) brightness(0.9);
  box-shadow: 0 0 0 rgb(0 0 0 / 0%);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translate3d(0, -12px, 0) scale3d(0.97, 0.97, 1);
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
  filter: blur(2px) brightness(0.95);
  box-shadow: 0 0 0 rgb(0 0 0 / 0%);
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale3d(1, 1, 1);
  max-height: 4000px; /* 更大的值确保内容完全显示 */
  filter: blur(0) brightness(1);
  box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
}

/* 更精细的内容动画 */
.slide-fade-enter-active .grid,
.slide-fade-leave-active .grid {
  transition:
    opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.15s,
    transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.15s;
  will-change: opacity, transform;
}

.slide-fade-enter-from .grid {
  opacity: 0;
  transform: translate3d(0, 10px, 0);
}

.slide-fade-leave-to .grid {
  opacity: 0.3;
  transform: translate3d(0, -5px, 0);
}

.slide-fade-enter-to .grid,
.slide-fade-leave-from .grid {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

/* 空状态的特殊动画 */
.slide-fade-enter-active .text-center,
.slide-fade-leave-active .text-center {
  transition: opacity 0.3s ease 0.2s, transform 0.3s ease 0.2s;
}

.slide-fade-enter-from .text-center {
  opacity: 0;
  transform: translate3d(0, 8px, 0);
}

.slide-fade-leave-to .text-center {
  opacity: 0.5;
  transform: translate3d(0, -4px, 0);
}

.slide-fade-enter-to .text-center,
.slide-fade-leave-from .text-center {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}
</style>