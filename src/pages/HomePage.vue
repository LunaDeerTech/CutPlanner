<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div class="text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-6xl md:text-8xl font-light text-gray-900 mb-6">
        CutPlanner
      </h1>
      <p class="text-xl md:text-2xl text-gray-600 mb-12 font-light">
        专业木板切割规划工具
      </p>
      
      <!-- 功能导航区域 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        <!-- 添加原料 -->
        <div class="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 cursor-pointer" 
             @click="navigateToMaterialInput">
          <div class="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">添加原料板材</h3>
          <p class="text-gray-600 text-sm">输入原料木板的尺寸和材质信息</p>
        </div>

        <!-- 导入切割清单 - 暂未实现 -->
        <div class="group bg-white rounded-xl shadow-lg opacity-50 p-6 cursor-not-allowed">
          <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-400 mb-2">输入切割清单</h3>
          <p class="text-gray-400 text-sm">手动输入目标尺寸或通过Excel模板填写（敬请期待）</p>
        </div>

        <!-- 切割规划 - 暂未实现 -->
        <div class="group bg-white rounded-xl shadow-lg opacity-50 p-6 cursor-not-allowed">
          <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-400 mb-2">生成切割方案</h3>
          <p class="text-gray-400 text-sm">智能优化切割布局（敬请期待）</p>
        </div>
      </div>

      <!-- 材料列表预览 -->
      <div v-if="materialStore.materials.length > 0" class="mt-12">
        <h2 class="text-2xl font-semibold text-gray-900 mb-6">已添加的材料</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="material in materialStore.materials"
            :key="material.id"
            class="bg-white rounded-lg shadow p-4 relative group hover:shadow-md transition-shadow"
          >
            <!-- 编辑和删除按钮 -->
            <div class="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                @click="editMaterial(material)"
                class="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="编辑材料"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button
                @click="deleteMaterial(material)"
                class="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="删除材料"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
            
            <h3 class="font-medium text-gray-900 pr-12">{{ material.name }}</h3>
            <p class="text-sm text-gray-600 mt-1">
              {{ material.width }} × {{ material.height }} × {{ material.thickness }} {{ material.unit }}
            </p>
            <p v-if="material.materialType" class="text-xs text-gray-500 mt-1">
              {{ material.materialType }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useMaterialStore } from '@/store/material'
import type { Material } from '@/models/types'

const router = useRouter()
const materialStore = useMaterialStore()

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

<style scoped>
/* Enhanced homepage with navigation and material preview */
</style>