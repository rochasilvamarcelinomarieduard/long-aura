<template>
  <div class="container">

    <div class="orb orb1" />
    <div class="orb orb2" />
    <div class="orb orb3" />

    <div class="card-border" :class="{ 'card-enter': mounted }">
      <div class="card">

        <!-- LOGO -->
        <div class="logo">
          <div class="logo-mark">
            <svg viewBox="0 0 36 36" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round">
              <path d="M18 4C11 4 5 10 5 17c0 8.5 13 17 13 17S31 25.5 31 17c0-7-6-13-13-13z" fill="url(#gl)" stroke="none" opacity=".25"/>
              <path d="M18 4C11 4 5 10 5 17c0 8.5 13 17 13 17S31 25.5 31 17c0-7-6-13-13-13z"/>
              <path d="M18 12v12M13 17h10"/>
              <defs>
                <linearGradient id="gl" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#ff8c00"/><stop offset="100%" stop-color="#ff2e88"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 class="logo-name">Aura</h1>
          <p class="logo-sub">{{ subtitulo }}</p>
        </div>

        <!-- TABS -->
        <div v-if="view === 'auth'" class="tabs">
          <button :class="['tab-btn', { active: tab === 'login' }]" @click="tab='login'">Entrar</button>
          <button :class="['tab-btn', { active: tab === 'cadastro' }]" @click="tab='cadastro'">Criar conta</button>
          <div class="tab-slider" :style="{ transform: tab==='login' ? 'translateX(0)' : 'translateX(100%)' }" />
        </div>

        <!-- STEP DOTS -->
        <div v-if="['step2','step3'].includes(view)" class="steps">
          <div class="step-dot done" />
          <div class="step-dot" :class="{ active: view==='step2', done: view==='step3' }" />
          <div class="step-dot" :class="{ active: view==='step3' }" />
        </div>

        <transition name="slide" mode="out-in">
          <div :key="view + tab" class="form-area">

            <!-- ── LOGIN ── -->
            <template v-if="view==='auth' && tab==='login'">

              <div class="field" :class="{ focused: f.lemail, filled: !!l.email }">
                <label>Email</label>
                <div class="iw">
                  <svg class="fi" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="2" y="4" width="16" height="13" rx="2"/><path d="M2 7l8 5 8-5"/></svg>
                  <input v-model="l.email" type="email" placeholder="seu@email.com"
                    @focus="f.lemail=true" @blur="f.lemail=false"
                    @keyup.enter="doLoginSenha()" />
                </div>
              </div>

              <div class="field" :class="{ focused: f.lsenha, filled: !!l.senha }">
                <label>Senha</label>
                <div class="iw">
                  <svg class="fi" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="4" y="9" width="12" height="9" rx="2"/><path d="M7 9V7a3 3 0 0 1 6 0v2"/></svg>
                  <input v-model="l.senha" :type="sp1?'text':'password'" placeholder="sua senha"
                    @focus="f.lsenha=true" @blur="f.lsenha=false"
                    @keyup.enter="doLoginSenha" />
                  <button type="button" class="eye" @click="sp1=!sp1">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                      <template v-if="!sp1"><path d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><circle cx="10" cy="10" r="2.5"/></template>
                      <template v-else><path d="M3 3l14 14"/><path d="M7.5 7.6A5 5 0 0 0 5.3 10s2 4 5 4a4.8 4.8 0 0 0 2.5-.7"/></template>
                    </svg>
                  </button>
                </div>
              </div>

              <p v-if="erroLogin" class="err-msg">{{ erroLogin }}</p>

              <div class="flex-gap" />

              <button class="btn-main" :class="{ loading: carregando }" :disabled="carregando" @click="doLoginSenha()">
                <span v-if="!carregando">Entrar</span>
                <span v-else class="spinner" />
              </button>

              <div class="divider"><span>ou</span></div>

              <button class="btn-google" @click="esqueceuSenha">
                <svg class="fi" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                  <rect x="4" y="9" width="12" height="9" rx="2"/><path d="M7 9V7a3 3 0 0 1 6 0v2"/>
                </svg>
                Esqueci minha senha
              </button>

              <button class="btn-google" style="margin-top:8px" @click="googleAuth">
                <svg viewBox="0 0 24 24" class="g-svg">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Entrar com Google
              </button>

              <p class="bottom-hint" style="margin-top:12px">Não tem conta? <a class="link" href="#" @click.prevent="tab='cadastro'">Criar agora</a></p>
            </template>

            <!-- ── CADASTRO STEP 1 ── -->
            <template v-if="view==='auth' && tab==='cadastro'">
              <div class="field" :class="{ focused: f.cnome, filled: !!c.nome }">
                <label>Nome completo</label>
                <div class="iw">
                  <svg class="fi" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="10" cy="7" r="3.5"/><path d="M3 18c0-3.5 3.1-6 7-6s7 2.5 7 6"/></svg>
                  <input v-model="c.nome" type="text" placeholder="Ana Silva" @focus="f.cnome=true" @blur="f.cnome=false" />
                </div>
              </div>

              <div class="field" :class="{ focused: f.cemail, filled: !!c.email, error: e.email }">
                <label>Email</label>
                <div class="iw">
                  <svg class="fi" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="2" y="4" width="16" height="13" rx="2"/><path d="M2 7l8 5 8-5"/></svg>
                  <input v-model="c.email" type="email" placeholder="seu@email.com" @focus="f.cemail=true" @blur="f.cemail=false; validEmail()" />
                  <div v-if="c.email && !e.email" class="ok-icon"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="2 6 5 9 10 3"/></svg></div>
                </div>
                <p v-if="e.email" class="ferr">{{ e.email }}</p>
              </div>

              <div class="field" :class="{ focused: f.csenha, filled: !!c.senha }">
                <label>Senha</label>
                <div class="iw">
                  <svg class="fi" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="4" y="9" width="12" height="9" rx="2"/><path d="M7 9V7a3 3 0 0 1 6 0v2"/></svg>
                  <input v-model="c.senha" :type="sp2?'text':'password'" placeholder="mín. 8 caracteres" @focus="f.csenha=true" @blur="f.csenha=false" />
                  <button type="button" class="eye" @click="sp2=!sp2">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                      <template v-if="!sp2"><path d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><circle cx="10" cy="10" r="2.5"/></template>
                      <template v-else><path d="M3 3l14 14"/><path d="M7.5 7.6A5 5 0 0 0 5.3 10s2 4 5 4a4.8 4.8 0 0 0 2.5-.7"/></template>
                    </svg>
                  </button>
                </div>
                <div v-if="c.senha" class="str-wrap">
                  <div class="str-bar"><div v-for="i in 4" :key="i" class="str-seg" :class="strClass(i)" /></div>
                  <span class="str-lbl" :class="strColor">{{ strLabel }}</span>
                </div>
              </div>

              <div class="field" :class="{ focused: f.cconf, filled: !!c.confirmar, error: e.conf }">
                <label>Confirmar senha</label>
                <div class="iw">
                  <svg class="fi" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="4" y="9" width="12" height="9" rx="2"/><path d="M7 9V7a3 3 0 0 1 6 0v2"/><path d="M8 14l2 2 4-4"/></svg>
                  <input v-model="c.confirmar" :type="sp3?'text':'password'" placeholder="repita a senha" @focus="f.cconf=true" @blur="f.cconf=false; validConf()" />
                  <div v-if="senhasOk" class="ok-icon"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="2 6 5 9 10 3"/></svg></div>
                  <button v-else type="button" class="eye" @click="sp3=!sp3">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><circle cx="10" cy="10" r="2.5"/></svg>
                  </button>
                </div>
                <p v-if="e.conf" class="ferr">{{ e.conf }}</p>
              </div>

              <button class="btn-main" style="margin-top:4px" @click="irStep2">
                <span>Continuar</span>
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 10h12M11 5l5 5-5 5"/></svg>
              </button>

              <p class="bottom-hint" style="margin-top:12px">Já tem conta? <a class="link" href="#" @click.prevent="tab='login'">Entrar</a></p>
            </template>

            <!-- ── STEP 2 ── -->
            <template v-if="view==='step2'">
              <p class="step-title">Sobre você</p>
              <p class="step-sub">Estas informações são privadas e não aparecerão publicamente.</p>

              <div class="field">
                <label>Sexo</label>
                <div class="gender-grid">
                  <div v-for="g in generos" :key="g.v" class="gender-card" :class="{ selected: c.genero===g.v }" @click="c.genero=g.v">
                    <span class="g-icon">{{ g.emoji }}</span>
                    <span class="g-label">{{ g.l }}</span>
                  </div>
                </div>
              </div>

              <div class="field" :class="{ focused: f.nasc, filled: !!c.nascimento, error: e.nasc }">
                <label>Data de nascimento</label>
                <div class="iw">
                  <svg class="fi" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="5" width="14" height="12" rx="2"/><path d="M7 3v4M13 3v4M3 9h14"/></svg>
                  <input v-model="c.nascimento" type="date" @focus="f.nasc=true" @blur="f.nasc=false; validIdade()" />
                </div>
                <p v-if="e.nasc" class="ferr">{{ e.nasc }}</p>
              </div>

              <div class="flex-gap" />

              <div class="btn-row">
                <button class="btn-back" @click="view='auth'; tab='cadastro'">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M16 10H4M9 5l-5 5 5 5"/></svg>
                </button>
                <button class="btn-main flex1" @click="irStep3">
                  <span>Continuar</span>
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 10h12M11 5l5 5-5 5"/></svg>
                </button>
              </div>
            </template>

            <!-- ── STEP 3 ── -->
            <template v-if="view==='step3'">
              <p class="step-title">Seu username</p>
              <p class="step-sub">Deve conter letras, pelo menos um número e uma letra maiúscula.</p>

              <div class="field" :class="{ focused: f.user, filled: !!c.username, error: e.username }">
                <label>Username</label>
                <div class="iw">
                  <span class="prefix">@</span>
                  <input v-model="c.username" type="text" placeholder="AnaS123" class="has-pfx"
                    @focus="f.user=true" @blur="f.user=false; validUsername()" />
                  <div v-if="c.username && !e.username && userReqsOk" class="ok-icon">
                    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="2 6 5 9 10 3"/></svg>
                  </div>
                </div>
                <p v-if="e.username" class="ferr">{{ e.username }}</p>

                <div class="reqs">
                  <div v-for="r in userReqs" :key="r.l" class="req" :class="{ met: r.ok }">
                    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                      <polyline v-if="r.ok" points="2 6 5 9 10 3"/>
                      <circle v-else cx="6" cy="6" r="1.8" fill="currentColor" stroke="none"/>
                    </svg>
                    {{ r.l }}
                  </div>
                </div>
              </div>

              <div class="flex-gap" />

              <div class="btn-row">
                <button class="btn-back" @click="view='step2'">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M16 10H4M9 5l-5 5 5 5"/></svg>
                </button>
                <button class="btn-main flex1" :class="{ loading: carregando }" :disabled="carregando" @click="finalizarCadastro">
                  <span v-if="!carregando">Criar minha conta</span>
                  <span v-else class="spinner" />
                </button>
              </div>
            </template>

            <!-- ── SUCESSO ── -->
            <template v-if="view==='sucesso'">
              <div class="success-wrap">
                <div class="success-ring">
                  <svg viewBox="0 0 48 48" fill="none" stroke-width="3.5" stroke-linecap="round">
                    <polyline points="12 25 21 34 36 16" stroke="url(#sg)"/>
                    <defs>
                      <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stop-color="#ff8c00"/><stop offset="100%" stop-color="#ff2e88"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <h2 class="success-title">Bem-vinda, {{ c.nome.split(' ')[0] }}!</h2>
                <p class="success-msg">Sua conta foi criada com sucesso. Explore tudo que o Aura tem a oferecer.</p>
                <div class="profile-card">
                  <div class="avatar">{{ c.nome.charAt(0).toUpperCase() }}</div>
                  <div class="pinfo">
                    <p class="pname">{{ c.nome }}</p>
                    <p class="pusername">@{{ c.username }}</p>
                    <span class="badge">Novo membro</span>
                  </div>
                </div>
                <button class="btn-main" @click="irParaApp">
                  <span>Ir para o app</span>
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 10h12M11 5l5 5-5 5"/></svg>
                </button>
              </div>
            </template>

          </div>
        </transition>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { signUp, signInWithGoogle, signInWithPassword } from '../auth.js'
import { supabase } from '../supabase.js'
import Swal from 'sweetalert2'

const emit = defineEmits(['autenticado'])

const mounted = ref(false)
onMounted(() => setTimeout(() => { mounted.value = true }, 50))

const view = ref('auth')
const tab  = ref('login')

const subtitulo = computed(() => {
  if (view.value === 'sucesso') return 'Conta criada!'
  if (view.value === 'step2')   return 'Quase lá'
  if (view.value === 'step3')   return 'Último passo'
  return tab.value === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'
})

const f = reactive({ lemail:false, lsenha:false, cnome:false, cemail:false, csenha:false, cconf:false, nasc:false, user:false })
const e = reactive({ email:'', conf:'', nasc:'', username:'' })

const l        = reactive({ email:'', senha:'' })
const sp1      = ref(false)
const erroLogin = ref('')

const c = reactive({
  nome: '', username: '', email: '', senha: '',
  confirmar: '', nascimento: '', genero: ''
})
const sp2 = ref(false)
const sp3 = ref(false)
const carregando = ref(false)

const generos = [
  { v:'fem',  l:'Feminino',          emoji:'♀️' },
  { v:'masc', l:'Masculino',         emoji:'♂️' },
  { v:'nb',   l:'Não-binário',       emoji:'⚧️' },
  { v:'pref', l:'Prefiro não dizer', emoji:'·'  },
]

const score = computed(() => {
  const s = c.senha; let n = 0
  if (s.length >= 8) n++; if (/[A-Z]/.test(s)) n++; if (/[0-9]/.test(s)) n++; if (/[^A-Za-z0-9]/.test(s)) n++
  return n
})
const strLabel = computed(() => ['Muito fraca','Fraca','Razoável','Boa','Forte'][score.value] ?? 'Muito fraca')
const strColor = computed(() => ['cx','cw','cf','cg','cs'][score.value] ?? 'cx')
function strClass(i) {
  if (i > score.value) return ''
  return ['','sw','sf','sg','ss'][score.value] ?? 'sw'
}

const senhasOk = computed(() => c.senha && c.confirmar && c.senha === c.confirmar)

const userReqs = computed(() => [
  { l:'Mínimo 4 caracteres',  ok: c.username.length >= 4 },
  { l:'Pelo menos uma letra', ok: /[a-zA-Z]/.test(c.username) },
  { l:'Pelo menos um número', ok: /[0-9]/.test(c.username) },
  { l:'Letra maiúscula',      ok: /[A-Z]/.test(c.username) },
])
const userReqsOk = computed(() => userReqs.value.every(r => r.ok))

function validEmail() {
  e.email = c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email) ? 'Email inválido.' : ''
}
function validConf() {
  e.conf = (c.confirmar && c.senha !== c.confirmar) ? 'As senhas não coincidem.' : ''
}
function validIdade() {
  if (!c.nascimento) { e.nasc = ''; return }
  const n = new Date(c.nascimento), h = new Date()
  let age = h.getFullYear() - n.getFullYear()
  if (h.getMonth() - n.getMonth() < 0 || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) age--
  e.nasc = age < 18 ? '⚠ Você precisa ter 18 anos ou mais para criar uma conta.' : ''
}
function validUsername() {
  const u = c.username
  if (!u) { e.username = ''; return }
  if (u.length < 4)           { e.username = 'Mínimo 4 caracteres.'; return }
  if (!/[a-zA-Z]/.test(u))   { e.username = 'Precisa ter pelo menos uma letra.'; return }
  if (!/[0-9]/.test(u))      { e.username = 'Precisa ter pelo menos um número.'; return }
  if (!/[A-Z]/.test(u))      { e.username = 'Precisa ter pelo menos uma letra maiúscula.'; return }
  e.username = ''
}

async function doLoginSenha() {
  erroLogin.value = ''
  if (!l.email) { erroLogin.value = 'Digite seu email.'; return }
  if (!l.senha) { erroLogin.value = 'Digite sua senha.'; return }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(l.email)) { erroLogin.value = 'Email inválido.'; return }
  carregando.value = true
  try {
    await signInWithPassword(l.email, l.senha)
    emit('autenticado')
  } catch (err) {
    erroLogin.value = err.message?.includes('Invalid') || err.message?.includes('invalid')
      ? 'Email ou senha incorretos.'
      : err.message || 'Erro ao entrar. Tente novamente.'
  } finally {
    carregando.value = false
  }
}

async function esqueceuSenha() {
  erroLogin.value = ''

  if (!l.email) {
    Swal.fire({
      icon: 'warning',
      title: 'Atenção',
      text: 'Digite seu e-mail primeiro.',
      confirmButtonText: 'OK'
    })
    return
  }

  carregando.value = true

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(l.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) throw error

    Swal.fire({
      icon: 'success',
      title: 'E-mail enviado!',
      text: 'Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.',
      confirmButtonText: 'OK'
    })

  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: err.message || 'Erro ao enviar e-mail.',
      confirmButtonText: 'OK'
    })
  } finally {
    carregando.value = false
  }
}

async function googleAuth() {
  try {
    await signInWithGoogle()
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Erro ao entrar com Google',
      text: err.message,
      confirmButtonText: 'OK'
    })
  }
}

function irStep2() {
  validEmail()
  validConf()

  if (!c.nome || !c.email || !c.senha || !c.confirmar) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos obrigatórios',
      text: 'Preencha todos os campos.'
    })
    return
  }

  if (e.email || e.conf) return

  if (!senhasOk.value) {
    e.conf = 'As senhas não coincidem.'

    Swal.fire({
      icon: 'error',
      title: 'Senhas diferentes',
      text: 'As senhas não coincidem.'
    })
    return
  }

  view.value = 'step2'
}

function irStep3() {
  validIdade()

  if (!c.genero) {
    Swal.fire({
      icon: 'warning',
      title: 'Campo obrigatório',
      text: 'Selecione seu sexo.'
    })
    return
  }

  if (!c.nascimento) {
    Swal.fire({
      icon: 'warning',
      title: 'Campo obrigatório',
      text: 'Informe sua data de nascimento.'
    })
    return
  }

  if (e.nasc) return

  view.value = 'step3'
}

async function finalizarCadastro() {
  validUsername()
  if (!c.username || e.username || !userReqsOk.value) {
    if (!e.username) e.username = 'O username não atende todos os requisitos.'
    return
  }
  if (c.senha !== c.confirmar) { e.conf = 'As senhas não coincidem.'; return }
  carregando.value = true
  try {
    await signUp({
      nome: c.nome, username: c.username, email: c.email,
      senha: c.senha, nascimento: c.nascimento, genero: c.genero
    })
    carregando.value = false
    view.value = 'sucesso'
  } catch (err) {
    carregando.value = false
    if (err.message?.includes('already registered') || err.message?.includes('unique')) {
  Swal.fire({
    icon: 'warning',
    title: 'Cadastro não realizado',
    text: 'Este e-mail ou nome de usuário já está cadastrado.'
  })
} else {
  Swal.fire({
    icon: 'error',
    title: 'Erro ao criar conta',
    text: err.message || 'Ocorreu um erro inesperado.'
  })
}
  }
}

function irParaApp() {
  emit('autenticado')
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500;600&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#app{height:100%;width:100%;background:#000;font-family:'Outfit',sans-serif}

:root{
  --p1:#ff8c00;--p2:#ff2e88;
  --grad:linear-gradient(135deg,#ff8c00,#ff2e88);
  --s:#000;--s2:#0d0d0d;--s3:#131313;
  --bd:#1e1e1e;--tx:#f2f2f2;--mt:#888;--mt2:#4a4a4a;
}

.container{width:100%;height:100vh;display:flex;align-items:center;justify-content:center;padding:16px;position:relative;overflow:hidden}

.orb{position:fixed;border-radius:50%;filter:blur(90px);pointer-events:none}
.orb1{width:500px;height:500px;background:radial-gradient(circle,#ff8c0018,transparent);top:-150px;left:-120px}
.orb2{width:400px;height:400px;background:radial-gradient(circle,#ff2e8820,transparent);bottom:-120px;right:-100px}
.orb3{width:250px;height:250px;background:radial-gradient(circle,#ff2e8812,transparent);top:40%;left:40%}

.card-border{
  position:relative;z-index:1;width:100%;max-width:560px;
  padding:3px;border-radius:36px;
  background:linear-gradient(135deg,#ff8c00,#ff2e88,#ff8c00);
  background-size:200% 200%;
  animation:bspin 3s ease infinite;
  box-shadow:0 0 50px #ff8c0018,0 0 100px #ff2e8812;
  opacity:0;transform:translateY(32px) scale(.96);
  transition:opacity .55s ease,transform .55s cubic-bezier(.34,1.2,.64,1),box-shadow .4s;
}
.card-border.card-enter{opacity:1;transform:translateY(0) scale(1)}
.card-border:hover{box-shadow:0 0 70px #ff8c0030,0 0 130px #ff2e8822}
@keyframes bspin{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}

.card{
  width:100%;height:620px;background:#000;border-radius:34px;
  padding:36px 52px 32px;display:flex;flex-direction:column;
  position:relative;overflow:hidden;
}
.card::after{
  content:'';position:absolute;top:0;left:12%;right:12%;height:1px;
  background:linear-gradient(90deg,transparent,#ff8c0035,#ff2e8835,transparent);
}

.logo{text-align:center;margin-bottom:20px;flex-shrink:0}
.logo-mark{
  width:52px;height:52px;background:var(--grad);border-radius:16px;
  display:inline-flex;align-items:center;justify-content:center;
  margin-bottom:10px;box-shadow:0 6px 24px #ff8c0028;
  transition:transform .3s,box-shadow .3s;
}
.logo-mark:hover{transform:translateY(-3px) rotate(-5deg);box-shadow:0 10px 32px #ff8c0040}
.logo-mark svg{width:26px;height:26px}
.logo-name{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:var(--tx);letter-spacing:-1px;line-height:1;margin-bottom:4px}
.logo-sub{font-size:13px;color:var(--mt);transition:color .3s}

.tabs{
  display:grid;grid-template-columns:1fr 1fr;position:relative;
  background:var(--s2);border-radius:14px;padding:4px;
  margin-bottom:16px;border:1px solid var(--bd);overflow:hidden;flex-shrink:0;
}
.tab-slider{
  position:absolute;top:4px;bottom:4px;left:4px;width:calc(50% - 4px);
  background:var(--grad);border-radius:11px;
  transition:transform .3s cubic-bezier(.34,1.56,.64,1);
  pointer-events:none;box-shadow:0 4px 16px #ff8c0022;
}
.tab-btn{
  position:relative;z-index:1;padding:10px;border:none;border-radius:10px;
  cursor:pointer;font-family:'Outfit',sans-serif;font-size:14px;font-weight:500;
  background:transparent;color:var(--mt);transition:color .25s;
}
.tab-btn.active{color:#fff}
.tab-btn:not(.active):hover{color:#bbb}

.steps{display:flex;justify-content:center;gap:8px;margin-bottom:20px;flex-shrink:0}
.step-dot{width:8px;height:8px;border-radius:50%;background:var(--bd);transition:all .3s}
.step-dot.active{width:24px;border-radius:4px;background:var(--grad);box-shadow:0 0 8px #ff8c0035}
.step-dot.done{background:#ff8c0060}

.form-area{flex:1;display:flex;flex-direction:column;min-height:0;overflow-y:auto;overflow-x:hidden;scrollbar-width:none}
.form-area::-webkit-scrollbar{display:none}
.flex-gap{flex:1}

.slide-enter-active,.slide-leave-active{transition:opacity .16s ease,transform .16s ease}
.slide-enter-from{opacity:0;transform:translateX(16px)}
.slide-leave-to{opacity:0;transform:translateX(-16px)}

.field{margin-bottom:13px;flex-shrink:0}
.field label{display:block;font-size:11px;color:var(--mt2);text-transform:uppercase;letter-spacing:.7px;margin-bottom:5px;font-weight:500;transition:color .2s}
.field.focused label,.field.filled label{color:var(--p2)}
.field.error label{color:#ff4d6d}
.iw{position:relative;display:flex;align-items:center}
.fi{position:absolute;left:12px;width:15px;height:15px;color:var(--mt2);pointer-events:none;transition:color .2s;flex-shrink:0}
.field.focused .fi{color:var(--p2)}
.field.error .fi{color:#ff4d6d}
.iw input{
  width:100%;padding:13px 36px 13px 35px;
  background:var(--s2);border:1px solid var(--bd);border-radius:11px;
  color:var(--tx);font-family:'Outfit',sans-serif;font-size:14px;outline:none;
  transition:border-color .25s,background .25s,box-shadow .25s;color-scheme:dark;
}
.iw input::placeholder{color:var(--mt2)}
.iw input:hover{border-color:#2a2a2a}
.iw input:focus{border-color:var(--p2);background:var(--s3);box-shadow:0 0 0 3px #ff5fa214}
.field.error .iw input{border-color:#ff4d6d}
.ferr{font-size:11px;color:#ff4d6d;margin-top:4px}
.prefix{position:absolute;left:12px;color:var(--p1);font-size:14px;font-weight:600;pointer-events:none;z-index:1}
.has-pfx{padding-left:26px !important}
.eye{position:absolute;right:9px;background:none;border:none;cursor:pointer;color:var(--mt2);padding:4px;display:flex;align-items:center;border-radius:5px;transition:color .2s,background .2s}
.eye:hover{color:var(--p2);background:#ff5fa212}
.eye svg{width:15px;height:15px}
.ok-icon{position:absolute;right:10px;width:20px;height:20px;border-radius:50%;background:#3ecf8e18;color:#3ecf8e;display:flex;align-items:center;justify-content:center}
.ok-icon svg{width:12px;height:12px}

.str-wrap{display:flex;align-items:center;gap:10px;margin-top:7px}
.str-bar{display:flex;gap:4px;flex:1}
.str-seg{flex:1;height:3px;border-radius:2px;background:var(--bd);transition:background .3s}
.str-seg.sw{background:#ff4d6d}.str-seg.sf{background:#ff9a3c}.str-seg.sg{background:#e5c200}.str-seg.ss{background:#3ecf8e}
.str-lbl{font-size:11px;white-space:nowrap}
.cx{color:#ff4d6d}.cw{color:#ff4d6d}.cf{color:#ff9a3c}.cg{color:#e5c200}.cs{color:#3ecf8e}

.gender-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px}
.gender-card{display:flex;flex-direction:column;align-items:center;gap:5px;padding:14px 8px;background:var(--s2);border:1px solid var(--bd);border-radius:13px;cursor:pointer;transition:all .2s}
.gender-card:hover{border-color:#333}
.gender-card.selected{border-color:var(--p2);background:#ff5fa210;box-shadow:0 0 0 1px var(--p2)}
.g-icon{font-size:22px;line-height:1}
.g-label{font-size:12px;color:var(--mt);text-align:center;transition:color .2s}
.gender-card.selected .g-label{color:var(--p2);font-weight:500}

.step-title{font-family:'Syne',sans-serif;font-size:20px;color:var(--tx);margin-bottom:4px;flex-shrink:0}
.step-sub{font-size:12px;color:var(--mt);line-height:1.55;margin-bottom:18px;flex-shrink:0}

.reqs{display:grid;grid-template-columns:1fr 1fr;gap:5px 10px;margin-top:10px}
.req{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--mt2);transition:color .25s}
.req svg{width:12px;height:12px;flex-shrink:0}
.req.met{color:#3ecf8e}.req.met svg{stroke:#3ecf8e}

.link{color:var(--p2);font-size:12px;text-decoration:none;transition:opacity .2s}
.link:hover{opacity:.7}
.bottom-hint{font-size:12px;color:var(--mt);text-align:center;flex-shrink:0}
.err-msg{font-size:12px;color:#ff4d6d;background:#ff4d6d0e;border:1px solid #ff4d6d28;border-radius:8px;padding:8px 12px;text-align:center;flex-shrink:0;margin-bottom:4px}

.btn-main{
  width:100%;padding:14px 20px;background:var(--grad);
  border:none;border-radius:12px;color:#fff;
  font-family:'Outfit',sans-serif;font-size:15px;font-weight:600;
  cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;
  position:relative;overflow:hidden;
  box-shadow:0 6px 22px #ff8c0022;
  transition:transform .2s,box-shadow .2s,opacity .2s;flex-shrink:0;
}
.btn-main::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,#ffffff22,transparent);opacity:0;transition:opacity .3s}
.btn-main:not(:disabled):hover{transform:translateY(-2px);box-shadow:0 10px 32px #ff8c0040}
.btn-main:not(:disabled):hover::before{opacity:1}
.btn-main:not(:disabled):hover svg{transform:translateX(3px)}
.btn-main:not(:disabled):active{transform:scale(.98)}
.btn-main:disabled{opacity:.45;cursor:not-allowed}
.btn-main.loading{pointer-events:none;opacity:.85}
.btn-main svg{width:16px;height:16px;transition:transform .25s}
.flex1{flex:1}
.spinner{width:17px;height:17px;border:2px solid #ffffff45;border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

.btn-row{display:flex;gap:10px;flex-shrink:0}
.btn-back{
  width:46px;height:46px;flex-shrink:0;
  background:var(--s2);border:1px solid var(--bd);border-radius:12px;
  color:var(--mt);cursor:pointer;display:flex;align-items:center;justify-content:center;
  transition:border-color .2s,color .2s,transform .2s,background .2s;
}
.btn-back:hover{border-color:var(--p1);color:var(--p1);transform:translateX(-2px);background:#ff8c000e}
.btn-back svg{width:17px;height:17px}

.btn-google{
  width:100%;padding:13px 20px;
  background:var(--s2);border:1px solid var(--bd);border-radius:12px;
  color:#ccc;font-family:'Outfit',sans-serif;font-size:14px;font-weight:500;
  cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;
  transition:border-color .25s,background .25s,transform .2s,box-shadow .2s;flex-shrink:0;
}
.btn-google:hover{border-color:var(--p2);background:#ff2e880e;color:var(--tx);transform:translateY(-2px);box-shadow:0 6px 18px #ff2e8818}
.btn-google:active{transform:scale(.98)}
.g-svg{width:18px;height:18px;flex-shrink:0}

.divider{display:flex;align-items:center;gap:12px;margin:14px 0;color:var(--mt2);font-size:12px;flex-shrink:0}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--bd)}

.success-wrap{display:flex;flex-direction:column;align-items:center;text-align:center;flex:1}
.success-ring{
  width:80px;height:80px;border-radius:50%;
  border:2px solid #ff8c0050;
  background:linear-gradient(135deg,#ff8c0012,#ff2e8812);
  display:flex;align-items:center;justify-content:center;
  margin:0 auto 20px;
  box-shadow:0 0 0 6px #ff8c000e,0 0 0 12px #ff2e8808;
  animation:rpop .5s cubic-bezier(.34,1.56,.64,1) forwards;
}
.success-ring svg{width:36px;height:36px}
@keyframes rpop{from{transform:scale(.5);opacity:0}to{transform:scale(1);opacity:1}}
.success-title{font-family:'Syne',sans-serif;font-size:24px;color:var(--tx);margin-bottom:8px}
.success-msg{font-size:13px;color:var(--mt);line-height:1.6;margin-bottom:20px;max-width:290px}
.profile-card{display:flex;align-items:center;gap:14px;background:var(--s2);border:1px solid var(--bd);border-radius:16px;padding:16px;width:100%;text-align:left;margin-bottom:20px}
.avatar{width:48px;height:48px;border-radius:50%;flex-shrink:0;background:var(--grad);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:#fff;box-shadow:0 4px 14px #ff8c0028}
.pinfo .pname{font-size:15px;font-weight:500;color:var(--tx)}
.pinfo .pusername{font-size:13px;color:var(--mt);margin-top:2px}
.badge{display:inline-block;padding:2px 10px;background:linear-gradient(135deg,#ff8c0018,#ff2e8818);color:var(--p2);border-radius:20px;font-size:11px;margin-top:5px;border:1px solid #ff2e8828}

@media(max-width:600px){
  .card{padding:26px 24px 22px;height:auto;min-height:680px}
  .reqs{grid-template-columns:1fr}
}
</style>