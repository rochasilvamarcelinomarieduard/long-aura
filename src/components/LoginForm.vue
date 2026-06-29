<template>
  <form class="form" @submit.prevent="doLogin">

    <!-- Email -->
    <div class="field" :class="{ focused: focus.email, filled: !!email }">
      <label>Email</label>
      <div class="input-wrap">
        <svg class="field-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <rect x="2" y="4" width="16" height="13" rx="2"/>
          <path d="M2 7l8 5 8-5"/>
        </svg>
        <input
          v-model="email"
          type="email"
          placeholder="seu@email.com"
          autocomplete="email"
          @focus="focus.email = true"
          @blur="focus.email = false"
        />
      </div>
    </div>

    <!-- Senha -->
    <div class="field" :class="{ focused: focus.senha, filled: !!senha }">
      <div class="label-row">
        <label>Senha</label>
        <a class="link-forgot" href="#" @click.prevent="esqueceuSenha">Esqueci a senha</a>
      </div>
      <div class="input-wrap">
        <svg class="field-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <rect x="4" y="9" width="12" height="9" rx="2"/>
          <path d="M7 9V7a3 3 0 0 1 6 0v2"/>
          <circle cx="10" cy="14" r="1" fill="currentColor" stroke="none"/>
        </svg>
        <input
          v-model="senha"
          :type="showPwd ? 'text' : 'password'"
          placeholder="••••••••"
          autocomplete="current-password"
          @focus="focus.senha = true"
          @blur="focus.senha = false"
        />
        <button type="button" class="eye-btn" @click="showPwd = !showPwd" tabindex="-1" :aria-label="showPwd ? 'Ocultar senha' : 'Mostrar senha'">
          <!-- olho aberto -->
          <svg v-if="!showPwd" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <path d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/>
            <circle cx="10" cy="10" r="2.5"/>
          </svg>
          <!-- olho fechado -->
          <svg v-else viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <path d="M3 3l14 14"/>
            <path d="M7.5 7.6A5 5 0 0 0 5.3 10s2 4 5 4a4.8 4.8 0 0 0 2.5-.7"/>
            <path d="M12.7 12.6A5 5 0 0 0 14.7 10s-2-4-5-4a4.8 4.8 0 0 0-2.2.5"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Lembrar de mim -->
    <label class="check-label">
      <input type="checkbox" v-model="lembrar" class="check-input" />
      <span class="check-box" />
      <span class="check-text">Lembrar de mim</span>
    </label>

    <!-- Botão entrar -->
    <button type="submit" class="btn-login" :class="{ loading: carregando }">
      <span v-if="!carregando">Entrar na conta</span>
      <span v-else class="spinner" />
      <svg v-if="!carregando" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M4 10h12M11 5l5 5-5 5"/>
      </svg>
    </button>

    <!-- Divider -->
    <div class="divider"><span>ou continue com</span></div>

    <!-- Google -->
    <button type="button" class="btn-google" @click="googleLogin">
      <svg class="google-logo" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      <span>Entrar com Google</span>
    </button>

  </form>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { supabase } from '@/supabase.js'

const email     = ref('')
const senha     = ref('')
const lembrar   = ref(false)
const showPwd   = ref(false)
const carregando = ref(false)

const focus = reactive({ email: false, senha: false })


async function esqueceuSenha() {
  if (!email.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Atenção',
      text: 'Digite seu e-mail primeiro.',
      confirmButtonText: 'OK'
    })
    return
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
    redirectTo: 'http://localhost:5173/reset-password'
  })
  if (error) {
  Swal.fire({
    icon: 'error',
    title: 'Erro ao enviar e-mail',
    text: error.message
  })
} else {
  Swal.fire({
    icon: 'success',
    title: 'E-mail enviado!',
    text: 'Verifique sua caixa de entrada.',
    confirmButtonText: 'OK'
  })
}
  
}async function doLogin() {
  if (!email.value || !senha.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos obrigatórios',
      text: 'Preencha e-mail e senha.'
    })
    return
  }

  carregando.value = true
  await new Promise(r => setTimeout(r, 1200))
  carregando.value = false

  Swal.fire({
    icon: 'success',
    title: 'Login realizado!',
    text: `Bem-vindo, ${email.value}.`
  })
}

function googleLogin() {
  Swal.fire({
    icon: 'info',
    title: 'Google OAuth',
    text: 'O login com Google será iniciado.'
  })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap');

:root {
  --pink:      #ff5fa2;
  --pink-deep: #d63c7e;
  --pink-glow: #ff5fa230;
  --pink-soft: #ff5fa215;
  --surface2:  #181818;
  --border:    #2a2a2a;
  --text:      #f0f0f0;
  --muted:     #888;
  --muted2:    #444;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0;
  font-family: 'Outfit', sans-serif;
}

/* ── Field ─────────────────────────────────────── */
.field {
  margin-bottom: 16px;
}

.field label {
  display: block;
  font-size: 11px;
  color: var(--muted2, #444);
  text-transform: uppercase;
  letter-spacing: 0.7px;
  margin-bottom: 7px;
  transition: color 0.2s;
  font-weight: 500;
}
.field.focused label,
.field.filled  label { color: var(--pink, #ff5fa2); }

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 7px;
}
.label-row label { margin-bottom: 0; }

.link-forgot {
  font-size: 12px;
  color: var(--pink, #ff5fa2);
  text-decoration: none;
  transition: opacity 0.2s;
}
.link-forgot:hover { opacity: 0.7; }

/* ── Input wrap ────────────────────────────────── */
.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 13px;
  width: 16px;
  height: 16px;
  color: var(--muted2, #444);
  pointer-events: none;
  transition: color 0.2s;
  flex-shrink: 0;
}
.field.focused .field-icon { color: var(--pink, #ff5fa2); }

.input-wrap input {
  width: 100%;
  padding: 13px 42px 13px 38px;
  background: var(--surface2, #181818);
  border: 1px solid var(--border, #2a2a2a);
  border-radius: 11px;
  color: var(--text, #f0f0f0);
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 400;
  outline: none;
  transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
  color-scheme: dark;
}
.input-wrap input::placeholder { color: var(--muted2, #444); }
.input-wrap input:hover { border-color: #3a3a3a; }
.input-wrap input:focus {
  border-color: var(--pink, #ff5fa2);
  background: #141414;
  box-shadow: 0 0 0 3px var(--pink-soft, #ff5fa215);
}

/* ── Eye button ────────────────────────────────── */
.eye-btn {
  position: absolute;
  right: 11px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--muted2, #444);
  padding: 4px;
  display: flex;
  align-items: center;
  border-radius: 6px;
  transition: color 0.2s, background 0.2s;
}
.eye-btn:hover {
  color: var(--pink, #ff5fa2);
  background: var(--pink-soft, #ff5fa215);
}
.eye-btn svg { width: 16px; height: 16px; }

/* ── Checkbox ──────────────────────────────────── */
.check-label {
  display: flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
  user-select: none;
  margin-bottom: 20px;
}
.check-input { display: none; }
.check-box {
  width: 18px; height: 18px;
  border: 1.5px solid var(--border, #2a2a2a);
  border-radius: 5px;
  background: var(--surface2, #181818);
  flex-shrink: 0;
  position: relative;
  transition: border-color 0.2s, background 0.2s;
}
.check-label:hover .check-box { border-color: var(--pink, #ff5fa2); }
.check-input:checked + .check-box {
  background: var(--pink, #ff5fa2);
  border-color: var(--pink, #ff5fa2);
}
.check-input:checked + .check-box::after {
  content: '';
  position: absolute;
  top: 2px; left: 5px;
  width: 5px; height: 9px;
  border: 2px solid #fff;
  border-top: none;
  border-left: none;
  transform: rotate(45deg);
}
.check-text {
  font-size: 13px;
  color: var(--muted, #888);
}

/* ── Botão principal ───────────────────────────── */
.btn-login {
  width: 100%;
  padding: 15px 20px;
  background: linear-gradient(135deg, #ff5fa2, #d63c7e);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 6px 20px #ff5fa230;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-bottom: 16px;
}
.btn-login::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #ffffff25, transparent);
  opacity: 0;
  transition: opacity 0.3s;
}
.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px #ff5fa250;
}
.btn-login:hover::before { opacity: 1; }
.btn-login:active { transform: scale(0.98); }
.btn-login svg {
  width: 18px; height: 18px;
  transition: transform 0.25s;
}
.btn-login:hover svg { transform: translateX(3px); }

/* estado loading */
.btn-login.loading { pointer-events: none; opacity: 0.8; }
.spinner {
  width: 18px; height: 18px;
  border: 2px solid #ffffff50;
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Divider ───────────────────────────────────── */
.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  color: var(--muted2, #444);
  font-size: 12px;
}
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border, #2a2a2a);
}

/* ── Botão Google ──────────────────────────────── */
.btn-google {
  width: 100%;
  padding: 13px 20px;
  background: var(--surface2, #181818);
  border: 1px solid var(--border, #2a2a2a);
  border-radius: 12px;
  color: var(--text, #f0f0f0);
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: border-color 0.25s, 0.25s, transform 0.2s, box-shadow 0.2s;
}
.btn-google:hover {
  border-color: var(--pink, #ff5fa2);
  background: var(--pink-soft, #ff5fa215);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px var(--pink-glow, #ff5fa230);
}
.btn-google:active { transform: scale(0.98); }

.google-logo {
  width: 20px; height: 20px;
  flex-shrink: 0;
}
</style>