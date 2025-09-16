<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面标题 -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
        <h1 class="text-3xl font-bold text-gray-900">CutPlanner</h1>
        <p class="mt-2 text-gray-600">板材切割规划工具 - 减少废料，提升效率</p>
        
        <!-- 右上角按钮组 -->
        <div class="absolute top-6 right-4 flex items-center space-x-2">
          <!-- 项目信息按钮 -->
          <button
            @click="showProjectInfoModal = true"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="项目信息"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </button>
          
          <!-- 设置按钮 -->
          <button
            @click="showSettingsModal = true"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="设置"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <!-- 1. 原料配置区域 -->
      <MaterialSection />

      <!-- 2. 切割清单区域 -->
      <CuttingListSection
        :cutting-items="cuttingStore.items"
        @add-item="handleAddCuttingItem"
        @edit-item="handleEditCuttingItem"
        @update-item="handleUpdateCuttingItem"
        @delete-item="handleDeleteCuttingItem"
        @import-items="handleImportCuttingItems"
        @download-template="handleDownloadTemplate"
        @upload-template="handleUploadTemplate"
      />

      <!-- 3. 参数配置区域 -->
      <SettingsSection
        :settings="settingsStore.settings"
        @update-settings="handleUpdateSettings"
      />

      <!-- 4. 切割示意图区域 -->
      <CuttingResultSection
        :has-cutting-result="cuttingStore.hasResults"
        :cutting-results="cuttingStore.results"
        :materials="materialStore.materials"
        :items="cuttingStore.items"
        :can-generate="canGenerate"
        @generate-cutting-plan="generateCuttingPlan"
        @export-p-n-g="handleExportPNG"
        @export-report="handleExportReport"
      />
    </div>

    <!-- 设置弹窗 -->
    <SettingsModal
      :is-visible="showSettingsModal"
      @close="showSettingsModal = false"
      @save="handleSettingsSaved"
    />

    <!-- 项目信息弹窗 -->
    <ProjectInfoModal
      :is-visible="showProjectInfoModal"
      @close="showProjectInfoModal = false"
    />

    <!-- 切割项目弹窗 -->
    <CuttingItemModal
      :is-visible="showCuttingItemModal"
      :edit-item="editingCuttingItem"
      @close="showCuttingItemModal = false"
      @save="handleSaveCuttingItem"
      @update="handleUpdateCuttingItem"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMaterialStore } from '@/store/material'
import { useCuttingStore } from '@/store/cutting'
import { useSettingsStore } from '@/store/settings'
import MaterialSection from '@/components/MaterialSection.vue'
import CuttingListSection from '@/components/CuttingListSection.vue'
import SettingsSection from '@/components/SettingsSection.vue'
import CuttingResultSection from '@/components/CuttingResultSection.vue'
import SettingsModal from '@/components/SettingsModal.vue'
import CuttingItemModal from '@/components/CuttingItemModal.vue'
import ProjectInfoModal from '@/components/ProjectInfoModal.vue'
import { CuttingPlannerService } from '@/services/cutting/CuttingPlannerService'
import { exportAllCuttingPlansToPNG, generateCuttingReport } from '@/services/export'
import type { CuttingItem, CuttingSettings } from '@/models/types'

const materialStore = useMaterialStore()
const cuttingStore = useCuttingStore()
const settingsStore = useSettingsStore()

// 设置弹窗显示状态
const showSettingsModal = ref(false)

// 项目信息弹窗显示状态
const showProjectInfoModal = ref(false)

// 切割项目弹窗状态
const showCuttingItemModal = ref(false)
const editingCuttingItem = ref<CuttingItem | null>(null)

// 计算属性：是否可以生成切割方案
const canGenerate = computed(() => {
  return materialStore.materials.length > 0 && 
         cuttingStore.items.length > 0 && 
         materialStore.selectedMaterial !== null
})

// 切割清单相关方法
const handleAddCuttingItem = () => {
  editingCuttingItem.value = null
  showCuttingItemModal.value = true
}

const handleEditCuttingItem = (item: CuttingItem) => {
  editingCuttingItem.value = item
  showCuttingItemModal.value = true
}

const handleUpdateCuttingItem = (id: string, updates: Partial<CuttingItem>) => {
  cuttingStore.updateItem(id, updates)
  console.log('切割项目已更新:', updates)
}

const handleDeleteCuttingItem = (item: CuttingItem) => {
  cuttingStore.removeItem(item.id)
  console.log(`切割项目 "${item.name || '未命名'}" 已删除`)
}

const handleSaveCuttingItem = (item: Omit<CuttingItem, 'id'>) => {
  const newItem = cuttingStore.addItem(item)
  console.log('切割项目已添加:', newItem)
}

const handleDownloadTemplate = () => {
}

const handleUploadTemplate = () => {
  // 这个方法已经被替换为直接打开导入对话框，实际逻辑在CuttingListSection中
  console.log('打开导入对话框...')
}

const handleImportCuttingItems = (items: CuttingItem[]) => {
  // 批量添加导入的切割项目
  items.forEach(item => {
    const newItem: Omit<CuttingItem, 'id'> = {
      length: item.length,
      width: item.width,
      quantity: item.quantity,
      rotatation: item.rotatation || 'auto' // 默认旋转设置为 'auto'
    }
    
    // 添加可选字段
    if (item.name) newItem.name = item.name
    
    cuttingStore.addItem(newItem)
  })
  console.log(`已导入 ${items.length} 个切割项目`)
}

// 参数配置相关方法
const handleUpdateSettings = (updatedSettings: Partial<CuttingSettings>) => {
  settingsStore.updateSettings(updatedSettings)
  console.log('设置已更新:', settingsStore.settings)
}

// 设置保存处理
const handleSettingsSaved = (settings: CuttingSettings) => {
  console.log('设置已保存:', settings)
}

// 生成切割方案
const generateCuttingPlan = async () => {
  if (!canGenerate.value) {
    // 提供更具体的错误信息
    if (materialStore.materials.length === 0) {
      alert('请先添加原料')
    } else if (cuttingStore.items.length === 0) {
      alert('请先添加切割清单')
    } else if (materialStore.selectedMaterial === null) {
      alert('请先选择要使用的料板规格\n\n在"原料配置"区域点击料板卡片来选择')
    } else {
      alert('请先添加原料和切割清单，并选择要使用的料板')
    }
    return
  }
  
  try {
    // 设置计算状态
    cuttingStore.setCalculating(true)
    cuttingStore.clearResults()
    
    console.log('开始生成切割方案...')
    console.log('材料列表:', materialStore.materials)
    console.log('选择的材料:', materialStore.selectedMaterial)
    console.log('切割项目:', cuttingStore.items)
    console.log('设置:', settingsStore.settings)
    
    // 创建切割规划服务
    const cuttingPlanner = new CuttingPlannerService(settingsStore.settings)
    
    // 执行切割算法 - 传递选择的材料
    const results = await cuttingPlanner.calculateOptimalLayout(
      materialStore.materials,
      cuttingStore.items,
      materialStore.selectedMaterial!  // 使用 ! 断言，因为前面已经检查过 canGenerate
    )
    
    console.log('切割方案生成完成:', results)
    
    // 保存结果
    cuttingStore.setResults(results)
    
    // 显示成功信息
    if (results.length > 0) {
      const totalPieces = results.reduce((sum: number, result: any) => sum + result.cuts.length, 0)
      const usedMaterialName = materialStore.selectedMaterial?.name || materialStore.materials[0]?.name || '自动选择的料板'
      alert(`切割方案生成成功！\n使用料板: ${usedMaterialName}\n使用数量: ${results.length} 张\n切割零件: ${totalPieces} 个\n\n${materialStore.selectedMaterial ? '使用了您选择的料板类型' : '系统自动选择了最优料板'}`)
    } else {
      alert('无法生成切割方案，请检查材料和切割项目的尺寸')
    }
    
  } catch (error) {
    console.error('生成切割方案时出错:', error)
    alert(`生成切割方案时出错: ${error instanceof Error ? error.message : '未知错误'}`)
  } finally {
    cuttingStore.setCalculating(false)
  }
}

// 导出功能
const handleExportPNG = async () => {
  if (!cuttingStore.hasResults) {
    alert('请先生成切割方案')
    return
  }
  
  try {
    console.log('开始导出PNG...')
    // 尝试导出所有切割方案的PNG
    const containerId = 'cutting-results-container'
    await exportAllCuttingPlansToPNG(containerId, '切割方案')
  } catch (error) {
    console.error('导出PNG时发生错误:', error)
    alert(`导出PNG失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

const handleExportReport = async () => {
  if (!cuttingStore.hasResults) {
    alert('请先生成切割方案')
    return
  }
  
  try {
    console.log('开始生成切割报告...')
    generateCuttingReport(
      cuttingStore.results,
      materialStore.materials,
      cuttingStore.items
    )
  } catch (error) {
    console.error('导出报告时发生错误:', error)
    alert(`导出报告失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}
</script>

<style scoped>
/* Enhanced homepage with navigation and material preview */
</style>