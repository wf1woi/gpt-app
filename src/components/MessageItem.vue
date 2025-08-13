<template>
  <div class="msg-row" :class="{ user: role === 'user' }">
    <el-avatar v-if="role==='assistant'" class="avatar ai">AI</el-avatar>
    <div class="msg-bubble" :class="role==='user' ? 'user' : 'ai'">
      <div class="content" v-html="rendered"></div>
      <div class="msg-meta">
        <span class="time">{{ time }}</span>
        <el-button link size="small" @click="copy" class="copy-btn">复制</el-button>
      </div>
    </div>
    <el-avatar v-if="role==='user'" class="avatar user">我</el-avatar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ role: 'user'|'assistant'; content: string; time: string }>()

function copy() {
  navigator.clipboard.writeText(props.content.replace(/<[^>]+>/g, ''))
}

const rendered = computed(() => {
  // 轻量 Markdown 处理（*粗体*、`内联代码`、换行）—避免新增依赖
  let html = props.content
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g,'&gt;')
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **bold**
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>') // *italic*
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>') // `code`
  html = html.replace(/\n/g, '<br>')
  return html
})
</script>

<style scoped>
/* 美化后的消息项样式 */
.msg-row {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-lg);
  margin: var(--spacing-md) 0;
  position: relative;
  transition: all var(--animation-duration-fast) cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.msg-row:hover {
  transform: translateY(-2px);
}

.avatar {
  width: calc(var(--avatar-size) + 4px);
  height: calc(var(--avatar-size) + 4px);
  line-height: calc(var(--avatar-size) + 4px);
  font-size: var(--font-size-sm);
  flex-shrink: 0;
  border-radius: 50%;
  text-align: center;
  position: relative;
  transition: all var(--animation-duration-fast) ease;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-semibold);
  color: white;
}

.avatar::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  background: linear-gradient(45deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.3) 50%, 
    transparent 100%);
  opacity: 0;
  transition: opacity var(--animation-duration-fast) ease;
}

.avatar.ai {
  background: linear-gradient(135deg, 
    var(--color-secondary) 0%, 
    rgba(var(--color-secondary-rgb), 0.8) 100%);
}

.msg-row:hover .avatar.ai {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(var(--color-secondary-rgb), 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.msg-row:hover .avatar.ai::after {
  opacity: 1;
}

.avatar.user {
  background: linear-gradient(135deg, 
    var(--color-primary) 0%, 
    rgba(var(--color-primary-rgb), 0.8) 100%);
}

.msg-row:hover .avatar.user {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(var(--color-primary-rgb), 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.msg-row:hover .avatar.user::after {
  opacity: 1;
}

.msg-bubble {
  flex: 1;
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 85%;
  position: relative;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(8px);
  border: 1px solid transparent;
  transition: all var(--animation-duration-fast) ease;
}

.msg-row:hover .msg-bubble {
  background: rgba(255, 255, 255, 0.6);
  border-color: rgba(var(--color-primary-rgb), 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08),
              0 4px 16px rgba(var(--color-primary-rgb), 0.1);
}

.msg-bubble.user {
  background: linear-gradient(135deg, 
    rgba(var(--color-primary-rgb), 0.08) 0%, 
    rgba(var(--color-primary-rgb), 0.04) 100%);
  margin-left: auto;
  border-left: 3px solid var(--color-primary);
}

.msg-bubble.user::before {
  content: '';
  position: absolute;
  top: 0;
  right: -6px;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, 
    var(--color-primary) 0%, 
    rgba(var(--color-primary-rgb), 0.6) 100%);
  border-radius: 2px;
}

.msg-bubble.ai {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.6) 0%, 
    rgba(248, 250, 252, 0.4) 100%);
  border-left: 3px solid var(--color-secondary);
}

.msg-bubble.ai::before {
  content: '';
  position: absolute;
  top: 0;
  left: -6px;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, 
    var(--color-secondary) 0%, 
    rgba(var(--color-secondary-rgb), 0.6) 100%);
  border-radius: 2px;
}

.content {
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  position: relative;
  z-index: 1;
}

.msg-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-xs);
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.1);
  position: relative;
}

.msg-meta::after {
  content: '';
  position: absolute;
  top: -1px;
  right: 0;
  width: 30%;
  height: 2px;
  background: linear-gradient(90deg, 
    var(--color-primary) 0%, 
    transparent 100%);
  border-radius: 1px;
}

.time {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  background: rgba(0, 0, 0, 0.04);
  padding: 2px 8px;
  border-radius: var(--border-radius-full);
  font-family: var(--font-family-mono, monospace);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.copy-btn {
  opacity: 0;
  transition: opacity var(--animation-duration-fast);
  color: var(--color-text-tertiary);
  background: rgba(255, 255, 255, 0.3);
  padding: 2px 8px;
  border-radius: var(--border-radius-full);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.msg-bubble:hover .copy-btn {
  opacity: 1;
}

.copy-btn:hover {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  border-color: rgba(var(--color-primary-rgb), 0.15);
}

.content code {
  background-color: rgba(0, 0, 0, 0.06);
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
  font-family: var(--font-family-mono, monospace);
  font-size: var(--font-size-xs);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.content strong {
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.content em {
  font-style: italic;
  color: var(--color-text-secondary);
}
</style>
