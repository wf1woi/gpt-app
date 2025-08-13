<template>
  <div class="chat-composer">
    <div class="composer-wrapper">
      <el-input
        v-model="text"
        type="textarea"
        :autosize="{ minRows: 1, maxRows: 6 }"
        placeholder="输入你的问题或指令..."
        @keydown.enter.exact.prevent="send"
        @keydown.enter.shift.exact.stop
        class="composer-input"
      />
      <el-button 
        type="primary" 
        :loading="loading" 
        @click="send" 
        circle 
        title="发送"
        class="send-button"
      >
        <el-icon><Promotion /></el-icon>
      </el-button>
    </div>
    <div class="composer-foot">
      <div class="left">
        <el-button text size="small" :disabled="true" title="上传文件（示例占位）">上传</el-button>
        <el-button text size="small" :disabled="true" title="语音输入（示例占位）">语音</el-button>
        <el-divider direction="vertical" />
        <el-button text size="small" :disabled="true" title="AI 设置（示例占位）">AI 设置</el-button>
      </div>
      <div class="right">
        <el-text type="info">回车发送 / Shift+回车 换行</el-text>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Promotion } from '@element-plus/icons-vue'

const props = defineProps<{ loading?: boolean }>()
const emits = defineEmits<{ (e:'send', text:string):void }>()

const text = ref('')
watch(() => props.loading, () => {})

function send() {
  const t = text.value.trim()
  if (!t) return
  emits('send', t)
  text.value = ''
}
</script>

<style scoped>
.chat-composer {
  background: rgba(255, 255, 255, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  padding: var(--spacing-xl);
  border-radius: 0 0 var(--border-radius-xl) var(--border-radius-xl);
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.06),
              inset 0 1px 0 rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;
}

.chat-composer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(var(--color-primary-rgb), 0.4) 50%, 
    transparent 100%);
}

.composer-wrapper {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  position: relative;
}

.composer-input {
  flex: 1;
  position: relative;
}

.composer-input::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: var(--border-radius-full);
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.8) 0%, 
    rgba(248, 250, 252, 0.6) 100%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.5);
  z-index: -1;
}

.composer-input .el-textarea__inner {
  border-radius: var(--border-radius-full);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
  padding: var(--spacing-md) var(--spacing-lg);
  transition: all var(--animation-duration-fast) cubic-bezier(0.25, 0.46, 0.45, 0.94);
  min-height: 56px;
  font-size: var(--font-size-base);
  background: transparent;
  color: var(--color-text);
  backdrop-filter: blur(4px);
}

.composer-input .el-textarea__inner:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.2),
              0 4px 16px rgba(0, 0, 0, 0.1);
  outline: none;
}

.send-button {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, 
    var(--color-primary) 0%, 
    rgba(var(--color-primary-rgb), 0.8) 100%);
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(var(--color-primary-rgb), 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all var(--animation-duration-fast) cubic-bezier(0.25, 0.46, 0.45, 0.94);
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.send-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.3) 50%, 
    transparent 100%);
  opacity: 0;
  transition: opacity var(--animation-duration-fast) ease;
}

.send-button:hover {
  background: linear-gradient(135deg, 
    var(--color-primary) 0%, 
    var(--color-primary) 100%);
  transform: scale(1.05) translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--color-primary-rgb), 0.4),
              0 4px 12px rgba(0, 0, 0, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.send-button:hover::before {
  opacity: 1;
}

.send-button:active {
  transform: scale(0.98) translateY(0);
}

.send-button:disabled {
  background: rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: not-allowed;
  border-color: rgba(255, 255, 255, 0.4);
}

.composer-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--spacing-sm);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
}

.composer-foot::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(0, 0, 0, 0.1) 50%, 
    transparent 100%);
}

.left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.right {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  background: rgba(0, 0, 0, 0.03);
  padding: 2px 10px;
  border-radius: var(--border-radius-full);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.el-button {
  color: var(--color-text-secondary);
  border-radius: var(--border-radius-md);
  transition: all var(--animation-duration-fast) ease;
  position: relative;
  overflow: hidden;
}

.el-button::before {
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

.el-button:hover {
  color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.05);
}

.el-button:hover::before {
  opacity: 1;
}

.el-button:disabled {
  color: var(--color-text-tertiary);
  cursor: not-allowed;
  background: transparent;
}

.el-divider {
  background: linear-gradient(180deg, 
    transparent 0%, 
    rgba(0, 0, 0, 0.2) 50%, 
    transparent 100%);
  width: 1px;
  height: 20px;
}
</style>