<template>
  <div 
    v-if="isVisible"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="handleBackdropClick"
  >
    <div 
      class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all"
      @click.stop
    >
      <!-- 标题栏 -->
      <div class="flex items-center justify-between p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">关于项目</h3>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- 项目信息内容 -->
      <div class="p-6 space-y-4">
        <!-- 项目名称与版本 -->
        <div class="text-center">
          <h4 class="text-xl font-bold text-gray-900">CutPlanner</h4>
          <p class="text-sm text-gray-500">
            版本
            <span v-if="/^[0-9a-f]{7}$/i.test(projectInfo.version)">
              <a :href="commitUrl" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">{{ projectInfo.version }}</a>
            </span>
            <span v-else>
              {{ projectInfo.version }}
            </span>
          </p>
        </div>

        <!-- 项目简介 -->
        <div class="text-center">
          <p class="text-gray-600">{{ projectInfo.description }}</p>
        </div>

        <!-- 详细信息 -->
        <div class="space-y-3 border-t pt-4">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-gray-500">作者</span>
            <a 
              :href="projectInfo.authorLink" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              {{ projectInfo.author }}
            </a>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-gray-500">开源协议</span>
            <span class="text-sm text-gray-900">{{ projectInfo.license }}</span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-gray-500">版权信息</span>
            <span class="text-sm text-gray-900">{{ projectInfo.copyright }}</span>
          </div>

          <!-- 源码地址 -->
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-gray-500">源码地址</span>
            <a 
              :href="projectInfo.repository"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              GitHub
            </a>
          </div>
        </div>

        <!-- 技术栈标签 -->
        <div class="border-t pt-4">
          <p class="text-sm font-medium text-gray-500 mb-2">技术栈</p>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="tech in projectInfo.technologies" 
              :key="tech"
              class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
            >
              {{ tech }}
            </span>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="flex justify-end p-6 border-t bg-gray-50 rounded-b-lg">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 定义 props
defineProps<{
  isVisible: boolean
}>()

// 定义 emits
defineEmits<{
  close: []
}>()

  // 项目信息数据
  // __GIT_HASH__ is injected at build time by Vite (short git hash or package version fallback)
  const injectedHash = typeof __GIT_HASH__ !== 'undefined' ? __GIT_HASH__ : ''

  const projectInfo = {
    // Show the injected git short hash (7 chars) when available. Otherwise fall back to package version.
    version: injectedHash || '0.1.0',
    description: '板材切割规划工具 - 减少废料，提升效率',
    author: '未央鹿鸣',
    authorLink: 'https://zhangyuheng.lunadeer.cn',
    license: 'GPL-3.0',
    copyright: '© 2025 LunaDeerTech',
    repository: 'https://github.com/LunaDeerTech/CutPlanner',
    technologies: ['Vue 3', 'TypeScript', 'Vite', 'Tailwind CSS', 'Pinia']
  }

  // Construct commit URL if version looks like a 7-char git hash
  const commitUrl = (/^[0-9a-f]{7}$/i.test(projectInfo.version))
    ? `${projectInfo.repository}/commit/${projectInfo.version}`
    : projectInfo.repository

// 处理背景点击事件
const handleBackdropClick = () => {
  // 点击背景时关闭弹窗
  // 由于有 @click.stop 在内容区域，只有点击背景才会触发
}
</script>