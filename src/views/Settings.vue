<template>
  <el-card class="page" shadow="never">
    <template #header>
      <div class="head"><el-icon><i-ep-Setting /></el-icon> 系统设置</div>
    </template>

    <el-form label-width="100px" :model="form">
      <el-card class="block" shadow="never">
        <template #header>个人设置</template>
        <el-form-item label="用户名">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="电子邮箱">
          <el-input v-model="form.email" type="email" />
        </el-form-item>
        <el-form-item label="语言">
          <el-select v-model="form.language" style="width: 220px">
            <el-option label="简体中文" value="zh-CN" />
            <el-option label="English" value="en" />
          </el-select>
        </el-form-item>
        <el-form-item label="时区">
          <el-select v-model="form.timezone" style="width: 260px">
            <el-option label="America/Los_Angeles" value="America/Los_Angeles" />
            <el-option label="Asia/Shanghai" value="Asia/Shanghai" />
          </el-select>
        </el-form-item>
      </el-card>

      <el-card class="block" shadow="never">
        <template #header>AI 助手设置</template>
        <el-form-item label="启用语音交互">
          <el-switch v-model="form.enableVoice" />
        </el-form-item>
        <el-form-item label="保存聊天历史">
          <el-switch v-model="form.saveHistory" />
        </el-form-item>
        <el-form-item label="回复风格">
          <el-radio-group v-model="form.aiStyle">
            <el-radio-button label="balanced">平衡</el-radio-button>
            <el-radio-button label="professional">专业</el-radio-button>
            <el-radio-button label="friendly">友好</el-radio-button>
            <el-radio-button label="creative">创意</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-card>

      <div class="actions">
        <el-button @click="reset">重置</el-button>
        <el-button type="primary" @click="save"><el-icon><i-ep-Check /></el-icon> 保存设置</el-button>
      </div>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useAppStore } from '@/store/app'

const app = useAppStore()
app.load()

const form = reactive({
  username: '高级用户',
  email: 'user@example.com',
  language: app.language,
  timezone: app.timezone,
  enableVoice: app.enableVoice,
  saveHistory: app.saveHistory,
  aiStyle: app.aiStyle
})

function save() {
  app.language = form.language
  app.timezone = form.timezone
  app.enableVoice = form.enableVoice
  app.saveHistory = form.saveHistory
  app.aiStyle = form.aiStyle
  app.persist()
}

function reset() {
  app.load()
}
</script>

<style scoped>
.page { min-height: calc(100vh - 120px); }
.head { font-weight:600; display:flex; align-items:center; gap:6px; }
.block { margin-bottom: 12px; }
.actions { display:flex; justify-content:flex-end; gap:8px; }
</style>
