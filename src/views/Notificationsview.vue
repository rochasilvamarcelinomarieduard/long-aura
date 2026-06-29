<template>
  <div class="notif-page">

    <!-- HEADER -->
    <div class="notif-header">
      <div class="header-top">
        <div class="header-title-row">
          <div class="header-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="url(#hg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="url(#hg2)" stroke-width="2" stroke-linecap="round"/>
              <defs>
                <linearGradient id="hg"  x1="3" y1="8"  x2="21" y2="21" gradientUnits="userSpaceOnUse"><stop stop-color="#ff2d6b"/><stop offset="1" stop-color="#ff6a00"/></linearGradient>
                <linearGradient id="hg2" x1="10" y1="21" x2="14" y2="21" gradientUnits="userSpaceOnUse"><stop stop-color="#ff2d6b"/><stop offset="1" stop-color="#ff6a00"/></linearGradient>
              </defs>
            </svg>
          </div>
          <h1 class="notif-title">Notificações</h1>
          <transition name="badge-pop">
            <div class="badge-count" v-if="naoLidasCount > 0">
              {{ naoLidasCount > 99 ? '99+' : naoLidasCount }}
            </div>
          </transition>
        </div>

        <div class="header-actions">
          <button
            class="mark-all-btn"
            @click="onMarcarTodasLidas"
            :disabled="naoLidasCount === 0 || marcandoTodas"
          >
            <svg v-if="!marcandoTodas" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" width="14" height="14">
              <polyline points="2 8 6 12 14 4"/>
            </svg>
            <svg v-else viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" class="spin-icon">
              <circle cx="8" cy="8" r="6" stroke-dasharray="28" stroke-dashoffset="8" stroke-linecap="round"/>
            </svg>
            {{ marcandoTodas ? 'Marcando...' : 'Marcar todas' }}
          </button>
        </div>
      </div>

      <!-- FILTROS + TIPO TABS UNIFICADOS -->
      <div class="all-filters-row">
        <button
          v-for="f in filtros"
          :key="f.val"
          class="filter-btn"
          :class="{ active: grupoAtivo === 'filtro' && filtroAtivo === f.val }"
          @click="() => { filtroAtivo = f.val; grupoAtivo = 'filtro'; tipoAtivo = 'todos' }"
        >{{ f.label }}</button>

        <div class="filters-divider" />

        <button
          v-for="t in tipos"
          :key="t.val"
          class="filter-btn tipo-btn"
          :class="{ active: grupoAtivo === 'tipo' && tipoAtivo === t.val }"
          @click="() => { tipoAtivo = t.val; grupoAtivo = 'tipo'; filtroAtivo = 'todas' }"
        >
          <span class="filter-btn-icon" v-html="t.icon"></span>
          <span>{{ t.label }}</span>
          <span v-if="contarTipo(t.val) > 0" class="filter-btn-badge">{{ contarTipo(t.val) }}</span>
        </button>
      </div>
    </div>

    <!-- LISTA DE NOTIFICAÇÕES -->
    <div class="notif-scroll" ref="scrollEl">
      <template v-if="gruposFiltrados.length > 0">
        <div v-for="grupo in gruposFiltrados" :key="grupo.data" class="notif-grupo">

          <div class="grupo-label">
            <div class="grupo-dot" />
            <span>{{ grupo.data }}</span>
            <div class="grupo-line" />
          </div>

          <transition-group name="notif" tag="div" class="grupo-itens">
            <div
              v-for="n in grupo.itens"
              :key="n.id"
              class="notif-item"
              :class="{ unread: !n.lida, [n.tipo]: true }"
              @click="onMarcarLida(n)"
            >
              <div class="item-glow" :style="{ background: corTipo(n.tipo) }" />

              <div class="avatar-wrap" @click.stop="irParaPerfil(n.username)">
                <img :src="n.avatar" class="avatar" :alt="n.usuario" @error="(e) => e.target.src = avatarPadrao(n.username)"/>
                <div class="tipo-dot" :class="n.tipo">
                  <span v-html="iconeTipo(n.tipo)" class="tipo-dot-inner" />
                </div>
              </div>

              <div class="notif-body">
                <p class="notif-text">
                  <span class="notif-user notif-user-link" @click.stop="irParaPerfil(n.username)">{{ n.usuario }}</span>
                  <span class="notif-msg"> {{ n.mensagem }}</span>
                </p>
                <div class="notif-meta">
                  <span class="notif-time">
                    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" width="9" height="9">
                      <circle cx="6" cy="6" r="4.5"/><path d="M6 3.5V6l1.5 1"/>
                    </svg>
                    {{ n.hora }}
                  </span>
                  <span class="notif-tipo-pill" :class="n.tipo">{{ labelTipoPill(n.tipo) }}</span>
                </div>
              </div>

              <div v-if="n.thumb" class="notif-thumb">
                <div class="thumb-bg">
                  <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12" style="opacity:.8">
                    <path d="M5 3.5v9L13 8z"/>
                  </svg>
                </div>
              </div>

              <div v-if="!n.lida" class="unread-dot" :style="{ background: corTipo(n.tipo) }" />

              <div class="item-actions">
                <button class="action-btn action-btn--perfil" @click.stop="irParaPerfil(n.username)" title="Ver perfil">
                  <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13">
                    <circle cx="8" cy="5.5" r="3"/>
                    <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6H2z"/>
                  </svg>
                  <span>Perfil</span>
                </button>
                <button class="action-btn action-btn--remover" @click.stop="removerNotif(n.id)" title="Remover notificação">
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" width="11" height="11">
                    <path d="M2 2l8 8M10 2l-8 8"/>
                  </svg>
                </button>
              </div>

            </div>
          </transition-group>

        </div>
      </template>

      <transition name="fade">
        <div v-if="gruposFiltrados.length === 0 && !carregando" class="empty-state">
          <div class="empty-ring">
            <div class="empty-icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" width="36" height="36">
                <path d="M24 4C15.2 4 8 11.2 8 20v12l-4 4v2h40v-2l-4-4V20C40 11.2 32.8 4 24 4z"/>
                <path d="M20 40c0 2.2 1.8 4 4 4s4-1.8 4-4"/>
              </svg>
            </div>
          </div>
          <p class="empty-title">Tudo em dia</p>
          <p class="empty-sub">Nenhuma notificação {{ filtroAtivo === 'nao-lidas' ? 'não lida' : '' }} por aqui</p>
        </div>
      </transition>

      <transition name="fade">
        <div v-if="carregando" class="skeleton-list">
          <div v-for="i in 5" :key="i" class="skeleton-item">
            <div class="sk-avatar" />
            <div class="sk-body">
              <div class="sk-line sk-line-a" />
              <div class="sk-line sk-line-b" />
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- TOAST -->
    <transition name="toast">
      <div v-if="toastMsg" class="toast" :class="toastTipo">
        <div class="toast-icon">
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="10" height="10">
            <polyline points="2 6 5 9 10 3"/>
          </svg>
        </div>
        {{ toastMsg }}
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase }  from '../supabase.js'
import { authState } from '../auth.js'
import {
  fetchNotificacoes,
  marcarLida,
  marcarTodasLidas,
  subscribeToNotificacoes,
  removerNotificacao,
} from '../notificacoes.js'


const router = useRouter()

const LIMITE_48H = 48 * 60 * 60 * 1000

const COR_TIPO = {
  curtida:    '#ff3a6e',
  comentario: '#ff8c38',
  seguidor:   '#34d399',
  mencao:     '#60a5fa',
  repost:     '#a78bfa',
}

function corTipo(tipo) { return COR_TIPO[tipo] || '#888' }

function iconeTipo(tipo) {
  const icons = {
    curtida:    `<svg viewBox="0 0 12 12" fill="currentColor" width="7" height="7"><path d="M6 10.5L1.5 6c-.8-.8-.8-2.2 0-3 .8-.8 2.2-.8 3 0L6 4.5l1.5-1.5c.8-.8 2.2-.8 3 0 .8.8.8 2.2 0 3L6 10.5z"/></svg>`,
    comentario: `<svg viewBox="0 0 12 12" fill="currentColor" width="7" height="7"><path d="M10 1H2C1.4 1 1 1.4 1 2v7l2-2h7c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1z"/></svg>`,
    seguidor:   `<svg viewBox="0 0 12 12" fill="currentColor" width="7" height="7"><path d="M8 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-4-1V3H3v2H1v1.5h2v2h1.5v-2H7V5H4zm4 2c-1.3 0-4 .67-4 2v1h8v-1c0-1.33-2.7-2-4-2z"/></svg>`,
    mencao:     `<svg viewBox="0 0 12 12" fill="currentColor" width="7" height="7"><path d="M6 1C3.2 1 1 3.2 1 6s2.2 5 5 5h2.5V9.5H6C4.1 9.5 2.5 7.9 2.5 6S4.1 2.5 6 2.5 9.5 4.1 9.5 6v.7c0 .4-.4.8-.8.8s-.8-.4-.8-.8V6c0-1.4-1.1-2.5-2.5-2.5S3 4.6 3 6s1.1 2.5 2.5 2.5c.7 0 1.3-.3 1.8-.7.3.4.8.7 1.4.7C9.6 8.5 11 7.2 11 5.7V6c0-2.8-2.2-5-5-5z"/></svg>`,
    repost:     `<svg viewBox="0 0 12 12" fill="currentColor" width="7" height="7"><path d="M9.5 3.5H3L5 1.5l-1-1L1 3.5 4 6.5l1-1-2-2h6.5v3h1.5v-3c0-.8-.7-1.5-1.5-1.5zM8 7.5l-1 1 2 2H2.5v-3H1v3C1 11.3 1.7 12 2.5 12H9l-2 2 1 1 3-3-3-3z"/></svg>`,
  }
  return icons[tipo] || `<svg viewBox="0 0 12 12" fill="currentColor" width="7" height="7"><circle cx="6" cy="6" r="3"/></svg>`
}

function labelTipoPill(tipo) {
  const map = { curtida: 'curtida', comentario: 'comentário', seguidor: 'seguiu', mencao: 'menção', repost: 'repost' }
  return map[tipo] || tipo
}

const ICONES_TIPO = {
  curtida:    `<svg viewBox="0 0 18 18" fill="currentColor" width="18" height="18"><path d="M9 15.5L3 9.5c-1.1-1.1-1.1-3 0-4.1 1.1-1.1 3-1.1 4.1 0L9 7l1.9-1.6c1.1-1.1 3-1.1 4.1 0 1.1 1.1 1.1 3 0 4.1L9 15.5z"/></svg>`,
  comentario: `<svg viewBox="0 0 18 18" fill="currentColor" width="18" height="18"><path d="M15 2H3C2.2 2 1.5 2.7 1.5 3.5v10.5L4.5 11H15c.8 0 1.5-.7 1.5-1.5v-6C16.5 2.7 15.8 2 15 2z"/></svg>`,
  seguidor:   `<svg viewBox="0 0 18 18" fill="currentColor" width="18" height="18"><path d="M12 9c1.7 0 3-1.3 3-3S13.7 3 12 3s-3 1.3-3 3 1.3 3 3 3zm-6-1.5V5H4.5v2.5H2V9h2.5v2.5H6V9h2.5V7.5H6zM12 10.5c-2 0-6 1-6 3V15h12v-1.5c0-2-4-3-6-3z"/></svg>`,
  mencao:     `<svg viewBox="0 0 18 18" fill="currentColor" width="18" height="18"><path d="M9 1.5C4.9 1.5 1.5 4.9 1.5 9S4.9 16.5 9 16.5h3.75v-2.25H9C6.1 14.25 3.75 11.9 3.75 9S6.1 3.75 9 3.75 14.25 6.1 14.25 9v1.05c0 .6-.6 1.2-1.2 1.2s-1.2-.6-1.2-1.2V9c0-2.1-1.65-3.75-3.75-3.75S4.35 6.9 4.35 9s1.65 3.75 3.75 3.75c1.05 0 1.95-.45 2.7-1.05.45.6 1.2 1.05 2.1 1.05C14.4 12.75 16.5 10.8 16.5 8.4V9C16.5 4.9 13.1 1.5 9 1.5z"/></svg>`,
  repost:     `<svg viewBox="0 0 18 18" fill="currentColor" width="18" height="18"><path d="M14.25 5.25H4.5L7.5 2.25l-1.5-1.5L1.5 5.25l4.5 4.5 1.5-1.5-3-3h9.75v4.5H16.5v-4.5c0-1.2-1.05-2.25-2.25-2.25zM12 10.5l-1.5 1.5 3 3H2.25v-4.5H.75v4.5C.75 16.2 1.8 17.25 3 17.25H13.5l-3 3 1.5 1.5L16.5 17.25 12 10.5z"/></svg>`,
}

const tipos = [
  { val: 'curtida',    label: 'Curtidas',    icon: ICONES_TIPO.curtida    },
  { val: 'comentario', label: 'Comentários', icon: ICONES_TIPO.comentario },
  { val: 'seguidor',   label: 'Seguidores',  icon: ICONES_TIPO.seguidor   },
  { val: 'mencao',     label: 'Menções',     icon: ICONES_TIPO.mencao     },
  { val: 'repost',     label: 'Reposts',     icon: ICONES_TIPO.repost     },
]

const filtroAtivo   = ref('todas')
const tipoAtivo     = ref('todos')
const grupoAtivo    = ref('')
const toastMsg      = ref('')
const toastTipo     = ref('')
const scrollEl      = ref(null)
const carregando    = ref(false)
const marcandoTodas = ref(false)
const notificacoes  = ref([])

const filtros = [
  { val: 'todas',     label: 'Todas'     },
  { val: 'nao-lidas', label: 'Não lidas' },
]

function AV(initials, bg) {
  return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150"><rect width="150" height="150" fill="${bg}"/><text x="75" y="75" font-family="system-ui" font-size="54" font-weight="700" fill="rgba(255,255,255,0.9)" text-anchor="middle" dominant-baseline="central">${initials}</text></svg>`)}`
}

function avatarPadrao(username = '?') {
  const initials = (username || '?').slice(0, 2).toUpperCase()
  const colors   = ['#c72a5e','#c75a00','#1a7a3a','#5a1090','#1a3a8a','#207a7a','#8a2060','#4a7a20']
  const color    = colors[(username.charCodeAt(0) || 0) % colors.length]
  return AV(initials, color)
}

function labelTempo(ts) {
  if (!ts) return ''
  const diff = Date.now() - new Date(ts).getTime()
  const min  = Math.floor(diff / 60000)
  if (min < 1)  return 'agora'
  if (min < 60) return min + 'min'
  const h = Math.floor(min / 60)
  if (h < 24)   return h + 'h'
  const d = Math.floor(h / 24)
  if (d === 1)  return 'Ontem'
  if (d < 7)    return d + 'd'
  return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function labelGrupo(ts) {
  if (!ts) return 'Outros'
  const diff = Date.now() - new Date(ts).getTime()
  const d    = Math.floor(diff / 86400000)
  if (d === 0) return 'Hoje'
  if (d === 1) return 'Ontem'
  if (d < 7)   return 'Esta semana'
  return 'Mais antigas'
}

function mensagemTipo(tipo, texto) {
  const msgs = {
    like: 'curtiu seu vídeo', curtida: 'curtiu seu vídeo',
    comentario: texto ? `comentou: "${texto}"` : 'comentou no seu vídeo',
    seguiu: 'começou a te seguir', seguidor: 'começou a te seguir',
    repost: 'republicou seu vídeo', mencao: 'te mencionou', mensagem: 'te enviou uma mensagem',
  }
  return msgs[tipo] || tipo
}

function normalizarTipo(tipo) {
  if (tipo === 'like')   return 'curtida'
  if (tipo === 'seguiu') return 'seguidor'
  return tipo
}

function chaveDedup(n) {
  const ts     = n._created_at || n.created_at || Date.now()
  const bucket = Math.floor(new Date(ts).getTime() / 10_000)
  const sender = n._from_user_id || n.from_user_id || n.username || ''
  const video  = n._video_id     || n.video_id     || ''
  return `${sender}|${n.tipo}|${video}|${bucket}`
}

function irParaPerfil(usernameRaw) {
  if (!usernameRaw) return
  const username = usernameRaw.replace(/^@/, '').trim()
  if (!username)   return
  router.push({ name: 'ProfileUser', params: { username } })
}

function mapearNotif(n) {
  const ts = n.created_at || n.criado_em
  return {
    id: n.id, _created_at: ts, _from_user_id: n.from_user_id, _video_id: n.video_id || n.id_do_video,
    grupo: labelGrupo(ts), usuario: '@' + (n.profiles?.username || 'usuario'), username: n.profiles?.username || '',
    mensagem: mensagemTipo(n.tipo, n.texto), tipo: normalizarTipo(n.tipo), hora: labelTempo(ts),
    lida: !!n.lida, avatar: n.profiles?.avatar_url || avatarPadrao(n.profiles?.username), thumb: !!(n.video_id || n.id_do_video),
  }
}

async function carregarNotificacoes() {
  if (!authState.user) return
  carregando.value = true
  try {
    const dados = await fetchNotificacoes()
    const vistas = new Set(); const unicas = []
    for (const n of (dados || [])) {
      const mapped = mapearNotif(n); const chave = chaveDedup(mapped)
      if (!vistas.has(chave)) { vistas.add(chave); unicas.push(mapped) }
    }
    notificacoes.value = unicas
  } catch (err) { mostrarToast('Erro ao carregar notificações', 'error') }
  finally { carregando.value = false }
}

const naoLidasCount = computed(() => notificacoes.value.filter(n => !n.lida).length)
function contarTipo(tipo) { return notificacoes.value.filter(n => !n.lida && n.tipo === tipo).length }

const ORDEM_GRUPOS = ['Hoje', 'Ontem', 'Esta semana', 'Mais antigas', 'Outros']
const grupos = computed(() => {
  const map = {}
  for (const n of notificacoes.value) { const g = n.grupo || 'Outros'; if (!map[g]) map[g] = []; map[g].push(n) }
  return ORDEM_GRUPOS.filter(k => map[k]).map(k => ({ data: k, itens: map[k] }))
})

const gruposFiltrados = computed(() =>
  grupos.value.map(g => ({ ...g, itens: g.itens.filter(n => {
    const passaFiltro = filtroAtivo.value === 'todas' || !n.lida
    const passaTipo   = tipoAtivo.value   === 'todos' || n.tipo === tipoAtivo.value
    return passaFiltro && passaTipo
  })})).filter(g => g.itens.length > 0)
)

async function onMarcarLida(n) {
  if (n.lida) return; n.lida = true
  try { await marcarLida(n.id) } catch { n.lida = false }
}

async function onMarcarTodasLidas() {
  if (naoLidasCount.value === 0 || marcandoTodas.value) return
  marcandoTodas.value = true
  const snapshot = notificacoes.value.map(n => ({ id: n.id, lida: n.lida }))
  notificacoes.value.forEach(n => { n.lida = true })
  try { await marcarTodasLidas(); mostrarToast('Todas marcadas como lidas ✓', 'success') }
  catch {
    snapshot.forEach(({ id, lida }) => { const notif = notificacoes.value.find(n => n.id === id); if (notif) notif.lida = lida })
    mostrarToast('Erro ao marcar notificações', 'error')
  } finally { marcandoTodas.value = false }
}

async function removerNotif(id) {
  const idx = notificacoes.value.findIndex(n => n.id === id); let removida
  if (idx !== -1) { ;[removida] = notificacoes.value.splice(idx, 1); idsPresentes.delete(id) }
  try { await removerNotificacao(id) }
  catch { if (removida) { notificacoes.value.splice(idx, 0, removida); idsPresentes.add(id) } }
}

function mostrarToast(msg, tipo = 'success') {
  toastMsg.value = msg; toastTipo.value = tipo
  setTimeout(() => { toastMsg.value = ''; toastTipo.value = '' }, 2800)
}

let subscription = null; let timerLimpeza = null
const idsPresentes = new Set()

onMounted(async () => {
  await carregarNotificacoes()
  if (!authState.user) return
  notificacoes.value.forEach(n => idsPresentes.add(n.id))

  subscription = subscribeToNotificacoes(async (nova) => {
    const senderId = nova.from_user_id
    if (senderId === authState.user.id) return
    if (idsPresentes.has(nova.id)) return
    idsPresentes.add(nova.id)
    let perfil = null
    try {
      const { data } = await supabase.from('profiles').select('username, avatar_url').eq('id', senderId).single()
      perfil = data
    } catch {}
    const ts = nova.created_at ?? new Date().toISOString()
    const novaNotif = {
      id: nova.id, _created_at: ts, _from_user_id: senderId, _video_id: nova.video_id ?? null,
      grupo: 'Hoje', usuario: '@' + (perfil?.username || 'usuario'), username: perfil?.username || '',
      mensagem: mensagemTipo(nova.tipo, nova.texto), tipo: normalizarTipo(nova.tipo), hora: 'agora',
      lida: false, avatar: perfil?.avatar_url || avatarPadrao(perfil?.username), thumb: !!nova.video_id,
    }
    const chave = chaveDedup(novaNotif)
    if (!notificacoes.value.some(n => chaveDedup(n) === chave)) notificacoes.value.unshift(novaNotif)
  })

  timerLimpeza = setInterval(() => {
    const agora = Date.now()
    notificacoes.value = notificacoes.value.filter(n => !n._created_at || agora - new Date(n._created_at).getTime() < LIMITE_48H).map(n => ({ ...n, hora: labelTempo(n._created_at), grupo: labelGrupo(n._created_at) }))
    const idsAtivos = new Set(notificacoes.value.map(n => n.id))
    for (const id of idsPresentes) { if (!idsAtivos.has(id)) idsPresentes.delete(id) }
  }, 60_000)
})

onUnmounted(() => {
  if (subscription) subscription.unsubscribe?.()
  if (timerLimpeza) clearInterval(timerLimpeza)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:           #0a0a0c;
  --bg2:          #111115;
  --bg3:          #18181e;
  --bg4:          #1f1f28;
  --bd:           rgba(255,255,255,0.08);
  --bd2:          rgba(255,255,255,0.13);
  --tx:           #ffffff;
  --tx2:          rgba(255,255,255,0.75);
  --tx3:          rgba(255,255,255,0.35);
  --acc:          #ff2d6b;
  --acc2:         #ff6a00;
  --ff:           'DM Sans', sans-serif;
  --c-curtida:    #ff3a6e;
  --c-comentario: #ff9500;
  --c-seguidor:   #30d158;
  --c-mencao:     #3d9eff;
  --c-repost:     #bf5af2;
  --grad:         linear-gradient(135deg, #ff2d6b, #ff6a00);
  --radius:       14px;
}

.notif-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--bg);
  font-family: var(--ff);
  color: var(--tx);
}

/* ─── HEADER ─────────────────────────────────────────── */
.notif-header {
  flex-shrink: 0;
  background: rgba(10,10,12,0.97);
  backdrop-filter: blur(24px);
  border-bottom: 1px solid var(--bd);
  padding: 24px 24px 0;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
}

.header-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon-wrap {
  width: 46px; height: 46px;
  border-radius: 14px;
  background: rgba(255,45,107,0.12);
  border: 1px solid rgba(255,45,107,0.25);
  display: flex; align-items: center; justify-content: center;
}

.notif-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #fff;
}

.badge-count {
  background: var(--grad);
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  min-width: 24px; height: 24px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  padding: 0 8px;
  box-shadow: 0 2px 12px rgba(255,45,107,0.5);
  animation: pulse-badge 2.5s ease infinite;
}
@keyframes pulse-badge {
  0%, 100% { box-shadow: 0 2px 12px rgba(255,45,107,0.5); }
  50%       { box-shadow: 0 2px 22px rgba(255,45,107,0.8); }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mark-all-btn {
  display: flex; align-items: center; gap: 8px;
  background: var(--grad);
  border: none; color: #fff;
  font-size: 13.5px; font-weight: 700;
  font-family: var(--ff);
  padding: 11px 22px;
  border-radius: 24px; cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap; min-width: 140px; justify-content: center;
  box-shadow: 0 4px 18px rgba(255,45,107,0.4);
  position: relative; overflow: hidden;
}
.mark-all-btn:not(:disabled):hover {
  box-shadow: 0 6px 24px rgba(255,45,107,0.6);
  transform: translateY(-1px);
}
.mark-all-btn:not(:disabled):active { transform: translateY(0); }
.mark-all-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.spin-icon { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ─── FILTROS ─────────────────────────────────────────── */
.all-filters-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
  padding: 14px 0 16px;
}

.filters-divider {
  width: 1px; height: 28px;
  background: var(--bd2);
  margin: 0 5px;
  flex-shrink: 0;
}

.filter-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 18px;
  border-radius: 12px;
  border: 1.5px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.75);
  font-size: 13.5px; font-weight: 600;
  font-family: var(--ff);
  cursor: pointer;
  transition: all 0.18s;
  white-space: nowrap;
}
.filter-btn:hover {
  border-color: rgba(255,45,107,0.5);
  color: #fff;
  background: rgba(255,45,107,0.08);
}
.filter-btn.active {
  background: var(--grad);
  border-color: transparent;
  color: #fff;
  font-weight: 700;
  box-shadow: 0 3px 16px rgba(255,45,107,0.4);
}

.filter-btn-icon {
  display: flex; align-items: center;
  opacity: 0.9;
  width: 18px; height: 18px;
}
.filter-btn.active .filter-btn-icon { opacity: 1; }

.filter-btn-badge {
  background: rgba(255,255,255,0.2);
  color: #fff;
  font-size: 11px; font-weight: 800;
  min-width: 19px; height: 19px; border-radius: 10px;
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0 5px;
}
.filter-btn:not(.active) .filter-btn-badge {
  background: var(--grad);
  color: #fff;
}

/* ─── LISTA DE NOTIFICAÇÕES ─────────────────────────── */
.notif-scroll {
  flex: 1; overflow-y: auto;
  scrollbar-width: thin; scrollbar-color: var(--bd) transparent;
  padding-bottom: 48px;
}

.notif-grupo { margin-bottom: 4px; }

.grupo-label {
  display: flex; align-items: center; gap: 10px;
  padding: 22px 24px 10px;
  font-size: 11px; font-weight: 800;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase; letter-spacing: 1.4px;
}
.grupo-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--grad); flex-shrink: 0; }
.grupo-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
.grupo-itens { display: flex; flex-direction: column; }

/* ─── NOTIF ITEM ─────────────────────────────────────── */
.notif-item {
  display: flex; align-items: center; gap: 14px;
  padding: 15px 16px 15px 20px;
  cursor: pointer; transition: background 0.15s;
  position: relative;
  border-left: 3px solid transparent;
  overflow: hidden;
}
.notif-item:hover { background: rgba(255,255,255,0.03); }

.notif-item.unread { background: rgba(255,255,255,0.035); }
.notif-item.unread.curtida    { border-left-color: var(--c-curtida);    }
.notif-item.unread.comentario { border-left-color: var(--c-comentario); }
.notif-item.unread.seguidor   { border-left-color: var(--c-seguidor);   }
.notif-item.unread.mencao     { border-left-color: var(--c-mencao);     }
.notif-item.unread.repost     { border-left-color: var(--c-repost);     }

.item-glow {
  position: absolute; left: 0; top: 0; bottom: 0;
  width: 80px; opacity: 0.04; pointer-events: none; filter: blur(14px);
}

.avatar-wrap { position: relative; flex-shrink: 0; cursor: pointer; }
.avatar {
  width: 48px; height: 48px; border-radius: 50%;
  object-fit: cover; display: block;
  border: 2px solid rgba(255,255,255,0.15); transition: all 0.2s;
}
.avatar-wrap:hover .avatar { border-color: var(--acc); transform: scale(1.05); }

.tipo-dot {
  position: absolute; bottom: -2px; right: -2px;
  width: 20px; height: 20px; border-radius: 50%;
  border: 2px solid var(--bg);
  display: flex; align-items: center; justify-content: center;
}
.tipo-dot.curtida    { background: var(--c-curtida);    }
.tipo-dot.comentario { background: var(--c-comentario); }
.tipo-dot.seguidor   { background: var(--c-seguidor);   }
.tipo-dot.mencao     { background: var(--c-mencao);     }
.tipo-dot.repost     { background: var(--c-repost);     }
.tipo-dot-inner { display: flex; align-items: center; justify-content: center; }

.notif-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
.notif-text { font-size: 14px; line-height: 1.5; color: rgba(255,255,255,0.7); }
.notif-user { font-size: 14px; font-weight: 700; color: #fff; }
.notif-msg  { color: rgba(255,255,255,0.7); }
.notif-user-link { cursor: pointer; transition: color 0.15s; }
.notif-user-link:hover { color: #ff6090; }
.notif-item.unread .notif-text { color: rgba(255,255,255,0.85); }
.notif-item.unread .notif-msg  { color: rgba(255,255,255,0.85); }

.notif-meta { display: flex; align-items: center; gap: 8px; }
.notif-time {
  display: flex; align-items: center; gap: 4px;
  font-size: 11.5px; color: rgba(255,255,255,0.4);
  font-weight: 500;
}

.notif-tipo-pill {
  font-size: 10px; font-weight: 700;
  padding: 3px 8px; border-radius: 20px;
  text-transform: uppercase; letter-spacing: 0.4px;
}
.notif-tipo-pill.curtida    { background: rgba(255,58,110,0.18);  color: #ff7099; }
.notif-tipo-pill.comentario { background: rgba(255,149,0,0.18);   color: #ffb84d; }
.notif-tipo-pill.seguidor   { background: rgba(48,209,88,0.18);   color: #5de07a; }
.notif-tipo-pill.mencao     { background: rgba(61,158,255,0.18);  color: #6db9ff; }
.notif-tipo-pill.repost     { background: rgba(191,90,242,0.18);  color: #d07ef0; }

.notif-thumb {
  flex-shrink: 0; width: 44px; height: 54px;
  border-radius: 9px; overflow: hidden;
  border: 1px solid rgba(255,255,255,0.1);
}
.thumb-bg {
  width: 100%; height: 100%;
  background: var(--bg3);
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.5);
}

.item-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; margin-left: 4px; }

.action-btn {
  display: flex; align-items: center; justify-content: center;
  gap: 5px; border-radius: 10px; cursor: pointer;
  font-family: var(--ff); font-weight: 700;
  transition: all 0.18s; white-space: nowrap; border: none;
}

.action-btn--perfil {
  height: 36px; padding: 0 14px;
  font-size: 12.5px;
  background: rgba(255,45,107,0.15);
  color: #ff6090;
  border: 1px solid rgba(255,45,107,0.3);
}
.action-btn--perfil:hover {
  background: var(--grad); border-color: transparent;
  color: #fff; box-shadow: 0 3px 16px rgba(255,45,107,0.45);
  transform: translateY(-1px);
}

.action-btn--remover {
  width: 36px; height: 36px; padding: 0;
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.35);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
}
.action-btn--remover:hover {
  background: rgba(255,45,107,0.18);
  border-color: rgba(255,45,107,0.35);
  color: #ff6090;
  transform: scale(1.05);
}

.unread-dot {
  width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0;
  animation: dot-pulse 2.5s ease infinite;
  box-shadow: 0 0 8px currentColor;
}
@keyframes dot-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.55; transform: scale(0.8); }
}

/* ─── EMPTY STATE ─────────────────────────────────────── */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 14px;
  padding: 90px 24px; text-align: center;
}
.empty-ring {
  position: relative; width: 90px; height: 90px;
  display: flex; align-items: center; justify-content: center;
}
.empty-ring::before {
  content: ''; position: absolute; inset: 0;
  border-radius: 50%; border: 1px solid rgba(255,255,255,0.12);
  animation: ring-spin 6s linear infinite;
}
.empty-ring::after {
  content: ''; position: absolute; inset: 8px;
  border-radius: 50%; border: 1px solid rgba(255,45,107,0.2);
}
@keyframes ring-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.empty-icon {
  width: 64px; height: 64px; border-radius: 50%;
  background: var(--bg3);
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.3);
}
.empty-title { font-size: 17px; font-weight: 800; color: rgba(255,255,255,0.8); }
.empty-sub   { font-size: 13.5px; color: rgba(255,255,255,0.35); }

/* ─── SKELETON ─────────────────────────────────────────── */
.skeleton-list { padding: 16px 24px; display: flex; flex-direction: column; gap: 2px; }
.skeleton-item { display: flex; align-items: center; gap: 14px; padding: 14px 0; }
.sk-avatar {
  width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(90deg, var(--bg3) 25%, var(--bg4) 50%, var(--bg3) 75%);
  background-size: 200% 100%; animation: shimmer 1.4s infinite;
}
.sk-body { flex: 1; display: flex; flex-direction: column; gap: 10px; }
.sk-line {
  border-radius: 6px; height: 13px;
  background: linear-gradient(90deg, var(--bg3) 25%, var(--bg4) 50%, var(--bg3) 75%);
  background-size: 200% 100%; animation: shimmer 1.4s infinite;
}
.sk-line-a { width: 65%; } .sk-line-b { width: 42%; }
@keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }

/* ─── TOAST ─────────────────────────────────────────────── */
.toast {
  position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
  background: var(--bg3); color: #fff;
  border: 1px solid rgba(255,45,107,0.25);
  padding: 11px 22px; border-radius: 32px;
  font-size: 13.5px; font-weight: 700; z-index: 500;
  white-space: nowrap; display: flex; align-items: center; gap: 10px;
  box-shadow: 0 10px 36px rgba(0,0,0,0.6), 0 0 24px rgba(255,45,107,0.12);
}
.toast-icon {
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--grad); color: #fff;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 10px rgba(255,45,107,0.45);
}
.toast.error .toast-icon { background: #ff3a3a; }

/* ─── TRANSITIONS ────────────────────────────────────────── */
.badge-pop-enter-active { animation: popIn  0.3s cubic-bezier(.34,1.56,.64,1); }
.badge-pop-leave-active { animation: popOut 0.2s ease forwards; }
@keyframes popIn  { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes popOut { to   { transform: scale(0); opacity: 0; } }

.notif-enter-active { transition: all 0.3s cubic-bezier(0.34,1.3,0.64,1); }
.notif-leave-active { transition: all 0.2s ease; }
.notif-enter-from   { opacity: 0; transform: translateX(-16px); }
.notif-leave-to     { opacity: 0; transform: translateX(24px);  }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }

.toast-enter-active, .toast-leave-active { transition: all 0.28s ease; }
.toast-enter-from,   .toast-leave-to     { opacity: 0; transform: translate(-50%, 12px); }

/* ─── RESPONSIVO ─────────────────────────────────────────── */
@media (max-width: 600px) {
  .notif-header     { padding: 18px 16px 0; }
  .notif-title      { font-size: 24px; }
  .header-icon-wrap { width: 40px; height: 40px; }
  .notif-item       { padding: 13px 12px 13px 14px; gap: 10px; }
  .grupo-label      { padding: 18px 16px 8px; }
  .mark-all-btn     { font-size: 12.5px; padding: 9px 15px; min-width: unset; }
  .action-btn--perfil span { display: none; }
  .action-btn--perfil { width: 36px; padding: 0; }
  .all-filters-row  { gap: 6px; padding: 12px 0 14px; }
  .filter-btn       { font-size: 13px; padding: 8px 14px; }
  .filters-divider  { display: none; }
}
</style>