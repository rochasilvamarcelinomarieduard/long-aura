import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  base: '/long-aura/',
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    headers: {
      // Desativa cache do Service Worker/browser que causa ERR_CACHE_OPERATION_NOT_SUPPORTED
      'Cache-Control': 'no-store',
    },
  },
  // Garante que o Supabase Realtime (WebSocket) não seja interceptado pelo Vite
  optimizeDeps: {
    exclude: ['@supabase/supabase-js'],
  },
})
