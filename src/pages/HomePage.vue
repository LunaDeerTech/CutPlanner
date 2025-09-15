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
            class="bg-white rounded-lg shadow p-4"
          >
            <h3 class="font-medium text-gray-900">{{ material.name }}</h3>
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

const router = useRouter()
const materialStore = useMaterialStore()

const navigateToMaterialInput = () => {
  router.push('/material/input')
}
</script>

<style scoped>
/* Enhanced homepage with navigation and material preview */
</style>