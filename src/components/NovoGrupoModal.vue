<template>
  <!-- ╔══════════════════════════════════════════════╗ -->
  <!-- ║  PASSO 3 — Crie: src/components/             ║ -->
  <!-- ║             NovoGrupoModal.vue               ║ -->
  <!-- ╚══════════════════════════════════════════════╝ -->

  <transition name="fade">
    <div v-if="modelValue" class="overlay dark" @click.self="$emit('update:modelValue', false)">
      <div class="modal">

        <!-- HEADER -->
        <div class="modal-hd">
          <button v-if="step === 2" class="back-btn" @click="step = 1">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          <h2>{{ step === 1 ? 'Novo grupo' : 'Adicionar membros' }}</h2>
          <button class="close-btn" @click="$emit('update:modelValue', false)">✕</button>
        </div>

        <!-- ── STEP 1: NOME + DESCRIÇÃO ── -->
        <div v-if="step === 1" class="step">
          <div class="av-preview" :style="avatarStyle">
            {{ nome.slice(0, 2).toUpperCase() || 'GR' }}
          </div>

          <input
            v-model="nome"
            class="inp"
            placeholder="Nome do grupo *"
            maxlength="50"
            autofocus
            @keydown.enter="nome.trim() && (step = 2)"
          />
          <input
            v-model="descricao"
            class="inp"
            placeholder="Descrição (opcional)"
            maxlength="120"
          />

          <p class="counter">{{ nome.length }}/50</p>

          <button class="btn-primary" :disabled="!nome.trim()" @click="step = 2">
            Próximo: adicionar membros →
          </button>
        </div>

        <!-- ── STEP 2: SELECIONAR MEMBROS ── -->
        <div v-else class="step step2">
          <!-- Chips dos selecionados -->
          <transition-group name="chip" tag="div" class="chips" v-if="selecionados.length">
            <div v-for="u in selecionados" :key="u.id" class="chip">
              <img :src="u.avatar" class="chip-av" />
              <span>{{ u.handle }}</span>
              <button @click="toggle(u)">✕</button>
            </div>
          </transition-group>

          <!-- Busca -->
          <div class="search-row">
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" class="search-ic">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input v-model="busca" class="search-in" placeholder="Buscar usuários..." />
          </div>

          <!-- Lista -->
          <div class="lista">
            <div
              v-for="u in usuariosFiltrados"
              :key="u.id"
              class="user-item"
              :class="{ sel: isSel(u) }"
              @click="toggle(u)"
            >
              <img :src="u.avatar" class="av40" />
              <div class="user-txt">
                <p class="user-nome">{{ u.nome }}</p>
                <p class="user-handle">{{ u.handle }}</p>
              </div>
              <div class="check" :class="{ on: isSel(u) }">
                <svg v-if="isSel(u)" viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
            </div>
            <p v-if="!usuariosFiltrados.length" class="vazio">Nenhum usuário encontrado</p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <span class="sel-count">{{ selecionados.length }} selecionado{{ selecionados.length !== 1 ? 's' : '' }}</span>
            <button
              class="btn-primary"
              :disabled="!selecionados.length || loading"
              @click="criar"
            >
              {{ loading ? 'Criando...' : `Criar grupo (${selecionados.length + 1})` }}
            </button>
          </div>
        </div>

      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,        // v-model para abrir/fechar
  usuarios:   Array,          // lista de todos os usuários (do componente pai)
})

const emit = defineEmits(['update:modelValue', 'criado'])

const step      = ref(1)
const nome      = ref('')
const descricao = ref('')
const busca     = ref('')
const selecionados = ref([])
const loading   = ref(false)

// Cores para o avatar preview
const CORES = [
  'linear-gradient(135deg,#c41840,#8b0000)',
  'linear-gradient(135deg,#c45000,#7a2d00)',
  'linear-gradient(135deg,#006b8c,#004455)',
  'linear-gradient(135deg,#1a6b2a,#0a3a14)',
  'linear-gradient(135deg,#6b1a6b,#3a0a3a)',
  'linear-gradient(135deg,#8c6b00,#4a3800)',
]

const avatarStyle = computed(() => ({
  background: CORES[(nome.value.charCodeAt(0) || 0) % CORES.length],
}))

const usuariosFiltrados = computed(() => {
  const q = busca.value.toLowerCase()
  if (!q) return props.usuarios || []
  return (props.usuarios || []).filter(u =>
    u.handle.toLowerCase().includes(q) || u.nome.toLowerCase().includes(q)
  )
})

function isSel(u) {
  return selecionados.value.some(s => s.id === u.id)
}

function toggle(u) {
  const idx = selecionados.value.findIndex(s => s.id === u.id)
  if (idx === -1) selecionados.value.push(u)
  else selecionados.value.splice(idx, 1)
}

async function criar() {
  if (!selecionados.value.length || loading.value) return
  loading.value = true
  try {
    emit('criado', {
      nome:      nome.value.trim(),
      descricao: descricao.value.trim(),
      membros:   selecionados.value,
    })
  } finally {
    loading.value = false
  }
}

// Reset ao fechar
watch(() => props.modelValue, v => {
  if (!v) {
    step.value         = 1
    nome.value         = ''
    descricao.value    = ''
    busca.value        = ''
    selecionados.value = []
    loading.value      = false
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }

.overlay {
  position: fixed; inset: 0; z-index: 400;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,.92);
}

.modal {
  background: #0f0800; border: 1px solid #2a1500;
  border-radius: 18px; width: 390px; max-height: 600px;
  display: flex; flex-direction: column; overflow: hidden;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #f0e8df;
}

/* Header */
.modal-hd {
  display: flex; align-items: center; gap: 8px;
  padding: 16px 20px; border-bottom: 1px solid #1e1000;
  flex-shrink: 0;
}
.modal-hd h2 { flex: 1; font-size: 15px; font-weight: 700; }
.back-btn, .close-btn {
  background: none; border: none; cursor: pointer;
  color: rgba(240,232,223,.4); font-size: 15px; padding: 4px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px; transition: color .15s;
}
.back-btn:hover { color: #ff8c00; }
.close-btn:hover { color: #ff2d6b; }
.back-btn svg { fill: currentColor; }

/* Steps */
.step {
  display: flex; flex-direction: column; gap: 10px;
  padding: 20px; flex: 1; overflow-y: auto;
}
.step2 { padding: 14px 16px; gap: 8px; }

/* Avatar preview */
.av-preview {
  width: 72px; height: 72px; border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; font-weight: 800; color: rgba(255,255,255,.9);
  margin: 0 auto 6px; transition: background .3s;
  border: 2px solid rgba(255,255,255,.08);
}

/* Inputs */
.inp {
  background: #130900; border: 1.5px solid #2a1800;
  border-radius: 12px; padding: 11px 14px;
  color: #f0e8df; font-size: 14px; font-family: inherit;
  outline: none; transition: border-color .2s;
}
.inp:focus { border-color: #ff6b00; }
.inp::placeholder { color: rgba(240,232,223,.25); }

.counter { font-size: 11px; color: rgba(240,232,223,.2); text-align: right; margin-top: -4px; }

/* Botão primário */
.btn-primary {
  background: linear-gradient(135deg, #ff2d6b, #ff6b00);
  color: #fff; border: none; border-radius: 22px;
  padding: 12px 20px; font-size: 13px; font-weight: 700;
  font-family: inherit; cursor: pointer; transition: all .15s;
  margin-top: 4px;
}
.btn-primary:disabled { opacity: .35; cursor: not-allowed; }
.btn-primary:not(:disabled):hover { transform: scale(1.02); box-shadow: 0 4px 16px rgba(255,45,107,.3); }

/* Chips */
.chips {
  display: flex; flex-wrap: wrap; gap: 6px; padding: 4px 0;
}
.chip {
  display: flex; align-items: center; gap: 5px;
  background: #1e0e00; border: 1px solid #2a1800;
  border-radius: 20px; padding: 4px 10px 4px 4px;
  font-size: 12px; font-weight: 600; color: rgba(240,232,223,.7);
}
.chip-av { width: 20px; height: 20px; border-radius: 50%; object-fit: cover; }
.chip button {
  background: none; border: none; color: rgba(240,232,223,.3);
  cursor: pointer; font-size: 11px; padding: 0 0 0 3px; line-height: 1;
}
.chip button:hover { color: #ff2d6b; }
.chip-enter-active, .chip-leave-active { transition: all .2s; }
.chip-enter-from, .chip-leave-to { opacity: 0; transform: scale(.8); }

/* Busca */
.search-row {
  display: flex; align-items: center; gap: 8px;
  background: #130900; border: 1.5px solid #2a1800;
  border-radius: 12px; padding: 0 12px;
}
.search-ic { fill: rgba(240,232,223,.25); flex-shrink: 0; }
.search-in {
  flex: 1; background: none; border: none; outline: none;
  color: #f0e8df; font-size: 13px; font-family: inherit; padding: 10px 0;
}
.search-in::placeholder { color: rgba(240,232,223,.25); }

/* Lista de usuários */
.lista { flex: 1; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #2a1800 transparent; }
.user-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 4px; cursor: pointer; border-radius: 10px;
  transition: background .12s;
}
.user-item:hover { background: #130900; }
.user-item.sel { background: rgba(255,45,107,.06); }
.av40 { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.user-txt { flex: 1; min-width: 0; }
.user-nome { font-size: 13px; font-weight: 600; }
.user-handle { font-size: 11px; color: rgba(240,232,223,.35); margin-top: 1px; }
.check {
  width: 20px; height: 20px; border-radius: 50%;
  border: 1.5px solid #2a1800; background: #130900;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all .15s;
}
.check.on {
  background: linear-gradient(135deg, #ff2d6b, #ff6b00);
  border-color: transparent; fill: #fff;
}
.vazio { padding: 24px; text-align: center; color: rgba(240,232,223,.25); font-size: 13px; }

/* Footer */
.footer {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 10px; border-top: 1px solid #1e1000; gap: 10px;
}
.sel-count { font-size: 12px; color: rgba(240,232,223,.3); flex-shrink: 0; }
.footer .btn-primary { margin: 0; flex: 1; }

/* Transition */
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 700px) {
  .modal { width: calc(100vw - 32px); max-height: 88vh; }
}
</style>