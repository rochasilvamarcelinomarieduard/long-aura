<template>
  <div class="app" :class="{ 'sidebar-expanded': sidebarExpanded }">
    <Sidebar v-model="sidebarExpanded" />

    <main class="main">
    <RouterView :toast-fn="mostrarToast" :key="$route.fullPath" />
    </main>

    <transition name="toast-pop">
      <div v-if="toastMsg" class="app-toast">
        <div class="toast-dot" />
        {{ toastMsg }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from '../components/SideBar.vue'

const sidebarExpanded = ref(false)
const toastMsg        = ref('')
let toastTimer        = null

function mostrarToast(msg) {
  toastMsg.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toastMsg.value = '', 2500)
}
</script>

<style>
/* Global reset */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --color-bg:       #070300;
  --color-bg-panel: rgba(8,4,0,.95);
  --color-border:   rgba(255,255,255,.05);
  --color-accent:   #ff2d55;
  --color-accent-2: #ff6a00;
  --font-body:      'DM Sans', sans-serif;
}

html, body {
  height: 100%;
  background: var(--color-bg);
  color: #fff;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100%;
}

/* Scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,.07); border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,.13); }
</style>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,600;0,700;1,700&display=swap');

.app {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: #070300;
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  overflow: hidden;
}

.main {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.app-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(14,7,0,.92);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 24px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 600;
  z-index: 500;
  color: rgba(255,255,255,.85);
  white-space: nowrap;
  backdrop-filter: blur(16px);
  box-shadow: 0 8px 40px rgba(0,0,0,.6);
}

.toast-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #34d399;
  flex-shrink: 0;
}

.toast-pop-enter-active, .toast-pop-leave-active {
  transition: all .25s cubic-bezier(.4,0,.2,1);
}
.toast-pop-enter-from, .toast-pop-leave-to {
  opacity: 0;
  transform: translate(-50%, 12px);
}
</style>