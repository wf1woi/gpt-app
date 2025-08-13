<template>
  <el-dialog v-model="visible" title="新建会话" width="420px">
    <el-form label-width="80px">
      <el-form-item label="会话名称">
        <el-input v-model="name" placeholder="输入会话名称..." />
      </el-form-item>
      <el-form-item label="选择模式">
        <el-radio-group v-model="type">
          <el-radio-button label="general">通用助手</el-radio-button>
          <el-radio-button label="code">代码助手</el-radio-button>
          <el-radio-button label="creative">创意写作</el-radio-button>
          <el-radio-button label="image">图像生成</el-radio-button>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="create"><el-icon><Plus /></el-icon> 创建</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useChatStore, type ChatType } from '@/store/chat'
import { Plus } from '@element-plus/icons-vue'

const chat = useChatStore()
const visible = ref(false)
const name = ref('')
const type = ref<ChatType>('general')

watch(() => chat.newChatDialogOpen, v => visible.value = v)
function close() { chat.closeNewChatDialog() }
function create() {
  chat.newSession(type.value, name.value || '新会话')
  chat.closeNewChatDialog()
  name.value = ''
  type.value = 'general'
}
</script>
