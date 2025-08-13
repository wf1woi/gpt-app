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
  padding: 12px 16px;
  border-top: 1px solid #eee;
  background: #fafafa;
}

.composer-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 8px;
}

.composer-input {
  flex: 1;
}

.composer-input .el-textarea__inner {
  border-radius: 8px;
  min-height: 48px;
}

.send-button {
  width: 40px;
  height: 40px;
}

.composer-foot {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.left {
  display: flex;
  gap: 8px;
}
</style>
