<!-- ProfileModal.vue -->
<template>
  <teleport to="body">
    <transition name="overlay-fade">
      <div v-if="aberto" class="profile-overlay" @click.self="fechar">
        <transition name="modal-slide">
          <div v-if="aberto" class="profile-modal">

            <!-- Handle -->
            <div class="modal-handle" />

            <!-- Cover + Avatar -->
            <div class="profile-cover">
              <div class="cover-pattern" />
              <button class="modal-close" @click="fechar">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
              <div class="profile-avatar-wrap">
                <img v-if="usuario?.avatar" :src="usuario.avatar" class="profile-avatar" />
                <div v-else class="avatar-placeholder">{{ iniciais }}</div>
              </div>
            </div>

            <!-- Info row -->
            <div class="profile-info-row">
              <div class="profile-names">
                <p class="profile-display-name">{{ usuario?.nome }}</p>
                <p class="profile-username">@{{ usuario?.username }}</p>
              </div>
              <div class="profile-actions">
                <button
                  v-if="!ehMeuPerfil"
                  class="btn-msg"
                  title="Mensagem"
                  @click="$emit('mensagem', usuario)"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                  </svg>
                </button>
                <button
                  v-if="!ehMeuPerfil"
                  class="btn-seguir"
                  :class="{ following: usuario?.seguindo }"
                  :disabled="loadingSeguir"
                  @click="toggleSeguir"
                >
                  <span v-if="loadingSeguir" class="dot-loader"><span/><span/><span/></span>
                  <template v-else>
                    <svg v-if="!usuario?.seguindo" viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    <svg v-else viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                    {{ usuario?.seguindo ? 'Seguindo' : 'Seguir' }}
                  </template>
                </button>
              </div>
            </div>

            <!-- Stats -->
            <div class="profile-stats">
              <div class="stat-item">
                <span class="stat-value">{{ fmt(usuario?.seguidores) }}</span>
                <span class="stat-label">Seguidores</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ fmt(usuario?.seguindo_count) }}</span>
                <span class="stat-label">Seguindo</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ fmt(usuario?.curtidas) }}</span>
                <span class="stat-label">Curtidas</span>
              </div>
            </div>

            <!-- Bio -->
            <p v-if="usuario?.bio" class="profile-bio">{{ usuario.bio }}</p>

            <!-- Vídeos recentes -->
            <div class="videos-section-label">
              <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" style="vertical-align:-1px">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
              {{ fmt(videos.length) }} vídeos
            </div>

            <div class="videos-grid-wrap">
              <!-- Loading -->
              <div v-if="loadingVideos" class="grid-loading">
                <div v-for="i in 9" :key="i" class="grid-skeleton" />
              </div>

              <!-- Grid -->
              <div v-else-if="videos.length" class="videos-grid">
                <div
                  v-for="v in videos"
                  :key="v.id"
                  class="grid-item"
                  @click="$emit('abrir-video', v); fechar()"
                >
                  <img :src="v.thumbnail" class="grid-thumb" />
                  <div class="grid-overlay">
                    <span class="grid-views">
                      <svg viewBox="0 0 24 24" fill="white" width="11" height="11">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      {{ fmt(v.likes) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Empty -->
              <div v-else class="grid-empty">
                <svg viewBox="0 0 24 24" fill="rgba(255,255,255,.2)" width="40" height="40">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                </svg>
                <p>Nenhum vídeo encontrado</p>
              </div>
            </div>

            <!-- Botão ir para o perfil completo -->
            <button class="btn-ver-perfil" @click="$emit('ir-para-perfil', usuario?.id); fechar()">
              <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              Ver perfil completo
            </button>

          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { authState } from '@/auth.js'

const props = defineProps({
  userId: { type: String, default: null },
})

const emit = defineEmits([
  'ir-para-perfil',
  'mensagem',
  'seguir',
  'abrir-video',
  'buscar-usuario',  // pai deve responder com os dados via callback
  'buscar-videos',   // pai deve responder com os dados via callback
])

// ── Estado ──────────────────────────────
const aberto       = ref(false)
const usuario      = ref(null)
const videos       = ref([])
const loadingSeguir = ref(false)
const loadingVideos = ref(true)

// ── Helpers ─────────────────────────────
const ehMeuPerfil = computed(() =>
  usuario.value?.id === authState.user?.id
)

const iniciais = computed(() => {
  const nome = usuario.value?.nome ?? ''
  return nome.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?'
})

function fmt(n) {
  if (!n) return '0'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

// ── Abrir / fechar ───────────────────────
async function abrir(id) {
  if (!id) return

  aberto.value      = true
  usuario.value     = null
  videos.value      = []
  loadingVideos.value = true

  // Busca dados do usuário
  emit('buscar-usuario', {
    userId: id,
    callback: (dados) => { usuario.value = dados },
  })

  // Busca vídeos
  emit('buscar-videos', {
    userId: id,
    callback: (lista) => {
      videos.value = lista
      loadingVideos.value = false
    },
  })

  // Fallback mock se o pai não responder em 700ms
  setTimeout(() => {
    if (!usuario.value) {
      usuario.value = {
        id,
        nome: 'Usuário',
        username: 'usuario',
        avatar: null,
        seguidores: 0,
        seguindo_count: 0,
        curtidas: 0,
        bio: '',
        seguindo: false,
      }
    }
    if (loadingVideos.value) {
      videos.value = []
      loadingVideos.value = false
    }
  }, 700)
}

function fechar() {
  aberto.value = false
}

// ── Seguir ───────────────────────────────
async function toggleSeguir() {
  if (!usuario.value) return
  loadingSeguir.value = true
  emit('seguir', {
    userId: usuario.value.id,
    callback: (sucesso) => {
      if (sucesso) {
      usuario.value.seguindo = !usuario.value.seguindo
      usuario.value.seguidores += usuario.value.seguindo ? 1 : -1
      }
      loadingSeguir.value = false
    },
  })

  // Monitora a variável 'aberto'. Se true, trava o scroll do body.
watch(aberto, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})

// Opcional: Fechar o modal ao apertar a tecla ESC
onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fechar()
  })
})
  // Fallback otimista
  setTimeout(() => {
    if (loadingSeguir.value) {
      usuario.value.seguindo = !usuario.value.seguindo
      loadingSeguir.value = false
    }
  }, 500)
}

// ── Expõe o método abrir para o pai ─────
defineExpose({ abrir })
</script>

<style scoped>
/* ── OVERLAY ── */
.profile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
  z-index: 200;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

/* ── MODAL ── */
.profile-modal {
  width: 100%;
  max-width: 480px;
  max-height: 80vh;
  background: #141414;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
}

/* Handle */
.modal-handle {
  width: 40px; height: 4px;
  background: rgba(255,255,255,.15);
  border-radius: 2px;
  margin: 12px auto 0;
  flex-shrink: 0;
}

/* ── COVER ── */
.profile-cover {
  height: 100px;
  background: linear-gradient(135deg, #1a0e00, #2a0d1a, #0d0d2a);
  position: relative;
  flex-shrink: 0;
}
.cover-pattern {
  position: absolute; inset: 0;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(255,45,85,.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255,107,0,.12) 0%, transparent 40%);
}
.modal-close {
  position: absolute; top: 10px; right: 12px;
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(0,0,0,.4);
  border: none; color: rgba(255,255,255,.6);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; z-index: 2; transition: background .15s;
}
.modal-close:hover { background: rgba(0,0,0,.6); }

/* ── AVATAR ── */
.profile-avatar-wrap {
  position: absolute;
  bottom: -26px; left: 20px;
  width: 58px; height: 58px;
  border-radius: 50%;
  padding: 2.5px;
  background: linear-gradient(135deg, #ff2d55, #ff6b00);
  z-index: 2;
}
.profile-avatar {
  width: 100%; height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2.5px solid #141414;
  display: block;
}
.avatar-placeholder {
  width: 100%; height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #2a1a2a, #1a1a2a);
  border: 2.5px solid #141414;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: 700;
  color: rgba(255,255,255,.7);
}

/* ── INFO ROW ── */
.profile-info-row {
  padding: 34px 20px 12px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
}
.profile-names { flex: 1; min-width: 0; }
.profile-display-name {
  font-size: 16px; font-weight: 700; color: #fff;
  margin: 0 0 2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.profile-username { font-size: 13px; color: rgba(255,255,255,.4); margin: 0; }

/* ── ACTIONS ── */
.profile-actions { display: flex; gap: 8px; flex-shrink: 0; }

.btn-msg {
  width: 34px; height: 34px; border-radius: 50%;
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.12);
  color: rgba(255,255,255,.7);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background .15s;
}
.btn-msg:hover { background: rgba(255,255,255,.13); }

.btn-seguir {
  display: flex; align-items: center; gap: 5px;
  padding: 7px 16px;
  background: #ff2d55;
  border: none; color: #fff;
  border-radius: 20px;
  font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit;
  transition: all .2s;
}
.btn-seguir.following {
  background: rgba(255,45,85,.12);
  border: 1px solid rgba(255,45,85,.35);
  color: #ff2d55;
}
.btn-seguir:hover { opacity: .85; }
.btn-seguir:disabled { opacity: .5; cursor: not-allowed; }

/* ── STATS ── */
.profile-stats {
  padding: 0 20px 14px;
  display: flex; gap: 20px;
  flex-shrink: 0;
  border-bottom: 0.5px solid rgba(255,255,255,.07);
}
.stat-item { display: flex; flex-direction: column; gap: 1px; }
.stat-value { font-size: 15px; font-weight: 700; color: #fff; }
.stat-label { font-size: 11px; color: rgba(255,255,255,.35); }

/* ── BIO ── */
.profile-bio {
  padding: 12px 20px 14px;
  font-size: 13px;
  color: rgba(255,255,255,.65);
  line-height: 1.5;
  flex-shrink: 0;
  border-bottom: 0.5px solid rgba(255,255,255,.07);
}

/* ── VIDEOS LABEL ── */
.videos-section-label {
  padding: 10px 20px 6px;
  font-size: 11px; font-weight: 700;
  color: rgba(255,255,255,.3);
  text-transform: uppercase; letter-spacing: .6px;
  flex-shrink: 0;
  display: flex; align-items: center; gap: 5px;
}

/* ── GRID ── (mesmo estilo do modal de áudio) */
.videos-grid-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 12px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,.1) transparent;
}
.videos-grid-wrap::-webkit-scrollbar { width: 3px; }
.videos-grid-wrap::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 2px; }

.videos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
}
.grid-item {
  position: relative;
  aspect-ratio: 9/16;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  background: #222;
}
.grid-thumb {
  width: 100%; height: 100%;
  object-fit: cover; display: block;
  transition: transform .2s;
}
.grid-item:hover .grid-thumb { transform: scale(1.04); }
.grid-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 50%);
  display: flex; align-items: flex-end;
  padding: 6px; opacity: 0;
  transition: opacity .2s;
}
.grid-item:hover .grid-overlay { opacity: 1; }
.grid-views { font-size: 11px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 3px; }

/* Skeleton */
.grid-loading {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px;
}
.grid-skeleton {
  aspect-ratio: 9/16; border-radius: 8px;
  background: rgba(255,255,255,.06);
  animation: skeleton-pulse 1.4s ease-in-out infinite;
}
.grid-skeleton:nth-child(2) { animation-delay: .15s; }
.grid-skeleton:nth-child(3) { animation-delay: .3s; }
.grid-skeleton:nth-child(4) { animation-delay: .1s; }
.grid-skeleton:nth-child(5) { animation-delay: .25s; }
.grid-skeleton:nth-child(6) { animation-delay: .4s; }
@keyframes skeleton-pulse {
  0%, 100% { opacity: .4; }
  50%       { opacity: .9; }
}

.grid-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; padding: 48px 0;
}
.grid-empty p { font-size: 13px; color: rgba(255,255,255,.25); margin: 0; }

/* ── BOTÃO PERFIL COMPLETO ── */
.btn-ver-perfil {
  margin: 0 16px 16px;
  padding: 11px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.1);
  color: rgba(255,255,255,.7);
  border-radius: 12px;
  font-size: 13px; font-weight: 700;
  font-family: inherit; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  transition: all .2s; flex-shrink: 0;
}
.btn-ver-perfil:hover { background: rgba(255,255,255,.1); }

/* Dot loader */
.dot-loader { display: flex; gap: 3px; align-items: center; }
.dot-loader span { width: 4px; height: 4px; border-radius: 50%; background: currentColor; animation: dot-pulse 1.2s infinite; }
.dot-loader span:nth-child(2) { animation-delay: .2s; }
.dot-loader span:nth-child(3) { animation-delay: .4s; }
@keyframes dot-pulse {
  0%, 80%, 100% { opacity: .3; transform: scale(.8); }
  40%            { opacity: 1; transform: scale(1); }
}

/* ── TRANSITIONS ── */
.overlay-fade-enter-active, .overlay-fade-leave-active { transition: opacity .25s ease; }
.overlay-fade-enter-from,  .overlay-fade-leave-to     { opacity: 0; }

.modal-slide-enter-active { transition: transform .38s cubic-bezier(.32,.72,0,1), opacity .25s ease; }
.modal-slide-leave-active { transition: transform .28s cubic-bezier(.4,0,1,1), opacity .2s ease; }
.modal-slide-enter-from, .modal-slide-leave-to { transform: scale(.9); opacity: 0; }
</style>