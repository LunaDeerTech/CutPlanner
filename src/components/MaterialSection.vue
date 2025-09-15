<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-900">原料配置</h2>
      <button
        @click="navigateToMaterialInput"
        class="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        添加原料
      </button>
    </div>
    
    <!-- 原料列表 -->
    <div v-if="materialStore.materials.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <div
        v-for="material in materialStore.materials"
        :key="material.id"
        class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
      >
        <div class="flex-1">
          <h3 class="font-medium text-gray-900">{{ material.name }}</h3>
          <p class="text-sm text-gray-600 mt-1">
            {{ material.width }} × {{ material.height }} × {{ material.thickness }} {{ material.unit }}
          </p>
          <p v-if="material.materialType" class="text-xs text-gray-500 mt-1">
            {{ material.materialType }}
          </p>
        </div>
        <div class="flex space-x-2">
          <button
            @click="editMaterial(material)"
            class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="编辑材料"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button
            @click="deleteMaterial(material)"
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
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useMaterialStore } from '@/store/material'
import type { Material } from '@/models/types'

const router = useRouter()
const materialStore = useMaterialStore()

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

const deleteMaterial = (material: Material) => {
  const confirmMessage = `确定要删除材料"${material.name}"吗？\n\n尺寸：${material.width} × ${material.height} × ${material.thickness} ${material.unit}\n${material.materialType ? `类型：${material.materialType}\n` : ''}\n此操作不可撤销。`
  
  if (confirm(confirmMessage)) {
    try {
      materialStore.removeMaterial(material.id)
      // 可以添加一个简单的成功提示
      console.log(`材料 "${material.name}" 已删除`)
    } catch (error) {
      alert(`删除失败: ${error}`)
    }
  }
}
</script>