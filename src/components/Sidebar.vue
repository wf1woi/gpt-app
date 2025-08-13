<template>
  <div class="sidebar">
      <div class="brand">
        <el-avatar :size="40">AI</el-avatar>
        <div class="info">
          <div class="name">智能AI助手</div>
          <div class="sub">gpt-app</div>
        </div>
        <div class="settings-container">
          <button @click="$router.push('/settings')" title="设置" class="settings-btn">
            <el-icon class="settings-icon">
              <Setting />
            </el-icon>
            <span class="settings-text">设置</span>
          </button>
        </div>
      </div>
      <el-menu :default-active="activePath" router class="menu" :collapse="false">
        <template v-for="assistant in assistants" :key="assistant.id">
          <el-menu-item :index="'/chat/' + assistant.id">
            <el-icon>
              <ChatDotRound />
            </el-icon>
            <span>{{ assistant.name }}</span>
          </el-menu-item>
        </template>
      </el-menu>

      <div class="section-head">
        <div>最近会话</div>
        <el-button text size="small" @click="openNewChat">新建</el-button>
      </div>

      <div class="sessions">
        <template v-for="s in sessions" :key="s.id">
          <el-card class="session-card" shadow="hover">
            <div class="row" @click="enter(s)">
              <div class="left">
                <el-tag size="small" :type="typeTag(s.assistantId)">{{ getAssistantShortName(s.assistantId) }}</el-tag>
                <div class="title">{{ s.title }} <span class="assistant-name">({{ getAssistantName(s.assistantId)
                    }})</span></div>
                <div class="time">{{ new Date(s.updatedAt).toLocaleString() }}</div>
              </div>
              <div class="ops" @click.stop>
                <el-button text @click="remove(s.id)" title="删除">
                  <el-icon>
                    <Delete />
                  </el-icon>
                </el-button>
              </div>
            </div>
          </el-card>
        </template>
        <div v-if="!sessions.length" class="empty">
          <el-empty description="暂无会话" :image-size="80" />
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue'
import { DifyClient } from '@/utils/dify'
import { useRoute, useRouter } from 'vue-router'
import { useChatStore } from '@/store/chat'
import { storeToRefs } from 'pinia'
import { ChatDotRound, Setting, Delete } from '@element-plus/icons-vue'
import { assistantConfig } from '@/utils/assistantConfig'

const route = useRoute()
const router = useRouter()
const chat = useChatStore()
const { currentAssistantId, sessionsByAssistantId } = storeToRefs(chat)

// 获取所有助手
const assistants = ref<any[]>([])

// 等待assistantConfig初始化完成后加载助手
onMounted(async () => {
  console.log('[Sidebar] Initializing...')
  await assistantConfig.waitForInit()
  assistants.value = assistantConfig.getAllAssistants()
  console.log('[Sidebar] Loaded assistants:', assistants.value)

  try {
    // 先从缓存获取会话列表
    const cachedConversations = localStorage.getItem('cachedConversations')
    if (cachedConversations) {
      console.log('[Sidebar] Loaded conversations from cache')
      // 缓存存在，直接加载
      chat.load()
    } else {
      // 缓存不存在，从API获取
      console.log('[Sidebar] Fetching conversations from API')
      const conversations = await DifyClient.getConversationsList({
        limit: 20,
        sort_by: '-updated_at'
      })

      // 将会话列表存入缓存
      localStorage.setItem('cachedConversations', JSON.stringify(conversations))
      console.log('[Sidebar] Fetched and cached conversations:', conversations)

      // 加载会话数据
      chat.load()
    }
  } catch (error) {
    console.error('[Sidebar] Error fetching conversations:', error)
    // 即使获取失败，也尝试从本地存储加载
    chat.load()
  }

  const assistantId = route.params.id as string;
  if (assistantId) {
    chat.selectAssistant(assistantId);
    console.log('[Sidebar] Selected assistant from route:', assistantId)
  } else if (assistants.value.length > 0) {
    // 默认选择第一个助手
    chat.selectAssistant(assistants.value[0].id);
    console.log('[Sidebar] Selected default assistant:', assistants.value[0].id)
  }
})

// 监听路由变化，更新当前助手
watchEffect(() => {
  const assistantId = route.params.id as string;
  if (assistantId) {
    chat.selectAssistant(assistantId);
    console.log('[Sidebar] Route changed, selected assistant:', assistantId)
  }
})

const activePath = computed(() => route.path)

const sessions = computed(() => sessionsByAssistantId.value(currentAssistantId.value))

// 根据助手ID获取助手名称
function getAssistantName(id: string) {
  const assistant = assistants.value.find(a => a.id === id);
  return assistant?.name || '未知助手'
}

// 根据助手ID获取标签类型
function typeTag(id: string) {
  // 可以根据不同助手设置不同颜色
  return 'success'
}
// 获取助手简称
function getAssistantShortName(id: string) {
  const assistant = assistants.value.find(a => a.id === id);
  return assistant?.name.substring(0, 2) || '助手'
}
function openNewChat() {
  chat.openNewChatDialog()
}
function enter(s: any) {
  router.push(`/chat/${s.assistantId}`)
}
function remove(id: string) {
  chat.removeSession(id)
}
</script>

<style scoped>
.sidebar {
  height: 100%;
  width: 100%;
  background: linear-gradient(180deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(248, 250, 252, 0.9) 100%);
  border-right: 1px solid rgba(79, 70, 229, 0.08);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(10px);
  position: relative;
}

.sidebar {
  height: 100%;
  width: 100%;
  background: var(--card-bg);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.brand {
  display: flex;
  align-items: center;
  padding: 20px 16px;
  border-bottom: 1px solid rgba(79, 70, 229, 0.1);
  background: linear-gradient(135deg, 
    var(--primary-color) 0%, 
    rgba(79, 70, 229, 0.9) 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(79, 70, 229, 0.15);
  position: relative;
  overflow: hidden;
}

.brand::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.1) 50%, 
    transparent 100%);
  opacity: 0.6;
}

.info {
  flex: 1;
  margin-left: 12px;
}

.info .name {
  font-weight: 600;
  font-size: 16px;
  color: white;
}

.info .sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.settings-container {
  display: flex;
  justify-content: flex-end;
}

.settings-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.15) 0%, 
    rgba(255, 255, 255, 0.1) 100%);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  font-size: 14px;
  backdrop-filter: blur(5px);
  position: relative;
  z-index: 1;
}

.settings-btn:hover {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.25) 0%, 
    rgba(255, 255, 255, 0.15) 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.menu {
  border-bottom: 1px solid var(--border-color);
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  color: var(--text-color-primary);
  font-weight: 500;
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
}

.sessions {
  flex: 1;
  overflow: auto;
  padding: 0;
}

.session-card {
  border-radius: 0;
  border: none;
  border-bottom: 1px solid var(--border-color);
  padding: 12px 16px;
  margin: 0;
  background-color: var(--card-bg);
}

.session-card:hover {
  background-color: var(--hover-bg);
}

.assistant-name {
  font-size: 12px;
  color: var(--text-color-secondary);
  margin-left: 6px;
}

.left {
  flex: 1;
}

.title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 4px;
}

.time {
  font-size: 12px;
  color: var(--text-color-secondary);
  margin-top: 2px;
}

.empty {
  padding: 30px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.info .name {
  font-weight: 600;
  font-size: 16px;
  background: linear-gradient(90deg, var(--el-primary-color), var(--el-success-color));
  -webkit-background-clip: text;
  background-clip: text;
  /* color: transparent; */
}

.info .sub {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.menu {
  border: none;
  border-radius: 0;
  overflow: hidden;
  background: linear-gradient(180deg, 
    rgba(255, 255, 255, 0.8) 0%, 
    rgba(248, 250, 252, 0.6) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3),
              0 2px 8px rgba(79, 70, 229, 0.08);
  margin: 8px 12px;
  border-radius: 12px;
  backdrop-filter: blur(8px);
}

.menu .el-menu-item {
  border-radius: 8px;
  margin: 6px 10px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;
}

.menu .el-menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(79, 70, 229, 0.05) 50%, 
    transparent 100%);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.menu .el-menu-item:hover {
  background: linear-gradient(90deg, 
    rgba(79, 70, 229, 0.08) 0%, 
    rgba(79, 70, 229, 0.05) 100%);
  transform: translateX(4px);
  border-color: rgba(79, 70, 229, 0.15);
  box-shadow: 0 3px 12px rgba(79, 70, 229, 0.12);
}

.menu .el-menu-item:hover::before {
  transform: translateX(0);
}

.menu .el-menu-item.is-active {
  background: linear-gradient(90deg, 
    rgba(79, 70, 229, 0.15) 0%, 
    rgba(79, 70, 229, 0.08) 100%);
  color: var(--el-primary-color);
  transform: translateX(6px);
  border-color: rgba(79, 70, 229, 0.2);
  box-shadow: 0 4px 16px rgba(79, 70, 229, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border-left: 3px solid var(--el-primary-color);
  font-weight: 600;
}

.menu .el-menu-item.is-active::before {
  transform: translateX(0);
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    transparent 50%, 
    rgba(255, 255, 255, 0.1) 100%);
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  color: var(--el-text-color-regular);
  font-weight: 600;
  border-radius: 10px;
  background: linear-gradient(90deg, 
    rgba(79, 70, 229, 0.06) 0%, 
    rgba(79, 70, 229, 0.02) 100%);
  margin: 8px 12px;
  border: 1px solid rgba(79, 70, 229, 0.08);
  box-shadow: 0 2px 6px rgba(79, 70, 229, 0.05);
  backdrop-filter: blur(5px);
  position: relative;
}

.section-head::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: linear-gradient(180deg, 
    var(--el-primary-color) 0%, 
    rgba(79, 70, 229, 0.6) 100%);
  border-radius: 2px;
}

.sessions {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 4px;
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE and Edge */
}

.sessions::-webkit-scrollbar {
  width: 0px;
  /* Chrome, Safari and Opera */
}

/* Hide scrollbar when not hovering */
.sessions::-webkit-scrollbar-thumb {
  display: none;
}

.sessions:hover::-webkit-scrollbar-thumb {
  display: block;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.sessions::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.2);
}

.session-card {
  cursor: pointer;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border: 1px solid rgba(79, 70, 229, 0.08);
  padding: 16px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.9) 0%, 
    rgba(248, 250, 252, 0.8) 100%);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(8px);
  margin: 6px 12px;
}

.session-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    transparent 0%, 
    rgba(79, 70, 229, 0.02) 50%, 
    transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.session-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background-color: transparent;
  transition: background-color 0.3s ease;
}

.session-card:hover {
  transform: translateY(-3px) translateX(4px);
  box-shadow: 0 12px 32px rgba(79, 70, 229, 0.15),
              0 4px 16px rgba(0, 0, 0, 0.08);
  border-color: rgba(79, 70, 229, 0.25);
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(248, 250, 252, 0.9) 100%);
}

.session-card:hover::after {
  opacity: 1;
}

.session-card:hover::before {
  background-color: var(--el-primary-color);
}

.row {
  display: flex;
  align-items: center;
}

.left {
  flex: 1;
  overflow: hidden;
}

.title {
  font-weight: 600;
  margin-top: 4px;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.empty {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 16px;
}

.ops {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.session-card:hover .ops {
  opacity: 1;
}
</style>
