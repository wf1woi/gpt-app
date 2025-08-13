<template>
  <div class="topbar">
    <div class="left">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>AI 控制台</el-breadcrumb-item>
        <el-breadcrumb-item>{{ title }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="right">
      <el-button circle text title="帮助"><el-icon><QuestionFilled /></el-icon></el-button>
      <el-button circle text title="通知"><el-icon><BellFilled /></el-icon></el-button>
      <el-divider direction="vertical" />
      <el-avatar>用</el-avatar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { QuestionFilled, BellFilled } from '@element-plus/icons-vue'
const route = useRoute()
const title = computed(() => {
  if (route.path.includes('/settings')) return '系统设置'
  return '仪表盘'
})
</script>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: transparent;
  color: white;
  height: 60px;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.left {
  flex: 1;
}

.el-breadcrumb {
  background: rgba(255, 255, 255, 0.15);
  padding: 8px 16px;
  border-radius: 20px;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.el-breadcrumb:hover {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.right {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.12);
  padding: 6px 12px;
  border-radius: 25px;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.el-breadcrumb__item .el-breadcrumb__inner,
.el-breadcrumb__item .el-breadcrumb__separator {
  color: rgba(255, 255, 255, 0.85);
  transition: color 0.3s ease;
}

.el-breadcrumb__item:last-child .el-breadcrumb__inner {
  color: white;
  font-weight: 600;
  position: relative;
}

.el-breadcrumb__item:last-child .el-breadcrumb__inner::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.8) 0%, 
    rgba(255, 255, 255, 0.4) 100%);
  border-radius: 1px;
}

.el-button--text {
  color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
}

.el-button--text::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, 
    rgba(255, 255, 255, 0.15) 0%, 
    transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.el-button--text:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px) scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.el-button--text:hover::before {
  opacity: 1;
}

.el-divider--vertical {
  background: linear-gradient(180deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.4) 20%, 
    rgba(255, 255, 255, 0.6) 50%, 
    rgba(255, 255, 255, 0.4) 80%, 
    transparent 100%);
  width: 1px;
  margin: 0 8px;
}
</style>
