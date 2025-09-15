<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面标题 -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 class="text-3xl font-bold text-gray-900">CutPlanner</h1>
        <p class="mt-2 text-gray-600">专业木板切割规划工具</p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <!-- 1. 原料配置区域 -->
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
        <div v-if="materialStore.materials.length > 0" class="space-y-3">
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

      <!-- 2. 切割清单区域 -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">切割清单</h2>
          <div class="flex space-x-3">
            <button
              @click="addCuttingItem"
              class="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              添加
            </button>
            <button
              @click="downloadTemplate"
              class="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              下载模板
            </button>
            <button
              @click="uploadTemplate"
              class="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
              </svg>
              上传模板
            </button>
          </div>
        </div>
        
        <!-- 切割清单列表 -->
        <div v-if="cuttingItems.length > 0" class="overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">长度</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">宽度</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数量</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in cuttingItems" :key="item.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.name || '未命名' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.width }}{{ item.unit }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.height }}{{ item.unit }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.quantity }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button class="text-blue-600 hover:text-blue-900 mr-4">编辑</button>
                  <button class="text-red-600 hover:text-red-900">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-else class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">暂无切割清单</h3>
          <p class="mt-1 text-sm text-gray-500">点击上方按钮添加切割项目或上传模板</p>
        </div>
      </div>

      <!-- 3. 参数配置区域 -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">参数配置</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- 锯片厚度 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">锯片厚度</label>
            <div class="relative">
              <input
                v-model.number="settingsStore.settings.kerfWidth"
                @input="updateSettings"
                type="number"
                min="0"
                step="0.1"
                class="block w-full pr-12 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="3.0"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span class="text-gray-500 sm:text-sm">mm</span>
              </div>
            </div>
          </div>
          
          <!-- 留边距 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">留边距</label>
            <div class="relative">
              <input
                v-model.number="settingsStore.settings.margin"
                @input="updateSettings"
                type="number"
                min="0"
                step="0.1"
                class="block w-full pr-12 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="5.0"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span class="text-gray-500 sm:text-sm">mm</span>
              </div>
            </div>
          </div>
          
          <!-- 允许旋转 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">允许旋转</label>
            <div class="flex items-center">
              <input
                v-model="settingsStore.settings.allowRotation"
                @change="updateSettings"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label class="ml-2 text-sm text-gray-900">允许切割件旋转</label>
            </div>
          </div>
          
          <!-- 算法选择 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">优化算法</label>
            <select
              v-model="settingsStore.settings.optimizationStrategy"
              @change="updateSettings"
              class="block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="first-fit">首次适应</option>
              <option value="best-fit">最佳适应</option>
              <option value="bottom-left">左下角</option>
              <option value="genetic">遗传算法</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 4. 生成排版按钮 -->
      <div class="text-center">
        <button
          @click="generateCuttingPlan"
          :disabled="!canGenerate"
          class="inline-flex items-center px-8 py-4 text-lg font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
          </svg>
          生成切割方案
        </button>
        <p v-if="!canGenerate" class="mt-2 text-sm text-gray-500">
          请先添加原料和切割清单
        </p>
      </div>

      <!-- 5. 切割示意图区域 -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">切割示意图</h2>
          <!-- 6. 导出按钮 -->
          <div class="flex space-x-3">
            <button
              @click="exportPNG"
              :disabled="!hasCuttingResult"
              class="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              导出PNG
            </button>
            <button
              @click="exportReport"
              :disabled="!hasCuttingResult"
              class="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              导出报告
            </button>
          </div>
        </div>
        
        <!-- 切割结果显示区域 -->
        <div class="border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 min-h-96 flex items-center justify-center">
          <div v-if="!hasCuttingResult" class="text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">暂无切割方案</h3>
            <p class="mt-1 text-sm text-gray-500">点击"生成切割方案"按钮开始规划</p>
          </div>
          <div v-else class="text-center">
            <p class="text-gray-600">切割示意图将在此显示</p>
            <p class="text-sm text-gray-500 mt-2">（功能开发中...）</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMaterialStore } from '@/store/material'
import { useSettingsStore } from '@/store/settings'
import type { Material, CuttingItem } from '@/models/types'

const router = useRouter()
const materialStore = useMaterialStore()
const settingsStore = useSettingsStore()

// 切割清单数据（临时模拟数据，后续会从store获取）
const cuttingItems = ref<CuttingItem[]>([])

// 切割结果状态
const hasCuttingResult = ref(false)

// 计算属性：是否可以生成切割方案
const canGenerate = computed(() => {
  return materialStore.materials.length > 0 && cuttingItems.value.length > 0
})

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

// 切割清单相关方法
const addCuttingItem = () => {
  // TODO: 弹出表单输入目标板尺寸与数量
  alert('添加切割项目功能开发中...')
}

const downloadTemplate = () => {
  // TODO: 下载Excel模板
  alert('下载模板功能开发中...')
}

const uploadTemplate = () => {
  // TODO: 上传模板解析
  alert('上传模板功能开发中...')
}

// 参数配置相关方法
const updateSettings = () => {
  // 设置已经通过v-model自动更新到store中
  console.log('设置已更新:', settingsStore.settings)
}

// 生成切割方案
const generateCuttingPlan = () => {
  if (!canGenerate.value) {
    alert('请先添加原料和切割清单')
    return
  }
  
  // TODO: 执行切割算法
  alert('生成切割方案功能开发中...')
  // 模拟生成结果
  hasCuttingResult.value = true
}

// 导出功能
const exportPNG = () => {
  if (!hasCuttingResult.value) {
    alert('请先生成切割方案')
    return
  }
  // TODO: 导出PNG
  alert('导出PNG功能开发中...')
}

const exportReport = () => {
  if (!hasCuttingResult.value) {
    alert('请先生成切割方案')
    return
  }
  // TODO: 导出报告
  alert('导出报告功能开发中...')
}
</script>

<style scoped>
/* Enhanced homepage with navigation and material preview */
</style>