<template>
  <section class="chat" :class="{ open: modelValue && !!grupo }">
    <template v-if="grupo">

      <!-- ── HEADER ── -->
      <div class="chat-hd">
        <button class="ic-btn back" @click="$emit('fechar')">
          <svg viewBox="0 0 24 24" fill="currentColor" width="19" height="19">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>

        <div class="grupo-av-md" :style="avatarStyle" @click="infoOpen = !infoOpen" style="cursor:pointer">
          {{ grupo.nome.slice(0,2).toUpperCase() }}
          <span v-if="onlineCount > 0" class="hd-online-dot" />
        </div>

        <div class="flex1" @click="infoOpen = !infoOpen" style="cursor:pointer">
          <p class="chat-nome">{{ grupo.nome }}</p>
          <p class="chat-status">
            {{ membros.length }} membros
            <template v-if="onlineCount > 0"> · {{ onlineCount }} online</template>
          </p>
        </div>

        <div class="hd-actions">
          <button class="ic-btn" title="Pesquisar" @click="searchOpen = !searchOpen; searchOpen && $nextTick(() => $refs.searchInput?.focus())">
            <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">
              <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
          <button class="ic-btn" :class="{ on: infoOpen }" @click="infoOpen = !infoOpen" title="Informações">
            <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- ── SEARCH BAR ── -->
      <transition name="slide-down">
        <div v-if="searchOpen" class="search-bar">
          <input ref="searchInput" v-model="searchQuery" class="search-in" placeholder="Buscar mensagens..." />
          <button v-if="searchQuery" class="ic-btn-sm" @click="searchQuery = ''">✕</button>
          <span v-if="searchQuery" class="search-count">{{ searchResults.length }} resultado(s)</span>
        </div>
      </transition>

      <!-- ── PAINEL DE INFO ── -->
      <transition name="slide-down">
        <div v-if="infoOpen" class="info-panel">
          <div class="info-header">
            <div class="grupo-av-lg" :style="avatarStyle">{{ grupo.nome.slice(0,2).toUpperCase() }}</div>
            <div>
              <p class="info-nome">{{ grupo.nome }}</p>
              <p v-if="grupo.descricao" class="info-desc">{{ grupo.descricao }}</p>
              <p class="info-sub">{{ membros.length }} membros · {{ onlineCount }} online</p>
            </div>
          </div>

          <div class="membros-grid">
            <div v-for="m in membros" :key="m.id" class="membro-chip" :title="`@${m.username}`">
              <div class="m-av" :class="{ online: m.online }" :style="{ background: memberColor(m) }">
                {{ (m.username || '?').slice(0,2).toUpperCase() }}
              </div>
              <span class="m-nome">{{ m.username }}</span>
              <span v-if="m.role === 'admin'" class="admin-tag">admin</span>
            </div>
          </div>

          <div class="info-actions">
            <button class="info-action-btn" @click="$emit('mutar')">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
              Silenciar
            </button>
            <button class="info-action-btn" @click="$emit('buscarMidia')">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
              Mídia
            </button>
          </div>

          <button class="sair-btn" @click="confirmarSaida">Sair do grupo</button>
        </div>
      </transition>

      <!-- ── ÁREA DE MENSAGENS ── -->
      <div class="msgs" ref="msgsEl" :style="bgStyle" @click="hideContextMenu">

        <div v-if="filteredMsgs.length === 0 && !searchQuery" class="chat-empty">
          <div class="grupo-av-xl" :style="avatarStyle">{{ grupo.nome.slice(0,2).toUpperCase() }}</div>
          <p class="nome-lg">{{ grupo.nome }}</p>
          <p class="sub">{{ membros.length }} participantes</p>
          <p class="sub">Comece a conversa!</p>
        </div>

        <div v-if="searchQuery && filteredMsgs.length === 0" class="chat-empty">
          <p class="sub">Nenhuma mensagem encontrada para "{{ searchQuery }}"</p>
        </div>

        <template v-for="(m, i) in displayMsgs" :key="m.id || i">
          <div v-if="m.sep" class="sep">{{ m.sep }}</div>

          <div
            v-else
            :id="`msg-${m.id}`"
            class="msg-row"
            :class="{ own: m.own, highlighted: highlightedId === m.id }"
            @contextmenu.prevent="openContextMenu($event, m)"
            @touchstart="onTouchStart($event, m)"
            @touchend="onTouchEnd"
          >
            <!-- Avatar -->
            <img v-if="!m.own && m.showAv" :src="m.autorAvatar" class="av26" />
            <div v-else-if="!m.own" class="av26-spacer" />

            <div class="balao-wrap" :class="{ own: m.own }">
              <span v-if="!m.own && m.showAv" class="balao-autor">{{ m.autorNome }}</span>

              <!-- Reply quote -->
              <div v-if="m.replyTo" class="reply-quote" @click="scrollToMsg(m.replyTo.id)">
                <span class="rq-autor">{{ m.replyTo.autorNome }}</span>
                <span class="rq-txt">{{ m.replyTo.txt }}</span>
              </div>

              <!-- Balão principal -->
              <div
                class="balao"
                :class="{ own: m.own, 'img-msg': m.img, 'voice-msg': m.voice, 'forwarded': m.forwarded }"
              >
                <!-- Encaminhado -->
                <div v-if="m.forwarded" class="fwd-label">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><path d="M12 8V4l8 8-8 8v-4H4V8h8z"/></svg>
                  Encaminhado
                </div>

                <!-- Imagem -->
                <img v-if="m.img" :src="m.txt" class="balao-img" @click="$emit('fullImg', m.txt)" />

                <!-- Áudio/voz -->
                <div v-else-if="m.voice" class="voice-inner">
                  <button class="play-btn" @click="m._playing = !m._playing">
                    <svg v-if="!m._playing" viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M8 5v14l11-7z"/></svg>
                    <svg v-else viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  </button>
                  <div class="wave-bars">
                    <div v-for="n in 18" :key="n" class="wave-bar" :style="{ height: (4 + Math.abs(Math.sin(n * 0.8)) * 14) + 'px', animationDelay: (n * 0.06) + 's', animationPlayState: m._playing ? 'running' : 'paused' }" />
                  </div>
                  <span class="voice-dur">{{ m.voiceDur || '0:07' }}</span>
                </div>

                <!-- Texto normal -->
                <template v-else>
                  <span v-html="highlightSearch(m.txt)" />
                </template>

                <span class="meta">
                  {{ m.hora }}
                  <svg v-if="m.own && m.lida" viewBox="0 0 24 24" fill="#ff8c00" width="10" height="10">
                    <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/>
                  </svg>
                  <svg v-else-if="m.own" viewBox="0 0 24 24" fill="rgba(255,255,255,.3)" width="10" height="10">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </span>
              </div>

              <!-- Reactions pills -->
              <div v-if="m.reactions && Object.keys(m.reactions).length" class="reactions-bar" :class="{ own: m.own }">
                <button
                  v-for="(users, emoji) in m.reactions"
                  :key="emoji"
                  class="react-pill"
                  :class="{ mine: users.includes(meId) }"
                  :title="users.join(', ')"
                  @click="$emit('toggleReaction', { msgId: m.id, emoji })"
                >
                  {{ emoji }} <span v-if="users.length > 1" class="react-count">{{ users.length }}</span>
                </button>
              </div>

              <!-- Visto por (última msg própria) -->
              <div v-if="m.own && m.seenBy && m.seenBy.length && i === displayMsgs.length - 1" class="seen-by">
                <img v-for="u in m.seenBy.slice(0,4)" :key="u.id" :src="avatarPadrao(u.username)" class="seen-av" :title="u.username" />
                <span v-if="m.seenBy.length > 4" class="seen-more">+{{ m.seenBy.length - 4 }}</span>
              </div>
            </div>

            <!-- Quick react toolbar (hover) -->
            <div class="quick-reacts" :class="{ own: m.own }">
              <button v-for="e in quickEmojis" :key="e" class="qr-btn" @click.stop="$emit('toggleReaction', { msgId: m.id, emoji: e })">{{ e }}</button>
              <button class="qr-btn qr-more" @click.stop="openContextMenu($event, m)">⋯</button>
            </div>
          </div>
        </template>

        <!-- Typing -->
        <div v-if="typing" class="msg-row typing-row">
          <img :src="avatarPadrao(typing)" class="av26" />
          <div class="balao typing-balao">
            <span class="dot"/><span class="dot"/><span class="dot"/>
          </div>
        </div>

        <!-- Scroll to bottom btn -->
        <transition name="pop">
          <button v-if="showScrollBtn" class="scroll-btn" @click="scrollToBottom">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6 1.41-1.41z"/></svg>
            <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
          </button>
        </transition>
      </div>

      <!-- ── CONTEXT MENU ── -->
      <teleport to="body">
        <transition name="pop">
          <div
            v-if="ctxMenu.open"
            class="ctx-menu"
            :style="{ top: ctxMenu.y + 'px', left: ctxMenu.x + 'px' }"
            @click.stop
          >
            <button class="ctx-item" @click="doReply">
              <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/></svg>
              Responder
            </button>
            <button class="ctx-item" @click="doReact('❤️')">❤️ Curtir</button>
            <button class="ctx-item" @click="doReact('😂')">😂 Haha</button>
            <button class="ctx-item" @click="doForward">
              <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M12 8V4l8 8-8 8v-4H4V8h8z"/></svg>
              Encaminhar
            </button>
            <button v-if="!ctxMenu.msg?.img" class="ctx-item" @click="doCopy">
              <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
              Copiar
            </button>
            <div class="ctx-sep" />
            <button v-if="ctxMenu.msg?.own" class="ctx-item danger" @click="doDelete">
              <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              Apagar
            </button>
            <button v-else class="ctx-item danger" @click="doReport">
              <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              Reportar
            </button>
          </div>
        </transition>
      </teleport>

      <!-- ── REPLY PREVIEW ── -->
      <transition name="slide-up">
        <div v-if="replyingTo" class="reply-preview">
          <div class="rp-accent" />
          <div class="rp-body">
            <span class="rp-autor">{{ replyingTo.autorNome }}</span>
            <span class="rp-txt">{{ replyingTo.txt || '📷 Imagem' }}</span>
          </div>
          <button class="rp-close" @click="replyingTo = null">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>
      </transition>

      <!-- ── EMOJI PICKER ── -->
      <transition name="pop">
        <div v-if="emojiOpen" class="emoji-pick">
          <div class="emoji-search">
            <input v-model="emojiSearch" class="emoji-search-in" placeholder="Buscar emoji..." />
          </div>
          <div class="emoji-grid">
            <button v-for="e in filteredEmojis" :key="e" class="e-btn" @click="txt += e">{{ e }}</button>
          </div>
        </div>
      </transition>

      <!-- ── INPUT BAR ── -->
      <div class="input-bar">
        <button class="ic-btn inp-ic" :class="{ on: emojiOpen }" @click="emojiOpen = !emojiOpen" title="Emojis">
          <svg viewBox="0 0 24 24" fill="currentColor" width="19" height="19">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
          </svg>
        </button>

        <button class="ic-btn inp-ic" @click="$refs.imgInput.click()" title="Imagem">
          <svg viewBox="0 0 24 24" fill="currentColor" width="19" height="19">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
          </svg>
        </button>

       

        <input ref="imgInput" type="file" accept="image/*" multiple style="display:none" @change="enviarImg" />

        <textarea
          ref="inputEl"
          v-model="txt"
          class="msg-in"
          :placeholder="`Mensagem para ${grupo.nome}...`"
          rows="1"
          @keydown.enter.exact.prevent="enviar"
          @keydown.shift.enter="null"
          @input="autoResize"
        />

        <button class="send-btn" :class="{ on: txt.trim() }" :disabled="!txt.trim()" @click="enviar">
          <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>

    </template>
  </section>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  grupo:      Object,
  membros:    { type: Array, default: () => [] },
  msgs:       { type: Array, default: () => [] },
  bgStyle:    Object,
  typing:     [Boolean, String],
  meId:       { type: [String, Number], default: null },
})

const emit = defineEmits([
  'update:modelValue',
  'fechar',
  'enviar',
  'enviarImg',
  'enviarVoz',
  'sair',
  'fullImg',
  'toggleReaction',
  'deletarMensagem',
  'encaminharMensagem',
  'reportarMensagem',
  'mutar',
  'buscarMidia',
])

// ── STATE ──────────────────────────────────────────────────────────────────
const txt          = ref('')
const emojiOpen    = ref(false)
const emojiSearch  = ref('')
const infoOpen     = ref(false)
const searchOpen   = ref(false)
const searchQuery  = ref('')
const msgsEl       = ref(null)
const inputEl      = ref(null)
const replyingTo   = ref(null)
const highlightedId = ref(null)
const showScrollBtn = ref(false)
const unreadCount  = ref(0)
const ctxMenu      = ref({ open: false, x: 0, y: 0, msg: null })

// Touch-hold para context menu mobile
let touchTimer = null

// ── CONSTANTES ─────────────────────────────────────────────────────────────
const quickEmojis = ['❤️', '😂', '🔥', '👏', '😮', '😢']

const allEmojis = [
  '😀','😂','😍','🥰','😎','🔥','💯','✨','🎉','👏','🙌','💪','👀','🫶','😭',
  '🤣','💀','🫠','🤯','😤','🎵','🎨','💻','🚀','⚡','🌊','🌸','🍕','❤️','✅',
  '🙏','😊','😬','🤔','😏','🤩','😴','🥹','😇','🫡','🤝','👋','🫂','💬','📸',
  '🎯','🏆','⭐','💡','🔑','📌','✍️','📝','🗓️','💼','🖥️','📱','⌨️','🖱️','🔔',
]

const CORES = [
  'linear-gradient(135deg,#c41840,#8b0000)',
  'linear-gradient(135deg,#c45000,#7a2d00)',
  'linear-gradient(135deg,#006b8c,#004455)',
  'linear-gradient(135deg,#1a6b2a,#0a3a14)',
  'linear-gradient(135deg,#6b1a6b,#3a0a3a)',
  'linear-gradient(135deg,#8c6b00,#4a3800)',
]

const MEMBER_COLORS = ['#c41840','#006b8c','#1a6b2a','#6b1a6b','#8c6b00','#c45000','#0c3860','#6b2020']

// ── COMPUTED ────────────────────────────────────────────────────────────────
const avatarStyle = computed(() => ({
  background: CORES[((props.grupo?.nome || '').charCodeAt(0) || 0) % CORES.length],
}))

const onlineCount = computed(() =>
  props.membros.filter(m => m.online && m.id !== props.meId).length
)

const filteredEmojis = computed(() =>
  emojiSearch.value
    ? allEmojis.filter(e => e.includes(emojiSearch.value))
    : allEmojis
)

const searchResults = computed(() =>
  searchQuery.value
    ? props.msgs.filter(m => m.txt?.toLowerCase().includes(searchQuery.value.toLowerCase()))
    : []
)

const filteredMsgs = computed(() =>
  searchQuery.value
    ? props.msgs.filter(m => m.txt?.toLowerCase().includes(searchQuery.value.toLowerCase()))
    : props.msgs
)

/** Msgs prontas para render: intercala separadores de data */
const displayMsgs = computed(() => {
  const source = filteredMsgs.value
  if (!source.length) return []

  const result = []
  let lastDay = ''
  let lastAuthorId = null
  let lastTs = null

  source.forEach((m, i) => {
    const date = m.ts ? new Date(m.ts) : new Date()
    const dayStr = dayLabel(date)

    if (dayStr !== lastDay) {
      result.push({ sep: dayStr })
      lastDay = dayStr
      lastAuthorId = null
    }

    const gap = lastTs ? (date - new Date(lastTs)) > 120_000 : true
    const showAv = m.autorId !== lastAuthorId || gap

    result.push({ ...m, showAv })
    lastAuthorId = m.autorId
    lastTs = m.ts
  })

  return result
})

// ── HELPERS ─────────────────────────────────────────────────────────────────
function dayLabel(d) {
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return 'Hoje'
  const y = new Date(today); y.setDate(y.getDate() - 1)
  if (d.toDateString() === y.toDateString()) return 'Ontem'
  return d.toLocaleDateString('pt-BR')
}

function avatarPadrao(username = '?') {
  const initials = (username || '?').slice(0, 2).toUpperCase()
  const colors   = ['#1a2850','#103838','#2d1040','#4a1018','#10381a','#3a1808']
  const color    = colors[(username.charCodeAt(0) || 0) % colors.length]
  return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150"><rect width="150" height="150" fill="${color}"/><text x="75" y="75" font-family="system-ui" font-size="54" font-weight="700" fill="#fff0ea" text-anchor="middle" dominant-baseline="central">${initials}</text></svg>`)}`
}

function memberColor(m) {
  return MEMBER_COLORS[(m.username?.charCodeAt(0) || 0) % MEMBER_COLORS.length]
}

function highlightSearch(text) {
  if (!searchQuery.value || !text) return text
  const re = new RegExp(`(${searchQuery.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(re, '<mark class="search-hl">$1</mark>')
}

// ── SCROLL ──────────────────────────────────────────────────────────────────
function scrollToBottom() {
  nextTick(() => {
    if (msgsEl.value) {
      msgsEl.value.scrollTop = msgsEl.value.scrollHeight
      unreadCount.value = 0
    }
  })
}

function scrollToMsg(id) {
  const el = document.getElementById(`msg-${id}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    highlightedId.value = id
    setTimeout(() => highlightedId.value = null, 1500)
  }
}

function onScroll() {
  if (!msgsEl.value) return
  const el = msgsEl.value
  showScrollBtn.value = el.scrollHeight - el.scrollTop - el.clientHeight > 120
}

// ── INPUT ───────────────────────────────────────────────────────────────────
function autoResize() {
  const el = inputEl.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 130) + 'px'
}

function enviar() {
  const t = txt.value.trim()
  if (!t) return
  emit('enviar', { txt: t, replyTo: replyingTo.value || null })
  txt.value        = ''
  replyingTo.value = null
  emojiOpen.value  = false
  nextTick(autoResize)
}

function enviarImg(e) {
  const files = Array.from(e.target.files)
  files.forEach(file => {
    const r = new FileReader()
    r.onload = ev => emit('enviarImg', ev.target.result)
    r.readAsDataURL(file)
  })
  e.target.value = ''
}

// ── CONTEXT MENU ─────────────────────────────────────────────────────────────
function openContextMenu(event, msg) {
  const x = Math.min(event.clientX, window.innerWidth  - 200)
  const y = Math.min(event.clientY, window.innerHeight - 200)
  ctxMenu.value = { open: true, x, y, msg }
}

function hideContextMenu() {
  ctxMenu.value.open = false
}

// touch-hold (mobile)
function onTouchStart(event, msg) {
  touchTimer = setTimeout(() => openContextMenu(event.touches[0], msg), 500)
}
function onTouchEnd() {
  clearTimeout(touchTimer)
}

// Ações do context menu
function doReply()   { replyingTo.value = ctxMenu.value.msg; hideContextMenu(); nextTick(() => inputEl.value?.focus()) }
function doReact(e)  { emit('toggleReaction', { msgId: ctxMenu.value.msg?.id, emoji: e }); hideContextMenu() }
function doForward() { emit('encaminharMensagem', ctxMenu.value.msg); hideContextMenu() }
function doCopy()    { navigator.clipboard?.writeText(ctxMenu.value.msg?.txt || ''); hideContextMenu() }
function doDelete()  { if (confirm('Apagar esta mensagem?')) emit('deletarMensagem', ctxMenu.value.msg?.id); hideContextMenu() }
function doReport()  { emit('reportarMensagem', ctxMenu.value.msg?.id); hideContextMenu() }

// ── OUTROS ──────────────────────────────────────────────────────────────────
function confirmarSaida() {
  if (confirm(`Sair do grupo "${props.grupo?.nome}"?`)) emit('sair')
}

// ── WATCHERS ─────────────────────────────────────────────────────────────────
watch(() => props.msgs?.length, (newLen, oldLen) => {
  if (msgsEl.value) {
    const atBottom = msgsEl.value.scrollHeight - msgsEl.value.scrollTop - msgsEl.value.clientHeight < 120
    if (atBottom) {
      scrollToBottom()
    } else if (newLen > (oldLen || 0)) {
      unreadCount.value++
    }
  }
})

watch(() => props.grupo, () => {
  infoOpen.value   = false
  emojiOpen.value  = false
  searchOpen.value = false
  searchQuery.value = ''
  txt.value        = ''
  replyingTo.value = null
  scrollToBottom()
})

// ── LIFECYCLE ────────────────────────────────────────────────────────────────
onMounted(() => {
  msgsEl.value?.addEventListener('scroll', onScroll)
  document.addEventListener('click', hideContextMenu)
  scrollToBottom()
})

onBeforeUnmount(() => {
  msgsEl.value?.removeEventListener('scroll', onScroll)
  document.removeEventListener('click', hideContextMenu)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }

/* ── LAYOUT ── */
.chat {
  flex: 1;
  display: none;
  flex-direction: column;
  background: #080400;
  min-width: 0;
  position: relative;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #f0e8df;
  overflow: hidden;
}
.chat.open { display: flex; }

/* ── HEADER ── */
.chat-hd {
  display: flex; align-items: center; gap: 8px;
  padding: 11px 14px;
  background: #0c0700;
  border-bottom: 1px solid #1a0f00;
  flex-shrink: 0;
  z-index: 10;
}
.hd-actions { display: flex; gap: 6px; }
.back { display: none; }
.flex1 { flex: 1; min-width: 0; }
.chat-nome  { font-size: 14px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.chat-status { font-size: 11px; color: rgba(240,232,223,.35); margin-top: 1px; }

.ic-btn {
  background: #181000; border: 1px solid #2a1800;
  color: rgba(240,232,223,.5); width: 34px; height: 34px;
  border-radius: 10px; display: flex; align-items: center;
  justify-content: center; cursor: pointer; transition: all .2s;
  flex-shrink: 0;
}
.ic-btn:hover, .ic-btn.on { background: #221400; color: #ff8c00; border-color: #ff8c00; }

.ic-btn-sm {
  background: none; border: none; color: rgba(240,232,223,.4);
  cursor: pointer; font-size: 13px; padding: 4px;
}

/* ── AVATARES ── */
.grupo-av-md {
  width: 38px; height: 38px; border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 800; color: rgba(255,255,255,.9);
  flex-shrink: 0; border: 1.5px solid rgba(255,255,255,.08);
  position: relative;
}
.hd-online-dot {
  position: absolute; bottom: -2px; right: -2px;
  width: 9px; height: 9px; border-radius: 50%;
  background: #22dd6b; border: 2px solid #0c0700;
}
.grupo-av-lg {
  width: 52px; height: 52px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 800; color: rgba(255,255,255,.9);
  flex-shrink: 0;
}
.grupo-av-xl {
  width: 72px; height: 72px; border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; font-weight: 800; color: rgba(255,255,255,.9);
  margin-bottom: 4px;
}
.av26 {
  width: 26px; height: 26px; border-radius: 50%;
  object-fit: cover; flex-shrink: 0;
}
.av26-spacer { width: 26px; flex-shrink: 0; }

/* ── SEARCH BAR ── */
.search-bar {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 14px; background: #0c0700;
  border-bottom: 1px solid #1a0f00; flex-shrink: 0;
}
.search-in {
  flex: 1; background: #130900; border: 1px solid #2a1800;
  border-radius: 18px; padding: 6px 12px; color: #f0e8df;
  font-size: 13px; font-family: inherit; outline: none;
}
.search-in::placeholder { color: rgba(240,232,223,.2); }
.search-in:focus { border-color: #ff6b00; }
.search-count { font-size: 11px; color: rgba(240,232,223,.35); white-space: nowrap; }

/* ── INFO PANEL ── */
.info-panel {
  background: #0a0600; border-bottom: 1px solid #1a0f00;
  padding: 14px 16px; flex-shrink: 0; max-height: 340px; overflow-y: auto;
}
.info-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.info-nome { font-size: 15px; font-weight: 700; }
.info-desc { font-size: 12px; color: rgba(240,232,223,.4); margin-top: 2px; }
.info-sub  { font-size: 11px; color: rgba(240,232,223,.28); margin-top: 3px; }

.membros-grid {
  display: flex; flex-wrap: wrap; gap: 10px;
  margin-bottom: 14px;
}
.membro-chip {
  display: flex; flex-direction: column; align-items: center;
  gap: 3px; cursor: pointer;
}
.m-av {
  width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; color: rgba(255,255,255,.9);
  position: relative;
}
.m-av.online::after {
  content: ''; position: absolute; bottom: 0; right: 0;
  width: 10px; height: 10px; background: #22dd6b;
  border-radius: 50%; border: 2px solid #0a0600;
}
.m-nome  { font-size: 10px; color: rgba(240,232,223,.45); max-width: 48px; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.admin-tag {
  font-size: 9px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .08em; color: #ff8c00;
  background: rgba(255,140,0,.1); border: 1px solid rgba(255,140,0,.2);
  border-radius: 8px; padding: 1px 6px;
}
.info-actions { display: flex; gap: 8px; margin-bottom: 12px; }
.info-action-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
  background: rgba(255,255,255,.04); border: 1px solid #2a1800;
  color: rgba(240,232,223,.55); border-radius: 10px; padding: 8px;
  font-size: 12px; font-family: inherit; cursor: pointer; transition: all .15s;
}
.info-action-btn:hover { background: rgba(255,255,255,.08); color: #ff8c00; border-color: rgba(255,140,0,.3); }
.sair-btn {
  width: 100%; background: rgba(255,50,50,.08);
  border: 1px solid rgba(255,50,50,.2);
  color: rgba(255,100,100,.6); border-radius: 10px;
  padding: 9px; font-size: 13px; font-weight: 600;
  font-family: inherit; cursor: pointer; transition: all .15s;
}
.sair-btn:hover { background: rgba(255,50,50,.14); color: rgba(255,100,100,.9); }

/* ── MENSAGENS ── */
.msgs {
  flex: 1; overflow-y: auto; padding: 16px 14px 10px;
  display: flex; flex-direction: column; gap: 4px;
  scroll-behavior: smooth; scrollbar-width: thin;
  scrollbar-color: #2a1800 transparent;
  position: relative;
}
.chat-empty {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; margin: auto; padding: 40px; text-align: center;
}
.nome-lg { font-size: 16px; font-weight: 700; }
.sub { font-size: 13px; color: rgba(240,232,223,.3); }
.sep {
  text-align: center; font-size: 10px; color: rgba(240,232,223,.2);
  padding: 8px 0; text-transform: uppercase; letter-spacing: .06em;
  user-select: none;
}

/* ── MSG ROW ── */
.msg-row {
  display: flex; align-items: flex-end; gap: 7px;
  position: relative;
  animation: msgIn .2s ease;
  transition: background .3s;
}
.msg-row.own { flex-direction: row-reverse; }
.msg-row.highlighted { background: rgba(255,140,0,.08); border-radius: 10px; }
@keyframes msgIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:none } }

/* Quick react toolbar */
.quick-reacts {
  position: absolute; top: -34px; left: 33px;
  background: #0e0800; border: 1px solid #2a1800;
  border-radius: 24px; padding: 4px 8px;
  display: flex; gap: 2px; z-index: 20;
  opacity: 0; pointer-events: none;
  transition: opacity .15s;
  white-space: nowrap;
}
.quick-reacts.own { left: auto; right: 0; }
.msg-row:hover .quick-reacts { opacity: 1; pointer-events: all; }
.qr-btn {
  background: none; border: none; font-size: 18px;
  cursor: pointer; padding: 3px 4px; border-radius: 50%;
  transition: transform .12s; line-height: 1;
}
.qr-btn:hover { transform: scale(1.25); }
.qr-more { font-size: 14px; color: rgba(240,232,223,.4); }

/* ── BALÃO WRAP ── */
.balao-wrap { display: flex; flex-direction: column; gap: 2px; max-width: 65%; }
.balao-wrap.own { align-items: flex-end; }
.balao-autor { font-size: 10px; font-weight: 700; color: #ff9a3c; padding-left: 4px; margin-bottom: 1px; }

/* ── REPLY QUOTE ── */
.reply-quote {
  background: rgba(255,255,255,.05); border-left: 3px solid #ff8c00;
  border-radius: 8px 8px 0 0; padding: 5px 9px;
  cursor: pointer; transition: background .12s;
  margin-bottom: -4px;
}
.reply-quote:hover { background: rgba(255,255,255,.08); }
.rq-autor { display: block; font-size: 10px; font-weight: 700; color: #ff9a3c; }
.rq-txt {
  display: block; font-size: 11px; color: rgba(240,232,223,.4);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 220px;
}

/* ── BALÃO ── */
.balao {
  background: #1a0e00; border: 1px solid #2a1800;
  border-radius: 16px 16px 16px 4px;
  padding: 8px 12px; font-size: 14px; line-height: 1.5;
  color: rgba(240,232,223,.88); word-break: break-word;
  position: relative;
}
.balao.own {
  background: linear-gradient(135deg, #c41840, #c45000);
  border: none; border-radius: 16px 16px 4px 16px; color: #fff;
}
.balao.img-msg { padding: 3px; background: transparent; border-color: #2a1800; }
.balao-img { width: 200px; height: 170px; object-fit: cover; border-radius: 13px; cursor: zoom-in; display: block; }

/* Encaminhado */
.fwd-label {
  display: flex; align-items: center; gap: 4px;
  font-size: 10px; color: rgba(255,255,255,.4);
  margin-bottom: 4px; font-style: italic;
}

/* Voz */
.balao.voice-msg { padding: 10px 12px; }
.voice-inner { display: flex; align-items: center; gap: 8px; }
.play-btn {
  background: rgba(255,255,255,.15); border: none; border-radius: 50%;
  width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #fff; flex-shrink: 0;
}
.wave-bars { display: flex; gap: 2px; align-items: center; height: 22px; }
.wave-bar {
  width: 3px; border-radius: 2px; background: rgba(255,255,255,.45);
  animation: wv 1.1s ease infinite; animation-play-state: paused;
}
@keyframes wv { 0%,100% { transform:scaleY(1) } 50% { transform:scaleY(2.2) } }
.voice-dur { font-size: 11px; color: rgba(255,255,255,.5); }

/* META */
.meta {
  display: flex; align-items: center; gap: 3px;
  font-size: 10px; color: rgba(255,255,255,.28);
  margin-top: 3px; justify-content: flex-end;
}
.balao:not(.own) .meta { color: rgba(240,232,223,.28); }

/* ── REACTIONS ── */
.reactions-bar {
  display: flex; gap: 4px; flex-wrap: wrap; margin-top: 3px;
}
.react-pill {
  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
  border-radius: 20px; padding: 2px 8px; font-size: 13px;
  cursor: pointer; transition: all .15s; display: flex; align-items: center; gap: 3px;
  user-select: none;
}
.react-pill.mine { background: rgba(255,140,0,.15); border-color: rgba(255,140,0,.3); }
.react-pill:hover { background: rgba(255,255,255,.12); transform: scale(1.08); }
.react-count { font-size: 11px; color: rgba(240,232,223,.5); font-weight: 600; }

/* ── VISTO POR ── */
.seen-by {
  display: flex; align-items: center; gap: 3px;
  justify-content: flex-end; margin-top: 3px;
}
.seen-av { width: 14px; height: 14px; border-radius: 50%; object-fit: cover; }
.seen-more { font-size: 9px; color: rgba(240,232,223,.3); }

/* ── TYPING ── */
.typing-row { display: flex; align-items: flex-end; gap: 7px; }
.typing-balao {
  background: #1a0e00; border: 1px solid #2a1800;
  border-radius: 16px 16px 16px 4px;
  padding: 11px 14px; display: flex; gap: 5px; align-items: center;
}
.dot { width: 6px; height: 6px; background: rgba(240,232,223,.3); border-radius: 50%; animation: bounce 1.2s infinite; }
.dot:nth-child(2) { animation-delay: .18s; }
.dot:nth-child(3) { animation-delay: .36s; }
@keyframes bounce { 0%,60%,100% { transform:none } 30% { transform:translateY(-5px) } }

/* ── SCROLL BUTTON ── */
.scroll-btn {
  position: absolute; bottom: 14px; right: 14px;
  background: #1a0e00; border: 1px solid #2a1800; color: #f0e8df;
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; box-shadow: 0 2px 12px rgba(0,0,0,.5);
  z-index: 15;
}
.unread-badge {
  position: absolute; top: -5px; right: -5px;
  background: #ff2d6b; color: #fff; font-size: 9px; font-weight: 700;
  border-radius: 10px; padding: 1px 5px; min-width: 16px; text-align: center;
}

/* ── CONTEXT MENU ── */
.ctx-menu {
  position: fixed; background: #0e0800; border: 1px solid #2a1800;
  border-radius: 14px; padding: 6px; z-index: 1000;
  box-shadow: 0 8px 32px rgba(0,0,0,.7); min-width: 170px;
}
.ctx-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: 9px; cursor: pointer;
  font-size: 13px; color: #f0e8df; background: none; border: none;
  width: 100%; text-align: left; font-family: inherit;
  transition: background .12s;
}
.ctx-item:hover { background: rgba(255,255,255,.07); }
.ctx-item.danger { color: rgba(255,100,100,.7); }
.ctx-item.danger:hover { background: rgba(255,60,60,.1); color: rgba(255,100,100,.95); }
.ctx-sep { height: 1px; background: #1a0f00; margin: 3px 4px; }

/* ── REPLY PREVIEW ── */
.reply-preview {
  display: flex; align-items: center; gap: 10px;
  background: #0a0600; border-top: 1px solid #1a0f00;
  padding: 8px 14px; flex-shrink: 0;
}
.rp-accent { width: 3px; height: 38px; background: #ff8c00; border-radius: 3px; flex-shrink: 0; }
.rp-body { flex: 1; min-width: 0; }
.rp-autor { display: block; font-size: 11px; font-weight: 700; color: #ff9a3c; }
.rp-txt   { display: block; font-size: 12px; color: rgba(240,232,223,.4); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rp-close {
  background: none; border: none; color: rgba(240,232,223,.4);
  cursor: pointer; padding: 4px; line-height: 1;
  transition: color .15s;
}
.rp-close:hover { color: rgba(240,232,223,.8); }

/* ── EMOJI PICKER ── */
.emoji-pick {
  position: absolute; bottom: 66px; left: 14px;
  background: #0e0800; border: 1px solid #2a1800;
  border-radius: 14px; padding: 10px; z-index: 60;
  box-shadow: 0 8px 32px rgba(0,0,0,.6); width: 280px;
}
.emoji-search { margin-bottom: 8px; }
.emoji-search-in {
  width: 100%; background: #130900; border: 1px solid #2a1800;
  border-radius: 10px; padding: 6px 10px; color: #f0e8df;
  font-size: 12px; font-family: inherit; outline: none;
}
.emoji-search-in:focus { border-color: #ff6b00; }
.emoji-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 2px; max-height: 180px; overflow-y: auto; }
.e-btn {
  background: none; border: none; font-size: 20px;
  cursor: pointer; padding: 5px; border-radius: 8px;
  transition: background .12s; line-height: 1;
}
.e-btn:hover { background: #1e1000; transform: scale(1.15); }

/* ── INPUT ── */
.input-bar {
  display: flex; align-items: flex-end; gap: 6px;
  padding: 10px 12px; background: #0c0700;
  border-top: 1px solid #1a0f00; flex-shrink: 0; position: relative;
}
.inp-ic { background: none !important; border: none !important; color: rgba(240,232,223,.28) !important; }
.inp-ic:hover, .inp-ic.on { color: #ff8c00 !important; }

.msg-in {
  flex: 1; background: #130900; border: 1.5px solid #2a1800;
  border-radius: 20px; padding: 9px 14px; color: #f0e8df;
  font-size: 14px; font-family: inherit; outline: none;
  transition: border-color .2s; resize: none;
  min-height: 38px; max-height: 130px; line-height: 1.4;
  overflow-y: auto; scrollbar-width: thin;
}
.msg-in:focus { border-color: #ff6b00; }
.msg-in::placeholder { color: rgba(240,232,223,.2); }

.send-btn {
  background: #1e1000; border: 1.5px solid #2a1800;
  color: rgba(240,232,223,.22); width: 38px; height: 38px;
  border-radius: 50%; display: flex; align-items: center;
  justify-content: center; cursor: pointer; transition: all .2s;
  flex-shrink: 0;
}
.send-btn.on {
  background: linear-gradient(135deg,#ff2d6b,#ff6b00);
  border-color: transparent; color: #fff;
  box-shadow: 0 3px 14px rgba(255,45,107,.35);
}
.send-btn.on:hover { transform: scale(1.08); }

/* ── SEARCH HIGHLIGHT ── */
:deep(.search-hl) {
  background: rgba(255,140,0,.3); color: #ffd080;
  border-radius: 3px; padding: 0 2px;
}

/* ── TRANSITIONS ── */
.slide-down-enter-active, .slide-down-leave-active { transition: all .25s ease; overflow: hidden; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; max-height: 0; }
.slide-down-enter-to, .slide-down-leave-from { max-height: 400px; }
.slide-up-enter-active, .slide-up-leave-active { transition: all .2s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(8px); }
.pop-enter-active { transition: all .2s cubic-bezier(.34,1.56,.64,1); }
.pop-leave-active { transition: all .15s ease; }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: scale(.88) translateY(6px); }

/* ── MOBILE ── */
@media (max-width: 700px) {
  .chat {
    display: flex; position: absolute; inset: 0;
    transform: translateX(100%);
    transition: transform .3s cubic-bezier(.4,0,.2,1);
  }
  .chat.open { transform: none; }
  .back { display: flex; }
  .balao-wrap { max-width: 80%; }
  .emoji-pick { left: 8px; right: 8px; width: auto; }
}
</style>