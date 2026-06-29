<template>
  <div class="rp-root">
    <div class="rp-card-border">
      <div class="rp-card">

        <div class="rp-logo">
          <div class="rp-logo-mark">
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
          <h1 class="rp-logo-name">Aura</h1>
          <p class="rp-logo-sub">{{ subtitulo }}</p>
        </div>

        <!-- SUCESSO -->
        <template v-if="sucesso">
          <div class="rp-success">
            <div class="rp-success-ring">
              <svg viewBox="0 0 48 48" fill="none" stroke-width="3.5" stroke-linecap="round">
                <polyline points="12 25 21 34 36 16" stroke="url(#sg)"/>
                <defs>
                  <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#ff8c00"/><stop offset="100%" stop-color="#ff2e88"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <p class="rp-success-title">Senha alterada!</p>
            <p class="rp-success-sub">Você já pode entrar com sua nova senha.</p>
            <button class="rp-btn-main" @click="voltarLogin">
              <span>Ir para o login</span>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 10h12M11 5l5 5-5 5"/></svg>
            </button>
          </div>
        </template>

        <!-- TOKEN INVÁLIDO -->
        <template v-else-if="tokenInvalido">
          <div class="rp-success">
            <div class="rp-success-ring" style="border-color:#ff4d6d50;background:linear-gradient(135deg,#ff4d6d12,#ff4d6d12)">
              <svg viewBox="0 0 48 48" fill="none" stroke="#ff4d6d" stroke-width="3.5" stroke-linecap="round">
                <path d="M16 16l16 16M32 16L16 32"/>
              </svg>
            </div>
            <p class="rp-success-title">Link inválido ou expirado</p>
            <p class="rp-success-sub">Solicite um novo link de redefinição de senha.</p>
           <button class="rp-btn-main" @click="voltarLogin">
              <span>Voltar ao login</span>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 10h12M11 5l5 5-5 5"/></svg>
            </button>
          </div>
        </template>

        <!-- FORM -->
        <template v-else>
          <div class="rp-field" :class="{ focused: f.senha, filled: !!senha }">
            <label>Nova senha</label>
            <div class="rp-iw">
              <svg class="rp-fi" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                <rect x="4" y="9" width="12" height="9" rx="2"/><path d="M7 9V7a3 3 0 0 1 6 0v2"/>
              </svg>
              <input v-model="senha" :type="sp1 ? 'text' : 'password'" placeholder="mín. 8 caracteres" @focus="f.senha=true" @blur="f.senha=false" />
              <button type="button" class="rp-eye" @click="sp1=!sp1">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                  <template v-if="!sp1"><path d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><circle cx="10" cy="10" r="2.5"/></template>
                  <template v-else><path d="M3 3l14 14"/><path d="M7.5 7.6A5 5 0 0 0 5.3 10s2 4 5 4a4.8 4.8 0 0 0 2.5-.7"/></template>
                </svg>
              </button>
            </div>
            <div v-if="senha" class="rp-str-wrap">
              <div class="rp-str-bar">
                <div v-for="i in 4" :key="i" class="rp-str-seg" :class="strClass(i)" />
              </div>
              <span class="rp-str-lbl" :class="strColor">{{ strLabel }}</span>
            </div>
          </div>

          <div class="rp-field" :class="{ focused: f.confirmar, filled: !!confirmar, error: erroConf }">
            <label>Confirmar senha</label>
            <div class="rp-iw">
              <svg class="rp-fi" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                <rect x="4" y="9" width="12" height="9" rx="2"/><path d="M7 9V7a3 3 0 0 1 6 0v2"/><path d="M8 14l2 2 4-4"/>
              </svg>
              <input v-model="confirmar" :type="sp2 ? 'text' : 'password'" placeholder="repita a senha" @focus="f.confirmar=true" @blur="f.confirmar=false" />
              <div v-if="senhasOk" class="rp-ok-icon">
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="2 6 5 9 10 3"/></svg>
              </div>
            </div>
            <p v-if="erroConf" class="rp-ferr">{{ erroConf }}</p>
          </div>

          <p v-if="erro" class="rp-erro">{{ erro }}</p>

          <div class="rp-flex-gap" />

          <button class="rp-btn-main" :class="{ loading: carregando }" :disabled="carregando" @click="redefinir">
            <span v-if="!carregando">Redefinir senha</span>
            <span v-else class="rp-spinner" />
          </button>
        </template>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase.js'

const router = useRouter()

const senha         = ref('')
const confirmar     = ref('')
const sp1           = ref(false)
const sp2           = ref(false)
const erro          = ref('')
const erroConf      = ref('')
const carregando    = ref(false)
const sucesso       = ref(false)
const tokenInvalido = ref(false)
const f = reactive({ senha: false, confirmar: false })

const subtitulo = computed(() => {
  if (sucesso.value)       return 'Senha alterada!'
  if (tokenInvalido.value) return 'Link inválido'
  return 'Redefinir senha'
})

const senhasOk = computed(() => senha.value && confirmar.value && senha.value === confirmar.value)

const score = computed(() => {
  const s = senha.value; let n = 0
  if (s.length >= 8) n++
  if (/[A-Z]/.test(s)) n++
  if (/[0-9]/.test(s)) n++
  if (/[^A-Za-z0-9]/.test(s)) n++
  return n
})
const strLabel = computed(() => ['Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte'][score.value] ?? 'Muito fraca')
const strColor = computed(() => ['cx', 'cw', 'cf', 'cg', 'cs'][score.value] ?? 'cx')
function strClass(i) {
  if (i > score.value) return ''
  return ['', 'sw', 'sf', 'sg', 'ss'][score.value] ?? 'sw'
}

onMounted(() => {
  let recuperou = false

  supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      recuperou = true
      tokenInvalido.value = false
    }
  })

  setTimeout(() => {
    if (!recuperou) router.push('/')
  }, 600000)
})

async function voltarLogin() {
  await supabase.auth.signOut()
  router.push('/')
}

async function redefinir() {
  erro.value = ''
  erroConf.value = ''
  if (senha.value.length < 8)         { erro.value = 'A senha deve ter no mínimo 8 caracteres.'; return }
  if (senha.value !== confirmar.value) { erroConf.value = 'As senhas não coincidem.'; return }

  carregando.value = true
  try {
    const { error } = await supabase.auth.updateUser({ password: senha.value })
    if (error) throw error
    sucesso.value = true
  } catch (e) {
    erro.value = e?.message || 'Erro ao redefinir senha.'
  } finally {
    carregando.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500;600&display=swap');

*,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }

.rp-root {
  width: 100vw; height: 100vh;
  background: #000;
  display: flex; align-items: center; justify-content: center;
  padding: 16px; font-family: 'Outfit', sans-serif;
  position: relative; overflow: hidden;
}

.rp-card-border {
  position: relative; z-index: 1;
  width: 100%; max-width: 480px;
  padding: 3px; border-radius: 36px;
  background: linear-gradient(135deg,#ff8c00,#ff2e88,#ff8c00);
  background-size: 200% 200%;
  animation: bspin 3s ease infinite;
  box-shadow: 0 0 50px #ff8c0018, 0 0 100px #ff2e8812;
}
@keyframes bspin { 0%,100% { background-position: 0% 50% } 50% { background-position: 100% 50% } }

.rp-card {
  background: #000; border-radius: 34px;
  padding: 36px 48px 32px;
  display: flex; flex-direction: column;
  min-height: 420px;
}

.rp-logo { text-align: center; margin-bottom: 24px; flex-shrink: 0; }
.rp-logo-mark {
  width: 52px; height: 52px;
  background: linear-gradient(135deg,#ff8c00,#ff2e88);
  border-radius: 16px;
  display: inline-flex; align-items: center; justify-content: center;
  margin-bottom: 10px; box-shadow: 0 6px 24px #ff8c0028;
}
.rp-logo-mark svg { width: 26px; height: 26px; }
.rp-logo-name { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -1px; margin-bottom: 4px; }
.rp-logo-sub { font-size: 13px; color: #666; }

.rp-field { margin-bottom: 14px; flex-shrink: 0; }
.rp-field label { display: block; font-size: 11px; color: #4a4a4a; text-transform: uppercase; letter-spacing: .7px; margin-bottom: 5px; font-weight: 500; transition: color .2s; }
.rp-field.focused label, .rp-field.filled label { color: #ff2e88; }
.rp-field.error label { color: #ff4d6d; }

.rp-iw { position: relative; display: flex; align-items: center; }
.rp-fi { position: absolute; left: 12px; width: 15px; height: 15px; color: #4a4a4a; pointer-events: none; transition: color .2s; flex-shrink: 0; }
.rp-field.focused .rp-fi { color: #ff2e88; }
.rp-field.error .rp-fi { color: #ff4d6d; }

.rp-iw input {
  width: 100%; padding: 13px 36px 13px 35px;
  background: #0d0d0d; border: 1px solid #1e1e1e;
  border-radius: 11px; color: #f2f2f2;
  font-family: 'Outfit', sans-serif; font-size: 14px;
  outline: none; transition: border-color .25s, background .25s, box-shadow .25s;
}
.rp-iw input::placeholder { color: #4a4a4a; }
.rp-iw input:focus { border-color: #ff2e88; background: #131313; box-shadow: 0 0 0 3px #ff5fa214; }
.rp-field.error .rp-iw input { border-color: #ff4d6d; }
.rp-ferr { font-size: 11px; color: #ff4d6d; margin-top: 4px; }

.rp-eye { position: absolute; right: 9px; background: none; border: none; cursor: pointer; color: #4a4a4a; padding: 4px; display: flex; align-items: center; border-radius: 5px; transition: color .2s; }
.rp-eye:hover { color: #ff2e88; }
.rp-eye svg { width: 15px; height: 15px; }

.rp-ok-icon { position: absolute; right: 10px; width: 20px; height: 20px; border-radius: 50%; background: #3ecf8e18; color: #3ecf8e; display: flex; align-items: center; justify-content: center; }
.rp-ok-icon svg { width: 12px; height: 12px; }

.rp-str-wrap { display: flex; align-items: center; gap: 10px; margin-top: 7px; }
.rp-str-bar { display: flex; gap: 4px; flex: 1; }
.rp-str-seg { flex: 1; height: 3px; border-radius: 2px; background: #1e1e1e; transition: background .3s; }
.rp-str-seg.sw { background: #ff4d6d; } .rp-str-seg.sf { background: #ff9a3c; } .rp-str-seg.sg { background: #e5c200; } .rp-str-seg.ss { background: #3ecf8e; }
.rp-str-lbl { font-size: 11px; white-space: nowrap; }
.cx { color: #ff4d6d; } .cw { color: #ff4d6d; } .cf { color: #ff9a3c; } .cg { color: #e5c200; } .cs { color: #3ecf8e; }

.rp-erro { font-size: 12px; color: #ff4d6d; background: #ff4d6d0e; border: 1px solid #ff4d6d28; border-radius: 8px; padding: 8px 12px; text-align: center; flex-shrink: 0; margin-bottom: 8px; }

.rp-flex-gap { flex: 1; }

.rp-btn-main {
  width: 100%; padding: 14px 20px;
  background: linear-gradient(135deg,#ff8c00,#ff2e88);
  border: none; border-radius: 12px; color: #fff;
  font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
  box-shadow: 0 6px 22px #ff8c0022;
  transition: transform .2s, box-shadow .2s, opacity .2s; flex-shrink: 0;
}
.rp-btn-main:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 10px 32px #ff8c0040; opacity: .95; }
.rp-btn-main:disabled { opacity: .45; cursor: not-allowed; }
.rp-btn-main svg { width: 16px; height: 16px; }

.rp-success { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; flex: 1; justify-content: center; }
.rp-success-ring {
  width: 80px; height: 80px; border-radius: 50%;
  border: 2px solid #ff8c0050;
  background: linear-gradient(135deg,#ff8c0012,#ff2e8812);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 0 6px #ff8c000e, 0 0 0 12px #ff2e8808;
  animation: rpop .5s cubic-bezier(.34,1.56,.64,1) forwards;
}
.rp-success-ring svg { width: 36px; height: 36px; }
@keyframes rpop { from { transform: scale(.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.rp-success-title { font-family: 'Syne', sans-serif; font-size: 22px; color: #fff; font-weight: 800; margin: 0; }
.rp-success-sub { font-size: 13px; color: #666; margin: 0 0 8px; line-height: 1.6; }

.rp-spinner { width: 17px; height: 17px; border: 2px solid #ffffff45; border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 500px) {
  .rp-card { padding: 28px 24px 24px; }
}
</style>