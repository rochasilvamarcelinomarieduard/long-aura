<template>
  <div class="al-root">
    <!-- Scanlines overlay -->
    <div class="scanlines" />

    <!-- Grid background -->
    <div class="grid-bg" />

    <!-- Corner decorations -->
    <div class="corner corner-tl" />
    <div class="corner corner-tr" />
    <div class="corner corner-bl" />
    <div class="corner corner-br" />

    <div class="al-center">
      <!-- Header -->
      <div class="al-header">
        <div class="al-logo">
          <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="url(#shield-grad)"/>
            <path d="M10 14l-3-3 1.4-1.4L10 11.2l5.6-5.6L17 7l-7 7z" fill="#0a0a0a"/>
            <defs>
              <linearGradient id="shield-grad" x1="3" y1="1" x2="21" y2="23" gradientUnits="userSpaceOnUse">
                <stop stop-color="#ff2d55"/>
                <stop offset="1" stop-color="#ff6a00"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div class="al-title-wrap">
          <p class="al-system">LONG AURA</p>
          <h1 class="al-title">ACESSO RESTRITO</h1>
          <p class="al-sub">Painel Administrativo · Credenciais Necessárias</p>
        </div>
      </div>

      <!-- Status bar -->
      <div class="status-bar">
        <span class="status-dot" :class="status.type" />
        <span class="status-text">{{ status.msg }}</span>
        <span class="status-time">{{ currentTime }}</span>
      </div>

      <!-- Form -->
      <div class="al-form">
        <div class="field-wrap" :class="{ error: errors.user }">
          <label class="field-label">IDENTIFICADOR</label>
          <div class="field-input-wrap">
            <svg class="field-icon" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
            <input
              v-model="form.username"
              class="field-input"
              type="text"
              placeholder="username ou email"
              autocomplete="off"
              @keyup.enter="submit"
              :disabled="loading"
            />
          </div>
          <p v-if="errors.user" class="field-error">{{ errors.user }}</p>
        </div>

        <div class="field-wrap" :class="{ error: errors.pass }">
          <label class="field-label">SENHA DE ACESSO</label>
          <div class="field-input-wrap">
            <svg class="field-icon" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            <input
              v-model="form.password"
              class="field-input"
              :type="showPass ? 'text' : 'password'"
              placeholder="••••••••"
              autocomplete="current-password"
              @keyup.enter="submit"
              :disabled="loading"
            />
            <button class="show-pass" @click="showPass = !showPass" tabindex="-1">
              <svg v-if="!showPass" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
              </svg>
            </button>
          </div>
          <p v-if="errors.pass" class="field-error">{{ errors.pass }}</p>
        </div>

        <!-- Tentativas -->
        <div v-if="attempts > 0" class="attempts-warn">
          <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {{ attempts }} tentativa{{ attempts > 1 ? 's' : '' }} inválida{{ attempts > 1 ? 's' : '' }}
          <span v-if="attempts >= 3"> · Conta pode ser bloqueada</span>
        </div>

        <button
          class="al-btn"
          @click="submit"
          :disabled="loading"
          :class="{ loading }"
        >
          <span v-if="!loading" class="btn-content">
            <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
            AUTENTICAR
          </span>
          <span v-else class="btn-loading">
            <span class="spinner" />
            VERIFICANDO…
          </span>
        </button>
      </div>

      <!-- Footer -->
      <div class="al-footer">
        <a class="back-link" @click="router.push('/')">
          ← Voltar ao site
        </a>
        <span class="al-version">v2.0 · Acesso logado</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase.js'
import { adminAuthState } from '@/adminAuth.js'

const router   = useRouter()
const loading  = ref(false)
const showPass = ref(false)
const attempts = ref(0)

const form = reactive({ username: '', password: '' })
const errors = reactive({ user: '', pass: '' })

const status = reactive({ msg: 'Sistema operacional', type: 'ok' })

// Clock
const currentTime = ref('')
let clockInterval = null
function updateClock() {
  currentTime.value = new Date().toLocaleTimeString('pt-BR')
}
onMounted(() => { updateClock(); clockInterval = setInterval(updateClock, 1000) })
onUnmounted(() => clearInterval(clockInterval))

function validate() {
  errors.user = ''
  errors.pass = ''
  let ok = true
  if (!form.username.trim()) { errors.user = 'Identificador obrigatório'; ok = false }
  if (!form.password)        { errors.pass = 'Senha obrigatória'; ok = false }
  return ok
}

async function submit() {
  if (!validate() || loading.value) return
  loading.value = true
  status.msg  = 'Autenticando…'
  status.type = 'warn'

  try {
    // Tenta login com email direto ou busca email pelo username
    let email = form.username.trim()

    if (!email.includes('@')) {
      // é username — busca o email
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', email)
        .single()

      if (!profile) {
        errors.user = 'Usuário não encontrado'
        attempts.value++
        status.msg  = 'Falha na autenticação'
        status.type = 'error'
        return
      }
      email = profile.email
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: form.password,
    })

    if (error) {
      errors.pass = 'Senha incorreta'
      attempts.value++
      status.msg  = 'Credenciais inválidas'
      status.type = 'error'
      return
    }

    // Verifica se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (!profile?.is_admin) {
      await supabase.auth.signOut()
      errors.user = 'Acesso negado — sem privilégios de administrador'
      attempts.value++
      status.msg  = 'Acesso não autorizado'
      status.type = 'error'
      return
    }

    // Sucesso — salva estado admin e redireciona
    adminAuthState.user    = data.user
    adminAuthState.profile = profile
    adminAuthState.ready   = true

    status.msg  = 'Acesso concedido!'
    status.type = 'ok'

    setTimeout(() => router.push('/admin/dashboard'), 400)

  } catch (err) {
    errors.pass = 'Erro inesperado, tente novamente'
    status.msg  = 'Erro de sistema'
    status.type = 'error'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=DM+Sans:wght@400;600;700&display=swap');

.al-root {
  min-height: 100vh;
  background: #030304;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  font-family: 'DM Sans', sans-serif;
}

/* ── Background effects ── */
.scanlines {
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(255,255,255,.012) 2px,
    rgba(255,255,255,.012) 4px
  );
  pointer-events: none;
  z-index: 1;
}

.grid-bg {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,45,85,.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,45,85,.04) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

/* Corner decorations */
.corner {
  position: fixed;
  width: 40px;
  height: 40px;
  pointer-events: none;
  z-index: 2;
}
.corner-tl { top: 20px; left: 20px; border-top: 1px solid rgba(255,45,85,.4); border-left: 1px solid rgba(255,45,85,.4); }
.corner-tr { top: 20px; right: 20px; border-top: 1px solid rgba(255,45,85,.4); border-right: 1px solid rgba(255,45,85,.4); }
.corner-bl { bottom: 20px; left: 20px; border-bottom: 1px solid rgba(255,45,85,.4); border-left: 1px solid rgba(255,45,85,.4); }
.corner-br { bottom: 20px; right: 20px; border-bottom: 1px solid rgba(255,45,85,.4); border-right: 1px solid rgba(255,45,85,.4); }

/* ── Center card ── */
.al-center {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 420px;
  padding: 0 20px;
  animation: fadeIn .4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Header ── */
.al-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}

.al-logo {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: rgba(255,45,85,.06);
  border: 1px solid rgba(255,45,85,.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.al-system {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: #ff2d55;
  letter-spacing: 3px;
  margin: 0 0 4px;
  opacity: .7;
}

.al-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 4px;
  letter-spacing: 1px;
}

.al-sub {
  font-size: 11px;
  color: rgba(255,255,255,.3);
  margin: 0;
  letter-spacing: .3px;
}

/* ── Status bar ── */
.status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 8px;
  margin-bottom: 24px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  animation: pulse 2s infinite;
}

.status-dot.ok    { background: #34d399; }
.status-dot.warn  { background: #fbbf24; }
.status-dot.error { background: #ff2d55; animation: none; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: .4; }
}

.status-text { color: rgba(255,255,255,.5); flex: 1; }
.status-time { color: rgba(255,255,255,.25); font-size: 10px; }

/* ── Form ── */
.al-form {
  background: rgba(255,255,255,.02);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 16px;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field-wrap { display: flex; flex-direction: column; gap: 6px; }

.field-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  color: rgba(255,255,255,.3);
  letter-spacing: 1.5px;
}

.field-wrap.error .field-label { color: #ff2d55; }

.field-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 12px;
  color: rgba(255,255,255,.2);
  pointer-events: none;
}

.field-input {
  width: 100%;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px;
  padding: 11px 12px 11px 34px;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  color: rgba(255,255,255,.85);
  outline: none;
  transition: border-color .15s, background .15s;
}

.field-input::placeholder { color: rgba(255,255,255,.18); }

.field-input:focus {
  border-color: rgba(255,45,85,.4);
  background: rgba(255,45,85,.04);
}

.field-wrap.error .field-input {
  border-color: rgba(255,45,85,.5);
  background: rgba(255,45,85,.05);
}

.field-input:disabled { opacity: .5; }

.show-pass {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: rgba(255,255,255,.25);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color .15s;
}
.show-pass:hover { color: rgba(255,255,255,.6); }

.field-error {
  font-size: 11px;
  color: #ff2d55;
  margin: 0;
  font-family: 'JetBrains Mono', monospace;
}

/* ── Attempts warning ── */
.attempts-warn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(255,45,85,.06);
  border: 1px solid rgba(255,45,85,.15);
  border-radius: 8px;
  font-size: 11px;
  color: rgba(255,100,100,.8);
  font-family: 'JetBrains Mono', monospace;
}

/* ── Button ── */
.al-btn {
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, #ff2d55, #ff6a00);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 1.5px;
  cursor: pointer;
  transition: opacity .18s, transform .15s, box-shadow .18s;
  position: relative;
  overflow: hidden;
  margin-top: 4px;
}

.al-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,.15), transparent);
  opacity: 0;
  transition: opacity .18s;
}

.al-btn:hover:not(:disabled)::before { opacity: 1; }
.al-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(255,45,85,.3); }
.al-btn:active:not(:disabled) { transform: translateY(0); }
.al-btn:disabled { opacity: .6; cursor: not-allowed; }

.btn-content, .btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  width: 13px;
  height: 13px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Footer ── */
.al-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  padding: 0 4px;
}

.back-link {
  font-size: 12px;
  color: rgba(255,255,255,.3);
  cursor: pointer;
  transition: color .15s;
  font-family: 'JetBrains Mono', monospace;
}
.back-link:hover { color: rgba(255,255,255,.6); }

.al-version {
  font-size: 10px;
  color: rgba(255,255,255,.15);
  font-family: 'JetBrains Mono', monospace;
}
</style>