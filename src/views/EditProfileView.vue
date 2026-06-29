<template>
  <div class="ep-root">

    <!-- HEADER -->
    <div class="ep-header">
      <button class="ep-back" @click="router.back()">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
      </button>
      <h1 class="ep-title">Editar perfil</h1>
      <button class="ep-save-btn" :disabled="salvando" @click="salvar">
        <span v-if="salvando" class="ep-spinner" />
        <span v-else>Salvar</span>
      </button>
    </div>

    <!-- FOTO -->
    <div class="ep-foto-section">
      <div class="ep-foto-wrap">
        <img :src="fotoPreview || authState.profile?.avatar_url || 'https://via.placeholder.com/150'" class="ep-foto" />
        <label class="ep-foto-overlay">
          <input type="file" accept="image/*" @change="onFoto" hidden />
          <svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
        </label>
      </div>
      <span class="ep-foto-hint">{{ fotoPreview ? '✅ Nova foto selecionada' : 'Trocar foto' }}</span>
    </div>

    <!-- ERRO -->
    <div v-if="erro" class="ep-erro">⚠️ {{ erro }}</div>

    <!-- CAMPOS -->
    <div class="ep-form">

      <div class="ep-section-title">Informações públicas</div>

      <div class="ep-field">
        <label>Nome</label>
        <input v-model="form.nome" maxlength="50" placeholder="Seu nome" />
      </div>

      <div class="ep-field">
        <label>Username</label>
        <div class="ep-prefix-wrap">
          <span class="ep-prefix">@</span>
          <input v-model="form.username" maxlength="30" placeholder="seuusername" />
        </div>
      </div>

      <div class="ep-field">
        <label>
          Bio
          <span class="ep-counter">{{ (form.bio || '').length }}/150</span>
        </label>
        <textarea v-model="form.bio" rows="3" maxlength="150" placeholder="Fale um pouco sobre você..." />
      </div>

      <div class="ep-field">
        <label>Website</label>
        <input v-model="form.website" placeholder="seusite.com" />
      </div>

      <div class="ep-divider" />
      <div class="ep-section-title">Informações pessoais</div>
      <p class="ep-section-sub">Essas informações não aparecem publicamente.</p>

      <div class="ep-field">
        <label>Sexo</label>
        <div class="ep-gender-grid">
          <div
            v-for="g in generos" :key="g.v"
            class="ep-gender-card"
            :class="{ selected: form.genero === g.v }"
            @click="form.genero = g.v"
          >
            <span class="ep-gender-icon">{{ g.emoji }}</span>
            <span class="ep-gender-label">{{ g.label }}</span>
          </div>
        </div>
      </div>

      <div class="ep-field">
        <label>Data de nascimento</label>
        <input v-model="form.nascimento" type="date" />
        <p v-if="erroIdade" class="ep-field-erro">{{ erroIdade }}</p>
      </div>

      <div class="ep-field">
        <label>Categoria</label>
        <select v-model="form.categoria">
          <option value="">Selecione...</option>
          <option v-for="c in categorias" :key="c">{{ c }}</option>
        </select>
      </div>

      <div class="ep-divider" />
      <div class="ep-section-title">Contato</div>

      <div class="ep-field">
        <label>Email</label>
        <input :value="authState.user?.email" disabled class="ep-disabled" />
        <p class="ep-field-hint">O email não pode ser alterado aqui.</p>
      </div>

    </div>

    <!-- BOTÃO BOTTOM -->
    <div class="ep-bottom">
      <button class="ep-bottom-btn" :disabled="salvando" @click="salvar">
        <span v-if="salvando" class="ep-spinner" />
        <span v-else>✅ Salvar alterações</span>
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authState, updateProfile, uploadAvatar, reloadProfile } from '@/auth.js'

const router = useRouter()

const salvando   = ref(false)
const erro       = ref('')
const erroIdade  = ref('')
const fotoPreview = ref(null)
const novaFotoFile = ref(null)

const form = reactive({
  nome:       '',
  username:   '',
  bio:        '',
  website:    '',
  genero:     '',
  nascimento: '',
  categoria:  '',
})

const generos = [
  { v: 'fem',  label: 'Feminino',          emoji: '♀️' },
  { v: 'masc', label: 'Masculino',         emoji: '♂️' },
  { v: 'nb',   label: 'Não-binário',       emoji: '⚧️' },
  { v: 'pref', label: 'Prefiro não dizer', emoji: '·' },
]

const categorias = [
  'Entretenimento','Esportes','Tecnologia','Culinária',
  'Moda & Beleza','Viagens','Música','Gaming',
  'Educação','Humor','Arte & Design','Negócios',
]

onMounted(() => {
  const p = authState.profile
  if (!p) return
  form.nome       = p.nome        || ''
  form.username   = p.username    || ''
  form.bio        = p.bio         || ''
  form.website    = p.website     || ''
  form.genero     = p.genero      || ''
  form.nascimento = p.nascimento  || ''
  form.categoria  = p.categoria   || ''
})

function onFoto(e) {
  const f = e.target.files[0]
  if (!f) return
  novaFotoFile.value = f
  fotoPreview.value  = URL.createObjectURL(f)
}

function validarIdade() {
  if (!form.nascimento) { erroIdade.value = ''; return true }
  const n = new Date(form.nascimento), h = new Date()
  let age = h.getFullYear() - n.getFullYear()
  if (h.getMonth() - n.getMonth() < 0 || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) age--
  if (age < 13) { erroIdade.value = 'Você precisa ter pelo menos 13 anos.'; return false }
  erroIdade.value = ''
  return true
}

async function salvar() {
  erro.value = ''
  const u = form.username?.trim()
  if (!u || u.length < 3 || !/^[a-zA-Z0-9_.]+$/.test(u)) {
    erro.value = 'Username inválido — mínimo 3 caracteres, só letras, números, _ e .'
    return
  }
  if (!form.nome?.trim()) { erro.value = 'Nome obrigatório.'; return }
  if (!validarIdade()) return

  salvando.value = true
  try {
    const payload = {
      username:   u,
      nome:       form.nome.trim(),
      bio:        form.bio?.trim()      || '',
      website:    form.website?.trim()  || '',
      genero:     form.genero           || '',
      nascimento: form.nascimento       || '',
      categoria:  form.categoria        || '',
    }
    if (novaFotoFile.value) {
      const url = await uploadAvatar(novaFotoFile.value)
      if (url) payload.avatar_url = url
    }
    await updateProfile(payload)
    await reloadProfile()
    router.back()
  } catch (e) {
    erro.value = e?.message || 'Erro ao salvar.'
  } finally {
    salvando.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');

.ep-root {
  font-family: 'DM Sans', sans-serif;
  background: #0a0a0a;
  min-height: 100vh;
  color: #fff;
  max-width: 600px;
  margin: 0 auto;
  padding-bottom: 100px;
}

/* HEADER */
.ep-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #1a1a1a;
  position: sticky;
  top: 0;
  background: rgba(10,10,10,.95);
  backdrop-filter: blur(12px);
  z-index: 10;
}
.ep-back {
  width: 36px; height: 36px;
  background: none; border: none; color: #fff;
  cursor: pointer; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.ep-back:hover { background: #1a1a1a; }
.ep-title {
  font-size: 16px; font-weight: 800;
  margin: 0; letter-spacing: -.3px;
}
.ep-save-btn {
  padding: 7px 18px;
  background: #fe2c55; color: #fff;
  border: none; border-radius: 8px;
  font-size: 13px; font-weight: 800;
  cursor: pointer; font-family: 'DM Sans', sans-serif;
  display: flex; align-items: center; gap: 6px;
  transition: background .15s, opacity .15s;
  min-width: 70px; justify-content: center;
}
.ep-save-btn:hover:not(:disabled) { background: #e0203b; }
.ep-save-btn:disabled { opacity: .5; cursor: not-allowed; }

/* FOTO */
.ep-foto-section {
  display: flex; flex-direction: column;
  align-items: center; gap: 10px;
  padding: 28px 16px 20px;
  border-bottom: 1px solid #131313;
}
.ep-foto-wrap {
  position: relative; width: 96px; height: 96px;
}
.ep-foto {
  width: 96px; height: 96px;
  border-radius: 50%; object-fit: cover;
  border: 3px solid #1e1e1e;
}
.ep-foto-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,.6);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; opacity: 0; transition: opacity .2s;
}
.ep-foto-wrap:hover .ep-foto-overlay { opacity: 1; }
.ep-foto-hint { font-size: 13px; color: #fe2c55; font-weight: 600; cursor: pointer; }

/* ERRO */
.ep-erro {
  margin: 0 16px 4px;
  background: #160000; border: 1px solid #3a0f0f;
  color: #ff6666; border-radius: 10px;
  padding: 10px 14px; font-size: 13px;
}

/* FORM */
.ep-form { padding: 0 16px; }

.ep-section-title {
  font-size: 11px; font-weight: 800;
  color: #444; text-transform: uppercase;
  letter-spacing: .7px; margin: 24px 0 14px;
}
.ep-section-sub {
  font-size: 12px; color: #3a3a3a;
  margin: -10px 0 14px; line-height: 1.5;
}

.ep-field { margin-bottom: 18px; }
.ep-field label {
  display: flex; justify-content: space-between;
  font-size: 11px; font-weight: 700;
  color: #484848; text-transform: uppercase;
  letter-spacing: .5px; margin-bottom: 8px;
}
.ep-counter { font-weight: 400; color: #333; text-transform: none; }

.ep-field input,
.ep-field textarea,
.ep-field select {
  width: 100%;
  background: #0d0d0d; border: 1px solid #1e1e1e;
  border-radius: 10px; padding: 12px 14px;
  color: #fff; font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  outline: none; box-sizing: border-box;
  transition: border-color .2s;
}
.ep-field input:focus,
.ep-field textarea:focus,
.ep-field select:focus { border-color: #fe2c55; }
.ep-field input::placeholder,
.ep-field textarea::placeholder { color: #2e2e2e; }
.ep-field textarea { resize: vertical; }
.ep-field select { cursor: pointer; }

.ep-disabled { opacity: .35; cursor: not-allowed; }
.ep-field-erro { font-size: 11px; color: #ff4d4d; margin-top: 5px; }
.ep-field-hint { font-size: 11px; color: #333; margin-top: 5px; }

.ep-prefix-wrap {
  display: flex; align-items: center;
  background: #0d0d0d; border: 1px solid #1e1e1e;
  border-radius: 10px; overflow: hidden;
  transition: border-color .2s;
}
.ep-prefix-wrap:focus-within { border-color: #fe2c55; }
.ep-prefix {
  padding: 0 0 0 14px;
  color: #484848; font-size: 14px; font-weight: 600;
}
.ep-prefix-wrap input {
  border: none !important; border-radius: 0;
  padding-left: 4px; background: transparent;
}

/* GÊNERO */
.ep-gender-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.ep-gender-card {
  display: flex; flex-direction: column;
  align-items: center; gap: 6px;
  padding: 14px 8px;
  background: #0d0d0d; border: 1px solid #1e1e1e;
  border-radius: 12px; cursor: pointer;
  transition: all .18s;
}
.ep-gender-card:hover { border-color: #2e2e2e; }
.ep-gender-card.selected {
  border-color: #fe2c55;
  background: rgba(254,44,85,.08);
  box-shadow: 0 0 0 1px #fe2c55;
}
.ep-gender-icon { font-size: 22px; line-height: 1; }
.ep-gender-label {
  font-size: 12px; color: #666;
  font-weight: 600; text-align: center;
  transition: color .18s;
}
.ep-gender-card.selected .ep-gender-label { color: #fe2c55; }

/* DIVIDER */
.ep-divider { height: 1px; background: #131313; margin: 8px 0; }

/* BOTTOM */
.ep-bottom {
  position: fixed; bottom: 0; left: 0; right: 0;
  padding: 12px 16px;
  background: rgba(10,10,10,.95);
  backdrop-filter: blur(12px);
  border-top: 1px solid #1a1a1a;
  max-width: 600px; margin: 0 auto;
}
.ep-bottom-btn {
  width: 100%; padding: 14px;
  background: #fe2c55; color: #fff;
  border: none; border-radius: 12px;
  font-size: 15px; font-weight: 800;
  cursor: pointer; font-family: 'DM Sans', sans-serif;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: background .15s, opacity .15s;
}
.ep-bottom-btn:hover:not(:disabled) { background: #e0203b; }
.ep-bottom-btn:disabled { opacity: .5; cursor: not-allowed; }

/* SPINNER */
.ep-spinner {
  display: inline-block; width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,.25);
  border-top-color: #fff; border-radius: 50%;
  animation: ep-spin .7s linear infinite;
}
@keyframes ep-spin { to { transform: rotate(360deg); } }

@media (max-width: 500px) {
  .ep-gender-grid { grid-template-columns: 1fr 1fr; }
}
</style>