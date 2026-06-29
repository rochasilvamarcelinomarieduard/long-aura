<template>
  <!-- ══════════════════════════════════════════
       STORIES ROW
  ══════════════════════════════════════════ -->
  <div class="stories-outer">
    <div class="stories-scroll" ref="scrollEl">

      <!-- MEU STORY -->
      <div class="s-slot" @click="meuGrupo ? abrirViewer(meuGrupo, 0) : (criarOpen = true)">
        <div class="s-ring-wrap" :class="meuGrupo ? (todoVistos(meuGrupo) ? 'ring-visto' : 'ring-ativo') : 'ring-add'">
          <div class="s-ring-inner">
            <img :src="avatarAtual" class="s-av" />
          </div>
          <span class="ring-plus-ic" v-if="!meuGrupo">
            <svg viewBox="0 0 24 24" fill="currentColor" width="9" height="9"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          </span>
        </div>
        <span class="s-nome">{{ meuGrupo ? 'Seu story' : 'Adicionar' }}</span>
        <span v-if="meuGrupo" class="s-tempo">{{ meuGrupo.stories[0]?.hora }}</span>
      </div>

      <!-- STORIES DOS OUTROS -->
      <div
        v-for="(grupo, gi) in outrosGrupos"
        :key="grupo.userId"
        class="s-slot"
        @click="abrirViewer(grupo, gi + 1)"
      >
        <div class="s-ring-wrap" :class="todoVistos(grupo) ? 'ring-visto' : 'ring-ativo'">
          <div class="s-ring-inner">
            <img :src="grupo.avatarUrl || avatarPadrao(grupo.username)" class="s-av" />
          </div>
          <span v-if="grupo.online" class="s-online-pip" />
        </div>
        <span class="s-nome">{{ grupo.username }}</span>
        <span class="s-tempo">{{ grupo.stories[0]?.hora }}</span>
      </div>

      <!-- SKELETON loading -->
      <template v-if="carregando">
        <div v-for="i in 5" :key="'sk'+i" class="s-slot skeleton">
          <div class="sk-av" />
          <div class="sk-txt" />
        </div>
      </template>
    </div>
  </div>

  <!-- ══════════════════════════════════════════
       STORY VIEWER
  ══════════════════════════════════════════ -->
  <Teleport to="body">
    <Transition name="viewer-anim">
      <div v-if="viewerOpen" class="viewer-backdrop" @click.self="fecharViewer">

        <button v-if="viewerGrupoIdx > 0" class="nav-usr nav-usr-l" @click.stop="mudarGrupo(-1)">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/></svg>
        </button>

        <div
          class="viewer-card"
          @touchstart.passive="onTouchStart"
          @touchend.passive="onTouchEnd"
        >
          <!-- PROGRESS BARS -->
          <div class="v-bars">
            <div v-for="(s, i) in grupoAtivo?.stories ?? []" :key="s.id" class="v-bar-track">
              <div
                class="v-bar-fill"
                :style="{
                  width: i < slideIdx ? '100%' : i === slideIdx ? prog + '%' : '0%',
                  transition: i === slideIdx && !pausado && progAtivo
                    ? `width ${s.duracao ?? 5}s linear` : 'none'
                }"
              />
            </div>
          </div>

          <!-- HEADER -->
          <div class="v-header">
            <div class="v-header-l">
              <div class="v-av-ring">
                <img :src="grupoAtivo?.avatarUrl || avatarPadrao(grupoAtivo?.username)" class="v-av-img" />
              </div>
              <div class="v-meta">
                <span class="v-username">{{ grupoAtivo?.username }}</span>
                <span class="v-hora">{{ storyAtivo?.hora }}</span>
              </div>
            </div>
            <div class="v-header-r">
              <button class="v-ctrl-btn" @click.stop="togglePause">
                <svg v-if="pausado" viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M8 5v14l11-7z"/></svg>
                <svg v-else viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              </button>
              <button class="v-ctrl-btn" @click.stop="mutado = !mutado">
                <svg v-if="mutado" viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                <svg v-else viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
              </button>
              <button v-if="euSouDono" class="v-ctrl-btn v-ctrl-danger" @click.stop="deletarStoryAtual">
                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              </button>
              <button class="v-ctrl-btn" @click.stop="fecharViewer">
                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
            </div>
          </div>

          <!-- TAP ZONES -->
          <div class="tap-zone tap-l" @click.stop="anteriorSlide" />
          <div class="tap-zone tap-r" @click.stop="proximoSlide" />

          <!-- SLIDE -->
          <Transition :name="dirSlide > 0 ? 'slide-r' : 'slide-l'" mode="out-in">
            <div :key="storyAtivo?.id" class="v-slide" :style="slideStyle">
              <div class="v-grad-top" />
              <div class="v-grad-bot" />

              <img
                v-if="storyAtivo?.mediaUrl"
                :src="storyAtivo.mediaUrl"
                class="v-media"
                @load="onMediaLoad"
              />

              <div v-if="storyAtivo?.sticker" class="v-sticker">{{ storyAtivo.sticker }}</div>

              <div v-if="storyAtivo?.texto" class="v-caption">
                <span :style="{ color: storyAtivo.textoCor, fontSize: storyAtivo.textoSize + 'px' }">
                  {{ storyAtivo.texto }}
                </span>
              </div>

              <div v-if="storyAtivo?.mencao" class="v-mencao">@{{ storyAtivo.mencao }}</div>

              <div v-if="storyAtivo?.musica" class="v-musica">
                <span class="v-musica-disc">🎵</span>
                <span>{{ storyAtivo.musica }}</span>
              </div>
            </div>
          </Transition>

          <!-- INFO BAR -->
          <div class="v-info-bar">
            <div class="v-views-pill">
              <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
              {{ storyAtivo?.views ?? 0 }}
            </div>
            <div class="v-reacoes">
              <button
                v-for="r in REACOES" :key="r"
                class="v-reacao-btn"
                :class="{ sel: minhaReacao === r }"
                @click.stop="reagir(r)"
              >{{ r }}</button>
            </div>
          </div>

          <!-- FOOTER -->
          <div class="v-footer">
            <div class="v-reply-wrap" :class="{ focus: replyFocused }">
              <input
                v-model="replyTxt"
                class="v-reply-in"
                :placeholder="'Responder a ' + (grupoAtivo?.username ?? '')"
                @focus="replyFocused = true; pararTimer()"
                @blur="replyFocused = false; iniciarTimer()"
                @keydown.enter.prevent="enviarReply"
              />
              <button v-if="replyTxt" class="v-reply-send" @click.stop="enviarReply">
                <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
            <button class="v-action-btn" :class="{ curtido }" @click.stop="toggleCurtir">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </button>
            <button class="v-action-btn" @click.stop="compartilhar">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
            </button>
          </div>
        </div>

        <button
          v-if="viewerGrupoIdx < todosGrupos.length - 1"
          class="nav-usr nav-usr-r"
          @click.stop="mudarGrupo(1)"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
        </button>
      </div>
    </Transition>

    <!-- ══════════════════════════════════════════
         CRIAR STORY — Modal
    ══════════════════════════════════════════ -->
    <Transition name="modal-anim">
      <div v-if="criarOpen" class="criar-backdrop" @click.self="criarOpen = false">
        <div class="criar-modal">

          <div class="criar-hd">
            <button class="criar-close" @click="criarOpen = false">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
            <span class="criar-titulo">Novo story</span>
            <div style="width:34px" />
          </div>

          <div class="criar-preview" :style="previewStyle" @click="!csMidia && $refs.fileIn.click()">
            <div class="prev-grad" />
            <img v-if="csMidia" :src="csMidia" class="prev-img" />
            <div v-if="csTxt" class="prev-caption">
              <span :style="{ color: csTxtCor, fontSize: csTxtSize + 'px' }">{{ csTxt }}</span>
            </div>
            <div v-if="csSticker" class="prev-sticker">{{ csSticker }}</div>
            <div v-if="!csMidia && !csTxt && !csSticker" class="prev-hint">
              <div class="prev-hint-ic">
                <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
              </div>
              <p>Toque para adicionar foto</p>
            </div>
            <div class="prev-timer-bar"><div class="prev-timer-fill" /></div>
          </div>

          <input ref="fileIn" type="file" accept="image/*,video/*" style="display:none" @change="onFileChange" />

          <div class="criar-toolbar">
            <button class="tool-btn" @click="$refs.fileIn.click()" title="Foto/Vídeo">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
            </button>
            <button class="tool-btn" :class="{ on: painelTxt }" @click="painelTxt = !painelTxt; painelStk = false" title="Texto">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M5 4v3h5.5v12h3V7H19V4z"/></svg>
            </button>
            <button class="tool-btn" :class="{ on: painelStk }" @click="painelStk = !painelStk; painelTxt = false" title="Stickers">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
            </button>
            <button v-if="csMidia" class="tool-btn tool-danger" @click="csMidia = null; csArquivo = null" title="Remover">
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
            <div class="fundo-paleta">
              <button
                v-for="f in FUNDOS" :key="f.nome"
                class="fundo-btn"
                :class="{ sel: csFundo === f.cor }"
                :style="{ background: f.cor }"
                @click="csFundo = f.cor"
              />
            </div>
          </div>

          <Transition name="painel-anim">
            <div v-if="painelTxt" class="painel-txt">
              <input v-model="csTxt" class="txt-campo" placeholder="Escreva algo..." maxlength="120" autofocus />
              <div class="txt-controles">
                <div class="cor-grade">
                  <button
                    v-for="c in TXT_CORES" :key="c"
                    class="cor-circulo"
                    :class="{ sel: csTxtCor === c }"
                    :style="{ background: c }"
                    @click="csTxtCor = c"
                  />
                </div>
                <div class="size-grade">
                  <button
                    v-for="s in [16, 22, 32]" :key="s"
                    class="size-opcao"
                    :class="{ sel: csTxtSize === s }"
                    :style="{ fontSize: s * 0.5 + 'px' }"
                    @click="csTxtSize = s"
                  >A</button>
                </div>
              </div>
            </div>
          </Transition>

          <Transition name="painel-anim">
            <div v-if="painelStk" class="painel-stk">
              <button
                v-for="s in STICKERS" :key="s"
                class="stk-item"
                :class="{ sel: csSticker === s }"
                @click="csSticker = s === csSticker ? null : s; painelStk = false"
              >{{ s }}</button>
            </div>
          </Transition>

          <button
            class="pub-btn"
            :class="{ loading: publicando }"
            :disabled="publicando || (!csMidia && !csTxt && !csSticker)"
            @click="publicar"
          >
            <span v-if="!publicando">
              <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" style="vertical-align:middle;margin-right:6px"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              Publicar
            </span>
            <span v-else class="pub-spinner" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { authState } from '../auth.js'
import {
  fetchStoriesAtivos,
  fetchStoriesVistos,
  publicarStory,
  deletarStory,
  registrarView,
  reagirStory,
  removerReacao,
  responderStory,
  fetchMinhasReacoes,
  subscribeToStories,
} from '../stories.js'

const emit = defineEmits(['toast'])

// ── CONSTANTES ──────────────────────────────────────────
const REACOES  = ['❤️', '🔥', '😂', '😮', '👏', '🫶']
const STICKERS = ['🔥','✨','❤️','😂','😍','💀','🎉','🙌','💯','🚀','🎵','💻','🌊','🌸','🎨','⚡','🥳','😎','🤯','🫶','🎬','📸','🌅','🍕','👀']
const TXT_CORES = ['#ffffff','#ff2d6b','#ff8c00','#ffee00','#00e676','#40c4ff','#1a1a1a']
const FUNDOS = [
  { nome: 'Dark',    cor: 'linear-gradient(160deg,#0d0d0d 0%,#1a1a1a 100%)' },
  { nome: 'Rosa',    cor: 'linear-gradient(160deg,#2d0016 0%,#5c0035 100%)' },
  { nome: 'Laranja', cor: 'linear-gradient(160deg,#2d1000 0%,#6b3000 100%)' },
  { nome: 'Azul',    cor: 'linear-gradient(160deg,#001030 0%,#002860 100%)' },
  { nome: 'Verde',   cor: 'linear-gradient(160deg,#001510 0%,#002a1a 100%)' },
  { nome: 'Roxo',    cor: 'linear-gradient(160deg,#140025 0%,#300055 100%)' },
  { nome: 'Preto',   cor: '#080808' },
]

// ── ESTADO ──────────────────────────────────────────────
const carregando  = ref(true)
const grupos      = ref([])
const storiesVist = ref(new Set())
let   storyRtSub  = null

const avatarAtual = computed(() =>
  authState.profile?.avatar_url || avatarPadrao(authState.user?.email || '?')
)
const meuId = computed(() => authState.user?.id)
const meuGrupo = computed(() => grupos.value.find(g => g.userId === meuId.value) ?? null)
const outrosGrupos = computed(() => grupos.value.filter(g => g.userId !== meuId.value))
const todosGrupos = computed(() => meuGrupo.value ? [meuGrupo.value, ...outrosGrupos.value] : outrosGrupos.value)

function todoVistos(grupo) {
  return grupo.stories.every(s => storiesVist.value.has(s.id))
}

// ── VIEWER ──────────────────────────────────────────────
const viewerOpen     = ref(false)
const viewerGrupoIdx = ref(0)
const slideIdx       = ref(0)
const prog           = ref(0)
const progAtivo      = ref(false)
const pausado        = ref(false)
const dirSlide       = ref(1)
const mutado         = ref(false)
const replyTxt       = ref('')
const replyFocused   = ref(false)
const curtido        = ref(false)
const minhaReacao    = ref(null)

let timerSlide = null
let touchStartX = 0

const grupoAtivo = computed(() => todosGrupos.value[viewerGrupoIdx.value] ?? null)
const storyAtivo = computed(() => grupoAtivo.value?.stories[slideIdx.value] ?? null)
const euSouDono  = computed(() => storyAtivo.value?.userId === meuId.value)

const slideStyle = computed(() => {
  if (!storyAtivo.value) return {}
  if (storyAtivo.value.mediaUrl) return {}
  return { background: storyAtivo.value.corFundo }
})

async function abrirViewer(grupo, idx) {
  viewerGrupoIdx.value = idx
  slideIdx.value = 0
  dirSlide.value = 1
  prog.value     = 0
  curtido.value  = false
  replyTxt.value = ''
  minhaReacao.value = null
  viewerOpen.value = true
  await nextTick()
  iniciarTimer()
  await carregarReacao()
}

function fecharViewer() {
  pararTimer()
  viewerOpen.value = false
}

function iniciarTimer() {
  pararTimer()
  prog.value    = 0
  progAtivo.value = false
  requestAnimationFrame(() => {
    progAtivo.value = true
    prog.value = 100
  })
  const dur = (storyAtivo.value?.duracao ?? 5) * 1000
  timerSlide = setTimeout(proximoSlide, dur)
}

function pararTimer() {
  clearTimeout(timerSlide)
  progAtivo.value = false
}

function togglePause() {
  pausado.value = !pausado.value
  if (pausado.value) pararTimer()
  else iniciarTimer()
}

async function proximoSlide() {
  const slides = grupoAtivo.value?.stories ?? []
  if (slideIdx.value < slides.length - 1) {
    dirSlide.value = 1
    slideIdx.value++
    iniciarTimer()
    await registrarViewAtual()
    await carregarReacao()
  } else if (viewerGrupoIdx.value < todosGrupos.value.length - 1) {
    mudarGrupo(1)
  } else {
    fecharViewer()
  }
}

function anteriorSlide() {
  if (prog.value > 15) { iniciarTimer(); return }
  if (slideIdx.value > 0) {
    dirSlide.value = -1
    slideIdx.value--
    iniciarTimer()
    carregarReacao()
  } else if (viewerGrupoIdx.value > 0) {
    mudarGrupo(-1)
  }
}

function mudarGrupo(delta) {
  const ni = viewerGrupoIdx.value + delta
  if (ni < 0 || ni >= todosGrupos.value.length) return
  viewerGrupoIdx.value = ni
  slideIdx.value       = 0
  dirSlide.value       = delta
  minhaReacao.value    = null
  curtido.value        = false
  iniciarTimer()
  registrarViewAtual()
  carregarReacao()
}

function onTouchStart(e) { touchStartX = e.touches[0].clientX }
function onTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - touchStartX
  if (dx > 60) anteriorSlide()
  else if (dx < -60) proximoSlide()
}

async function reagir(emoji) {
  if (!storyAtivo.value) return
  if (minhaReacao.value === emoji) {
    minhaReacao.value = null
    await removerReacao(storyAtivo.value.id).catch(console.warn)
  } else {
    minhaReacao.value = emoji
    await reagirStory(storyAtivo.value.id, emoji).catch(console.warn)
    emit('toast', emoji)
  }
}

async function toggleCurtir() {
  curtido.value = !curtido.value
  if (curtido.value) {
    await reagirStory(storyAtivo.value?.id, '❤️').catch(console.warn)
    emit('toast', '❤️')
  } else {
    await removerReacao(storyAtivo.value?.id).catch(console.warn)
  }
}

function compartilhar() { emit('toast', 'Compartilhado!') }

async function carregarReacao() {
  if (!storyAtivo.value || !meuId.value) return
  try {
    const mapa = await fetchMinhasReacoes([storyAtivo.value.id])
    minhaReacao.value = mapa[storyAtivo.value.id] ?? null
    curtido.value     = minhaReacao.value === '❤️'
  } catch {}
}

async function registrarViewAtual() {
  if (!storyAtivo.value || !meuId.value) return
  if (storyAtivo.value.userId === meuId.value) return
  storiesVist.value.add(storyAtivo.value.id)
  await registrarView(storyAtivo.value.id).catch(console.warn)
}

async function enviarReply() {
  const t = replyTxt.value.trim()
  if (!t || !storyAtivo.value) return
  replyTxt.value = ''
  try {
    await responderStory(storyAtivo.value.id, t)
    emit('toast', 'Resposta enviada!')
  } catch {
    emit('toast', 'Erro ao enviar resposta')
  }
  iniciarTimer()
}

async function deletarStoryAtual() {
  if (!storyAtivo.value || !euSouDono.value) return
  pararTimer()
  try {
    await deletarStory(storyAtivo.value.id, storyAtivo.value.mediaUrl)
    const grupo = grupoAtivo.value
    grupo.stories.splice(slideIdx.value, 1)
    if (grupo.stories.length === 0) {
      grupos.value = grupos.value.filter(g => g.userId !== grupo.userId)
      fecharViewer()
    } else {
      slideIdx.value = Math.min(slideIdx.value, grupo.stories.length - 1)
      iniciarTimer()
    }
    emit('toast', 'Story deletado')
  } catch {
    emit('toast', 'Erro ao deletar')
    iniciarTimer()
  }
}

function onMediaLoad() {}

// ── CRIAR ───────────────────────────────────────────────
const criarOpen  = ref(false)
const csMidia    = ref(null)
const csArquivo  = ref(null)
const csTxt      = ref('')
const csTxtCor   = ref('#ffffff')
const csTxtSize  = ref(22)
const csSticker  = ref(null)
const csFundo    = ref(FUNDOS[0].cor)
const painelTxt  = ref(false)
const painelStk  = ref(false)
const publicando = ref(false)

const previewStyle = computed(() => csMidia.value ? {} : { background: csFundo.value })

function onFileChange(e) {
  const f = e.target.files[0]
  if (!f) return
  csArquivo.value = f
  const r = new FileReader()
  r.onload = ev => { csMidia.value = ev.target.result }
  r.readAsDataURL(f)
  e.target.value = ''
}

async function publicar() {
  if (publicando.value) return
  publicando.value = true
  try {
    const novoStory = await publicarStory({
      arquivo: csArquivo.value,
      texto: csTxt.value || null,
      textoCor: csTxtCor.value,
      textoSize: csTxtSize.value,
      sticker: csSticker.value,
      corFundo: csFundo.value,
    })
    const grupoExistente = grupos.value.find(g => g.userId === meuId.value)
    if (grupoExistente) {
      grupoExistente.stories.unshift(novoStory)
    } else {
      grupos.value.unshift({
        userId: meuId.value,
        username: authState.profile?.username ?? 'você',
        nomeUsuario: authState.profile?.nome ?? 'Você',
        avatarUrl: authState.profile?.avatar_url ?? null,
        stories: [novoStory],
      })
    }
    criarOpen.value = false
    csMidia.value = null; csArquivo.value = null
    csTxt.value = ''; csSticker.value = null
    csFundo.value = FUNDOS[0].cor
    painelTxt.value = false; painelStk.value = false
    emit('toast', 'Story publicado! ✨')
  } catch (err) {
    console.error(err)
    emit('toast', 'Erro ao publicar story')
  } finally {
    publicando.value = false
  }
}

// ── DADOS ───────────────────────────────────────────────
async function carregar() {
  carregando.value = true
  try {
    const [dadosGrupos, vistos] = await Promise.all([
      fetchStoriesAtivos(),
      meuId.value ? fetchStoriesVistos(meuId.value) : Promise.resolve(new Set()),
    ])
    grupos.value      = dadosGrupos
    storiesVist.value = vistos
  } catch (err) {
    console.warn('fetchStoriesAtivos:', err)
  } finally {
    carregando.value = false
  }
}

function configurarRealtime() {
  storyRtSub = subscribeToStories(
    (novoStory) => {
      const grupo = grupos.value.find(g => g.userId === novoStory.userId)
      if (grupo) {
        if (!grupo.stories.find(s => s.id === novoStory.id)) grupo.stories.unshift(novoStory)
      } else {
        grupos.value.unshift({
          userId: novoStory.userId,
          username: novoStory.username,
          nomeUsuario: novoStory.nomeUsuario,
          avatarUrl: novoStory.avatarUrl,
          stories: [novoStory],
        })
      }
    },
    (storyId) => {
      for (const grupo of grupos.value) {
        const idx = grupo.stories.findIndex(s => s.id === storyId)
        if (idx !== -1) {
          grupo.stories.splice(idx, 1)
          if (grupo.stories.length === 0) grupos.value = grupos.value.filter(g => g !== grupo)
          break
        }
      }
    }
  )
}

onMounted(async () => {
  await carregar()
  configurarRealtime()
})

onUnmounted(() => {
  pararTimer()
  storyRtSub?.unsubscribe()
})

function avatarPadrao(username = '?') {
  const initials = (username || '?').slice(0, 2).toUpperCase()
  const cores    = ['#1a1a2e','#16213e','#0f3460','#1b1b2f','#192a51','#2c003e']
  const cor      = cores[(username.charCodeAt(0) || 0) % cores.length]
  return `data:image/svg+xml;base64,${btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150">
      <rect width="150" height="150" fill="${cor}"/>
      <text x="75" y="75" font-family="system-ui" font-size="54" font-weight="700"
        fill="#ffffff" text-anchor="middle" dominant-baseline="central">${initials}</text>
    </svg>`
  )}`
}
</script>

<style scoped>
/* ══════════════════════════════════════════════════════
   TOKENS
══════════════════════════════════════════════════════ */
:root {
  --c-bg:        #0a0a0a;
  --c-surface:   #111111;
  --c-border:    rgba(255,255,255,.07);
  --c-text:      #f5f5f5;
  --c-muted:     rgba(255,255,255,.38);
  --c-accent1:   #e1306c;  /* Instagram magenta */
  --c-accent2:   #f77737;  /* Instagram orange  */
  --c-accent3:   #405de6;  /* Instagram blue    */
  --ring-active: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
  --ring-seen:   rgba(255,255,255,.12);
  --radius-card: 18px;
  --font-main:   'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* ══════════════════════════════════════════════════════
   STORIES ROW
══════════════════════════════════════════════════════ */
.stories-outer {
  background: var(--c-bg);
  border-bottom: 1px solid var(--c-border);
  flex-shrink: 0;
}

.stories-scroll {
  display: flex;
  gap: 16px;
  padding: 12px 16px 14px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.stories-scroll::-webkit-scrollbar { display: none; }

/* Slot */
.s-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
  transition: transform .2s cubic-bezier(.34, 1.56, .64, 1);
}
.s-slot:hover  { transform: translateY(-2px); }
.s-slot:active { transform: scale(.94); }

/* Ring wrapper */
.s-ring-wrap {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  padding: 2px;
  position: relative;
  transition: box-shadow .25s ease;
}

.ring-ativo {
  background: var(--ring-active);
}
.ring-ativo:hover {
  box-shadow: 0 0 0 3px rgba(225,48,108,.25), 0 4px 18px rgba(225,48,108,.25);
}

.ring-visto {
  background: var(--ring-seen);
}

.ring-add {
  background: none;
  border: 2px dashed rgba(255,255,255,.2);
  padding: 1.5px;
}

/* Inner circle (white gap) */
.s-ring-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  padding: 2.5px;
  background: var(--c-bg);
}

.s-av {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.ring-plus-ic {
  position: absolute;
  bottom: -1px; right: -1px;
  width: 19px; height: 19px;
  background: var(--c-accent1);
  border-radius: 50%;
  border: 2.5px solid var(--c-bg);
  display: flex; align-items: center; justify-content: center;
  fill: #fff;
  box-shadow: 0 2px 8px rgba(225,48,108,.5);
}

.s-online-pip {
  position: absolute;
  bottom: 2px; right: 2px;
  width: 11px; height: 11px;
  background: #4cd964;
  border-radius: 50%;
  border: 2.5px solid var(--c-bg);
  box-shadow: 0 0 0 1px rgba(76,217,100,.3);
}

.s-nome {
  font-family: var(--font-main);
  font-size: 10.5px;
  font-weight: 500;
  color: var(--c-muted);
  white-space: nowrap;
  max-width: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: .01em;
}
.s-tempo {
  font-size: 9px;
  color: rgba(255,255,255,.18);
  font-weight: 400;
  white-space: nowrap;
}

/* Skeleton */
.skeleton .sk-av {
  width: 56px; height: 56px;
  border-radius: 50%;
  background: linear-gradient(90deg, #1a1a1a 25%, #242424 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.skeleton .sk-txt {
  width: 46px; height: 8px;
  border-radius: 4px;
  background: linear-gradient(90deg, #1a1a1a 25%, #242424 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite .08s;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ══════════════════════════════════════════════════════
   VIEWER BACKDROP
══════════════════════════════════════════════════════ */
.viewer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: rgba(0,0,0,.95);
  backdrop-filter: blur(2px);
}

/* ── CARD ── */
.viewer-card {
  width: min(400px, 98vw);
  height: min(720px, 96svh);
  border-radius: 22px;
  overflow: hidden;
  background: #0d0d0d;
  box-shadow:
    0 32px 80px rgba(0,0,0,.9),
    0 0 0 .5px rgba(255,255,255,.08);
  display: flex;
  flex-direction: column;
  position: relative;
  user-select: none;
}

/* ── PROGRESS BARS ── */
.v-bars {
  position: absolute;
  top: 12px; left: 10px; right: 10px;
  display: flex;
  gap: 3px;
  z-index: 20;
}
.v-bar-track {
  flex: 1;
  height: 2.5px;
  background: rgba(255,255,255,.22);
  border-radius: 2px;
  overflow: hidden;
}
.v-bar-fill {
  height: 100%;
  background: rgba(255,255,255,.95);
  border-radius: 2px;
}

/* ── HEADER ── */
.v-header {
  position: absolute;
  top: 24px; left: 0; right: 0;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 20;
  background: linear-gradient(to bottom, rgba(0,0,0,.5) 0%, transparent 100%);
}
.v-header-l { display: flex; align-items: center; gap: 10px; }
.v-header-r { display: flex; align-items: center; gap: 4px; }

.v-av-ring {
  width: 38px; height: 38px;
  border-radius: 50%;
  padding: 1.5px;
  background: var(--ring-active);
  flex-shrink: 0;
}
.v-av-img {
  width: 100%; height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #000;
  display: block;
}
.v-meta { display: flex; flex-direction: column; }
.v-username {
  font-family: var(--font-main);
  font-size: 13.5px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 6px rgba(0,0,0,.5);
  line-height: 1.2;
  letter-spacing: -.01em;
}
.v-hora {
  font-size: 10px;
  color: rgba(255,255,255,.5);
  font-weight: 400;
}

.v-ctrl-btn {
  background: rgba(255,255,255,.1);
  border: none;
  color: rgba(255,255,255,.9);
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(12px);
  fill: currentColor;
  transition: background .15s, transform .1s;
}
.v-ctrl-btn:hover  { background: rgba(255,255,255,.2); }
.v-ctrl-btn:active { transform: scale(.88); }
.v-ctrl-danger:hover { background: rgba(225,48,108,.25); color: var(--c-accent1); }

/* ── TAP ZONES ── */
.tap-zone {
  position: absolute;
  top: 0; bottom: 0;
  width: 38%;
  z-index: 10;
  cursor: pointer;
}
.tap-l { left: 0; }
.tap-r { right: 0; }

/* ── SLIDE ── */
.v-slide {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  overflow: hidden;
}
.v-grad-top {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 180px;
  background: linear-gradient(to bottom, rgba(0,0,0,.65) 0%, transparent 100%);
  pointer-events: none;
  z-index: 2;
}
.v-grad-bot {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 240px;
  background: linear-gradient(to top, rgba(0,0,0,.75) 0%, transparent 100%);
  pointer-events: none;
  z-index: 2;
}
.v-media {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  z-index: 1;
}
.v-sticker {
  position: absolute;
  top: 32%; left: 50%;
  transform: translateX(-50%);
  font-size: 58px;
  z-index: 5;
  filter: drop-shadow(0 4px 16px rgba(0,0,0,.4));
  pointer-events: none;
  animation: stkPop .32s cubic-bezier(.34, 1.56, .64, 1) both;
}
@keyframes stkPop {
  from { transform: translateX(-50%) scale(0) rotate(-12deg); opacity: 0; }
  to   { transform: translateX(-50%) scale(1) rotate(0); opacity: 1; }
}
.v-caption {
  position: absolute;
  bottom: 27%; left: 0; right: 0;
  display: flex; justify-content: center;
  padding: 0 22px;
  z-index: 5;
  pointer-events: none;
}
.v-caption span {
  background: rgba(0,0,0,.45);
  backdrop-filter: blur(6px);
  padding: 9px 18px;
  border-radius: 14px;
  font-family: var(--font-main);
  font-weight: 700;
  text-align: center;
  text-shadow: 0 1px 8px rgba(0,0,0,.5);
  white-space: pre-line;
  word-break: break-word;
  line-height: 1.35;
}
.v-mencao {
  position: absolute;
  bottom: 44%; left: 50%;
  transform: translateX(-50%);
  background: rgba(255,255,255,.16);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,.28);
  color: #fff;
  font-family: var(--font-main);
  font-size: 13px; font-weight: 700;
  padding: 5px 16px;
  border-radius: 24px;
  z-index: 5;
  white-space: nowrap;
  pointer-events: none;
}
.v-musica {
  position: absolute;
  top: 70px; right: 14px;
  display: flex; align-items: center; gap: 7px;
  background: rgba(0,0,0,.55);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 24px;
  padding: 5px 14px 5px 10px;
  z-index: 8;
  font-family: var(--font-main);
  font-size: 11px; font-weight: 600;
  color: rgba(255,255,255,.9);
  max-width: 155px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.v-musica-disc { animation: spinDisc 3s linear infinite; }
@keyframes spinDisc { to { transform: rotate(360deg); } }

/* ── INFO BAR ── */
.v-info-bar {
  position: absolute;
  bottom: 110px; left: 0; right: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 14px;
  z-index: 15;
}
.v-views-pill {
  display: flex; align-items: center; gap: 5px;
  background: rgba(0,0,0,.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 24px;
  padding: 5px 11px;
  font-family: var(--font-main);
  font-size: 12px; font-weight: 600;
  color: rgba(255,255,255,.8);
  fill: rgba(255,255,255,.65);
}
.v-reacoes { display: flex; gap: 6px; }
.v-reacao-btn {
  background: rgba(0,0,0,.5);
  backdrop-filter: blur(10px);
  border: 1.5px solid rgba(255,255,255,.1);
  border-radius: 50%;
  width: 38px; height: 38px;
  font-size: 19px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .22s cubic-bezier(.34, 1.56, .64, 1);
  line-height: 1;
}
.v-reacao-btn:hover { transform: scale(1.28); border-color: rgba(255,255,255,.28); }
.v-reacao-btn.sel {
  border-color: rgba(255,255,255,.55);
  background: rgba(255,255,255,.18);
  transform: scale(1.28);
}

/* ── FOOTER ── */
.v-footer {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  display: flex; align-items: center; gap: 9px;
  padding: 13px 13px 22px;
  background: linear-gradient(to top, rgba(0,0,0,.75) 0%, transparent 100%);
  z-index: 15;
}
.v-reply-wrap {
  flex: 1;
  background: rgba(255,255,255,.1);
  border: 1.5px solid rgba(255,255,255,.15);
  border-radius: 28px;
  display: flex; align-items: center;
  transition: border-color .2s, background .2s;
  overflow: hidden;
}
.v-reply-wrap.focus {
  border-color: rgba(255,255,255,.45);
  background: rgba(255,255,255,.15);
}
.v-reply-in {
  flex: 1;
  background: none;
  border: none; outline: none;
  padding: 11px 15px;
  color: #fff;
  font-family: var(--font-main);
  font-size: 13px; font-weight: 400;
}
.v-reply-in::placeholder { color: rgba(255,255,255,.42); }
.v-reply-send {
  background: none; border: none;
  color: var(--c-accent2);
  cursor: pointer;
  padding: 11px 13px;
  display: flex; fill: currentColor;
  transition: transform .15s, opacity .15s;
}
.v-reply-send:hover { transform: scale(1.15); opacity: .8; }

.v-action-btn {
  background: rgba(255,255,255,.1);
  backdrop-filter: blur(10px);
  border: 1.5px solid rgba(255,255,255,.12);
  border-radius: 50%;
  width: 42px; height: 42px;
  color: rgba(255,255,255,.9);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  fill: currentColor;
  transition: all .2s cubic-bezier(.34, 1.4, .64, 1);
  flex-shrink: 0;
}
.v-action-btn:hover  { background: rgba(255,255,255,.2); transform: scale(1.1); }
.v-action-btn.curtido {
  color: var(--c-accent1);
  fill: var(--c-accent1);
  border-color: rgba(225,48,108,.35);
  background: rgba(225,48,108,.12);
}

/* ── NAV USUÁRIOS ── */
.nav-usr {
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.14);
  color: rgba(255,255,255,.8);
  width: 44px; height: 44px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(12px);
  fill: currentColor;
  transition: all .2s;
  flex-shrink: 0;
}
.nav-usr:hover { background: rgba(255,255,255,.18); transform: scale(1.08); }
.nav-usr-l { margin-right: -6px; }
.nav-usr-r { margin-left:  -6px; }

/* ══════════════════════════════════════════════════════
   CRIAR MODAL
══════════════════════════════════════════════════════ */
.criar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(0,0,0,.92);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
}
.criar-modal {
  width: min(400px, 96vw);
  max-height: 97svh;
  background: #0f0f0f;
  border: .5px solid rgba(255,255,255,.1);
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 32px 80px rgba(0,0,0,.85);
}
.criar-hd {
  display: flex; align-items: center; justify-content: space-between;
  padding: 15px 16px;
  border-bottom: .5px solid rgba(255,255,255,.07);
  flex-shrink: 0;
}
.criar-close {
  background: rgba(255,255,255,.06);
  border: .5px solid rgba(255,255,255,.1);
  color: rgba(255,255,255,.55);
  width: 34px; height: 34px;
  border-radius: 10px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  fill: currentColor;
  transition: all .15s;
}
.criar-close:hover { background: rgba(225,48,108,.1); color: var(--c-accent1); border-color: rgba(225,48,108,.3); }
.criar-titulo {
  font-family: var(--font-main);
  font-size: 15px; font-weight: 700;
  color: #fff;
  letter-spacing: -.01em;
}

/* Preview */
.criar-preview {
  width: 100%;
  aspect-ratio: 9/16;
  max-height: 320px;
  position: relative;
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}
.prev-grad {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,.08) 0%, transparent 40%, rgba(0,0,0,.35) 100%);
  pointer-events: none;
  z-index: 2;
}
.prev-img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  z-index: 1;
}
.prev-caption {
  position: absolute;
  bottom: 28%; left: 0; right: 0;
  display: flex; justify-content: center;
  padding: 0 20px;
  z-index: 5; pointer-events: none;
}
.prev-caption span {
  background: rgba(0,0,0,.42);
  padding: 8px 15px;
  border-radius: 12px;
  font-family: var(--font-main);
  font-weight: 700;
  text-align: center;
  word-break: break-word;
}
.prev-sticker {
  position: absolute;
  top: 30%; left: 50%;
  transform: translateX(-50%);
  font-size: 52px;
  z-index: 5; pointer-events: none;
  animation: stkPop .3s ease both;
}
.prev-hint {
  display: flex; flex-direction: column;
  align-items: center; gap: 12px;
  color: rgba(255,255,255,.28);
  font-family: var(--font-main);
  font-size: 12px; font-weight: 500;
  z-index: 3; position: relative;
}
.prev-hint-ic {
  width: 64px; height: 64px;
  border-radius: 50%;
  border: 2px dashed rgba(255,255,255,.14);
  display: flex; align-items: center; justify-content: center;
  fill: rgba(255,255,255,.18);
}
.prev-timer-bar {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 2.5px;
  background: rgba(255,255,255,.1);
  z-index: 6;
}
.prev-timer-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--c-accent1), var(--c-accent2));
  width: 0;
  animation: timerBar 5s linear forwards;
}
@keyframes timerBar { to { width: 100%; } }

/* Toolbar */
.criar-toolbar {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 13px;
  border-bottom: .5px solid rgba(255,255,255,.07);
  flex-shrink: 0; flex-wrap: wrap;
}
.tool-btn {
  background: rgba(255,255,255,.06);
  border: .5px solid rgba(255,255,255,.1);
  color: rgba(255,255,255,.5);
  width: 34px; height: 34px;
  border-radius: 10px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  fill: currentColor;
  transition: all .15s;
  flex-shrink: 0;
}
.tool-btn:hover, .tool-btn.on {
  background: rgba(247,119,55,.1);
  color: var(--c-accent2);
  border-color: rgba(247,119,55,.35);
}
.tool-danger:hover {
  background: rgba(225,48,108,.1);
  color: var(--c-accent1);
  border-color: rgba(225,48,108,.35);
}
.fundo-paleta {
  display: flex; gap: 7px;
  margin-left: auto;
  overflow-x: auto;
  scrollbar-width: none;
}
.fundo-paleta::-webkit-scrollbar { display: none; }
.fundo-btn {
  width: 22px; height: 22px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  flex-shrink: 0;
  transition: all .18s;
}
.fundo-btn.sel {
  border-color: rgba(255,255,255,.85);
  transform: scale(1.22);
  box-shadow: 0 0 0 2px rgba(255,255,255,.15);
}

/* Painel Texto */
.painel-txt {
  padding: 11px 14px;
  background: #0a0a0a;
  border-bottom: .5px solid rgba(255,255,255,.07);
  flex-shrink: 0;
}
.txt-campo {
  width: 100%; box-sizing: border-box;
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 10px;
  padding: 10px 13px;
  color: #f5f5f5;
  font-family: var(--font-main);
  font-size: 14px; font-weight: 500;
  outline: none;
  margin-bottom: 10px;
  transition: border-color .2s;
}
.txt-campo:focus { border-color: rgba(225,48,108,.6); }
.txt-campo::placeholder { color: rgba(255,255,255,.2); font-weight: 400; }

.txt-controles { display: flex; justify-content: space-between; align-items: center; }
.cor-grade { display: flex; gap: 7px; flex-wrap: wrap; }
.cor-circulo {
  width: 22px; height: 22px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  flex-shrink: 0;
  transition: all .15s;
}
.cor-circulo.sel { border-color: rgba(255,255,255,.9); transform: scale(1.2); box-shadow: 0 0 0 2px rgba(255,255,255,.2); }
.size-grade { display: flex; gap: 4px; align-items: flex-end; }
.size-opcao {
  background: rgba(255,255,255,.05);
  border: .5px solid rgba(255,255,255,.1);
  color: rgba(255,255,255,.4);
  font-family: var(--font-main);
  font-weight: 800;
  width: 30px; height: 30px;
  border-radius: 8px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .15s;
}
.size-opcao.sel {
  background: rgba(225,48,108,.12);
  border-color: rgba(225,48,108,.5);
  color: var(--c-accent1);
}

/* Painel Stickers */
.painel-stk {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 2px;
  padding: 9px 13px;
  background: #0a0a0a;
  border-bottom: .5px solid rgba(255,255,255,.07);
  flex-shrink: 0;
}
.stk-item {
  background: none; border: 1px solid transparent;
  font-size: 20px;
  border-radius: 7px;
  cursor: pointer;
  padding: 4px;
  transition: all .15s;
  line-height: 1;
  display: flex; align-items: center; justify-content: center;
}
.stk-item:hover { background: rgba(255,255,255,.06); transform: scale(1.18); }
.stk-item.sel   { background: rgba(225,48,108,.12); border-color: rgba(225,48,108,.35); }

/* Publicar */
.pub-btn {
  margin: 12px 14px 14px;
  background: linear-gradient(135deg, var(--c-accent1) 0%, #c13584 40%, var(--c-accent3) 100%);
  border: none;
  color: #fff;
  font-family: var(--font-main);
  font-size: 14px; font-weight: 700;
  padding: 14px 0;
  border-radius: 14px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .22s cubic-bezier(.34, 1.4, .64, 1);
  box-shadow: 0 6px 24px rgba(225,48,108,.35);
  fill: currentColor;
  flex-shrink: 0;
  letter-spacing: .01em;
}
.pub-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(225,48,108,.45);
}
.pub-btn:active:not(:disabled) { transform: scale(.97); }
.pub-btn:disabled { opacity: .38; cursor: not-allowed; }
.pub-btn.loading  { pointer-events: none; }

.pub-spinner {
  width: 18px; height: 18px;
  border: 2.5px solid rgba(255,255,255,.28);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .65s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ══════════════════════════════════════════════════════
   TRANSITIONS
══════════════════════════════════════════════════════ */
.viewer-anim-enter-active { transition: all .3s cubic-bezier(.34, 1.1, .64, 1); }
.viewer-anim-leave-active { transition: all .22s ease; }
.viewer-anim-enter-from,
.viewer-anim-leave-to     { opacity: 0; }
.viewer-anim-enter-from .viewer-card { transform: scale(.88); }
.viewer-anim-leave-to  .viewer-card  { transform: scale(.96); }

.modal-anim-enter-active { transition: all .3s cubic-bezier(.34, 1.1, .64, 1); }
.modal-anim-leave-active { transition: all .2s ease; }
.modal-anim-enter-from,
.modal-anim-leave-to     { opacity: 0; }
.modal-anim-enter-from .criar-modal { transform: translateY(28px) scale(.96); }
.modal-anim-leave-to  .criar-modal  { transform: translateY(18px) scale(.98); }

.painel-anim-enter-active { transition: all .2s cubic-bezier(.34, 1.4, .64, 1); }
.painel-anim-leave-active { transition: all .14s ease; }
.painel-anim-enter-from,
.painel-anim-leave-to     { opacity: 0; transform: translateY(-6px) scale(.97); }

.slide-r-enter-active,
.slide-r-leave-active,
.slide-l-enter-active,
.slide-l-leave-active {
  transition: all .24s cubic-bezier(.4, 0, .2, 1);
  position: absolute; inset: 0;
}
.slide-r-enter-from { transform: translateX(100%); opacity: .6; }
.slide-r-leave-to   { transform: translateX(-100%); opacity: .6; }
.slide-l-enter-from { transform: translateX(-100%); opacity: .6; }
.slide-l-leave-to   { transform: translateX(100%); opacity: .6; }

/* ══════════════════════════════════════════════════════
   MOBILE
══════════════════════════════════════════════════════ */
@media (max-width: 480px) {
  .viewer-card {
    width: 100vw;
    height: 100svh;
    border-radius: 0;
  }
  .viewer-backdrop { gap: 0; }
  .nav-usr { display: none; }
  .v-bars  { top: 8px; left: 8px; right: 8px; }
}
</style>