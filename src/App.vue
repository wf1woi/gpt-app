<template>
  <div class="app">
    <aside class="sidebar" :class="{ 'sidebar-collapsed': !sidebarVisible }">
      <Sidebar />
    </aside>
    <main class="main-content">
      <header class="topbar">
        <Topbar />
      </header>
      <div class="page-content">
        <router-view />
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
  font-family: var(--font-family);
  background: #f5f5f5;
}

.sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid #eee;
  flex-shrink: 0;
}

.sidebar-collapsed {
  width: 60px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.topbar {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.page-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
}
</style>
