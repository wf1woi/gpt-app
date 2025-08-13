import { createRouter, createWebHistory, NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { getUserByCode } from '@/api/wecom'
import { useAppStore } from '@/store/app'
import { assistantConfig } from '@/utils/assistantConfig'

import ChatView from '@/views/ChatView.vue'
import Settings from '@/views/Settings.vue'

// 获取默认助手ID
const defaultAssistantId = assistantConfig.getAllAssistants()[0]?.id || 'meeting'

const routes = [
  { path: '/', redirect: `/chat/${defaultAssistantId}` },
  { path: '/chat/:id', component: ChatView, props: true },
  { path: '/settings', component: Settings }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * 全局前置守卫 - 处理code参数和用户信息
 */
router.beforeEach(async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  // 检查是否有code参数
  const code = to.query.code as string | undefined

  // 如果有code参数且尚未存储用户工号
  if (code) {
    const appStore = useAppStore()
    
    // 如果用户工号为空，才调用接口获取
    if (!appStore.userCode) {
      try {
        console.log('获取用户信息中...')
        const result = await getUserByCode(code)
        
        if (result.success && result.data) {
          console.log('获取用户信息成功:', result.data)
          appStore.setUserCode(result.data)
        } else {
          console.error('获取用户信息失败:', result.error)
        }
      } catch (error) {
        console.error('获取用户信息时发生错误:', error)
      }
    }
  }

  next()
})

export default router
