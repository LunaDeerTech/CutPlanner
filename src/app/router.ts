import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: {
      title: 'CutPlanner - 木板切割规划工具'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Add global route guard to update page title
router.beforeEach((to) => {
  if (to.meta?.title) {
    document.title = to.meta.title as string
  }
})

export default router