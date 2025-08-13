<template>
  <el-card shadow="never" class="chat-card">
    <div class="chat-wrap">
      <ChatHeader
        :title="name"
        :short="short"
        :color="color"
        :conversation-id="current?.conversationId"
        @rename="rename"
        @clear="clear"
        @remove="remove"
      />

      <div class="chat-toolbar">
        <div class="left">
          <el-button size="small" :disabled="!current?.streaming" @click="stop" type="danger" plain>停止生成</el-button>
          <el-button size="small" :disabled="current?.streaming || !hasLastUser" @click="regenerate">重新生成</el-button>
        </div>
        <div class="right">
          <el-tag type="info" size="small">Dify 应用（SSE）</el-tag>
        </div>
      </div>

      <MessageList :messages="messages" :typing="typing" />

      <ChatComposer :loading="sending" @send="onSend" />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useChatStore } from '@/store/chat'
import MessageList from '@/components/MessageList.vue'
import ChatComposer from '@/components/ChatComposer.vue'
import ChatHeader from '@/components/ChatHeader.vue'
import { DifyClient } from '@/utils/dify'
import { assistantConfig } from '@/utils/assistantConfig'
import { ElMessageBox, ElMessage } from 'element-plus'

// 响应式获取当前助手
const currentAssistant = assistantConfig.useCurrentAssistant()

const name = computed(() => currentAssistant.value?.name || '智能助手')
const short = computed(() => currentAssistant.value?.name.substring(0, 1) || '助')
const color = computed(() => '#79bbff') // 可以根据助手ID设置不同颜色

// 监听助手变化，更新会话
watch(currentAssistant, (newAssistant, oldAssistant) => {
  if (newAssistant && newAssistant.id !== oldAssistant?.id) {
    chat.selectAssistant(newAssistant.id)
  }
})

const chat = useChatStore()
onMounted(() => {
  if (currentAssistant.value) {
    chat.selectAssistant(currentAssistant.value.id)
  }
})

const current = computed(() => (chat as any).currentSession)
const messages = computed(() => current.value?.messages || [])
const typing = ref(false)
const sending = ref(false)

const hasLastUser = computed(() => {
  const s = current.value
  if (!s || s.messages.length === 0) return false
  const lastUser = [...s.messages].reverse().find(m => m.role === 'user')
  return !!lastUser
})

function ensureSession() {
  return current.value || chat.newSession(currentAssistant.value?.id || 'default', name.value)
}

async function onSend(text: string) {
  const s = ensureSession()
  chat.addMessage(s.id, 'user', text)
  typing.value = true; sending.value = true
  chat.setStreaming(s.id, true)

  try {
    await DifyClient.sendMessage(
      text,
      s.conversationId,
      (chunk: string, isFinal: boolean) => {
        if (!s.messages.find((m: any) => m.role === 'assistant' && m.id.endsWith('_temp'))) {
          chat.addMessage(s.id, 'assistant', chunk)
          const last = s.messages[s.messages.length - 1]
          last.id = last.id + '_temp'
        } else {
          const last = s.messages[s.messages.length - 1]
          last.content += chunk
          chat.persist()
        }

        if (isFinal) {
          const last = s.messages[s.messages.length - 1]
          if (last && last.id.endsWith('_temp')) last.id = last.id.replace('_temp','')
          typing.value = false; sending.value = false
          chat.setStreaming(s.id, false)
          chat.setTaskId(s.id, undefined)

          // 如果是新对话，更新会话名称
          if (!s.title || s.title === '新会话') {
            const newTitle = text.length > 20 ? text.substring(0, 20) + '...' : text;
            chat.renameSession(s.id, newTitle);
          }
        }
      },
      (taskId: string) => {
        chat.setTaskId(s.id, taskId)
      }
    );
  } catch (error) {
    chat.addMessage(s.id, 'assistant', '⚠️ 调用失败：' + (error instanceof Error ? error.message : String(error)))
    typing.value = false; sending.value = false
    chat.setStreaming(s.id, false)
  }
}

// 调用后端停止接口终止当前生成
async function stop() {
  const s = current.value
  if (!s || !s.taskId) return
  try {
    await DifyClient.stop(s.taskId)
  } catch (error) {
    console.error(error)
  }
  chat.setStreaming(s.id, false)
  chat.setTaskId(s.id, undefined)
  typing.value = false; sending.value = false
}

function regenerate() {
  const s = current.value
  if (!s) return
  // 找到最后一条用户消息作为重试依据
  const lastUser = [...s.messages].reverse().find(m => m.role === 'user')
  if (!lastUser) return
  onSend(lastUser.content.replace(/<[^>]+>/g, ''))
}

function clear() {
  const s = ensureSession()
  ElMessageBox.confirm('确定清空该会话所有消息吗？', '清空对话', { type: 'warning' })
    .then(() => chat.resetSession(s.id))
    .catch(() => {})
}

function remove() {
  const s = current.value
  if (!s) return
  ElMessageBox.confirm('确定删除该会话吗？该操作不可恢复。', '删除会话', { type: 'warning' })
    .then(() => chat.removeSession(s.id))
    .then(() => ElMessage.success('已删除'))
    .catch(() => {})
}

async function rename() {
  // 获取当前会话，如果不存在则创建新会话
  const s = current.value || chat.newSession(currentAssistant.value?.id || '', name.value)
  const { value } = await ElMessageBox.prompt('输入新的会话名称：', '重命名', {
    inputPlaceholder: '会话名称',
    inputValue: s.title
  }).catch(() => ({ value: null } as any))
  if (value) chat.renameSession(s.id, value)
}
</script>

<style scoped>
/* 美化后的聊天界面样式 */
.chat-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border: none;
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
  background: linear-gradient(135deg, 
    rgba(248, 250, 252, 0.8) 0%, 
    rgba(255, 255, 255, 0.6) 100%);
  position: relative;
}

.chat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 10% 20%, rgba(121, 187, 255, 0.05) 0%, transparent 20%),
    radial-gradient(circle at 90% 80%, rgba(165, 180, 252, 0.05) 0%, transparent 20%);
  z-index: 0;
}

.chat-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  z-index: 1;
}

.chat-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-lg);
  background: rgba(255, 255, 255, 0.6);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(6px);
  position: relative;
}

.chat-toolbar::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(0, 0, 0, 0.1) 50%, 
    transparent 100%);
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
  background: transparent;
  position: relative;
}

.chat-body::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(121, 187, 255, 0.03) 0%, transparent 15%),
    radial-gradient(circle at 80% 70%, rgba(165, 180, 252, 0.03) 0%, transparent 15%);
  z-index: -1;
}

/* 美化按钮样式 */
.el-button--small {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-xs);
  border-radius: var(--border-radius-md);
  background-color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.08);
  color: var(--color-text-secondary);
  transition: all var(--animation-duration-fast) ease;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(4px);
}

.el-button--small::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    transparent 0%, 
    rgba(var(--color-primary-rgb), 0.05) 50%, 
    transparent 100%);
  opacity: 0;
  transition: opacity var(--animation-duration-fast) ease;
}

.el-button--small:hover {
  background-color: rgba(255, 255, 255, 0.9);
  border-color: rgba(0, 0, 0, 0.15);
  color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.el-button--small:hover::before {
  opacity: 1;
}

.el-button--small:disabled {
  background-color: rgba(0, 0, 0, 0.03);
  border-color: rgba(0, 0, 0, 0.05);
  color: var(--color-text-tertiary);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 美化标签样式 */
.el-tag {
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-xs);
  background: linear-gradient(135deg, 
    rgba(121, 187, 255, 0.15) 0%, 
    rgba(165, 180, 252, 0.1) 100%);
  color: var(--color-primary);
  border: 1px solid rgba(121, 187, 255, 0.2);
  padding: 2px 10px;
  backdrop-filter: blur(4px);
  position: relative;
  overflow: hidden;
}

.el-tag::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.2) 50%, 
    transparent 100%);
  opacity: 0;
  transition: opacity var(--animation-duration-fast) ease;
}

.el-tag:hover::before {
  opacity: 1;
}
</style>
