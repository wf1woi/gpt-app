<template>
  <div class="app">
    <!-- 全局背景渐变 -->
    <div class="app-background"></div>
    
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ 'sidebar-collapsed': !sidebarVisible }">
      <div class="sidebar-backdrop"></div>
      <Sidebar />
    </aside>
    
    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 顶部栏 -->
      <header class="topbar">
        <Topbar />
      </header>
      
      <!-- 页面内容 -->
      <div class="page-content">
        <div class="content-wrapper">
          <router-view />
        </div>
      </div>
    </main>
  </div>
  <NewChatDialog />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Topbar from './components/Topbar.vue'
import NewChatDialog from './components/NewChatDialog.vue'

const sidebarVisible = ref(true)
</script>

<style scoped>
.app {
  display: flex;
  height: 100vh;
  background: var(--color-background);
  font-family: var(--font-family);
  position: relative;
  overflow: hidden;
}

.app-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    var(--color-primary) 0%, 
    rgba(var(--color-primary-rgb), 0.8) 25%,
    rgba(var(--color-primary-rgb), 0.4) 50%,
    rgba(255, 255, 255, 0.9) 75%,
    #ffffff 100%);
  z-index: -2;
}

.app-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 50%, rgba(var(--color-primary-rgb), 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(var(--color-primary-rgb), 0.05) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(var(--color-primary-rgb), 0.08) 0%, transparent 50%);
  z-index: -1;
}

.sidebar {
  width: var(--sidebar-width, 260px);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(var(--color-primary-rgb), 0.1);
  transition: all var(--animation-duration-normal, 0.3s) cubic-bezier(0.25, 0.46, 0.45, 0.94);
  flex-shrink: 0;
  position: relative;
  z-index: 10;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.06);
}

.sidebar-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, 
    rgba(var(--color-primary-rgb), 0.02) 0%, 
    transparent 50%, 
    rgba(var(--color-primary-rgb), 0.02) 100%);
  z-index: -1;
}

.sidebar-collapsed {
  width: 60px;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.04);
}

.sidebar-collapsed .sidebar-backdrop {
  background: linear-gradient(180deg, 
    rgba(var(--color-primary-rgb), 0.04) 0%, 
    rgba(var(--color-primary-rgb), 0.02) 50%, 
    rgba(var(--color-primary-rgb), 0.04) 100%);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: transparent;
  position: relative;
  z-index: 1;
}

.topbar {
  height: var(--topbar-height, 60px);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.08);
  flex-shrink: 0;
  position: relative;
  z-index: 9;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
}

.topbar::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(var(--color-primary-rgb), 0.1) 20%, 
    rgba(var(--color-primary-rgb), 0.2) 50%, 
    rgba(var(--color-primary-rgb), 0.1) 80%, 
    transparent 100%);
}

.page-content {
  flex: 1;
  overflow: hidden;
  background: transparent;
  padding: var(--spacing-md, 20px);
  position: relative;
}

.content-wrapper {
  height: 100%;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  border-radius: var(--border-radius-xl, 16px);
  box-shadow: var(--shadow-lg, 0 8px 32px rgba(0, 0, 0, 0.1)), inset 0 1px 0 rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: auto;
  position: relative;
}

.content-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    transparent 50%, 
    rgba(var(--color-primary-rgb), 0.02) 100%);
  pointer-events: none;
  z-index: 0;
}
</style>
