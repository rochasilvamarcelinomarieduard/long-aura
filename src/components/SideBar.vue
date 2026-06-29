<template>
  <aside class="sidebar expanded">
    <div class="sidebar-glow" />

    <div class="logo" @click="router.push('/home')">
      <div class="logo-mark">
        <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
          <path d="M12 2L2 7l10 5 10-5-10-5z" fill="url(#lg1)"/>
          <path d="M2 17l10 5 10-5" stroke="url(#lg2)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          <path d="M2 12l10 5 10-5" stroke="url(#lg3)" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".5"/>
          <defs>
            <linearGradient id="lg1" x1="2" y1="7" x2="22" y2="7" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ff2d55"/><stop offset="1" stop-color="#ff6a00"/>
            </linearGradient>
            <linearGradient id="lg2" x1="2" y1="17" x2="22" y2="17" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ff2d55"/><stop offset="1" stop-color="#ff6a00"/>
            </linearGradient>
            <linearGradient id="lg3" x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ff2d55"/><stop offset="1" stop-color="#ff6a00"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span class="logo-text">Long<em>Aura</em></span>
    </div>

    <nav class="nav">
      <button
        v-for="item in navItems"
        :key="item.route"
        class="nav-item"
        :class="{ active: isActive(item.route) }"
        @click="navigate(item.route)"
      >
        <div class="active-bar" />
        <div class="nav-icon-wrap">
          <span class="nav-icon" v-html="item.icon" />
          <span v-if="item.route === '/home/notifications' ? notifNaoLidas > 0 : item.badge > 0" class="nav-dot" />
        </div>
        <span class="nav-label">{{ item.label }}</span>
        <span
          v-if="item.route === '/home/notifications' ? notifNaoLidas > 0 : item.badge > 0"
          class="nav-badge"
        >{{ item.route === '/home/notifications' ? notifNaoLidas : item.badge }}</span>
      </button>
    </nav>

    <div class="sidebar-footer">
      <div class="footer-collapsed" v-if="!modelValue">
        <img v-if="avatarUrl" :src="avatarUrl" class="footer-avatar" />
        <div v-else class="footer-avatar-placeholder">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
        </div>
      </div>

      <div class="sidebar-footer">
        <div class="footer-expanded">
          <template v-if="user">
            <div class="footer-user">
              <img v-if="avatarUrl" :src="avatarUrl" class="footer-user-avatar" />
              <div class="footer-user-info">
                <p class="footer-username">@{{ userName }}</p>
                <p class="footer-status">Online</p>
              </div>
            </div>
            <button class="btn-logout" @click="doLogout">Sair</button>
          </template>
          <template v-else>
            <p class="footer-cta-text">Entre para curtir, comentar e seguir</p>
            <button class="btn-login" @click="router.push('/')">Entrar agora</button>
          </template>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authState, signOut } from '@/auth.js'
import { supabase } from '@/supabase.js'
import { carrinho } from '@/stores/carrinho.js'

defineProps({ modelValue: Boolean })
defineEmits(['update:modelValue'])

const router = useRouter()
const route  = useRoute()

const user      = computed(() => authState.user)
const userName  = computed(() => authState.profile?.username || authState.user?.email || '')
const avatarUrl = computed(() => authState.profile?.avatar_url || null)

const notifNaoLidas = ref(0)
let notifChannel = null

async function carregarNaoLidas() {
  if (!authState.user) { notifNaoLidas.value = 0; return }
  try {
    const { count } = await supabase
      .from('notificacoes')
      .select('id', { count: 'exact', head: true })
      .eq('to_user_id', authState.user.id)
      .eq('lida', false)
    notifNaoLidas.value = count ?? 0
  } catch { notifNaoLidas.value = 0 }
}

function inscreverRealtime() {
  if (!authState.user || notifChannel) return
  notifChannel = supabase
    .channel(`sidebar_notif_${authState.user.id}`)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'notificacoes', filter: `to_user_id=eq.${authState.user.id}` },
      () => carregarNaoLidas()
    )
    .subscribe()
}

function desinscrever() {
  if (notifChannel) { supabase.removeChannel(notifChannel); notifChannel = null }
}

watch(() => route.path, (path) => {
  if (path === '/home/notifications') notifNaoLidas.value = 0
})

watch(() => authState.user, (u) => {
  desinscrever()
  if (u) { carregarNaoLidas(); inscreverRealtime() }
  else   { notifNaoLidas.value = 0 }
})

onMounted(() => {
  if (authState.user) { carregarNaoLidas(); inscreverRealtime() }
})

onUnmounted(() => desinscrever())

function isActive(routePath) { return route.path === routePath }
function navigate(routePath) { router.push(routePath) }
async function doLogout() { await signOut(); router.push('/') }

const NAV_ICONS = {
  home:   `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>`,
  notif:  `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>`,
  msg:    `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`,
  perfil: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>`,
  loja:   `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M20 4H4v2l16 .01V4zm1 5H3l1 9h16l1-9zm-9 7h-2v-4h2v4z"/></svg>`,
}

const navItems = computed(() => [
  { route: '/home',               label: 'Início',       icon: NAV_ICONS.home,   badge: 0 },
  { route: '/home/explore',       label: 'Busca',        icon: NAV_ICONS.search, badge: 0 },
  { route: '/home/upload',        label: 'Publicar',     icon: NAV_ICONS.upload, badge: 0 },
  { route: '/home/notifications', label: 'Notificações', icon: NAV_ICONS.notif,  badge: notifNaoLidas.value },
  { route: '/home/messages',      label: 'Mensagens',    icon: NAV_ICONS.msg,    badge: 0 },
  { route: '/home/profile',       label: 'Perfil',       icon: NAV_ICONS.perfil, badge: 0 },
  { route: '/home/loja',          label: 'Loja',         icon: NAV_ICONS.loja,   badge: 0 },
])
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,600;0,700;1,700&display=swap');

* { font-family: 'DM Sans', sans-serif; }

.sidebar {
  position: relative;
  z-index: 100;
  width: 236px;
  min-width: 68px;
  height: 100vh;
  background: rgba(8, 4, 0, 0.95);
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  transition: width 0.28s cubic-bezier(.4,0,.2,1);
  overflow: hidden;
  border-right: 1px solid rgba(255,255,255,.04);
  flex-shrink: 0;
}

.sidebar.expanded { width: 236px; }

.sidebar-glow {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 200px;
  background: radial-gradient(ellipse at 50% -20%, rgba(255,45,85,.08) 0%, transparent 70%);
  pointer-events: none;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px 28px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.logo-mark {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255,45,85,.08);
  border: 1px solid rgba(255,45,85,.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background .2s;
}

.logo:hover .logo-mark { background: rgba(255,45,85,.15); }

.logo-text {
  font-size: 19px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -.3px;
  opacity: 1;
  transition: opacity .2s;
}

.logo-text em {
  font-style: italic;
  background: linear-gradient(135deg, #ff2d55, #ff6a00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.sidebar.expanded .logo-text { opacity: 1; }

.nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 0 8px;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 10px;
  background: none;
  border: none;
  color: rgba(255,245,232,.35);
  border-radius: 12px;
  cursor: pointer;
  transition: background .15s, color .15s;
  white-space: nowrap;
  width: 100%;
  font-family: inherit;
  overflow: hidden;
}

.active-bar {
  position: absolute;
  left: 0; top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  border-radius: 0 2px 2px 0;
  background: linear-gradient(180deg, #ff2d55, #ff6a00);
  transition: height .25s cubic-bezier(.4,0,.2,1);
}

.nav-item.active .active-bar { height: 60%; }

.nav-item:hover {
  background: rgba(255,255,255,.04);
  color: rgba(255,245,232,.7);
}

.nav-item.active {
  color: #fff;
  background: rgba(255,45,85,.07);
}

.nav-icon-wrap {
  position: relative;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform .15s;
}

.nav-item:hover .nav-icon { transform: scale(1.1); }
.nav-item.active .nav-icon { transform: scale(1.05); }

.nav-dot {
  position: absolute;
  top: -2px; right: -2px;
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #ff2d55;
  border: 1.5px solid #080400;
}

.nav-label {
  font-size: 14px;
  font-weight: 600;
  opacity: 1;
  transition: opacity .2s;
  flex: 1;
  text-align: left;
  letter-spacing: -.1px;
}

.sidebar.expanded .nav-label { opacity: 1; }

.nav-badge {
  font-size: 10px;
  font-weight: 700;
  background: #ff2d55;
  color: #fff;
  border-radius: 10px;
  padding: 1px 6px;
  opacity: 0;
  transition: opacity .2s;
  line-height: 16px;
}

.sidebar.expanded .nav-badge { opacity: 1; }
.sidebar.expanded .nav-dot { display: none; }

.sidebar-footer {
  padding: 16px 12px 8px;
  border-top: 1px solid rgba(255,255,255,.04);
  margin-top: 8px;
}

.footer-collapsed {
  display: flex;
  justify-content: center;
}

.footer-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid rgba(255,45,85,.3);
}

.footer-avatar-placeholder {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,.3);
}

.footer-expanded {
  opacity: 1;
  transition: opacity .2s;
}

.sidebar.expanded .footer-expanded { opacity: 1; }

.footer-user {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.footer-user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid rgba(255,45,85,.3);
  flex-shrink: 0;
}

.footer-user-info { flex: 1; min-width: 0; }

.footer-username {
  font-size: 13px;
  font-weight: 700;
  color: rgba(255,255,255,.85);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.footer-status {
  font-size: 11px;
  color: #34d399;
  display: flex;
  align-items: center;
  gap: 4px;
}

.footer-status::before {
  content: '';
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #34d399;
  display: inline-block;
}

.footer-cta-text {
  font-size: 12px;
  color: rgba(255,255,255,.35);
  line-height: 1.5;
  margin-bottom: 10px;
}

.btn-login {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px;
  background: linear-gradient(135deg, #ff2d55, #ff6a00);
  border: none;
  color: #fff;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: opacity .18s, transform .15s;
  letter-spacing: -.1px;
}

.btn-login:hover { opacity: .9; transform: scale(1.02); }

.btn-logout {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 8px 10px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.07);
  color: rgba(255,255,255,.4);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all .18s;
}

.btn-logout:hover {
  background: rgba(255,45,85,.08);
  color: #ff2d55;
  border-color: rgba(255,45,85,.2);
}
</style>