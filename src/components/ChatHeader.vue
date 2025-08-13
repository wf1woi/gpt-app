<template>
  <div class="chat-header">
    <div class="left">
      <el-avatar :style="{ background: color }">{{ short }}</el-avatar>
      <div>
        <div class="title">{{ title }}</div>
        <div class="sub">会话：{{ conversationId || '尚未建立' }}</div>
      </div>
    </div>
    <div class="right">
      <el-space>
        <el-dropdown>
          <el-button text type="primary">会话操作</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click.stop="emit('rename')">重命名</el-dropdown-item>
              <el-dropdown-item @click.stop="emit('clear')">清空对话</el-dropdown-item>
              <el-dropdown-item divided @click.stop="emit('remove')">删除会话</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-space>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; short: string; color: string; conversationId?: string }>()
const emit = defineEmits<{ (e:'rename'):void; (e:'clear'):void; (e:'remove'):void }>()
</script>

<style scoped>
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color);
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chat-header .left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.chat-header .title {
  font-weight: 600;
  font-size: 16px;
}
.chat-header .sub {
  font-size: 12px;
  color: var(--chat-muted);
}

.chat-toolbar {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-fill-color-lighter);
}
</style>
