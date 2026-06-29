import { createApp } from 'vue'
import App           from './App.vue'
import router        from './router'
import { initAuth }  from './auth.js'

// initAuth() é chamado AQUI e apenas aqui.
// Aguarda a sessão ser resolvida antes de montar a app,
// garantindo que o router guard tenha authState.user correto.
initAuth()
  .catch(err => console.warn('Supabase init error:', err))
  .finally(() => {
    createApp(App).use(router).mount('#app')
  })
