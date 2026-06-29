<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/supabase.js'
import { authState, updateProfile, reloadProfile, uploadAvatar } from '@/auth.js'

defineOptions({ name: 'ProfileView' })

const router = useRouter()
const route  = useRoute()

const visitandoId     = ref(null)
const visitandoPerfil = ref(null)
const carregando      = ref(false)
const meusVideos      = ref([])
const videosCurtidos      = ref([])
const videosRepublicados  = ref([])
const usuariosSugeridos   = ref([])
const seguindoMap     = ref({})
const seguidoresMap   = ref({})  // quem ME segue
const bloqueados      = ref([])
const silenciados     = ref([])

const contagemSeguidores = ref(0)
const contagemSeguindo   = ref(0)
const totalCurtidas      = ref(0)

const toastMsg   = ref('')
const toastTipo  = ref('info')
const abaAtiva   = ref('VÍDEOS')
const headerFixo = ref(false)
const pesquisaPerfil = ref('')

const temaAtual = ref('escuro')

const videoAberto     = ref(null)
const curtidasMap     = ref({})
const salvosMap       = ref({})
const repostMap       = ref({})
const statsVideo      = ref({ curtidas: 0, salvos: 0, comentarios: 0, visualizacoes: 0 })
const carregandoStats = ref(false)

const comentarios          = ref([])
const novoComentario       = ref('')
const enviandoComentario   = ref(false)
const carregandoComentarios = ref(false)
const comentariosListRef   = ref(null)
const gifPickerAberto      = ref(false)
const comentariosAbertos   = ref(false)
const gifQuery             = ref('')
const gifResultados        = ref([])
const gifCarregando        = ref(false)
// Tenor API v1 — chave pública demo do Tenor (funciona para desenvolvimento)
// Para produção, pegue a sua em: https://developers.google.com/tenor/guides/quickstart
const TENOR_KEY = 'LIVDSRZULELA'
let comentariosChannel     = null

const notificacoes      = ref([])
const modalNotificacoes = ref(false)
const notifNaoLidas     = ref(0)

const modalConfig       = ref(false)
const modalLista        = ref(null)
const modalMensagem     = ref(false)
const modalReportar     = ref(false)
const modalCompartilhar = ref(false)
const criandoDestaque   = ref(false)
const modalConfirm = ref({ show: false, titulo: '', sub: '', icone: 'lixeira', onConfirm: null })
const editandoDestaque = ref(null)
const editandoDestaqueForm = ref({ titulo: '', cor: '#ff6b35', fotos: [] })
const salvandoDestaque = ref(false)
const destaqueDetalhe   = ref(null)
const editando          = ref(false)
const editandoVideo     = ref(null)

const salvando          = ref(false)
const erroEdicao        = ref('')
const rascunho          = ref({ username: '', nome: '', bio: '', website: '', categoria: '', genero: '' })
const fotoPreviewLocal  = ref(null)
const _novaFotoFile     = ref(null)
const capaPerfil        = ref(null)
const _novaCapaFile     = ref(null)
const capaPreviewLocal  = ref(null)

const salvandoVideo    = ref(false)
const erroVideoEdicao  = ref('')
const rascunhoVideo    = ref({ titulo: '', descricao: '' })

const abaConfig = ref('conta')

const salvandoConfig       = ref(false)
const salvandoSeguranca    = ref(false)
const redefinindoSenha     = ref(false)
const excluindoConta       = ref(false)
const solicitandoVerif     = ref(false)

// ── Crop / Zoom de avatar ────────────────────────────────────────────────────
const cropCanvas   = ref(null)
// ── Crop / Zoom de CAPA ───────────────────────────────────────────────────
const cropCapaCanvas   = ref(null)
const cropCapaScale    = ref(1)
const cropCapaOffsetX  = ref(0)
const cropCapaOffsetY  = ref(0)
const cropCapaDragging = ref(false)
const cropCapaStartX   = ref(0)
const cropCapaStartY   = ref(0)
const cropCapaImg      = ref(null)
const cropCapaMode     = ref(false)

const CAPA_W = 960
const CAPA_H = 330
const cropScale    = ref(1)
const cropOffsetX  = ref(0)
const cropOffsetY  = ref(0)
const cropDragging = ref(false)
const cropStartX   = ref(0)
const cropStartY   = ref(0)
const cropImg      = ref(null)
const cropMode     = ref(false)

function onAvatarChange(e) {
  const f = e.target.files[0]
  if (!f) return
  _novaFotoFile.value = f
  const url = URL.createObjectURL(f)
  fotoPreviewLocal.value = url
  const img = new Image()
  img.onload = () => {
    cropImg.value = img
    cropScale.value = 1
    cropOffsetX.value = 0
    cropOffsetY.value = 0
    cropMode.value = true
    nextTick(() => desenharCrop())
  }
  img.src = url
}

function desenharCrop() {
  const c = cropCanvas.value
  if (!c || !cropImg.value) return
  const ctx = c.getContext('2d')
  const SIZE = 200
  ctx.clearRect(0, 0, SIZE, SIZE)
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, SIZE, SIZE)
  ctx.save()
  ctx.beginPath()
  ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2)
  ctx.clip()
  const img = cropImg.value
  const scale = cropScale.value
  const sw = img.naturalWidth * scale
  const sh = img.naturalHeight * scale
  const dx = SIZE / 2 - sw / 2 + cropOffsetX.value
  const dy = SIZE / 2 - sh / 2 + cropOffsetY.value
  ctx.drawImage(img, dx, dy, sw, sh)
  ctx.restore()
  ctx.strokeStyle = '#ff6b35'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 1, 0, Math.PI * 2)
  ctx.stroke()
}

watch([cropScale, cropOffsetX, cropOffsetY], desenharCrop)

function cropMouseDown(e) {
  cropDragging.value = true
  cropStartX.value = e.clientX - cropOffsetX.value
  cropStartY.value = e.clientY - cropOffsetY.value
}
function cropMouseMove(e) {
  if (!cropDragging.value) return
  cropOffsetX.value = e.clientX - cropStartX.value
  cropOffsetY.value = e.clientY - cropStartY.value
}
function cropMouseUp() { cropDragging.value = false }

function cropTouchStart(e) {
  const t = e.touches[0]
  cropDragging.value = true
  cropStartX.value = t.clientX - cropOffsetX.value
  cropStartY.value = t.clientY - cropOffsetY.value
}
function cropTouchMove(e) {
  if (!cropDragging.value) return
  const t = e.touches[0]
  cropOffsetX.value = t.clientX - cropStartX.value
  cropOffsetY.value = t.clientY - cropStartY.value
}

async function aplicarCrop() {
  const c = cropCanvas.value
  if (!c) return
  c.toBlob(blob => {
    const file = new File([blob], 'avatar_crop.png', { type: 'image/png' })
    _novaFotoFile.value = file
    fotoPreviewLocal.value = URL.createObjectURL(blob)
    cropMode.value = false
    
  }, 'image/png', 0.92)
}

function cancelarCrop() {
  cropMode.value = false
  fotoPreviewLocal.value = null
  _novaFotoFile.value = null
}

// ── Crop Capa ─────────────────────────────────────────────────────────────────
function desenharCropCapa() {
  const c = cropCapaCanvas.value
  if (!c || !cropCapaImg.value) return
  const ctx = c.getContext('2d')
  ctx.clearRect(0, 0, CAPA_W, CAPA_H)
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, CAPA_W, CAPA_H)
  const img = cropCapaImg.value

  // Escala inicial: imagem cobre todo o canvas
  const scaleBase = Math.max(CAPA_W / img.naturalWidth, CAPA_H / img.naturalHeight)
  const scale = scaleBase * cropCapaScale.value

  const sw = img.naturalWidth * scale
  const sh = img.naturalHeight * scale
  const dx = CAPA_W / 2 - sw / 2 + cropCapaOffsetX.value
  const dy = CAPA_H / 2 - sh / 2 + cropCapaOffsetY.value
  ctx.drawImage(img, dx, dy, sw, sh)
}

watch([cropCapaScale, cropCapaOffsetX, cropCapaOffsetY], desenharCropCapa)

function cropCapaMouseDown(e) {
  cropCapaDragging.value = true
  cropCapaStartX.value = e.clientX - cropCapaOffsetX.value
  cropCapaStartY.value = e.clientY - cropCapaOffsetY.value
}
function cropCapaMouseMove(e) {
  if (!cropCapaDragging.value) return
  cropCapaOffsetX.value = e.clientX - cropCapaStartX.value
  cropCapaOffsetY.value = e.clientY - cropCapaStartY.value
}
function cropCapaMouseUp() { cropCapaDragging.value = false }

function cropCapaTouchStart(e) {
  const t = e.touches[0]
  cropCapaDragging.value = true
  cropCapaStartX.value = t.clientX - cropCapaOffsetX.value
  cropCapaStartY.value = t.clientY - cropCapaOffsetY.value
}
function cropCapaTouchMove(e) {
  if (!cropCapaDragging.value) return
  const t = e.touches[0]
  cropCapaOffsetX.value = t.clientX - cropCapaStartX.value
  cropCapaOffsetY.value = t.clientY - cropCapaStartY.value
}

async function aplicarCropCapa() {
  const c = cropCapaCanvas.value
  if (!c) return
  c.toBlob(blob => {
    const file = new File([blob], 'capa_crop.png', { type: 'image/png' })
    _novaCapaFile.value = file
    capaPreviewLocal.value = URL.createObjectURL(blob)
    cropCapaMode.value = false
  }, 'image/png', 0.92)
}

function cancelarCropCapa() {
  cropCapaMode.value = false
}
// ─────────────────────────────────────────────────────────────────────────────

const config = ref({
  privacidade: {
    contaPrivada: false,
    quemPodeComentar: 'todos',
    quemPodeEnviarMensagem: 'todos',
    quemPodeVerVideos: 'todos',
    atividadeOnline: true,
    permitirCompartilhamento: true,
  },
  notificacoes: {
    seguidos: true,
    curtidas: true,
    comentarios: true,
    mensagens: true,
  },
  aparencia: {
    tema: 'escuro',
    qualidadeVideo: 'auto',
  },
  seguranca: {
    autenticacaoDoisFatores: false,
    alertasLoginNovo: true,
  },
  conteudo: {
    filtrarSpam: true,
    filtrarOfensivo: true,
    palavrasBlocklist: [],
  },
})

const reportandoItem = ref(null)
const motivoReporte  = ref('')
const motivosReporte = ['Conteúdo inapropriado','Spam ou enganoso','Assédio','Discurso de ódio','Violência','Nudez','Violação de direitos','Informação falsa','Outro']

const qrCodeUrl   = ref('')
const linkPerfil  = ref('')
const linkCopiado = ref(false)
const qrCarregando = ref(true)

const destaques       = ref([])
const novoDestaque    = ref({ titulo: '', cor: '#ff6b35' })
const fotasPreview    = ref([])
const fotasSelecionadas = ref([])
const enviandoCapa    = ref(false)
const carrosselIndex  = ref(0)
const storyViewer     = ref(null)
const storyProgress   = ref(0)
let storyTimer        = null

const listaUsuarios   = ref([])
const carregandoLista = ref(false)
const pesquisaLista   = ref('')
let realtimeChannel   = null

const menuContexto      = ref(null)
const menuContextoVideo = ref(null)
const estaSegundoODono  = ref(false)
const textoMensagem     = ref('')
const sugestoesListRef  = ref(null)
const sugestoeOuterRef  = ref(null)
let followsChannel      = null
const pvRootRef = ref(null)
let _suggDragX = 0
let _suggDragging = false
const playerVideoEl = ref(null)
const playerAudioEl = ref(null)

const suggScrollLeft = ref(0)
const suggAtEnd      = ref(false)
const suggDots       = ref(1)
const suggActiveDot  = ref(1)

const mostrarEmail    = ref(false)
const mostrarCpf      = ref(false)

const novaPalavraBlocklist = ref('')

const estouSeguindo = computed(() => seguindoMap.value)

// ── COMPUTED ──────────────────────────────────────────────────────────────────

const perfil = computed(() => {
  const p = visitandoId.value ? visitandoPerfil.value : authState.profile
  return {
    id:         p?.id           || authState.user?.id,
    username:   p?.username     || 'usuario',
    nome:       p?.nome         || 'Sem Nome',
   avatar:     p?.avatar_url   || '/default-avatar.svg',
    capa:       p?.capa_url     || p?.cover_url || capaPerfil.value || null,
    bio:        p?.bio          || '',
    website:    p?.website      || '',
    seguidores: contagemSeguidores.value,
    seguindo:   contagemSeguindo.value,
    curtidas:   totalCurtidas.value,
    verificado: p?.verificado   || false,
    categoria:  p?.categoria    || '',
    privado:    p?.privado      || false,
    links:      p?.links        || [],
    quem_pode_comentar:   p?.quem_pode_comentar   || 'todos',
    quem_pode_ver_videos: p?.quem_pode_ver_videos  || 'todos',
  }
})

const ehMeuPerfil = computed(() => !visitandoId.value || visitandoId.value === authState.user?.id)

const podeVerVideo = computed(() => {
  if (ehMeuPerfil.value) return true
  const restricao = visitandoPerfil.value?.quem_pode_ver_videos || 'todos'
  if (restricao === 'todos') return true
  if (restricao === 'somente_eu') return false
  if (restricao === 'seguidores') return !!seguindoMap.value[visitandoId.value]
  return true
})

const videosFiltrados = computed(() => {
  const listas = { CURTIDOS: videosCurtidos, REPUBLICADOS: videosRepublicados }
  let lista = (listas[abaAtiva.value]?.value) ?? meusVideos.value
  if (pesquisaPerfil.value.trim()) {
    const q = pesquisaPerfil.value.toLowerCase()
    lista = lista.filter(v => (v.titulo || v.title || '').toLowerCase().includes(q))
  }
  return lista
})

const listaFiltrada = computed(() => {
  if (!pesquisaLista.value.trim()) return listaUsuarios.value
  const q = pesquisaLista.value.toLowerCase()
  return listaUsuarios.value.filter(u => u.username?.toLowerCase().includes(q) || u.nome?.toLowerCase().includes(q))
})

// ── HELPERS ───────────────────────────────────────────────────────────────────

function maskEmail(email) {
  if (!email) return '—'
  const [user, domain] = email.split('@')
  if (!domain) return '••••••••'
  const masked = user.slice(0,2) + '•'.repeat(Math.max(user.length - 2, 3))
  return masked + '@' + domain
}

function normalizarVideo(v) {
  if (!v) return null
  // Supabase retorna counts como [{count: N}] quando usa select com count
  const resolveCount = (val) => {
    if (Array.isArray(val)) return val[0]?.count || 0
    return val || 0
  }
  return {
    ...v,
    thumbnail_url:  v.thumbnail_url || v.thumb_url || v.thumbnail || null,
    likes_count:    resolveCount(v.likes_count)    || resolveCount(v.curtidas_count)    || 0,
    comments_count: resolveCount(v.comments_count) || resolveCount(v.comentarios_count) || 0,
    views:          v.views || 0,
  }
}

function formatarNumero(n) {
  if (!n) return '0'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace('.0', '') + 'K'
  return String(n)
}

function formatarTempo(ts) {
  if (!ts) return ''
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000)
  if (diff < 60)      return 'agora'
  if (diff < 3600)    return Math.floor(diff / 60) + 'min'
  if (diff < 86400)   return Math.floor(diff / 3600) + 'h'
  if (diff < 604800)  return Math.floor(diff / 86400) + 'd'
  return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function mostrarToast(m, tipo = 'info') {
  toastMsg.value = m; toastTipo.value = tipo
  setTimeout(() => { toastMsg.value = '' }, 3200)
}

function confirmar({ titulo, sub, icone = 'lixeira', onConfirm }) {
  modalConfirm.value = { show: true, titulo, sub, icone, onConfirm }
}

const _uid = () => authState.user?.id || ''
function ls(key) { try { return JSON.parse(localStorage.getItem(key + _uid()) || 'null') } catch { return null } }
function lsSave(key, val) { try { localStorage.setItem(key + _uid(), JSON.stringify(val)) } catch {} }

function mergeDeep(target, source) {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      typeof target[key] === 'object' &&
      target[key] !== null
    ) {
      result[key] = mergeDeep(target[key], source[key])
    } else {
      result[key] = source[key]
    }
  }
  return result
}

function aplicarTema(tema) {
  temaAtual.value = tema
  const vars = tema === 'claro' ? {
    '--bg':    '#f0f0f0',
    '--bg2':   '#ffffff',
    '--bg3':   '#e8e8e8',
    '--bg4':   '#dedede',
    '--bg5':   '#d0d0d0',
    '--text':  '#0a0a0a',
    '--text2': '#333333',
    '--text3': '#777777',
    '--text4': '#bbbbbb',
    '--border':  'rgba(0,0,0,0.08)',
    '--border2': 'rgba(0,0,0,0.14)',
    '--border3': 'rgba(255,107,53,0.35)',
    '--accent-glow': 'rgba(255,107,53,0.15)',
  } : {
    '--bg':    '#080808',
    '--bg2':   '#0d0d0d',
    '--bg3':   '#121212',
    '--bg4':   '#181818',
    '--bg5':   '#1e1e1e',
    '--text':  '#f5f5f5',
    '--text2': '#b0b0b0',
    '--text3': '#606060',
    '--text4': '#282828',
    '--border':  'rgba(255,255,255,0.05)',
    '--border2': 'rgba(255,255,255,0.10)',
    '--border3': 'rgba(255,107,53,0.22)',
    '--accent-glow': 'rgba(255,107,53,0.20)',
  }
  ;[document.documentElement, pvRootRef.value].forEach(el => {
    if (!el) return
    Object.entries(vars).forEach(([k, v]) => el.style.setProperty(k, v))
  })
  lsSave('tema_', tema)
}

async function carregarConfigSupabase() {
  if (!authState.user?.id) return

  const { data: settingsData } = await supabase
    .from('user_settings')
    .select('settings')
    .eq('user_id', authState.user.id)
    .maybeSingle()

  if (settingsData?.settings) {
    config.value = mergeDeep(config.value, settingsData.settings)
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select(`
      privado,
      quem_pode_comentar,
      quem_pode_ver_videos,
      quem_pode_mensagem,
      atividade_online,
      permitir_compartilhamento,
      dois_fatores,
      alertas_login
    `)
    .eq('id', authState.user.id)
    .maybeSingle()

  if (profileData) {
    if (profileData.privado               !== null) config.value.privacidade.contaPrivada             = profileData.privado
    if (profileData.quem_pode_comentar    !== null) config.value.privacidade.quemPodeComentar          = profileData.quem_pode_comentar    || 'todos'
    if (profileData.quem_pode_ver_videos  !== null) config.value.privacidade.quemPodeVerVideos         = profileData.quem_pode_ver_videos  || 'todos'
    if (profileData.quem_pode_mensagem    !== null) config.value.privacidade.quemPodeEnviarMensagem    = profileData.quem_pode_mensagem    || 'todos'
    if (profileData.atividade_online      !== null) config.value.privacidade.atividadeOnline           = profileData.atividade_online      ?? true
    if (profileData.permitir_compartilhamento !== null) config.value.privacidade.permitirCompartilhamento = profileData.permitir_compartilhamento ?? true
    if (profileData.dois_fatores   !== null) config.value.seguranca.autenticacaoDoisFatores = profileData.dois_fatores   ?? false
    if (profileData.alertas_login  !== null) config.value.seguranca.alertasLoginNovo        = profileData.alertas_login  ?? true
  }

  aplicarTema(config.value.aparencia?.tema || 'escuro')
}

async function salvarConfig() {
  aplicarTema(config.value.aparencia.tema)
  if (!authState.user?.id) { mostrarToast('Configurações salvas!', 'success'); return }

  salvandoConfig.value = true
  try {
    const { error: errSettings } = await supabase
      .from('user_settings')
      .upsert(
        { user_id: authState.user.id, settings: config.value, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
    if (errSettings) throw errSettings

    const { error: errPerfil } = await supabase
      .from('profiles')
      .update({
        privado:                      config.value.privacidade.contaPrivada,
        quem_pode_comentar:           config.value.privacidade.quemPodeComentar,
        quem_pode_ver_videos:         config.value.privacidade.quemPodeVerVideos,
        quem_pode_mensagem:           config.value.privacidade.quemPodeEnviarMensagem,
        atividade_online:             config.value.privacidade.atividadeOnline,
        permitir_compartilhamento:    config.value.privacidade.permitirCompartilhamento,
        dois_fatores:                 config.value.seguranca.autenticacaoDoisFatores,
        alertas_login:                config.value.seguranca.alertasLoginNovo,
      })
      .eq('id', authState.user.id)
    if (errPerfil) console.error('Erro ao sincronizar perfil:', errPerfil)

    mostrarToast('Configurações salvas!', 'success')
  } catch (e) {
    console.error('Erro ao salvar configs:', e)
    mostrarToast('Erro ao salvar configurações', 'error')
  } finally {
    salvandoConfig.value = false
  }
}

async function salvarPrivacidadeImediato() {
  if (!authState.user?.id) return
  try {
    await supabase.from('profiles').update({
      privado:                      config.value.privacidade.contaPrivada,
      quem_pode_comentar:           config.value.privacidade.quemPodeComentar,
      quem_pode_ver_videos:         config.value.privacidade.quemPodeVerVideos,
      quem_pode_mensagem:           config.value.privacidade.quemPodeEnviarMensagem,
      atividade_online:             config.value.privacidade.atividadeOnline,
      permitir_compartilhamento:    config.value.privacidade.permitirCompartilhamento,
    }).eq('id', authState.user.id)

    await supabase.from('user_settings').upsert(
      { user_id: authState.user.id, settings: config.value, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
  } catch (e) { console.error('Erro privacidade imediato:', e) }
}

async function salvarNotificacoesImediato() {
  if (!authState.user?.id) return
  try {
    await supabase.from('user_settings').upsert(
      { user_id: authState.user.id, settings: config.value, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
  } catch (e) { console.error('Erro notificações imediato:', e) }
}

async function salvarAparenciaImediato() {
  if (!authState.user?.id) return
  aplicarTema(config.value.aparencia.tema)
  try {
    await supabase.from('user_settings').upsert(
      { user_id: authState.user.id, settings: config.value, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
  } catch (e) { console.error('Erro aparência imediato:', e) }
}

async function salvarSegurancaImediato() {
  if (!authState.user?.id) return
  salvandoSeguranca.value = true
  try {
    await supabase.from('profiles').update({
      dois_fatores:   config.value.seguranca.autenticacaoDoisFatores,
      alertas_login:  config.value.seguranca.alertasLoginNovo,
    }).eq('id', authState.user.id)

    await supabase.from('user_settings').upsert(
      { user_id: authState.user.id, settings: config.value, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    mostrarToast('Segurança atualizada!', 'success')
  } catch (e) {
    console.error('Erro segurança:', e)
    mostrarToast('Erro ao salvar segurança', 'error')
  } finally {
    salvandoSeguranca.value = false
  }
}

async function redefinirSenha() {
  const email = authState.user?.email
  if (!email) { mostrarToast('E-mail não encontrado', 'error'); return }
  redefinindoSenha.value = true
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/redefinir-senha',
    })
    if (error) throw error
    mostrarToast('Link de redefinição enviado ao e-mail!', 'success')
  } catch (e) {
    console.error('Erro ao redefinir senha:', e)
    mostrarToast('Erro ao enviar link de redefinição', 'error')
  } finally {
    redefinindoSenha.value = false
  }
}

async function solicitarVerificacao() {
  if (!authState.user?.id) return
  solicitandoVerif.value = true
  try {
    const { error } = await supabase.from('verification_requests').upsert(
      { user_id: authState.user.id, status: 'pending', requested_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    if (error) throw error
    mostrarToast('Solicitação de verificação enviada!', 'success')
  } catch (e) {
    console.warn('verification_requests:', e?.message)
    mostrarToast('Solicitação enviada! Responderemos em breve.', 'info')
  } finally {
    solicitandoVerif.value = false
  }
}

async function excluirConta() {
  if (!confirm('Tem certeza? Esta ação é irreversível e todos os seus dados serão apagados.')) return
  if (!confirm('Confirmação final: sua conta será permanentemente excluída.')) return
  excluindoConta.value = true
  try {
    const { error } = await supabase.rpc('delete_user_account', { uid: authState.user.id })
    if (error) throw error
    await supabase.auth.signOut()
    router.push('/login')
  } catch (e) {
    console.error('Erro ao excluir conta:', e)
    mostrarToast('Erro ao excluir. Entre em contato com o suporte.', 'error')
  } finally {
    excluindoConta.value = false
  }
}

async function salvarConteudoImediato() {
  if (!authState.user?.id) return
  try {
    await supabase.from('user_settings').upsert(
      { user_id: authState.user.id, settings: config.value, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
  } catch (e) { console.error('Erro conteúdo:', e) }
}

function carregarLocal() {
  capaPerfil.value = ls('capa_perfil_') || null
  const temaSalvo  = ls('tema_') || 'escuro'
  aplicarTema(temaSalvo)
}

async function carregarDestaques() {
  const id = visitandoId.value || authState.user?.id
  if (!id) return
  const { data, error } = await supabase
    .from('highlights')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: true })
  if (error) { console.error('Erro ao carregar destaques:', error); return }
  destaques.value = (data || []).map(d => ({
  ...d,
  fotos: Array.isArray(d.fotos) ? d.fotos : []
}))}


async function buscarContagens() {
  const id = visitandoId.value || authState.user?.id
  if (!id) return
  const [{ count: seg }, { count: snd }, { count: cur }] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id',  id),
    supabase.from('likes').select('*', { count: 'exact', head: true }).eq('user_id', id),
  ])
  contagemSeguidores.value = seg || 0
  contagemSeguindo.value   = snd || 0
  totalCurtidas.value      = cur || 0
}

async function carregarMaps() {
  if (!authState.user?.id) return
  const uid = authState.user.id
 const [follows, likes, reposts] = await Promise.all([
  supabase.from('follows').select('following_id').eq('follower_id', uid),
  supabase.from('likes').select('video_id').eq('user_id', uid),
  supabase.from('reposts').select('video_id').eq('user_id', uid),
])
  const toMap = (arr, key) => Object.fromEntries((arr || []).map(r => [r[key], true]))
  seguindoMap.value = toMap(follows.data, 'following_id')
  curtidasMap.value = toMap(likes.data,   'video_id')

  repostMap.value   = toMap(reposts.data, 'video_id')
  lsSave('seguindoMap_', seguindoMap.value)

  // Quem me segue
  const { data: meSegue } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('following_id', _uid())
  seguidoresMap.value = toMap(meSegue || [], 'follower_id')
}

async function carregarTudo() {
  carregando.value = true
  const id = visitandoId.value || authState.user?.id
  const [{ data: vids }, { data: likes }, { data: reposts }] = await Promise.all([
  supabase.from('videos')
    .select('*, likes_count:likes(count), comments_count:comments(count)')
    .eq('user_id', id)
    .order('created_at', { ascending: false }),
  supabase.from('likes').select('video_id, videos(*, likes_count:likes(count), comments_count:comments(count))').eq('user_id', id),
  supabase.from('reposts').select('video_id, videos(*, likes_count:likes(count), comments_count:comments(count))').eq('user_id', id),
])
  meusVideos.value         = (vids    || []).map(normalizarVideo).filter(Boolean)
  videosCurtidos.value     = (likes   || []).map(r => normalizarVideo(r.videos)).filter(Boolean)
  videosRepublicados.value = (reposts || []).map(r => normalizarVideo(r.videos)).filter(Boolean)
  carregando.value = false
  carregarSugeridos()
}

async function carregarSugeridos() {
  const { data: todos } = await supabase
    .from('profiles')
    .select('id, username, nome, avatar_url, verificado, bio')
    .neq('id', _uid())
    .limit(100)
  if (!todos?.length) return
  const filtrados = todos.filter(u => !bloqueados.value.includes(u.id) && !silenciados.value.includes(u.id))
  const ids = filtrados.map(u => u.id)
  let contagens = {}
  if (ids.length) {
    const { data: fw } = await supabase.from('follows').select('following_id').in('following_id', ids)
    fw?.forEach(f => { contagens[f.following_id] = (contagens[f.following_id] || 0) + 1 })
  }
  usuariosSugeridos.value = filtrados.sort((a, b) => (contagens[b.id] || 0) - (contagens[a.id] || 0))
  await nextTick()
  calcSuggState()
}

async function carregarNotificacoes() {
  if (!authState.user?.id) return

  const n = config.value.notificacoes || {}
  const tiposAtivos = [
    n.seguidos    !== false && 'follow',
    n.curtidas    !== false && 'like',
    n.comentarios !== false && 'comment',
    n.mensagens   !== false && 'message',
    'repost',
  ].filter(Boolean)

  let query = supabase
    .from('notificacoes')
    .select('*, profiles:from_user_id(username, avatar_url)')
    .eq('to_user_id', authState.user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (tiposAtivos.length < 5) {
    query = query.in('tipo', tiposAtivos)
  }

  const { data } = await query
  notificacoes.value  = data || []
  notifNaoLidas.value = (data || []).filter(n => !n.lida).length
}

async function buscarStatsVideo(id) {
  carregandoStats.value = true
  const [{ count: c }, { count: s }, { count: cm }, { data: v }] = await Promise.all([
    supabase.from('likes').select('*', { count: 'exact', head: true }).eq('video_id', id),
    supabase.from('saves').select('*', { count: 'exact', head: true }).eq('video_id', id),
    supabase.from('comments').select('*', { count: 'exact', head: true }).eq('video_id', id),
    supabase.from('videos').select('views').eq('id', id).single(),
  ])
  statsVideo.value = { curtidas: c || 0, salvos: s || 0, comentarios: cm || 0, visualizacoes: v?.views || 0 }
  carregandoStats.value = false
}

async function toggleCurtir(videoId) {
  if (!authState.user?.id) return
  const era = curtidasMap.value[videoId]
  curtidasMap.value = { ...curtidasMap.value, [videoId]: !era }
  statsVideo.value.curtidas = Math.max(0, (statsVideo.value.curtidas || 0) + (era ? -1 : 1))
  // Atualiza contador no card da grid
  const idx = meusVideos.value.findIndex(v => v.id === videoId)
  if (idx !== -1) meusVideos.value[idx] = { ...meusVideos.value[idx], likes_count: Math.max(0, (meusVideos.value[idx].likes_count || 0) + (era ? -1 : 1)) }
  try {
    if (era) await supabase.from('likes').delete().eq('user_id', authState.user.id).eq('video_id', videoId)
    else     await supabase.from('likes').insert({ user_id: authState.user.id, video_id: videoId })
  } catch {
    curtidasMap.value = { ...curtidasMap.value, [videoId]: era }
    if (idx !== -1) meusVideos.value[idx] = { ...meusVideos.value[idx], likes_count: Math.max(0, (meusVideos.value[idx].likes_count || 0) + (era ? 1 : -1)) }
    mostrarToast('Erro ao curtir', 'error')
  }
}

async function toggleSalvar(videoId) {
  if (!authState.user?.id) return
  const era = salvosMap.value[videoId]
  salvosMap.value = { ...salvosMap.value, [videoId]: !era }
  statsVideo.value.salvos = Math.max(0, (statsVideo.value.salvos || 0) + (era ? -1 : 1))
  try {
    if (era) { await supabase.from('saves').delete().eq('user_id', authState.user.id).eq('video_id', videoId); mostrarToast('Removido dos salvos', 'info') }
    else     { await supabase.from('saves').insert({ user_id: authState.user.id, video_id: videoId }); mostrarToast('Salvo!', 'success') }
  } catch { salvosMap.value = { ...salvosMap.value, [videoId]: era }; mostrarToast('Erro ao salvar', 'error') }
}

async function toggleRepost(videoId) {
  if (!authState.user?.id) return
  const era = repostMap.value[videoId]
  repostMap.value = { ...repostMap.value, [videoId]: !era }
  try {
    if (era) { await supabase.from('reposts').delete().eq('user_id', authState.user.id).eq('video_id', videoId); mostrarToast('Repost removido', 'info') }
    else     { await supabase.from('reposts').insert({ user_id: authState.user.id, video_id: videoId }); mostrarToast('Repostado!', 'success') }
  } catch { repostMap.value = { ...repostMap.value, [videoId]: era }; mostrarToast('Erro', 'error') }
}

async function toggleSeguirUsuario(userId, username) {
  if (!authState.user?.id) return
  const era = seguindoMap.value[userId]

  // Confirmação ao deixar de seguir
  if (era) {
    const meSegueEle = seguidoresMap.value[userId]
    const msg = meSegueEle
      ? `Tem certeza que quer parar de seguir @${username}?\n\nEle(a) te segue — você pode perder a conexão.`
      : `Tem certeza que quer parar de seguir @${username}?`
    if (!confirm(msg)) return
  }

  seguindoMap.value = { ...seguindoMap.value, [userId]: !era }
  lsSave('seguindoMap_', seguindoMap.value)
  contagemSeguindo.value = era ? Math.max(0, contagemSeguindo.value - 1) : contagemSeguindo.value + 1
  try {
    if (era) await supabase.from('follows').delete().eq('follower_id', authState.user.id).eq('following_id', userId)
    else     await supabase.from('follows').insert({ follower_id: authState.user.id, following_id: userId })
    mostrarToast(era ? `Deixou de seguir @${username}` : `Seguindo @${username}`, era ? 'info' : 'success')
    buscarContagens()
  } catch {
    seguindoMap.value = { ...seguindoMap.value, [userId]: era }
    lsSave('seguindoMap_', seguindoMap.value)
    contagemSeguindo.value = era ? contagemSeguindo.value + 1 : Math.max(0, contagemSeguindo.value - 1)
    mostrarToast('Erro ao seguir', 'error')
  }
}

async function removerSeguidor(userId, username) {
  if (!authState.user?.id) return
  if (!confirm(`Remover @${username} dos seus seguidores?\n\nEle(a) não será notificado(a).`)) return
  try {
    await supabase.from('follows')
      .delete()
      .eq('follower_id', userId)
      .eq('following_id', authState.user.id)
    delete seguidoresMap.value[userId]
    seguidoresMap.value = { ...seguidoresMap.value }
    listaUsuarios.value = listaUsuarios.value.filter(u => u.id !== userId)
    contagemSeguidores.value = Math.max(0, contagemSeguidores.value - 1)
    mostrarToast(`@${username} foi removido(a) dos seus seguidores`, 'info')
  } catch {
    mostrarToast('Erro ao remover seguidor', 'error')
  }
}

async function toggleSeguir() {
  if (!authState.user?.id) return
  const alvoId = visitandoId.value || perfil.value.id
  const era = estaSegundoODono.value
  estaSegundoODono.value = !era
  seguindoMap.value = { ...seguindoMap.value, [alvoId]: !era }
  lsSave('seguindoMap_', seguindoMap.value)
  contagemSeguindo.value = era ? Math.max(0, contagemSeguindo.value - 1) : contagemSeguindo.value + 1
  try {
    if (era) await supabase.from('follows').delete().eq('follower_id', authState.user.id).eq('following_id', alvoId)
    else     await supabase.from('follows').insert({ follower_id: authState.user.id, following_id: alvoId })
    mostrarToast(era ? 'Deixou de seguir' : 'Seguindo!', era ? 'info' : 'success')
  } catch {
    estaSegundoODono.value = era
    seguindoMap.value = { ...seguindoMap.value, [alvoId]: era }
    lsSave('seguindoMap_', seguindoMap.value)
    contagemSeguindo.value = era ? contagemSeguindo.value + 1 : Math.max(0, contagemSeguindo.value - 1)
  }
  buscarContagens()
}

async function carregarComentarios(videoId) {
  carregandoComentarios.value = true
  const { data } = await supabase.from('comments')
    .select('*, profiles:user_id(username, avatar_url, verificado)')
    .eq('video_id', videoId).order('created_at', { ascending: true }).limit(200)
  const todos = (data || []).map(c => ({ ...c, curtidas_comt: 0, curtido: false, mostrarResposta: false }))
  // Filtra comentários que o usuário já apagou (persistidos no localStorage)
  comentarios.value = filtrarComentariosApagados(todos)
  carregandoComentarios.value = false
  await nextTick()
  if (comentariosListRef.value) comentariosListRef.value.scrollTop = comentariosListRef.value.scrollHeight
}

function iniciarRealtimeComentarios(videoId) {
  pararRealtimeComentarios()
  comentariosChannel = supabase.channel('comments_' + videoId)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `video_id=eq.${videoId}` }, async payload => {
      // Não exibe se o usuário já tinha apagado esse comentário
      try {
        const key = `cmt_deleted_${_uid()}`
        const deleted = new Set(JSON.parse(localStorage.getItem(key) || '[]'))
        if (deleted.has(String(payload.new.id))) return
      } catch {}
      const { data: prof } = await supabase.from('profiles').select('username, avatar_url, verificado').eq('id', payload.new.user_id).single()
      comentarios.value.push({ ...payload.new, profiles: prof, curtidas_comt: 0, curtido: false, mostrarResposta: false })
      statsVideo.value.comentarios++
      await nextTick()
      if (comentariosListRef.value) comentariosListRef.value.scrollTop = comentariosListRef.value.scrollHeight
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'comments', filter: `video_id=eq.${videoId}` }, payload => {
      comentarios.value = comentarios.value.filter(c => c.id !== payload.old.id)
      statsVideo.value.comentarios = Math.max(0, statsVideo.value.comentarios - 1)
    })
    .subscribe()
}

function pararRealtimeComentarios() {
  if (comentariosChannel) { supabase.removeChannel(comentariosChannel); comentariosChannel = null }
}

async function enviarComentario() {
  const texto = novoComentario.value?.trim()
  if (!texto || !authState.user?.id || enviandoComentario.value) return

  if (videoAberto.value?.user_id) {
    const { data: donoPerfil } = await supabase
      .from('profiles')
      .select('quem_pode_comentar')
      .eq('id', videoAberto.value.user_id)
      .maybeSingle()

    const restricao = donoPerfil?.quem_pode_comentar || 'todos'
    if (restricao === 'ninguem') {
      mostrarToast('Comentários desativados neste perfil', 'warning')
      return
    }
    if (restricao === 'seguidores') {
      const { data: fw } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', authState.user.id)
        .eq('following_id', videoAberto.value.user_id)
        .maybeSingle()
      if (!fw) {
        mostrarToast('Apenas seguidores podem comentar aqui', 'warning')
        return
      }
    }
  }

  const bloqueio = (config.value.conteudo?.palavrasBlocklist || [])
    .find(p => texto.toLowerCase().includes(p.toLowerCase()))
  if (bloqueio) { mostrarToast('Comentário contém palavra bloqueada', 'warning'); return }

  enviandoComentario.value = true
  try {
    const { data, error } = await supabase.from('comments').insert({
      video_id: videoAberto.value.id,
      user_id:  authState.user.id,
      texto
    }).select('*, profiles:user_id(username, avatar_url, verificado)').single()

    if (error) throw error

    comentarios.value.push({ ...data, curtidas_comt: 0, curtido: false, mostrarResposta: false })
    statsVideo.value.comentarios++
 novoComentario.value = ''

    const idxCard = meusVideos.value.findIndex(v => v.id === videoAberto.value.id)
    if (idxCard !== -1) {
      meusVideos.value[idxCard] = {
        ...meusVideos.value[idxCard],
        comments_count: statsVideo.value.comentarios
      }
    }
    ;[videosCurtidos, videosRepublicados].forEach(lista => {
      const i = lista.value.findIndex(v => v.id === videoAberto.value.id)
      if (i !== -1) lista.value[i] = {
        ...lista.value[i],
        comments_count: statsVideo.value.comentarios
      }
    })
    supabase.from('videos')
      .update({ comments_count: statsVideo.value.comentarios })
      .eq('id', videoAberto.value.id)
      .then(() => {})

    await nextTick()
    if (comentariosListRef.value)
      comentariosListRef.value.scrollTop = comentariosListRef.value.scrollHeight

  } catch (e) {
    mostrarToast('Erro ao comentar', 'error')
  } finally {
    enviandoComentario.value = false
  }
}

async function apagarComentario(c) {
  if (!confirm('Apagar comentário?')) return

  // Remove da UI imediatamente (optimistic update)
// Remove da UI imediatamente (optimistic update)
comentarios.value = comentarios.value.filter(x => x.id !== c.id)
statsVideo.value.comentarios = Math.max(0, statsVideo.value.comentarios - 1)

// Atualiza o contador no card da grid também
if (videoAberto.value) {
  
  const idxCard = meusVideos.value.findIndex(v => v.id === videoAberto.value.id)
  if (idxCard !== -1) {
    meusVideos.value[idxCard] = {
      ...meusVideos.value[idxCard],
      comments_count: Math.max(0, (meusVideos.value[idxCard].comments_count || 0) - 1)
    }
  }
  // Atualiza também nas listas de curtidos/salvos/republicados
  ;[videosCurtidos, videosRepublicados].forEach(lista => {
    const i = lista.value.findIndex(v => v.id === videoAberto.value.id)
    if (i !== -1) {
      lista.value[i] = {
        ...lista.value[i],
        comments_count: Math.max(0, (lista.value[i].comments_count || 0) - 1)
      }
    }
  })
}
  // Persiste no localStorage ANTES do request (garante que não volta mesmo se der erro de rede)
  try {
    const key = `cmt_deleted_${_uid()}`
    const deleted = JSON.parse(localStorage.getItem(key) || '[]')
    if (!deleted.includes(String(c.id))) {
      deleted.push(String(c.id))
      localStorage.setItem(key, JSON.stringify(deleted.slice(-200)))
    }
  } catch {}

  // Tenta deletar no banco — tenta com user_id primeiro, depois sem (para admins/donos do vídeo)
  try {
    let res = await supabase
      .from('comments')
      .delete()
      .eq('id', c.id)
      .eq('user_id', authState.user?.id)

    // Se RLS bloqueou ou não achou (pode ser dono do vídeo apagando comentário alheio)
    if (res.error) {
      const res2 = await supabase
        .from('comments')
        .delete()
        .eq('id', c.id)
      if (res2.error) throw res2.error
    }

   mostrarToast('Comentário apagado', 'info')

    if (videoAberto.value) {
      supabase.from('videos')
        .update({ comments_count: statsVideo.value.comentarios })
        .eq('id', videoAberto.value.id)
        .then(() => {})
    }
  } catch (e) {
    console.error('Erro ao apagar comentário no banco:', e?.message || e)
    // Mesmo com erro no banco, mantém removido da UI (localStorage garante)
    mostrarToast('Removido localmente (erro ao sincronizar)', 'warning')
  }
}

// Filtra comentários que o usuário já apagou (localStorage)
function filtrarComentariosApagados(lista) {
  try {
    const key = `cmt_deleted_${_uid()}`
    const deleted = new Set(JSON.parse(localStorage.getItem(key) || '[]'))
    return lista.filter(c => !deleted.has(String(c.id)))
  } catch { return lista }
}

function abrirVideo(video) {
  videoAberto.value = video
}
function fecharVideo() {
  videoAberto.value = null
}


function abrirMenuContexto(video, e) {
  e?.stopPropagation(); menuContextoVideo.value = video
  menuContexto.value = {
    x: Math.min(e?.clientX || 0, window.innerWidth - 185),
    y: Math.min(e?.clientY || 0, window.innerHeight - 270)
  }
}
function fecharMenuContexto() { menuContexto.value = null; menuContextoVideo.value = null }

async function excluirVideo(video, e) {
  e?.stopPropagation()
  if (!confirm('Excluir este vídeo?')) return
  try {
    await supabase.from('videos').delete().eq('id', video.id).eq('user_id', authState.user?.id)
    meusVideos.value = meusVideos.value.filter(v => v.id !== video.id)
    if (videoAberto.value?.id === video.id) fecharVideo()
    mostrarToast('Vídeo excluído', 'info')
  } catch { mostrarToast('Erro ao excluir', 'error') }
}

function abrirEdicaoVideo(video, e) {
  e?.stopPropagation(); editandoVideo.value = video
  rascunhoVideo.value = { titulo: video.titulo || video.title || '', descricao: video.descricao || video.description || '' }
  erroVideoEdicao.value = ''; salvandoVideo.value = false
}

async function salvarVideo() {
  if (!rascunhoVideo.value.titulo.trim()) { erroVideoEdicao.value = 'Título obrigatório.'; return }
  salvandoVideo.value = true
  try {
    await supabase.from('videos').update({ titulo: rascunhoVideo.value.titulo.trim(), descricao: rascunhoVideo.value.descricao.trim() })
      .eq('id', editandoVideo.value.id).eq('user_id', authState.user?.id)
    const idx = meusVideos.value.findIndex(v => v.id === editandoVideo.value.id)
    if (idx !== -1) meusVideos.value[idx] = { ...meusVideos.value[idx], ...rascunhoVideo.value }
    editandoVideo.value = null; mostrarToast('Atualizado!', 'success')
  } catch { erroVideoEdicao.value = 'Erro ao salvar.' } finally { salvandoVideo.value = false }
}

function abrirEdicao() {
  const p = authState.profile
  rascunho.value = { username: p?.username || '', nome: p?.nome || '', bio: p?.bio || '', website: p?.website || '', categoria: p?.categoria || '', genero: p?.genero || '' }
  fotoPreviewLocal.value = null; _novaFotoFile.value = null
  capaPreviewLocal.value = null; _novaCapaFile.value = null
  cropMode.value = false
  cropCapaMode.value = false
  erroEdicao.value = ''; editando.value = true
}

function onCapaChange(e) {
  const f = e.target.files[0]
  if (!f) return
  _novaCapaFile.value = f
  const url = URL.createObjectURL(f)
  capaPreviewLocal.value = url
  const img = new Image()
  img.onload = () => {
  cropCapaImg.value = img
  cropCapaScale.value = 1
  cropCapaOffsetX.value = 0
  cropCapaOffsetY.value = 0
  cropCapaMode.value = true
  nextTick(() => {
    desenharCropCapa()
  })
}
  img.src = url
}

async function salvarPerfil() {
  const u = rascunho.value.username?.trim()
  if (!u || u.length < 3 || !/^[a-zA-Z0-9_.]+$/.test(u)) { erroEdicao.value = 'Usuário inválido (mín. 3 chars, letras/números/_.'; return }
  if (!rascunho.value.nome?.trim()) { erroEdicao.value = 'Nome obrigatório.'; return }
  salvando.value = true; erroEdicao.value = ''
  try {
    const payload = { username: u, nome: rascunho.value.nome.trim(), bio: rascunho.value.bio?.trim() || '', categoria: rascunho.value.categoria || '', genero: rascunho.value.genero || '' }
    if (_novaFotoFile.value) { const url = await uploadAvatar(_novaFotoFile.value); if (url) payload.avatar_url = url }
    if (_novaCapaFile.value) {
      const fn = `capas/${_uid()}/${Date.now()}_capa`
      const { error } = await supabase.storage.from('avatars').upload(fn, _novaCapaFile.value, { upsert: true })
      if (!error) {
        const url = supabase.storage.from('avatars').getPublicUrl(fn).data.publicUrl
        payload.capa_url = url; capaPerfil.value = url; lsSave('capa_perfil_', url)
      }
    }
    if (rascunho.value.website?.trim()) payload.website = rascunho.value.website.trim()
    await updateProfile(payload)
    if (authState.profile) Object.assign(authState.profile, payload)
    editando.value = false; mostrarToast('Perfil atualizado!', 'success')
    reloadProfile().catch(() => {})
  } catch (e) { erroEdicao.value = e?.message || 'Erro ao salvar.' } finally { salvando.value = false }
}

async function abrirCompartilhar() {
  linkPerfil.value  = window.location.origin + '/perfil/' + perfil.value.username
  qrCarregando.value = true; modalCompartilhar.value = true; linkCopiado.value = false
  qrCodeUrl.value   = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(linkPerfil.value) + '&bgcolor=0d0d0d&color=ff6b35&margin=10'
  const img = new Image(); img.onload = () => { qrCarregando.value = false }; img.onerror = () => { qrCarregando.value = false }; img.src = qrCodeUrl.value
}

async function copiarLink() {
  try { await navigator.clipboard.writeText(linkPerfil.value); linkCopiado.value = true; setTimeout(() => { linkCopiado.value = false }, 2000); mostrarToast('Link copiado!', 'success') }
  catch { mostrarToast('Erro ao copiar', 'error') }
}

function abrirCriarDestaque() { novoDestaque.value = { titulo: '', cor: '#ff6b35' }; fotasPreview.value = []; fotasSelecionadas.value = []; criandoDestaque.value = true }

function selecionarFotosDestaque(e) {
  const files = Array.from(e.target.files); fotasSelecionadas.value.push(...files)
  files.forEach(f => fotasPreview.value.push(URL.createObjectURL(f)))
}

async function salvarDestaque() {
  if (!novoDestaque.value.titulo.trim() || !fotasPreview.value.length) {
    mostrarToast('Título e foto obrigatórios!', 'warning'); return
  }
  if (!authState.user?.id) return
  enviandoCapa.value = true
  try {
    const urls = []
    for (let i = 0; i < fotasSelecionadas.value.length; i++) {
      const file = fotasSelecionadas.value[i]
      const fn = `destaques/${_uid()}/${Date.now()}_${i}_${file.name}`
      const { error } = await supabase.storage.from('avatars').upload(fn, file, { upsert: true })
      if (!error) {
        urls.push(supabase.storage.from('avatars').getPublicUrl(fn).data.publicUrl)
      } else {
        mostrarToast('Erro ao enviar foto ' + (i + 1), 'error')
      }
    }
    if (!urls.length) { mostrarToast('Nenhuma foto enviada', 'error'); enviandoCapa.value = false; return }

    const payload = {
      user_id: authState.user.id,
      titulo:  novoDestaque.value.titulo.trim(),
      cor:     novoDestaque.value.cor || '#ff6b35',
      fotos:   urls,
    }
    console.log('payload destaque:', JSON.stringify(payload))

    const { data, error: errInsert } = await supabase
      .from('highlights')
      .insert(payload)
      .select()
      .single()

    if (errInsert) {
      console.error('Erro insert destaque:', errInsert)
      throw errInsert
    }

    destaques.value.push(data)
    criandoDestaque.value = false
    mostrarToast('Destaque criado!', 'success')
  } catch (e) {
    console.error('Erro ao salvar destaque:', e)
    mostrarToast('Erro ao criar destaque', 'error')
  } finally {
    enviandoCapa.value = false
  }
}

function abrirStory(hl) {
  storyViewer.value = { destaque: hl, index: 0 }
  storyProgress.value = 0
  iniciarTimerStory()
}

function iniciarTimerStory() {
  pararTimerStory()
  storyProgress.value = 0
 storyTimer = setInterval(() => {
  storyProgress.value += 0.8
  if (storyProgress.value >= 100) {
      storyProgress.value = 0
      const sv = storyViewer.value
      if (!sv) return pararTimerStory()
      const nextIdx = sv.index + 1
      if (nextIdx < sv.destaque.fotos.length) {
        storyViewer.value = { ...sv, index: nextIdx }
      } else {
        fecharStory()
      }
    }
  }, 40)
}

function pararTimerStory() {
  if (storyTimer) { clearInterval(storyTimer); storyTimer = null }
}

function fecharStory() {
  pararTimerStory()
  storyViewer.value = null
  storyProgress.value = 0
}

function storyAnterior() {
  if (!storyViewer.value) return
  const nextIdx = storyViewer.value.index - 1
  if (nextIdx >= 0) {
    storyViewer.value = { ...storyViewer.value, index: nextIdx }
    storyProgress.value = 0
    iniciarTimerStory()
  } else fecharStory()
}

function storyProximo() {
  if (!storyViewer.value) return
  const nextIdx = storyViewer.value.index + 1
  if (nextIdx < storyViewer.value.destaque.fotos.length) {
    storyViewer.value = { ...storyViewer.value, index: nextIdx }
    storyProgress.value = 0
    iniciarTimerStory()
  } else fecharStory()
}

async function excluirDestaque(id, direto = false) {
  const executar = async () => {
    try {
      const { error } = await supabase
        .from('highlights')
        .delete()
        .eq('id', id)
        .eq('user_id', authState.user?.id)
      if (error) throw error
      destaques.value = destaques.value.filter(d => d.id !== id)
      fecharStory()
      mostrarToast('Destaque removido!', 'info')
    } catch (e) {
      mostrarToast('Erro ao excluir destaque', 'error')
    }
  }

  if (direto) { await executar(); return }

  confirmar({
    titulo: 'Excluir destaque?',
    sub: 'Todas as fotos deste destaque serão apagadas permanentemente.',
    icone: 'lixeira',
    onConfirm: async () => {
      modalConfirm.value.show = false
      await executar()
    }
  })
}
async function excluirFotoAtual() {
  if (!storyViewer.value) return
  const destaque = storyViewer.value.destaque
  const indexAtual = storyViewer.value.index
  const umaFoto = destaque.fotos.length === 1

  confirmar({
    titulo: umaFoto ? 'Excluir destaque?' : 'Excluir esta foto?',
    sub: umaFoto
      ? 'É a última foto — o destaque inteiro será removido.'
      : `Foto ${indexAtual + 1} de ${destaque.fotos.length} será apagada permanentemente.`,
    icone: 'foto',
    onConfirm: async () => {
      modalConfirm.value.show = false
      const novasFotos = destaque.fotos.filter((_, i) => i !== indexAtual)
      try {
        if (novasFotos.length === 0) {
          await excluirDestaque(destaque.id, true)
          return
        }
        const { error } = await supabase
          .from('highlights')
          .update({ fotos: novasFotos })
          .eq('id', destaque.id)
          .eq('user_id', authState.user?.id)
        if (error) throw error
        const idx = destaques.value.findIndex(d => d.id === destaque.id)
        if (idx !== -1) destaques.value[idx].fotos = novasFotos
        const novoIndex = Math.min(indexAtual, novasFotos.length - 1)
        storyViewer.value = { ...storyViewer.value, destaque: { ...destaque, fotos: novasFotos }, index: novoIndex }
        storyProgress.value = 0
        iniciarTimerStory()
        mostrarToast('Foto removida!', 'info')
      } catch (e) {
        mostrarToast('Erro ao remover foto', 'error')
      }
    }
  })
}
async function excluirTodosDestaques() {
  confirmar({
    titulo: 'Excluir todos os destaques?',
    sub: `${destaques.value.length} destaque${destaques.value.length > 1 ? 's' : ''} serão apagados permanentemente. Isso não pode ser desfeito.`,
    icone: 'todos',
    onConfirm: async () => {
      modalConfirm.value.show = false
      try {
        const { error } = await supabase
          .from('highlights')
          .delete()
          .eq('user_id', authState.user?.id)
        if (error) throw error
        destaques.value = []
        fecharStory()
        mostrarToast('Todos os destaques removidos!', 'info')
      } catch (e) {
        mostrarToast('Erro ao excluir destaques', 'error')
      }
    }
  })
}

function abrirEditarDestaque(hl) {
  editandoDestaque.value = hl
  editandoDestaqueForm.value = {
    titulo: hl.titulo,
    cor: hl.cor || '#ff6b35',
    fotos: [...(hl.fotos || [])],
  }
  salvandoDestaque.value = false
}

async function salvarEdicaoDestaque() {
  if (!editandoDestaqueForm.value.titulo.trim()) {
    mostrarToast('Título obrigatório', 'warning'); return
  }
  salvandoDestaque.value = true
  try {
    if (!editandoDestaqueForm.value.fotos.length) {
  mostrarToast('Selecione ao menos uma foto', 'warning'); return
}
const { error } = await supabase
  .from('highlights')
  .update({
    titulo: editandoDestaqueForm.value.titulo.trim(),
    cor:    editandoDestaqueForm.value.cor,
    fotos:  editandoDestaqueForm.value.fotos,
  })
      .eq('id', editandoDestaque.value.id)
      .eq('user_id', authState.user?.id)
    if (error) throw error

    const idx = destaques.value.findIndex(d => d.id === editandoDestaque.value.id)
    if (idx !== -1) {
  destaques.value[idx].titulo = editandoDestaqueForm.value.titulo.trim()
  destaques.value[idx].cor    = editandoDestaqueForm.value.cor
  destaques.value[idx].fotos  = editandoDestaqueForm.value.fotos
}
    // Atualiza o story viewer se estiver aberto
    if (storyViewer.value?.destaque?.id === editandoDestaque.value.id) {
      storyViewer.value = {
        ...storyViewer.value,
        destaque: {
          ...storyViewer.value.destaque,
          titulo: editandoDestaqueForm.value.titulo.trim(),
          cor: editandoDestaqueForm.value.cor,
        }
      }
    }

    editandoDestaque.value = null
    mostrarToast('Destaque atualizado!', 'success')
  } catch (e) {
    mostrarToast('Erro ao salvar destaque', 'error')
  } finally {
    salvandoDestaque.value = false
  }
}

async function abrirLista(tipo) { modalLista.value = tipo; pesquisaLista.value = ''; await buscarLista(tipo); iniciarRealtime(tipo) }

async function buscarLista(tipo) {
  carregandoLista.value = true; listaUsuarios.value = []
  const id    = visitandoId.value || authState.user?.id
  const campo = tipo === 'seguidores' ? ['following_id', 'follower_id'] : ['follower_id', 'following_id']
  const { data } = await supabase.from('follows')
    .select(`${campo[1]}, profiles:${campo[1]}(id, username, nome, avatar_url, verificado)`)
    .eq(campo[0], id).order('created_at', { ascending: false }).limit(200)
  listaUsuarios.value = (data || []).map(r => r.profiles).filter(Boolean)
  carregandoLista.value = false
}

function iniciarRealtime(tipo) {
  if (realtimeChannel) { supabase.removeChannel(realtimeChannel); realtimeChannel = null }
  const id    = visitandoId.value || authState.user?.id
  const filtro = tipo === 'seguidores' ? `following_id=eq.${id}` : `follower_id=eq.${id}`
  realtimeChannel = supabase.channel(`follows_${tipo}_${id}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'follows', filter: filtro }, () => buscarLista(tipo))
    .subscribe()
}

function fecharLista() { modalLista.value = null; if (realtimeChannel) { supabase.removeChannel(realtimeChannel); realtimeChannel = null }; buscarContagens() }

async function marcarNotifLida(id) {
  await supabase.from('notificacoes').update({ lida: true }).eq('id', id)
  const idx = notificacoes.value.findIndex(n => n.id === id)
  if (idx !== -1) notificacoes.value[idx].lida = true
  notifNaoLidas.value = notificacoes.value.filter(n => !n.lida).length
}

async function marcarTodasLidas() {
  await supabase.from('notificacoes')
    .update({ lida: true })
    .eq('to_user_id', authState.user.id)
    .eq('lida', false)
  notificacoes.value.forEach(n => n.lida = true)
  notifNaoLidas.value = 0
  mostrarToast('Todas marcadas como lidas', 'success')
}

function abrirReportar(item) { reportandoItem.value = item; motivoReporte.value = ''; modalReportar.value = true; menuContexto.value = null }
async function enviarReporte() { if (!motivoReporte.value) { mostrarToast('Selecione um motivo', 'warning'); return }; mostrarToast('Reporte enviado!', 'success'); modalReportar.value = false }
async function enviarMensagem() { if (!textoMensagem.value.trim()) return; mostrarToast('Mensagem enviada!', 'success'); modalMensagem.value = false; textoMensagem.value = '' }

async function adicionarPalavraBlocklist() {
  const p = novaPalavraBlocklist.value.trim().toLowerCase()
  if (!p) return
  if (!config.value.conteudo.palavrasBlocklist) config.value.conteudo.palavrasBlocklist = []
  if (!config.value.conteudo.palavrasBlocklist.includes(p)) {
    config.value.conteudo.palavrasBlocklist.push(p)
    await salvarConteudoImediato()
    mostrarToast('Palavra bloqueada adicionada', 'success')
  }
  novaPalavraBlocklist.value = ''
}

async function removerPalavraBlocklist(p) {
  config.value.conteudo.palavrasBlocklist = config.value.conteudo.palavrasBlocklist.filter(x => x !== p)
  await salvarConteudoImediato()
}

async function fazerLogout() { if (!confirm('Sair da conta?')) return; try { await supabase.auth.signOut(); router.push('/login') } catch { mostrarToast('Erro ao sair', 'error') } }
function irParaPerfil(userId, username) {
  console.log('irParaPerfil chamado:', userId, username)
  router.push({ name: 'ProfileUser', params: { username: username || userId } })
}
function onScroll(e) { headerFixo.value = e.target.scrollTop > 180 }

const CARD_W = 172

function calcSuggState() {
  const el = sugestoesListRef.value
  if (!el) return
  suggScrollLeft.value = el.scrollLeft
  suggAtEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8
  const total = Math.ceil(el.scrollWidth / CARD_W)
  suggDots.value = Math.max(1, Math.min(total, 8))
  suggActiveDot.value = Math.round(el.scrollLeft / CARD_W) + 1
}

function onSuggScroll() { calcSuggState() }

function suggScroll(dir) {
  const el = sugestoesListRef.value
  if (!el) return
  el.scrollBy({ left: dir * CARD_W * 2, behavior: 'smooth' })
  setTimeout(calcSuggState, 350)
}

function suggScrollTo(pos) {
  const el = sugestoesListRef.value
  if (!el) return
  el.scrollTo({ left: pos, behavior: 'smooth' })
  setTimeout(calcSuggState, 350)
}

// ── Click no card: navega para o perfil ─────────────────────────────────────
// Sem drag manual — o overflow-x: auto do CSS cuida do scroll.
// Clique no card = navegar. Clique no botão = seguir/deixar de seguir (@click.stop).
function onSuggCardClick(userId, username) {
  console.log('onSuggCardClick chamado, _suggDragging:', _suggDragging, userId, username)
  if (_suggDragging) return
  irParaPerfil(userId, username)
}

async function buscarGifs(q) {
  if (!q.trim()) { gifResultados.value = []; return }
  gifCarregando.value = true
  try {
    // Tenor API v1 — mais estável, funciona sem chave privada
    const url = `https://api.tenor.com/v1/search?q=${encodeURIComponent(q)}&key=${TENOR_KEY}&limit=24&media_filter=minimal&contentfilter=medium&locale=pt_BR`
    const res  = await fetch(url)
    if (!res.ok) throw new Error('Tenor HTTP ' + res.status)
    const data = await res.json()

    gifResultados.value = (data.results || []).map(r => {
      const media = r.media?.[0] || {}
      return {
        id:      r.id,
        preview: media.tinygif?.url || media.gif?.url || '',
        url:     media.gif?.url     || media.tinygif?.url || '',
        title:   r.title || q,
      }
    }).filter(g => g.preview && g.url)

    if (!gifResultados.value.length) {
      mostrarToast('Nenhum GIF encontrado para "' + q + '"', 'info')
    }
  } catch (e) {
    console.error('Tenor error:', e)
    gifResultados.value = []
    mostrarToast('Erro ao buscar GIFs — verifique sua conexão', 'error')
  }
  gifCarregando.value = false
}

let _gifDebounce = null
function onGifInput() {
  clearTimeout(_gifDebounce)
  _gifDebounce = setTimeout(() => buscarGifs(gifQuery.value), 400)
}

async function enviarGif(gif) {
  if (!authState.user?.id || !videoAberto.value) return
  gifPickerAberto.value = false
  gifQuery.value = ''
  gifResultados.value = []
  try {
    await supabase.from('comments').insert({
      video_id: videoAberto.value.id,
      user_id:  authState.user.id,
      texto:    `[GIF]${gif.url}`,
    })
  } catch { mostrarToast('Erro ao enviar GIF', 'error') }
}

function fecharGifPicker() {
  gifPickerAberto.value = false
  gifQuery.value = ''
  gifResultados.value = []
}

onMounted(async () => {
  const usernameParam = route.params?.username
  if (usernameParam) {
    const { data } = await supabase.from('profiles').select('*').eq('username', usernameParam).single()
    if (data) {
      visitandoId.value     = data.id
      visitandoPerfil.value = data
      if (authState.user) {
        const { data: fw } = await supabase.from('follows').select('id').eq('follower_id', authState.user.id).eq('following_id', data.id).maybeSingle()
        estaSegundoODono.value = !!fw
      }
    }
  }
  carregarLocal()
  await nextTick()
  aplicarTema(temaAtual.value)
  await reloadProfile()
  await carregarConfigSupabase()
  await Promise.all([buscarContagens(), carregarMaps()])
  await carregarTudo()
await carregarDestaques()
await carregarNotificacoes()

  const alvoId = authState.user?.id
  if (alvoId) {
    followsChannel = supabase.channel('contagem_follows_' + alvoId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'follows', filter: 'following_id=eq.' + alvoId }, () => buscarContagens())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'follows', filter: 'follower_id=eq.' + alvoId }, () => { buscarContagens(); carregarMaps() })
      .subscribe()
  }

  document.addEventListener('click', e => { if (menuContexto.value && !e.target.closest('.pv-menu-ctx')) fecharMenuContexto() })
})

onUnmounted(() => {
  pararRealtimeComentarios()
  pararTimerStory()
  if (followsChannel)   supabase.removeChannel(followsChannel)
  if (realtimeChannel)  supabase.removeChannel(realtimeChannel)
})
</script>

<template>
  <div class="pv-root" :data-tema="temaAtual" ref="pvRootRef" @scroll.passive="onScroll">

    <!-- ░░ HERO / CAPA — SEM botão externo de trocar capa ░░ -->
    <div class="pv-hero">
      <img v-if="perfil.capa || capaPreviewLocal" :src="capaPreviewLocal || perfil.capa" class="pv-hero-img" />
      <div v-else class="pv-hero-placeholder"></div>
      <div class="pv-hero-overlay"></div>
    </div>

    <!-- ░░ STICKY BAR ░░ -->
    <transition name="pv-bar-anim">
      <div v-if="headerFixo" class="pv-bar">
        <button class="pv-bar-back" @click="router.back()">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <div class="pv-bar-identity">
          <div class="pv-bar-av-wrap"><img :src="perfil.avatar" class="pv-bar-av" /></div>
          <span class="pv-bar-nome">{{ perfil.nome }}</span>
          <span v-if="perfil.verificado" class="pv-badge-check">✓</span>
        </div>
        <div class="pv-bar-right">
          <button v-if="ehMeuPerfil" class="pv-bar-btn" @click="modalNotificacoes = true">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
            <span v-if="notifNaoLidas > 0" class="pv-pip">{{ notifNaoLidas }}</span>
          </button>
          <button v-if="ehMeuPerfil" class="pv-bar-btn" @click="modalConfig = true">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
          </button>
        </div>
      </div>
    </transition>

   <div class="pv-body">

 
      <!-- ── IDENTITY CARD ── -->
      <div class="pv-identity">
        <div class="pv-ig-top">
          <div class="pv-av-ring" :class="{ 'pv-av-ring--own': ehMeuPerfil, 'pv-av-ring--story': destaques.length > 0 }">
            <img :src="fotoPreviewLocal || perfil.avatar" class="pv-av-img" @click="destaques.length > 0 ? abrirStory(destaques[0]) : null" :style="destaques.length > 0 ? 'cursor:pointer' : ''" />
            <label v-if="ehMeuPerfil" class="pv-av-change">
              <input type="file" accept="image/*" @change="onAvatarChange" hidden />
              <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
            </label>
            <div v-if="perfil.privado" class="pv-av-lock">
              <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
            </div>
          </div>

          <div class="pv-ig-right">
            <div class="pv-ig-nameline">
              <h1 class="pv-name">{{ perfil.username }}</h1>
              <span v-if="perfil.verificado" class="pv-verified">
                <svg viewBox="0 0 20 20" width="18" height="18" fill="none"><circle cx="10" cy="10" r="10" fill="url(#vg2)"/><path d="M6 10.5l2.5 2.5 5.5-5.5" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="vg2" x1="0" y1="0" x2="20" y2="20"><stop offset="0%" stop-color="#ff6b35"/><stop offset="100%" stop-color="#f72585"/></linearGradient></defs></svg>
              </span>
            </div>

            <div class="pv-ig-stats">
              <div class="pv-ig-stat">
                <span class="pv-ig-stat-n">{{ formatarNumero(meusVideos.length) }}</span>
                <span class="pv-ig-stat-l">publicações</span>
              </div>
              <button class="pv-ig-stat" @click="abrirLista('seguidores')">
                <span class="pv-ig-stat-n">{{ formatarNumero(perfil.seguidores) }}</span>
                <span class="pv-ig-stat-l">seguidores</span>
              </button>
              <button class="pv-ig-stat" @click="ehMeuPerfil ? abrirLista('seguindo') : null">
                <span class="pv-ig-stat-n">{{ formatarNumero(perfil.seguindo) }}</span>
                <span class="pv-ig-stat-l">seguindo</span>
              </button>
            </div>

            <div class="pv-ig-actions">
              <template v-if="ehMeuPerfil">
                <button class="pv-ig-btn pv-ig-btn--solid" @click="abrirEdicao">Editar perfil</button>
                <button class="pv-ig-btn pv-ig-btn--solid" @click="abrirCompartilhar">Compartilhar</button>
                <button class="pv-ig-icon-btn pv-cfg-main-btn" @click="modalConfig = true" title="Configurações">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
                </button>
                <button class="pv-ig-icon-btn" @click="modalNotificacoes = true" title="Notificações" style="position:relative">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
                  <span v-if="notifNaoLidas > 0" class="pv-pip">{{ notifNaoLidas }}</span>
                </button>
              </template>
           <template v-else>
  <button class="pv-ig-icon-btn" @click="router.back()" title="Voltar">
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
    </svg>
  </button>
  <button class="pv-ig-btn" :class="estaSegundoODono ? 'pv-ig-btn--following' : 'pv-ig-btn--follow'" @click="toggleSeguir">
    {{ estaSegundoODono ? 'Seguindo' : 'Seguir' }}
  </button>
  <button class="pv-ig-btn pv-ig-btn--solid" @click="modalMensagem = true">Mensagem</button>
  <button class="pv-ig-icon-btn" @click="abrirCompartilhar" title="Compartilhar">
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
  </button>
</template>
            </div>
          </div>
        </div>

        <!-- Bio abaixo com mais espaço -->
        <div class="pv-ig-bio-block">
          <p class="pv-ig-nome-real">{{ perfil.nome }}</p>
          <span v-if="perfil.categoria" class="pv-ig-cat">{{ perfil.categoria }}</span>
          <p v-if="perfil.bio" class="pv-ig-bio">{{ perfil.bio }}</p>
          <a v-if="perfil.website"
            :href="perfil.website.startsWith('http') ? perfil.website : 'https://'+perfil.website"
            target="_blank" class="pv-ig-link">
            {{ perfil.website.replace(/^https?:\/\//, '') }}
          </a>
          <span v-if="perfil.privado" class="pv-private-chip">Conta privada</span>
        </div>
      </div>

      <!-- ░░ DESTAQUES ░░ -->
      <div class="pv-hl-section">
        <div class="pv-hl-track">
          <div v-if="ehMeuPerfil" class="pv-hl-new-item" @click="abrirCriarDestaque">
            <div class="pv-hl-new-circle">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" style="opacity:.5"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            </div>
            <span class="pv-hl-lbl">Novo</span>
          </div>

          <div v-for="hl in destaques" :key="hl.id" class="pv-hl-item" @click="abrirStory(hl)">
            <div class="pv-hl-ring-wrap" :style="`--ring: ${hl.cor || '#ff6b35'}`">
              <div class="pv-hl-ring-border">
                <div class="pv-hl-thumb-wrap">
                  <img :src="hl.fotos?.[0]" class="pv-hl-thumb-img" />
                </div>
              </div>
              <div v-if="hl.fotos?.length > 1" class="pv-hl-multi-badge">{{ hl.fotos.length }}</div>
            </div>
            <span class="pv-hl-lbl">{{ hl.titulo }}</span>
          </div>

          <div v-if="!destaques.length && !ehMeuPerfil" class="pv-hl-empty">Sem destaques</div>
        </div>
      </div>

      <!-- ░░ SUGESTÕES ░░ -->
      <div class="pv-section">
        <div class="pv-sec-head">
          <span class="pv-sec-label">Sugestões para você</span>
        </div>
        <div class="pv-sugg-outer" ref="sugestoeOuterRef">
          <div v-if="carregando" class="pv-sugg-track">
            <div class="pv-sugg-skel" v-for="i in 5" :key="i"></div>
          </div>
          <div v-else class="pv-sugg-track" ref="sugestoesListRef"
            @scroll.passive="onSuggScroll">
            <!--
              CORREÇÃO: @click chama onSuggCardClick que verifica hasDragged
              antes de navegar — evita navegação acidental ao arrastar o carrossel
            -->
          <div v-for="user in usuariosSugeridos" :key="user.id"
  class="pv-sugg-card"
  @mousedown="e => { _suggDragX = e.clientX; _suggDragging = false }"
  @mousemove="e => { if (Math.abs(e.clientX - _suggDragX) > 8) _suggDragging = true }"
  @touchstart.passive="e => { _suggDragX = e.touches[0].clientX; _suggDragging = false }"
  @touchmove.passive="e => { if (Math.abs(e.touches[0].clientX - _suggDragX) > 8) _suggDragging = true }"
  @mouseup="() => { if (!_suggDragging) irParaPerfil(user.id, user.username) }"
  @click.stop>
              <div class="pv-sugg-av-wrap">
               <img :src="user.avatar_url || '/default-avatar.svg'" class="pv-sugg-av" />
                <span v-if="user.verificado" class="pv-sugg-check">✓</span>
              </div>
              <div class="pv-sugg-info">
                <p class="pv-sugg-user">@{{ user.username }}</p>
                <p v-if="user.nome" class="pv-sugg-nome">{{ user.nome }}</p>
                <p class="pv-sugg-bio">{{ user.bio ? user.bio.slice(0, 52) + (user.bio.length > 52 ? '…' : '') : '' }}</p>
              </div>
              <button class="pv-sugg-btn"
                :class="{
                  'pv-sugg-btn--on':   estouSeguindo[user.id],
                  'pv-sugg-btn--back': !estouSeguindo[user.id] && seguidoresMap[user.id]
                }"
                @click.stop="toggleSeguirUsuario(user.id, user.username)">
                {{ estouSeguindo[user.id] ? 'Seguindo' : (seguidoresMap[user.id] ? 'Seguir de volta' : 'Seguir') }}
              </button>
            </div>
            <div v-if="!usuariosSugeridos.length" class="pv-sugg-empty">Nenhuma sugestão por enquanto.</div>
          </div>

          <button class="pv-sugg-nav pv-sugg-nav--prev" :class="{ 'pv-sugg-nav--hidden': suggScrollLeft <= 8 }" @click="suggScroll(-1)" aria-label="Anterior">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </button>
          <button class="pv-sugg-nav pv-sugg-nav--next" :class="{ 'pv-sugg-nav--hidden': suggAtEnd }" @click="suggScroll(1)" aria-label="Próximo">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
          </button>
          <div class="pv-sugg-fade-r"></div>
        </div>

        <div class="pv-sugg-dots">
          <span v-for="i in suggDots" :key="i"
            class="pv-sugg-dot" :class="{ 'pv-sugg-dot--on': i === suggActiveDot }"
            @click="suggScrollTo((i-1) * CARD_W * 2)"></span>
        </div>
      </div>

      <!-- ░░ PUBLICAÇÕES ░░ -->
      <div class="pv-pub-section">
        <div class="pv-pub-header">
          <div class="pv-search-wrap">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" class="pv-search-icon"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            <input v-model="pesquisaPerfil" placeholder="Buscar publicações…" class="pv-search-inp" />
            <button v-if="pesquisaPerfil" @click="pesquisaPerfil = ''" class="pv-search-x">✕</button>
          </div>
          <div class="pv-tabs">
            <button v-for="tab in [
              { key:'VÍDEOS',       label:'Vídeos',   count: meusVideos.length },
              { key:'CURTIDOS',     label:'Curtidos', count: videosCurtidos.length },
              { key:'REPUBLICADOS', label:'Reposts',  count: videosRepublicados.length }
            ]" :key="tab.key"
              class="pv-tab"
              :class="{ 'pv-tab--on': abaAtiva === tab.key }"
              @click="abaAtiva = tab.key">
              <span class="pv-tab-lbl">{{ tab.label }}</span>
              <span v-if="tab.count > 0" class="pv-tab-count">{{ tab.count }}</span>
            </button>
          </div>
        </div>

        <template v-if="!podeVerVideo">
          <div class="pv-empty">
            <div class="pv-empty-icon">
              <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            </div>
            <p class="pv-empty-msg">Este perfil restringe a visualização dos vídeos</p>
          </div>
        </template>
        <template v-else>
          <div v-if="carregando" class="pv-grid">
            <div v-for="i in 9" :key="i" class="pv-card pv-card--skel"></div>
          </div>
          <div v-else class="pv-grid">
            <div v-for="v in videosFiltrados" :key="v.id" class="pv-card"
              @click="abrirVideo(v)" @contextmenu.prevent="abrirMenuContexto(v, $event)">

              <!-- MÍDIA -->
              <img v-if="v.thumbnail_url" :src="v.thumbnail_url" loading="lazy" class="pv-card-media" />
              <video v-else-if="v.video_url || v.url" :src="v.video_url || v.url" class="pv-card-media"
                muted preload="metadata" @loadedmetadata="e => e.target.currentTime=1" />
              <div v-else class="pv-card-empty">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor" style="opacity:.18"><path d="M8 5v14l11-7z"/></svg>
              </div>

              <!-- PLAY ICON centralizado -->
              <div class="pv-card-play-icon">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M8 5v14l11-7z"/></svg>
              </div>

              <!-- GRADIENTE -->
              <div class="pv-card-grad"></div>

              <!-- TOPO: tag de aba ativa -->
              <div class="pv-card-top">
                <span v-if="abaAtiva==='CURTIDOS'" class="pv-card-tag pv-card-tag--liked">
                  <svg viewBox="0 0 24 24" width="8" height="8" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  Curtido
                </span>
             
                <span v-else-if="abaAtiva==='REPUBLICADOS'" class="pv-card-tag pv-card-tag--repost">
                  <svg viewBox="0 0 24 24" width="8" height="8" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
                  Repost
                </span>
              </div>

            </div>

            <div v-if="!videosFiltrados.length && !carregando" class="pv-empty">
              <div class="pv-empty-icon">
                <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M10 9l5 3-5 3V9z"/></svg>
              </div>
              <p class="pv-empty-msg">
                {{ pesquisaPerfil ? `Nenhum resultado para "${pesquisaPerfil}"`
                  : abaAtiva === 'CURTIDOS'     ? 'Nenhum vídeo curtido ainda.'
                  : abaAtiva === 'REPUBLICADOS' ? 'Nenhum repost ainda.'
                  : 'Nenhuma publicação ainda.' }}
              </p>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- ░░ MENU CONTEXTO ░░ -->
    <transition name="pv-ctx-anim">
      <div v-if="menuContexto" class="pv-ctx pv-menu-ctx" :style="{ top: menuContexto.y+'px', left: menuContexto.x+'px' }">
        <button @click="abrirVideo(menuContextoVideo); fecharMenuContexto()">Assistir</button>
        <button @click="toggleCurtir(menuContextoVideo.id); fecharMenuContexto()">{{ curtidasMap[menuContextoVideo?.id] ? 'Descurtir' : 'Curtir' }}</button>
        <button @click="toggleSalvar(menuContextoVideo.id); fecharMenuContexto()">{{ salvosMap[menuContextoVideo?.id] ? 'Remover salvo' : 'Salvar' }}</button>
        <button @click="toggleRepost(menuContextoVideo.id); fecharMenuContexto()">{{ repostMap[menuContextoVideo?.id] ? 'Desfazer repost' : 'Repostar' }}</button>
        <div class="pv-ctx-sep"></div>
        <button v-if="ehMeuPerfil" @click="abrirEdicaoVideo(menuContextoVideo, $event); fecharMenuContexto()">Editar</button>
        <button v-if="ehMeuPerfil" class="pv-ctx-danger" @click="excluirVideo(menuContextoVideo, $event); fecharMenuContexto()">Excluir</button>
        <button v-if="!ehMeuPerfil" class="pv-ctx-danger" @click="abrirReportar({ tipo: 'video', id: menuContextoVideo?.id }); fecharMenuContexto()">Reportar</button>
      </div>
    </transition>

    <!-- ══════════════════════ STORY VIEWER ══════════════════════ -->
    <transition name="pv-modal-anim">
      <div v-if="storyViewer" class="pv-story-overlay" @click.self="fecharStory">
        <div class="pv-story-container">
          <div class="pv-story-bars">
            <div v-for="(foto, i) in storyViewer.destaque.fotos" :key="i" class="pv-story-bar">
              <div class="pv-story-bar-fill" :style="{ width: i < storyViewer.index ? '100%' : i === storyViewer.index ? storyProgress + '%' : '0%' }"></div>
            </div>
          </div>
          <div class="pv-story-header">
            <div class="pv-story-who">
              <img :src="perfil.avatar" class="pv-story-av" />
              <div>
                <p class="pv-story-user">@{{ perfil.username }}</p>
                <p class="pv-story-titulo">{{ storyViewer.destaque.titulo }}</p>
              </div>
            </div>
            <div class="pv-story-hd-right">
  <button class="pv-story-close" @click="fecharStory">✕</button>
  <template v-if="ehMeuPerfil">
    <button class="pv-story-edit" @click="abrirEditarDestaque(storyViewer.destaque)" title="Editar destaque">
      <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
    </button>
    <button class="pv-story-del" @click="excluirFotoAtual" title="Excluir esta foto">
      <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
    </button>
    <button class="pv-story-del pv-story-del--all" @click="excluirTodosDestaques" title="Excluir todos os destaques">
      <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
      <span style="font-size:9px;font-weight:800;letter-spacing:.3px">TODOS</span>
    </button>
  </template>
</div>
          </div>
          <img :src="storyViewer.destaque.fotos[storyViewer.index]" class="pv-story-img" />
          <div class="pv-story-ctrl-left" @click="storyAnterior"></div>
          <div class="pv-story-ctrl-right" @click="storyProximo"></div>
          <div class="pv-story-counter">{{ storyViewer.index + 1 }} / {{ storyViewer.destaque.fotos.length }}</div>
        </div>
      </div>
    </transition>

    <!-- ══════════════════════ MODAIS ══════════════════════ -->

 <!-- ══════════════════════ PLAYER DE VÍDEO ══════════════════════ -->
<transition name="pv-modal-anim">
  <div v-if="videoAberto" class="pv-overlay pv-overlay--player" @click.self="fecharVideo">
    <div class="pv-player-simple">
      <button class="pv-player-simple-close" @click="fecharVideo">✕</button>
      <video
        v-if="videoAberto.video_url || videoAberto.url"
        :src="videoAberto.video_url || videoAberto.url"
        controls autoplay
        class="pv-player-simple-video"
      />
      <img
        v-else-if="videoAberto.thumbnail_url"
        :src="videoAberto.thumbnail_url"
        class="pv-player-simple-video"
      />
      <div v-else class="pv-player-simple-null">
        <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor" style="opacity:.2"><path d="M8 5v14l11-7z"/></svg>
        <span>Mídia indisponível</span>
      </div>
    </div>
  </div>
</transition>

    <!-- ════════════ CONFIGURAÇÕES ════════════ -->
    <transition name="pv-modal-anim">
      <div v-if="modalConfig" class="pv-overlay" @click.self="modalConfig=false">
        <div class="pv-modal pv-cfg-modal">
          <div class="pv-modal-hd" style="padding:20px 22px 0">
            <h3>Configurações</h3>
            <button class="pv-close" @click="modalConfig=false">✕</button>
          </div>
          <div class="pv-cfg-layout">
            <div class="pv-cfg-nav">
              <button v-for="tab in [
                ['conta',        'Conta'],
                ['privacidade',  'Privacidade'],
                ['notificacoes', 'Notificações'],
                ['aparencia',    'Aparência'],
                ['seguranca',    'Segurança'],
                ['conteudo',     'Conteúdo'],
              ]" :key="tab[0]"
                class="pv-cfg-tab"
                :class="{active: abaConfig===tab[0]}"
                @click="abaConfig=tab[0]">
                {{ tab[1] }}
              </button>
              <div class="pv-cfg-sep"></div>
              <button class="pv-cfg-tab pv-cfg-logout" @click="fazerLogout">Sair da conta</button>
            </div>

            <div class="pv-cfg-body">

              <!-- ── CONTA ── -->
              <div v-if="abaConfig==='conta'">
                <p class="pv-cfg-sec">Informações</p>
                <div class="pv-cfg-row">
                  <div class="pv-cfg-row-info">
                    <span class="pv-cfg-row-label">Usuário</span>
                    <span class="pv-cfg-val">@{{ perfil.username }}</span>
                  </div>
                  <button class="pv-cfg-edit-btn" @click="abrirEdicao(); modalConfig=false">Editar</button>
                </div>
                <div class="pv-cfg-row">
                  <div class="pv-cfg-row-info">
                    <span class="pv-cfg-row-label">Nome</span>
                    <span class="pv-cfg-val">{{ perfil.nome }}</span>
                  </div>
                </div>
                <div class="pv-cfg-row">
                  <div class="pv-cfg-row-info">
                    <span class="pv-cfg-row-label">E-mail</span>
                    <span class="pv-cfg-val pv-cfg-masked">
                      {{ mostrarEmail ? (authState.user?.email || '—') : maskEmail(authState.user?.email) }}
                    </span>
                  </div>
                  <button class="pv-cfg-eye-btn" @click="mostrarEmail = !mostrarEmail">
                    <svg v-if="!mostrarEmail" viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                    <svg v-else viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>
                  </button>
                </div>
                <div class="pv-cfg-row">
                  <div class="pv-cfg-row-info">
                    <span class="pv-cfg-row-label">Membro desde</span>
                    <span class="pv-cfg-val">{{ authState.user?.created_at ? new Date(authState.user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : '—' }}</span>
                  </div>
                </div>
                <div class="pv-cfg-row">
                  <div class="pv-cfg-row-info">
                    <span class="pv-cfg-row-label">Verificado</span>
                    <span class="pv-cfg-val">{{ perfil.verificado ? 'Sim ✓' : 'Não' }}</span>
                  </div>
                  <button v-if="!perfil.verificado" class="pv-cfg-edit-btn" :disabled="solicitandoVerif" @click="solicitarVerificacao">
                    <span v-if="solicitandoVerif" class="pv-spinner"></span>
                    {{ solicitandoVerif ? 'Enviando…' : 'Solicitar' }}
                  </button>
                  <span v-else class="pv-cfg-val" style="color:var(--accent);font-weight:700">Verificado</span>
                </div>

                <p class="pv-cfg-sec" style="margin-top:20px;color:#ff4444">Zona de perigo</p>
                <div class="pv-danger-zone">
                  <button class="pv-danger-btn pv-danger-btn--red" :disabled="excluindoConta" @click="excluirConta">
                    <span v-if="excluindoConta" class="pv-spinner" style="border-top-color:#ff3333"></span>
                    {{ excluindoConta ? 'Excluindo…' : 'Excluir conta' }}
                  </button>
                </div>
              </div>

              <!-- ── PRIVACIDADE ── -->
              <div v-if="abaConfig==='privacidade'">
                <p class="pv-cfg-sec">Visibilidade</p>
                <div class="pv-cfg-toggle">
                  <div class="pv-cfg-toggle-info">
                    <span>Conta privada</span>
                    <small class="pv-cfg-toggle-sub">Apenas seguidores aprovados verão seus vídeos.</small>
                  </div>
                  <label class="pv-sw">
                    <input type="checkbox" v-model="config.privacidade.contaPrivada" @change="salvarPrivacidadeImediato" />
                    <span class="pv-sw-track"></span>
                  </label>
                </div>
                <div class="pv-cfg-toggle">
                  <div class="pv-cfg-toggle-info">
                    <span>Mostrar atividade online</span>
                    <small class="pv-cfg-toggle-sub">Exibir ponto verde quando você está online.</small>
                  </div>
                  <label class="pv-sw">
                    <input type="checkbox" v-model="config.privacidade.atividadeOnline" @change="salvarPrivacidadeImediato" />
                    <span class="pv-sw-track"></span>
                  </label>
                </div>
                <div class="pv-cfg-toggle">
                  <div class="pv-cfg-toggle-info">
                    <span>Permitir compartilhamento dos meus vídeos</span>
                    <small class="pv-cfg-toggle-sub">Outros podem compartilhar seus vídeos para fora da plataforma.</small>
                  </div>
                  <label class="pv-sw">
                    <input type="checkbox" v-model="config.privacidade.permitirCompartilhamento" @change="salvarPrivacidadeImediato" />
                    <span class="pv-sw-track"></span>
                  </label>
                </div>
                <p class="pv-cfg-sec" style="margin-top:16px">Interações</p>
                <div class="pv-cfg-row">
                  <div class="pv-cfg-row-info">
                    <span class="pv-cfg-row-label">Quem pode comentar</span>
                  </div>
                  <select v-model="config.privacidade.quemPodeComentar" class="pv-sel" style="width:140px" @change="salvarPrivacidadeImediato">
                    <option value="todos">Todos</option>
                    <option value="seguidores">Seguidores</option>
                    <option value="ninguem">Ninguém</option>
                  </select>
                </div>
                <div class="pv-cfg-row">
                  <div class="pv-cfg-row-info">
                    <span class="pv-cfg-row-label">Quem pode ver meus vídeos</span>
                  </div>
                  <select v-model="config.privacidade.quemPodeVerVideos" class="pv-sel" style="width:140px" @change="salvarPrivacidadeImediato">
                    <option value="todos">Todos</option>
                    <option value="seguidores">Seguidores</option>
                    <option value="somente_eu">Somente eu</option>
                  </select>
                </div>
                <div class="pv-cfg-row">
                  <div class="pv-cfg-row-info">
                    <span class="pv-cfg-row-label">Quem pode me enviar mensagem</span>
                  </div>
                  <select v-model="config.privacidade.quemPodeEnviarMensagem" class="pv-sel" style="width:140px" @change="salvarPrivacidadeImediato">
                    <option value="todos">Todos</option>
                    <option value="seguidores">Seguidores</option>
                    <option value="ninguem">Ninguém</option>
                  </select>
                </div>
                <p class="pv-cfg-sync-hint">
                  <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                  Alterações salvas automaticamente
                </p>
              </div>

              <!-- ── NOTIFICAÇÕES ── -->
              <div v-if="abaConfig==='notificacoes'">
                <p class="pv-cfg-sec">O que deseja receber</p>
                <div class="pv-cfg-toggle" v-for="(lbl,key) in {
                  seguidos:    'Novos seguidores',
                  curtidas:    'Curtidas nos meus vídeos',
                  comentarios: 'Comentários',
                  mensagens:   'Mensagens diretas'
                }" :key="key">
                  <span>{{ lbl }}</span>
                  <label class="pv-sw">
                    <input type="checkbox" v-model="config.notificacoes[key]" @change="salvarNotificacoesImediato" />
                    <span class="pv-sw-track"></span>
                  </label>
                </div>
                <p class="pv-cfg-sync-hint">
                  <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                  Preferências salvas automaticamente
                </p>
              </div>

              <!-- ── APARÊNCIA ── -->
              <div v-if="abaConfig==='aparencia'">
                <p class="pv-cfg-sec">Tema</p>
                <div class="pv-tema-row">
                  <button v-for="t in [['escuro','Escuro'],['claro','Claro']]" :key="t[0]"
                    class="pv-tema-opt" :class="{active: config.aparencia.tema === t[0]}"
                    @click="config.aparencia.tema = t[0]; salvarAparenciaImediato()">
                    {{ t[1] }}
                  </button>
                </div>
                <p class="pv-cfg-sec" style="margin-top:18px">Qualidade de vídeo</p>
                <select v-model="config.aparencia.qualidadeVideo" class="pv-sel" @change="salvarAparenciaImediato">
                  <option value="auto">Automático</option>
                  <option value="hd">HD (1080p)</option>
                  <option value="sd">SD (480p)</option>
                  <option value="low">Baixa qualidade</option>
                </select>
                <p class="pv-cfg-sync-hint" style="margin-top:14px">
                  <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                  Aparência salva automaticamente
                </p>
              </div>

              <!-- ── SEGURANÇA ── -->
              <div v-if="abaConfig==='seguranca'">
                <p class="pv-cfg-sec">Autenticação</p>
                <div class="pv-cfg-toggle">
                  <div class="pv-cfg-toggle-info">
                    <span>Autenticação em 2 fatores (2FA)</span>
                    <small class="pv-cfg-toggle-sub">Exige código adicional ao entrar.</small>
                  </div>
                  <label class="pv-sw">
                    <input type="checkbox" v-model="config.seguranca.autenticacaoDoisFatores" />
                    <span class="pv-sw-track"></span>
                  </label>
                </div>
                <div class="pv-cfg-toggle">
                  <div class="pv-cfg-toggle-info">
                    <span>Alertas de novo dispositivo</span>
                    <small class="pv-cfg-toggle-sub">Aviso por e-mail ao acessar de um novo aparelho.</small>
                  </div>
                  <label class="pv-sw">
                    <input type="checkbox" v-model="config.seguranca.alertasLoginNovo" />
                    <span class="pv-sw-track"></span>
                  </label>
                </div>
                <p class="pv-cfg-sec" style="margin-top:18px">Senha</p>
                <div class="pv-cfg-row">
                  <div class="pv-cfg-row-info">
                    <span class="pv-cfg-row-label">Senha atual</span>
                    <span class="pv-cfg-val pv-cfg-masked">••••••••••••</span>
                  </div>
                  <button class="pv-cfg-edit-btn" :disabled="redefinindoSenha" @click="redefinirSenha">
                    <span v-if="redefinindoSenha" class="pv-spinner"></span>
                    {{ redefinindoSenha ? 'Enviando…' : 'Alterar' }}
                  </button>
                </div>
                <button
                  class="pv-btn pv-btn--primary"
                  style="margin-top:20px;width:100%;justify-content:center"
                  :disabled="salvandoSeguranca"
                  @click="salvarSegurancaImediato">
                  <span v-if="salvandoSeguranca" class="pv-spinner"></span>
                  {{ salvandoSeguranca ? 'Salvando…' : 'Salvar segurança' }}
                </button>
              </div>

              <!-- ── CONTEÚDO ── -->
              <div v-if="abaConfig==='conteudo'">
                <p class="pv-cfg-sec">Filtros</p>
                <div class="pv-cfg-toggle">
                  <div class="pv-cfg-toggle-info">
                    <span>Filtrar comentários spam</span>
                    <small class="pv-cfg-toggle-sub">Ocultar automaticamente comentários identificados como spam.</small>
                  </div>
                  <label class="pv-sw">
                    <input type="checkbox" v-model="config.conteudo.filtrarSpam" @change="salvarConteudoImediato" />
                    <span class="pv-sw-track"></span>
                  </label>
                </div>
                <div class="pv-cfg-toggle">
                  <div class="pv-cfg-toggle-info">
                    <span>Filtrar comentários ofensivos</span>
                    <small class="pv-cfg-toggle-sub">Ocultar comentários detectados como discurso de ódio.</small>
                  </div>
                  <label class="pv-sw">
                    <input type="checkbox" v-model="config.conteudo.filtrarOfensivo" @change="salvarConteudoImediato" />
                    <span class="pv-sw-track"></span>
                  </label>
                </div>
                <p class="pv-cfg-sec" style="margin-top:18px">Palavras bloqueadas</p>
                <p style="font-size:11px;color:var(--text3);margin-bottom:12px;line-height:1.5">Comentários com essas palavras serão ocultados automaticamente.</p>
                <div class="pv-blocklist-input-row">
                  <input v-model="novaPalavraBlocklist" class="pv-field-inp" placeholder="Adicionar palavra…" maxlength="50"
                    @keydown.enter="adicionarPalavraBlocklist" />
                  <button class="pv-cfg-edit-btn" @click="adicionarPalavraBlocklist">Adicionar</button>
                </div>
                <div class="pv-blocklist-tags" v-if="config.conteudo.palavrasBlocklist?.length">
                  <span v-for="p in config.conteudo.palavrasBlocklist" :key="p" class="pv-blocklist-tag">
                    {{ p }}
                    <button @click="removerPalavraBlocklist(p)">✕</button>
                  </span>
                </div>
                <div v-else class="pv-cfg-apps-empty" style="margin-top:10px">Nenhuma palavra bloqueada.</div>
                <p class="pv-cfg-sync-hint" style="margin-top:12px">
                  <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                  Palavras salvas automaticamente
                </p>
              </div>

              <button
                v-if="abaConfig !== 'seguranca'"
                class="pv-btn pv-btn--primary"
                style="margin-top:24px;width:100%;justify-content:center"
                :disabled="salvandoConfig"
                @click="salvarConfig">
                <span v-if="salvandoConfig" class="pv-spinner"></span>
                {{ salvandoConfig ? 'Salvando…' : 'Salvar configurações' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- ══════════ EDITAR PERFIL (com crop) ══════════ -->
    <transition name="pv-modal-anim">
      <div v-if="editando" class="pv-overlay" @click.self="()=>{if(!salvando)editando=false}">
        <div class="pv-modal">
          <div class="pv-modal-hd">
            <h3>Editar perfil</h3>
            <button class="pv-close" @click="editando=false" :disabled="salvando">✕</button>
          </div>

         <!-- CAPA -->
          <div class="pv-edit-capa-wrap">
            <div class="pv-edit-capa" :style="(capaPreviewLocal || perfil.capa) ? `background-image:url(${capaPreviewLocal || perfil.capa})` : ''">
              <div v-if="!capaPreviewLocal && !perfil.capa" class="pv-edit-capa-empty">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" style="opacity:.3"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                <span>Sem foto de capa</span>
              </div>
              <label class="pv-edit-capa-btn">
                <input type="file" accept="image/*" @change="onCapaChange" hidden />
                Trocar capa
              </label>
            </div>

            <div v-if="capaPreviewLocal" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
              <button class="pv-cfg-edit-btn pv-crop-open-btn"
                @click="cropCapaMode=true; nextTick(()=>desenharCropCapa())">
                ✂ Recortar / Ajustar capa
              </button>
              <button class="pv-cfg-edit-btn"
                style="color:#ff5555;border-color:rgba(255,85,85,.25)"
                @click="capaPreviewLocal=null; _novaCapaFile=null; cropCapaMode=false">
                Remover
              </button>
            </div>
          </div>

          <!-- PAINEL DE CROP DA CAPA -->
          <transition name="pv-modal-anim">
            <div v-if="cropCapaMode" class="pv-crop-panel">
              <p class="pv-cfg-sec" style="margin-bottom:14px">Ajustar foto de capa</p>
              <div class="pv-crop-wrap">
                <canvas
                  ref="cropCapaCanvas"
                  :width="CAPA_W" :height="CAPA_H"
                  class="pv-crop-canvas pv-crop-canvas--capa"
                  @mousedown="cropCapaMouseDown"
                  @mousemove="cropCapaMouseMove"
                  @mouseup="cropCapaMouseUp"
                  @mouseleave="cropCapaMouseUp"
                  @touchstart.prevent="cropCapaTouchStart"
                  @touchmove.prevent="cropCapaTouchMove"
                  @touchend="cropCapaMouseUp"
                ></canvas>
                <p class="pv-crop-hint">Arraste para reposicionar</p>
              </div>
              <div class="pv-crop-zoom">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="opacity:.5;flex-shrink:0"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                <span class="pv-crop-zoom-label">Zoom</span>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.02"
                  v-model.number="cropCapaScale"
                  class="pv-crop-slider"
                />
                <span class="pv-crop-zoom-val">{{ Math.round(cropCapaScale * 100) }}%</span>
              </div>
              <div class="pv-modal-acts" style="margin-top:14px">
                <button class="pv-btn pv-btn--ghost" @click="cancelarCropCapa">Cancelar</button>
                <button class="pv-btn pv-btn--primary" @click="aplicarCropCapa">✓ Aplicar</button>
              </div>
            </div>
          </transition>

          <!-- AVATAR com botões de ação -->
          <div class="pv-edit-av-row">
            <div class="pv-edit-av-wrap">
              <img :src="fotoPreviewLocal || perfil.avatar" class="pv-edit-av" />
              <label class="pv-edit-av-over">
                <input type="file" accept="image/*" @change="onAvatarChange" hidden />
                <svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
              </label>
            </div>
            <div style="flex:1;display:flex;flex-direction:column;gap:6px">
              <span class="pv-edit-av-hint">
                {{ fotoPreviewLocal ? 'Nova foto selecionada' : 'Clique na foto para trocar' }}
              </span>
              <div v-if="fotoPreviewLocal" style="display:flex;gap:6px;flex-wrap:wrap">
                <button class="pv-cfg-edit-btn pv-crop-open-btn"
                  @click="cropMode=true; nextTick(()=>desenharCrop())">
                  ✂ Recortar / Ajustar
                </button>
                <button class="pv-cfg-edit-btn"
                  style="color:#ff5555;border-color:rgba(255,85,85,.25)"
                  @click="fotoPreviewLocal=null; _novaFotoFile=null; cropMode=false">
                  Remover
                </button>
              </div>
            </div>
          </div>

          <!-- PAINEL DE CROP -->
          <transition name="pv-modal-anim">
            <div v-if="cropMode" class="pv-crop-panel">
              <p class="pv-cfg-sec" style="margin-bottom:14px">Ajustar foto de perfil</p>
              <div class="pv-crop-wrap">
                <canvas
                  ref="cropCanvas"
                  width="200" height="200"
                  class="pv-crop-canvas"
                  @mousedown="cropMouseDown"
                  @mousemove="cropMouseMove"
                  @mouseup="cropMouseUp"
                  @mouseleave="cropMouseUp"
                  @touchstart.prevent="cropTouchStart"
                  @touchmove.prevent="cropTouchMove"
                  @touchend="cropMouseUp"
                ></canvas>
                <p class="pv-crop-hint">Arraste para reposicionar</p>
              </div>
              <div class="pv-crop-zoom">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="opacity:.5;flex-shrink:0"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                <span class="pv-crop-zoom-label">Zoom</span>
               <input
  type="range"
  min="0.5"
  max="3"
  step="0.02"
  v-model.number="cropCapaScale"
  class="pv-crop-slider"
/>
                <span class="pv-crop-zoom-val">{{ Math.round(cropScale * 100) }}%</span>
              </div>
              <div class="pv-modal-acts" style="margin-top:14px">
                <button class="pv-btn pv-btn--ghost" @click="cancelarCrop">Cancelar</button>
                <button class="pv-btn pv-btn--primary" @click="aplicarCrop">✓ Aplicar</button>
              </div>
            </div>
          </transition>

          <div v-if="erroEdicao" class="pv-erro">{{ erroEdicao }}</div>

          <!-- CAMPOS -->
          <div class="pv-field">
            <label>Usuário</label>
            <div class="pv-prefix-wrap"><span class="pv-prefix">@</span><input v-model="rascunho.username" maxlength="30" /></div>
          </div>
          <div class="pv-field"><label>Nome</label><input v-model="rascunho.nome" maxlength="50" /></div>
          <div class="pv-field">
            <label>Bio <span class="pv-field-count">{{ (rascunho.bio||'').length }}/150</span></label>
            <textarea v-model="rascunho.bio" rows="3" maxlength="150"></textarea>
          </div>
          <div class="pv-field"><label>Website</label><input v-model="rascunho.website" placeholder="seusite.com" /></div>
          <div class="pv-field">
            <label>Categoria</label>
            <select v-model="rascunho.categoria" class="pv-sel" style="width:100%">
              <option value="">Selecione…</option>
              <option v-for="c in ['Entretenimento','Esportes','Tecnologia','Culinária','Moda & Beleza','Viagens','Música','Gaming','Educação','Humor','Arte & Design','Negócios']" :key="c">{{ c }}</option>
            </select>
          </div>
          <div class="pv-modal-acts">
            <button @click="editando=false" class="pv-btn pv-btn--ghost" :disabled="salvando">Cancelar</button>
            <button @click="salvarPerfil" class="pv-btn pv-btn--primary" :disabled="salvando">
              <span v-if="salvando" class="pv-spinner"></span>{{ salvando?'Salvando…':'Salvar' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Editar vídeo -->
    <transition name="pv-modal-anim">
      <div v-if="editandoVideo" class="pv-overlay" @click.self="()=>{if(!salvandoVideo)editandoVideo=null}">
        <div class="pv-modal" style="max-width:400px">
          <div class="pv-modal-hd">
            <h3>Editar publicação</h3>
            <button class="pv-close" @click="editandoVideo=null" :disabled="salvandoVideo">✕</button>
          </div>
          <div v-if="erroVideoEdicao" class="pv-erro">{{ erroVideoEdicao }}</div>
          <div class="pv-field"><label>Título</label><input v-model="rascunhoVideo.titulo" maxlength="100" /></div>
          <div class="pv-field">
            <label>Descrição <span class="pv-field-count">{{ (rascunhoVideo.descricao||'').length }}/300</span></label>
            <textarea v-model="rascunhoVideo.descricao" rows="3" maxlength="300" placeholder="Aparece ao abrir o vídeo…"></textarea>
          </div>
          <div class="pv-modal-acts">
            <button @click="editandoVideo=null" class="pv-btn pv-btn--ghost" :disabled="salvandoVideo">Cancelar</button>
            <button @click="salvarVideo" class="pv-btn pv-btn--primary" :disabled="salvandoVideo">
              <span v-if="salvandoVideo" class="pv-spinner"></span>{{ salvandoVideo?'Salvando…':'Salvar' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Mensagem -->
    <transition name="pv-modal-anim">
      <div v-if="modalMensagem" class="pv-overlay" @click.self="modalMensagem=false">
        <div class="pv-modal" style="max-width:380px">
          <div class="pv-modal-hd">
            <h3>Mensagem para @{{ perfil.username }}</h3>
            <button class="pv-close" @click="modalMensagem=false">✕</button>
          </div>
          <div class="pv-field"><textarea v-model="textoMensagem" placeholder="Digite sua mensagem…" rows="4" maxlength="500"></textarea></div>
          <div class="pv-modal-acts">
            <button @click="modalMensagem=false" class="pv-btn pv-btn--ghost">Cancelar</button>
            <button @click="enviarMensagem" class="pv-btn pv-btn--primary" :disabled="!textoMensagem.trim()">Enviar</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Reportar -->
    <transition name="pv-modal-anim">
      <div v-if="modalReportar" class="pv-overlay" @click.self="modalReportar=false">
        <div class="pv-modal" style="max-width:360px">
          <div class="pv-modal-hd">
            <h3>Reportar conteúdo</h3>
            <button class="pv-close" @click="modalReportar=false">✕</button>
          </div>
          <p class="pv-report-hint">Selecione o motivo. Sua denúncia é anônima.</p>
          <div class="pv-report-list">
            <label v-for="m in motivosReporte" :key="m" class="pv-report-opt">
              <input type="radio" :value="m" v-model="motivoReporte" /> <span>{{ m }}</span>
            </label>
          </div>
          <div class="pv-modal-acts" style="margin-top:14px">
            <button @click="modalReportar=false" class="pv-btn pv-btn--ghost">Cancelar</button>
            <button @click="enviarReporte" class="pv-btn pv-btn--primary" :disabled="!motivoReporte">Enviar</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Compartilhar -->
    <transition name="pv-modal-anim">
      <div v-if="modalCompartilhar" class="pv-overlay" @click.self="modalCompartilhar=false">
        <div class="pv-modal" style="max-width:340px">
          <div class="pv-modal-hd">
            <h3>Compartilhar perfil</h3>
            <button class="pv-close" @click="modalCompartilhar=false">✕</button>
          </div>
          <div class="pv-share-who">
            <img :src="perfil.avatar" class="pv-share-av" />
            <div><p class="pv-share-user">@{{ perfil.username }}</p><p class="pv-share-nome">{{ perfil.nome }}</p></div>
          </div>
          <div class="pv-qr-box">
            <div v-if="qrCarregando" class="pv-qr-load"><div class="pv-spin"></div></div>
            <img v-else :src="qrCodeUrl" class="pv-qr-img" />
          </div>
          <div class="pv-link-box">
            <span class="pv-link-txt">{{ linkPerfil }}</span>
            <button class="pv-link-copy" :class="{copied:linkCopiado}" @click="copiarLink">
              <svg v-if="!linkCopiado" viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
              <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </button>
          </div>
          <div class="pv-modal-acts">
            <button class="pv-btn pv-btn--ghost" @click="modalCompartilhar=false">Fechar</button>
            <button class="pv-btn pv-btn--primary" @click="navigator.share?navigator.share({title:perfil.username,url:linkPerfil}):copiarLink()">Compartilhar</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Criar destaque -->
    <transition name="pv-modal-anim">
      <div v-if="criandoDestaque" class="pv-overlay" @click.self="criandoDestaque=false">
        <div class="pv-modal">
          <div class="pv-modal-hd">
            <h3>Novo destaque</h3>
            <button class="pv-close" @click="criandoDestaque=false">✕</button>
          </div>
          <div class="pv-hl-fotos-row">
            <label class="pv-hl-add-card">
              <input type="file" accept="image/*" multiple @change="selecionarFotosDestaque" hidden />
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" style="opacity:.4"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              <span>Adicionar</span>
            </label>
            <div v-for="(url,i) in fotasPreview" :key="i" class="pv-hl-thumb">
              <img :src="url" />
              <button class="pv-hl-rm" @click="fotasSelecionadas.splice(i,1);fotasPreview.splice(i,1)">✕</button>
              <div v-if="i===0" class="pv-hl-capa-badge">Capa</div>
            </div>
          </div>
          <div class="pv-field" style="margin-top:16px">
            <label>Título <span class="pv-field-count">{{ (novoDestaque.titulo||'').length }}/20</span></label>
            <input v-model="novoDestaque.titulo" maxlength="20" placeholder="Ex: Viagens, Treinos…" />
          </div>
          <div style="margin:14px 0">
            <p style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;margin:0 0 10px">Cor do anel</p>
            <div class="pv-hl-cor-row">
              <button v-for="cor in ['#ff6b35','#f72585','#ffd700','#10b981','#3b82f6','#7c3aed','#20d5ec','#ffffff']" :key="cor"
                class="pv-hl-cor" :class="{'pv-hl-cor--on':novoDestaque.cor===cor}" :style="{background:cor}"
                @click="novoDestaque.cor=cor"></button>
            </div>
          </div>
          <div class="pv-modal-acts">
            <button @click="criandoDestaque=false" class="pv-btn pv-btn--ghost">Cancelar</button>
            <button @click="salvarDestaque" class="pv-btn pv-btn--primary" :disabled="enviandoCapa||!novoDestaque.titulo.trim()||!fotasPreview.length">
              <span v-if="enviandoCapa" class="pv-spinner"></span>{{ enviandoCapa?'Criando…':'Criar destaque' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Lista seguidores/seguindo -->
    <transition name="pv-modal-anim">
      <div v-if="modalLista" class="pv-overlay" @click.self="fecharLista">
        <div class="pv-modal" style="max-width:360px;padding:0">
          <div class="pv-modal-hd" style="padding:20px 20px 0">
            <h3>{{ modalLista==='seguidores'?'Seguidores':'Seguindo' }}</h3>
            <button class="pv-close" @click="fecharLista">✕</button>
          </div>
          <div style="padding:12px 16px">
            <div class="pv-search-wrap">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" class="pv-search-icon"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
              <input v-model="pesquisaLista" placeholder="Buscar…" class="pv-search-inp" />
            </div>
          </div>
          <div v-if="carregandoLista" class="pv-list-loading"><div class="pv-spin"></div></div>
          <div v-else-if="!listaFiltrada.length" class="pv-list-empty">{{ pesquisaLista?'Nenhum resultado.':'Nenhum usuário.' }}</div>
          <div v-else class="pv-list-scroll">
            <div v-for="u in listaFiltrada" :key="u.id" class="pv-list-row" @click="fecharLista();irParaPerfil(u.id,u.username)">
              <img :src="u.avatar_url||'/default-avatar.svg/38'" class="pv-list-av" />
              <div class="pv-list-info">
                <span class="pv-list-user">
                  @{{ u.username }}
                  <span v-if="seguidoresMap[u.id]" class="pv-list-segue-badge">segue você</span>
                </span>
                <span v-if="u.nome" class="pv-list-nome">{{ u.nome }}</span>
              </div>
              <div class="pv-list-btns" @click.stop>
                <!-- Na aba seguidores: mostrar "Remover" -->
                <button v-if="modalLista === 'seguidores' && ehMeuPerfil"
                  class="pv-list-remove-btn"
                  @click="removerSeguidor(u.id, u.username)">
                  Remover
                </button>
                <!-- Botão seguir/deixar de seguir/seguir de volta -->
                <button
                  class="pv-sugg-btn"
                  :class="{
                    'pv-sugg-btn--on':   estouSeguindo[u.id],
                    'pv-sugg-btn--back': !estouSeguindo[u.id] && seguidoresMap[u.id]
                  }"
                  style="width:auto;padding:6px 14px"
                  @click="toggleSeguirUsuario(u.id, u.username)">
                  {{ estouSeguindo[u.id] ? 'Seguindo' : (seguidoresMap[u.id] ? 'Seguir de volta' : 'Seguir') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

  <!-- ══ EDITAR DESTAQUE ══ -->
<transition name="pv-modal-anim">
  <div v-if="editandoDestaque" class="pv-overlay" @click.self="editandoDestaque = null" style="z-index:9800">
    <div class="pv-modal" style="max-width:400px">
      <div class="pv-modal-hd">
        <h3>Editar destaque</h3>
        <button class="pv-close" @click="editandoDestaque = null">✕</button>
      </div>

      <!-- Preview do anel -->
      <div style="display:flex;justify-content:center;margin-bottom:18px">
        <div style="width:76px;height:76px;border-radius:50%;padding:3px;"
          :style="`background: conic-gradient(${editandoDestaqueForm.cor}, #f72585, ${editandoDestaqueForm.cor})`">
          <div style="width:100%;height:100%;border-radius:50%;overflow:hidden;border:3px solid var(--bg3)">
            <img :src="editandoDestaqueForm.fotos?.[0] || editandoDestaque.fotos?.[0]"
              style="width:100%;height:100%;object-fit:cover" />
          </div>
        </div>
      </div>

      <!-- Título -->
      <div class="pv-field">
        <label>Título <span class="pv-field-count">{{ editandoDestaqueForm.titulo.length }}/20</span></label>
        <input v-model="editandoDestaqueForm.titulo" maxlength="20" placeholder="Ex: Viagens, Treinos…" />
      </div>

      <!-- Cor -->
      <div style="margin:14px 0">
        <p style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;margin:0 0 10px">Cor do anel</p>
        <div class="pv-hl-cor-row">
          <button
            v-for="cor in ['#ff6b35','#f72585','#ffd700','#10b981','#3b82f6','#7c3aed','#20d5ec','#ffffff']"
            :key="cor"
            class="pv-hl-cor"
            :class="{ 'pv-hl-cor--on': editandoDestaqueForm.cor === cor }"
            :style="{ background: cor }"
            @click="editandoDestaqueForm.cor = cor"
          />
        </div>
      </div>

      <!-- Seleção de fotos -->
      <div style="margin:16px 0 4px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <p style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;margin:0">
            Fotos ({{ editandoDestaqueForm.fotos.length }} selecionada{{ editandoDestaqueForm.fotos.length !== 1 ? 's' : '' }})
          </p>
          <div style="display:flex;gap:6px">
            <button class="pv-cfg-edit-btn" @click="editandoDestaqueForm.fotos = [...editandoDestaque.fotos]">
              Marcar todas
            </button>
            <button class="pv-cfg-edit-btn" style="color:#ff5555;border-color:rgba(255,85,85,.25)"
              @click="editandoDestaqueForm.fotos = []">
              Desmarcar
            </button>
          </div>
        </div>

        <div class="pv-edit-fotos-grid">
          <div
            v-for="(foto, i) in editandoDestaque.fotos"
            :key="i"
            class="pv-edit-foto-item"
            :class="{ 'pv-edit-foto-item--on': editandoDestaqueForm.fotos.includes(foto) }"
            @click="editandoDestaqueForm.fotos.includes(foto)
              ? editandoDestaqueForm.fotos = editandoDestaqueForm.fotos.filter(f => f !== foto)
              : editandoDestaqueForm.fotos.push(foto)"
          >
            <img :src="foto" />

            <!-- Badge capa (primeira da lista selecionada) -->
            <div v-if="editandoDestaqueForm.fotos[0] === foto" class="pv-edit-foto-capa">Capa</div>

            <!-- Check ou X -->
            <div class="pv-edit-foto-check">
              <svg v-if="editandoDestaqueForm.fotos.includes(foto)" viewBox="0 0 24 24" width="14" height="14" fill="white">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="white">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </div>

            <!-- Número da ordem na seleção -->
            <div v-if="editandoDestaqueForm.fotos.includes(foto)" class="pv-edit-foto-order">
              {{ editandoDestaqueForm.fotos.indexOf(foto) + 1 }}
            </div>
          </div>
        </div>

        <p v-if="!editandoDestaqueForm.fotos.length" style="font-size:11px;color:#ff5555;margin-top:8px;text-align:center">
          Selecione ao menos uma foto
        </p>
      </div>

      <div class="pv-modal-acts" style="margin-top:16px">
        <button class="pv-btn pv-btn--ghost" @click="editandoDestaque = null" :disabled="salvandoDestaque">Cancelar</button>
        <button class="pv-btn pv-btn--primary" @click="salvarEdicaoDestaque" :disabled="salvandoDestaque || !editandoDestaqueForm.fotos.length">
          <span v-if="salvandoDestaque" class="pv-spinner"></span>
          {{ salvandoDestaque ? 'Salvando…' : 'Salvar' }}
        </button>
      </div>
    </div>
  </div>
</transition>
    <!-- ══ MODAL CONFIRM DESTAQUES ══ -->
<transition name="pv-modal-anim">
  <div v-if="modalConfirm.show" class="pv-overlay" @click.self="modalConfirm.show = false" style="z-index:9800">
    <div class="pv-confirm-modal">
      <div class="pv-confirm-icon" :class="`pv-confirm-icon--${modalConfirm.icone}`">
        <svg v-if="modalConfirm.icone === 'todos'" viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
        </svg>
        <svg v-else-if="modalConfirm.icone === 'foto'" viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
        </svg>
      </div>
      <h3 class="pv-confirm-titulo">{{ modalConfirm.titulo }}</h3>
      <p class="pv-confirm-sub">{{ modalConfirm.sub }}</p>
      <div class="pv-confirm-btns">
        <button class="pv-btn pv-btn--ghost" @click="modalConfirm.show = false">Cancelar</button>
        <button class="pv-confirm-del-btn" @click="modalConfirm.onConfirm?.()">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          Excluir
        </button>
      </div>
    </div>
  </div>
</transition>

    <!-- TOAST -->
    <transition name="pv-toast-anim">
      <div v-if="toastMsg" class="pv-toast" :class="'pv-toast--'+toastTipo">{{ toastMsg }}</div>
    </transition>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.pv-root {
  --accent:  #ff6b35;
  --accent2: #f72585;
  --cyan:    #4cc9f0;
  --gold:    #ffd60a;
  --green:   #10b981;
  --r:       12px;
  --r-sm:    8px;

  font-family: 'DM Sans', sans-serif;
  background: var(--bg, #080808);
  min-height: 100vh;
  color: var(--text, #f5f5f5);
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  transition: background .3s, color .3s;
}

.pv-hero { height: 240px; position: relative; overflow: hidden; background: var(--bg2); }
.pv-hero-img { width: 100%; height: 100%; object-fit: cover; object-position: center 35%; display: block; }
.pv-hero-placeholder { width: 100%; height: 100%; background: linear-gradient(135deg, var(--bg3) 0%, var(--bg4) 100%); }
.pv-hero-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 55%, var(--bg, #080808) 100%); pointer-events: none; }

.pv-bar { position: fixed; top: 0; left: 0; right: 0; z-index: 900; height: 52px; background: rgba(8,8,8,.94); backdrop-filter: blur(20px) saturate(160%); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 14px; gap: 10px; }
.pv-root[data-tema="claro"] .pv-bar { background: rgba(240,240,240,.94); }
.pv-bar-back { width: 32px; height: 32px; border-radius: 50%; background: var(--bg3); border: 1px solid var(--border2); color: var(--text2); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .2s; flex-shrink: 0; }
.pv-bar-back:hover { background: var(--bg4); color: var(--text); }
.pv-bar-identity { flex: 1; display: flex; align-items: center; gap: 8px; min-width: 0; }
.pv-bar-av-wrap { width: 26px; height: 26px; flex-shrink: 0; border-radius: 50%; padding: 1.5px; background: linear-gradient(135deg, var(--accent), var(--accent2)); }
.pv-bar-av { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--bg); display: block; }
.pv-bar-nome { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text); }
.pv-badge-check { font-size: 10px; background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #fff; width: 14px; height: 14px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; flex-shrink: 0; }
.pv-bar-right { display: flex; gap: 6px; }
.pv-bar-btn { width: 30px; height: 30px; border-radius: 8px; background: var(--bg3); border: 1px solid var(--border); color: var(--text2); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .2s; position: relative; }
.pv-bar-btn:hover { background: var(--bg4); color: var(--text); }
.pv-pip { position: absolute; top: -4px; right: -4px; background: var(--accent2); color: #fff; font-size: 8px; font-weight: 800; min-width: 15px; height: 15px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 1.5px solid var(--bg); }
.pv-bar-anim-enter-active, .pv-bar-anim-leave-active { transition: all .2s ease; }
.pv-bar-anim-enter-from, .pv-bar-anim-leave-to { opacity: 0; transform: translateY(-6px); }

.pv-body { max-width: 1080px; margin: 0 auto; padding: 0 24px 80px; }

.pv-identity { margin-top: -16px; position: relative; z-index: 2; padding-bottom: 8px; }
.pv-ig-top { display: flex; align-items: flex-start; gap: 28px; padding: 0 4px; }
.pv-av-ring { width: 100px; height: 100px; border-radius: 50%; padding: 3px; background: var(--bg3); border: 3px solid var(--bg); position: relative; flex-shrink: 0; }
.pv-av-ring--own { background: linear-gradient(135deg, var(--accent), var(--accent2)); padding: 3px; box-shadow: 0 0 22px rgba(255,107,53,.22); }
.pv-av-ring--story { background: linear-gradient(135deg, #f9ce34, #ee2a7b, #6228d7); padding: 3px; cursor: pointer; }
.pv-av-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 3px solid var(--bg); display: block; }
.pv-av-change { position: absolute; inset: 0; background: rgba(0,0,0,.62); border-radius: 50%; display: flex; align-items: center; justify-content: center; opacity: 0; cursor: pointer; transition: opacity .2s; }
.pv-av-ring:hover .pv-av-change { opacity: 1; }
.pv-av-lock { position: absolute; bottom: 2px; right: 2px; width: 20px; height: 20px; border-radius: 50%; background: var(--bg3); border: 1px solid var(--border2); display: flex; align-items: center; justify-content: center; }
.pv-ig-right { flex: 1; display: flex; flex-direction: column; gap: 14px; padding-top: 14px; }
.pv-ig-nameline { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.pv-name { font-family: 'DM Sans', sans-serif; font-size: 20px; font-weight: 600; color: var(--text); letter-spacing: -.2px; }
.pv-verified { display: flex; flex-shrink: 0; }
.pv-ig-stats { display: flex; gap: 0; align-items: center; }
.pv-ig-actions { display: flex; gap: 7px; align-items: center; flex-wrap: wrap; margin-top: 20px; }

.pv-ig-stat { display: flex; align-items: center; gap: 4px; padding: 0 18px 0 0; background: none; border: none; color: var(--text); cursor: pointer; font-family: 'DM Sans', sans-serif; transition: opacity .15s; }
.pv-ig-stat:hover { opacity: .75; }
.pv-ig-stat:first-child { padding-left: 0; }
.pv-ig-stat-n { font-size: 15px; font-weight: 700; color: var(--text); }
.pv-ig-stat-l { font-size: 14px; font-weight: 400; color: var(--text2); }
.pv-ig-btn { height: 33px; padding: 0 16px; border-radius: 8px; font-size: 13.5px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; border: 1px solid var(--border2); background: var(--bg3); color: var(--text); transition: all .18s; white-space: nowrap; }
.pv-ig-btn:hover { background: var(--bg4); }
.pv-ig-btn--solid { background: var(--bg3); }
.pv-ig-btn--follow { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #fff; border-color: transparent; box-shadow: 0 2px 10px rgba(255,107,53,.25); }
.pv-ig-btn--follow:hover { box-shadow: 0 3px 18px rgba(255,107,53,.4); transform: translateY(-1px); }
.pv-ig-btn--following { background: var(--bg3); color: var(--text3); }
.pv-ig-btn--following:hover { border-color: var(--accent2); color: var(--accent2); }
.pv-ig-icon-btn { width: 33px; height: 33px; border-radius: 8px; background: var(--bg3); border: 1px solid var(--border2); color: var(--text2); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .18s; position: relative; }
.pv-ig-icon-btn:hover { background: var(--bg4); color: var(--text); }
.pv-cfg-main-btn:hover { background: linear-gradient(135deg, rgba(255,107,53,.12), rgba(247,37,133,.12)); border-color: rgba(255,107,53,.4); color: var(--accent); }

.pv-ig-bio-block { padding: 20px 4px 4px; display: flex; flex-direction: column; gap: 5px; }
.pv-ig-nome-real { font-size: 14px; font-weight: 600; color: var(--text); line-height: 1.3; }
.pv-ig-cat { display: inline-block; font-size: 12px; color: var(--text3); font-weight: 400; }
.pv-ig-bio { font-size: 14px; color: var(--text); line-height: 1.55; white-space: pre-line; }
.pv-ig-link { display: inline-flex; align-items: center; gap: 4px; color: var(--accent); font-size: 13px; font-weight: 600; text-decoration: none; }
.pv-ig-link:hover { opacity: .75; }
.pv-private-chip { display: inline-flex; align-items: center; gap: 4px; background: rgba(255,255,255,.05); border: 1px solid var(--border2); color: var(--text3); font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 20px; width: fit-content; }

.pv-hl-section { margin-top: 20px; border-top: 1px solid var(--border); padding-top: 18px; }
.pv-hl-track { display: flex; gap: 20px; overflow-x: auto; padding: 2px 2px 14px; scrollbar-width: none; scroll-snap-type: x mandatory; }
.pv-hl-track::-webkit-scrollbar { display: none; }
.pv-hl-new-item { display: flex; flex-direction: column; align-items: center; gap: 7px; flex-shrink: 0; cursor: pointer; transition: transform .2s; scroll-snap-align: start; }
.pv-hl-new-item:hover { transform: scale(1.06); }
.pv-hl-new-circle { width: 76px; height: 76px; border-radius: 50%; border: 2px dashed var(--border2); background: var(--bg2); display: flex; align-items: center; justify-content: center; transition: border-color .18s; }
.pv-hl-new-item:hover .pv-hl-new-circle { border-color: var(--accent); }
.pv-hl-item { display: flex; flex-direction: column; align-items: center; gap: 7px; flex-shrink: 0; cursor: pointer; transition: transform .22s cubic-bezier(.34,1.56,.64,1); scroll-snap-align: start; }
.pv-hl-item:hover { transform: scale(1.06); }
.pv-hl-item:active { transform: scale(.94); }
.pv-hl-ring-wrap { position: relative; width: 76px; height: 76px; }
.pv-hl-ring-border { width: 76px; height: 76px; border-radius: 50%; padding: 2.5px; background: conic-gradient(var(--ring, var(--accent)), var(--accent2), var(--ring, var(--accent))); transition: box-shadow .2s; }
.pv-hl-item:hover .pv-hl-ring-border { box-shadow: 0 0 0 3px rgba(255,107,53,.15); }
.pv-hl-thumb-wrap { width: 100%; height: 100%; border-radius: 50%; overflow: hidden; border: 3px solid var(--bg); background: var(--bg3); }
.pv-hl-thumb-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pv-hl-multi-badge { position: absolute; bottom: 0; right: 0; background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #fff; font-size: 9px; font-weight: 800; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid var(--bg); }
.pv-hl-lbl { font-size: 11px; font-weight: 500; color: var(--text2); max-width: 76px; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pv-hl-empty { font-size: 12px; color: var(--text4); padding: 8px 0; }

.pv-story-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.96); display: flex; align-items: center; justify-content: center; z-index: 9500; }
.pv-story-container { position: relative; width: min(420px, 98vw); height: min(750px, 96vh); border-radius: 18px; overflow: hidden; background: #000; box-shadow: 0 24px 80px rgba(0,0,0,.9); }
.pv-story-bars { position: absolute; top: 10px; left: 10px; right: 10px; display: flex; gap: 4px; z-index: 10; }
.pv-story-bar { flex: 1; height: 3px; border-radius: 2px; background: rgba(255,255,255,.3); overflow: hidden; }
.pv-story-bar-fill { height: 100%; background: #fff; transition: width .04s linear; border-radius: 2px; }
.pv-story-header { position: absolute; top: 22px; left: 10px; right: 10px; display: flex; align-items: center; justify-content: space-between; z-index: 10; }
.pv-story-who { display: flex; align-items: center; gap: 9px; }
.pv-story-av { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,.5); }
.pv-story-user { font-size: 12.5px; font-weight: 700; color: #fff; text-shadow: 0 1px 4px rgba(0,0,0,.8); }
.pv-story-titulo { font-size: 10.5px; color: rgba(255,255,255,.75); }
.pv-story-hd-right { display: flex; gap: 7px; align-items: center; }
.pv-story-close, .pv-story-del { width: 30px; height: 30px; border-radius: 50%; background: rgba(0,0,0,.5); border: 1px solid rgba(255,255,255,.15); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 13px; transition: background .16s; }
.pv-story-close:hover { background: rgba(255,255,255,.18); }
.pv-story-del:hover { background: rgba(220,50,50,.6); }
.pv-story-edit {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: rgba(0,0,0,.5);
  border: 1px solid rgba(255,255,255,.15);
  color: #fff;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .16s;
}
.pv-story-edit:hover { background: rgba(255,107,53,.6); }
.pv-story-del--all {
  width: auto;
  padding: 0 8px;
  gap: 4px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  flex-direction: row;
}
.pv-story-del--all:hover { background: rgba(180,0,0,.75); }
.pv-story-img { width: 100%; height: 100%; object-fit: cover; display: block; user-select: none; -webkit-user-drag: none; }
.pv-story-ctrl-left, .pv-story-ctrl-right { position: absolute; top: 0; bottom: 0; width: 40%; z-index: 8; cursor: pointer; }
.pv-story-ctrl-left { left: 0; }
.pv-story-ctrl-right { right: 0; }
.pv-story-counter { position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,.5); backdrop-filter: blur(8px); color: rgba(255,255,255,.85); font-size: 11px; font-weight: 700; padding: 4px 11px; border-radius: 20px; z-index: 10; }

.pv-section { margin-top: 28px; }
.pv-sec-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.pv-sec-label { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; color: var(--text3); letter-spacing: 1px; text-transform: uppercase; }

.pv-sugg-outer { position: relative; }
.pv-sugg-track { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: none; scroll-snap-type: x mandatory; padding-left: 2px; padding-right: 2px; -webkit-overflow-scrolling: touch; }
.pv-sugg-track::-webkit-scrollbar { display: none; }
.pv-sugg-card { width: 160px; min-width: 160px; height: 220px; flex-shrink: 0; background: var(--bg3); border: 1px solid var(--border); border-radius: var(--r); padding: 18px 14px 14px; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; touch-action: manipulation; transition: background .2s, transform .22s cubic-bezier(.34,1.2,.64,1), border-color .2s, box-shadow .2s; scroll-snap-align: start; overflow: hidden; }
.pv-sugg-card:hover { background: var(--bg4); transform: translateY(-4px); border-color: var(--border3); box-shadow: 0 8px 28px rgba(0,0,0,.35); }
.pv-sugg-av-wrap { position: relative; flex-shrink: 0; }
.pv-sugg-av { width: 62px; height: 62px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border2); display: block; transition: border-color .2s; }
.pv-sugg-card:hover .pv-sugg-av { border-color: var(--accent); }
.pv-sugg-check { position: absolute; bottom: 0; right: 0; background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #fff; font-size: 9px; font-weight: 900; width: 17px; height: 17px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1.5px solid var(--bg); }
.pv-sugg-info { text-align: center; width: 100%; flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 2px; }
.pv-sugg-user { font-size: 12px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; display: block; color: var(--text); }
.pv-sugg-nome { font-size: 10px; color: var(--text3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; display: block; margin-top: 1px; }
.pv-sugg-bio { font-size: 10px; color: var(--text3); text-align: center; line-height: 1.45; margin-top: 2px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 28px; }
.pv-sugg-btn { width: 100%; border: none; background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #fff; padding: 7px 8px; border-radius: 8px; font-weight: 700; font-size: 11.5px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .2s; margin-top: auto; box-shadow: 0 2px 8px rgba(255,107,53,.22); white-space: nowrap; flex-shrink: 0; }
.pv-sugg-btn:hover { box-shadow: 0 4px 16px rgba(255,107,53,.4); transform: translateY(-1px); }
.pv-sugg-btn:active { transform: scale(.96); }
.pv-sugg-btn--on { background: var(--bg4) !important; color: var(--text3) !important; border: 1px solid var(--border); box-shadow: none; transform: none; }
.pv-sugg-btn--on:hover { border-color: var(--accent2); color: var(--accent2) !important; transform: none; }
.pv-sugg-skel { width: 160px; min-width: 160px; height: 220px; background: var(--bg3); border-radius: var(--r); animation: pv-pulse 1.5s ease-in-out infinite; }
.pv-sugg-empty { color: var(--text4); font-size: 12px; padding: 12px 0; }

.pv-sugg-nav { position: absolute; top: 50%; transform: translateY(calc(-50% - 8px)); z-index: 10; width: 38px; height: 38px; border-radius: 50%; border: none; background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 18px rgba(255,107,53,.45), 0 1px 4px rgba(0,0,0,.35); transition: opacity .2s, transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .2s; }
.pv-sugg-nav:hover { transform: translateY(calc(-50% - 8px)) scale(1.1); box-shadow: 0 6px 24px rgba(247,37,133,.55), 0 2px 8px rgba(0,0,0,.4); }
.pv-sugg-nav:active { transform: translateY(calc(-50% - 8px)) scale(.94); }
.pv-sugg-nav--prev { left: -14px; }
.pv-sugg-nav--next { right: -14px; }
.pv-sugg-nav--hidden { opacity: 0; pointer-events: none; transform: translateY(calc(-50% - 8px)) scale(.8); }
.pv-sugg-fade-r { position: absolute; top: 0; right: 0; bottom: 8px; width: 40px; background: linear-gradient(to right, transparent, var(--bg, #080808)); pointer-events: none; }
.pv-sugg-dots { display: flex; justify-content: center; gap: 5px; margin-top: 10px; }
.pv-sugg-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--bg4); cursor: pointer; transition: all .22s cubic-bezier(.34,1.56,.64,1); }
.pv-sugg-dot--on { background: linear-gradient(135deg, var(--accent), var(--accent2)); width: 18px; border-radius: 3px; box-shadow: 0 1px 6px rgba(255,107,53,.4); }
.pv-sugg-dot:hover { background: var(--text3); }

.pv-pub-section { margin-top: 28px; border-top: 1px solid var(--border); padding-top: 20px; }
.pv-pub-header { margin-bottom: 16px; }
.pv-search-wrap { display: flex; align-items: center; gap: 8px; background: var(--bg2); border: 1px solid var(--border); border-radius: 24px; padding: 9px 16px; margin-bottom: 12px; transition: border-color .2s, box-shadow .2s; }
.pv-search-wrap:focus-within { border-color: var(--border3); box-shadow: 0 0 0 3px rgba(255,107,53,.05); }
.pv-search-icon { color: var(--text3); flex-shrink: 0; }
.pv-search-inp { flex: 1; background: none; border: none; color: var(--text); font-size: 13px; outline: none; font-family: 'DM Sans', sans-serif; }
.pv-search-inp::placeholder { color: var(--text4); }
.pv-search-x { background: none; border: none; color: var(--text3); cursor: pointer; font-size: 12px; transition: color .15s; }
.pv-search-x:hover { color: var(--text); }
.pv-tabs { display: flex; border-bottom: 1px solid var(--border); overflow-x: auto; scrollbar-width: none; }
.pv-tabs::-webkit-scrollbar { display: none; }
.pv-tab { flex: 1; min-width: 80px; display: flex; align-items: center; justify-content: center; gap: 5px; padding: 10px 6px 13px; background: none; border: none; color: var(--text3); font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: color .18s, border-color .18s; }
.pv-tab:hover { color: var(--text2); }
.pv-tab--on { color: var(--text); border-bottom-color: var(--accent); font-weight: 700; }
.pv-tab-count { background: rgba(255,107,53,.15); border: 1px solid rgba(255,107,53,.2); color: var(--accent); font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 10px; }

/* ════════════════════ GRID / CARD ════════════════════ */
.pv-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }
@media (min-width: 600px) { .pv-grid { grid-template-columns: repeat(4, 1fr); gap: 4px; } }
@media (min-width: 900px) { .pv-grid { grid-template-columns: repeat(5, 1fr); gap: 5px; } }

.pv-card { aspect-ratio: 9/16; background: var(--bg3); border-radius: 10px; overflow: hidden; position: relative; cursor: pointer; transition: transform .22s cubic-bezier(.34,1.2,.64,1), box-shadow .22s; }
.pv-card:hover { transform: scale(1.02); z-index: 2; box-shadow: 0 10px 34px rgba(0,0,0,.6); }
.pv-card:active { transform: scale(.97); }
.pv-card--skel { animation: pv-pulse 1.5s ease-in-out infinite; }
@keyframes pv-pulse { 0%,100%{opacity:.22} 50%{opacity:.55} }

.pv-card-media { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .4s ease; }
.pv-card:hover .pv-card-media { transform: scale(1.05); }
.pv-card-empty { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--bg3); }

/* Play icon central — aparece só no hover */
.pv-card-play-icon { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity .2s; pointer-events: none; }
.pv-card-play-icon svg { filter: drop-shadow(0 2px 8px rgba(0,0,0,.8)); }
.pv-card:hover .pv-card-play-icon { opacity: 1; }

/* Gradiente */
.pv-card-grad { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,.22) 0%, transparent 35%, transparent 45%, rgba(0,0,0,.5) 75%, rgba(0,0,0,.88) 100%); pointer-events: none; }

/* Tag de topo (Curtido / Salvo / Repost) */
.pv-card-top { position: absolute; top: 7px; left: 7px; z-index: 3; }
.pv-card-tag { display: inline-flex; align-items: center; gap: 3px; padding: 3px 7px; border-radius: 20px; font-size: 9px; font-weight: 800; backdrop-filter: blur(8px); letter-spacing: .3px; }
.pv-card-tag--liked { background: rgba(247,37,133,.7); color: #fff; }
.pv-card-tag--saved { background: rgba(255,214,10,.75); color: #000; }
.pv-card-tag--repost { background: rgba(76,201,240,.7); color: #000; }

/* Hover overlay: ações rápidas */
.pv-card-hover-overlay { position: absolute; inset: 0; display: flex; align-items: flex-end; justify-content: flex-end; padding: 8px; opacity: 0; transition: opacity .18s; pointer-events: none; z-index: 4; }
.pv-card:hover .pv-card-hover-overlay { opacity: 1; pointer-events: all; }
.pv-card-hover-actions { display: flex; flex-direction: column; gap: 5px; }
.pv-card-act-btn { width: 30px; height: 30px; border-radius: 50%; border: none; background: rgba(0,0,0,.65); backdrop-filter: blur(8px); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .16s cubic-bezier(.34,1.56,.64,1); }
.pv-card-act-btn:hover { background: rgba(255,255,255,.22); transform: scale(1.14); }
.pv-card-act-btn--liked svg { fill: #ff4e8a; }
.pv-card-act-btn--liked { background: rgba(247,37,133,.35) !important; }
.pv-card-act-btn--saved svg { fill: var(--gold); }
.pv-card-act-btn--saved { background: rgba(255,214,10,.25) !important; }
.pv-card-act-btn--delete:hover { background: rgba(255,44,44,.5) !important; }

/* Rodapé */
.pv-card-bottom { position: absolute; bottom: 0; left: 0; right: 0; padding: 6px 8px 8px; z-index: 3; }
.pv-card-title { font-size: 10.5px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 5px rgba(0,0,0,.9); margin-bottom: 4px; }
.pv-card-stats { display: flex; align-items: center; gap: 8px; }
.pv-card-stat { display: flex; align-items: center; gap: 3px; font-size: 9px; font-weight: 700; color: rgba(255,255,255,.8); text-shadow: 0 1px 4px rgba(0,0,0,.9); }
.pv-empty { grid-column: 1/-1; display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 0; }
.pv-empty-icon { color: var(--text4); }
.pv-empty-msg { font-size: 13px; color: var(--text3); text-align: center; }

.pv-ctx { position: fixed; z-index: 9000; background: var(--bg3); border: 1px solid var(--border2); border-radius: 14px; padding: 5px; min-width: 180px; box-shadow: 0 12px 44px rgba(0,0,0,.65); }
.pv-ctx button { display: flex; align-items: center; gap: 9px; width: 100%; padding: 9px 12px; border: none; background: none; color: var(--text2); font-size: 13px; font-family: 'DM Sans', sans-serif; cursor: pointer; border-radius: 9px; transition: background .12s, color .12s; text-align: left; }
.pv-ctx button:hover { background: var(--bg4); color: var(--text); }
.pv-ctx-sep { height: 1px; background: var(--border); margin: 4px 0; }
.pv-ctx-danger { color: #ff5555 !important; }
.pv-ctx-danger:hover { background: rgba(255,44,44,.07) !important; }
.pv-ctx-anim-enter-active, .pv-ctx-anim-leave-active { transition: all .16s ease; }
.pv-ctx-anim-enter-from, .pv-ctx-anim-leave-to { opacity: 0; transform: scale(.92) translateY(-4px); }

.pv-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.9); display: flex; align-items: center; justify-content: center; z-index: 8000; padding: 16px; overflow-y: auto; }
.pv-overlay--player { padding: 8px; }
.pv-modal { background: var(--bg3); width: 96%; max-width: 440px; padding: 24px; border-radius: 20px; border: 1px solid var(--border); max-height: 92vh; overflow-y: auto; box-shadow: 0 22px 62px rgba(0,0,0,.6); }
.pv-modal-hd { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.pv-modal-hd h3 { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: var(--text); }
.pv-modal-acts { display: flex; gap: 8px; margin-top: 8px; }
.pv-modal-anim-enter-active { transition: all .26s cubic-bezier(.34,1.2,.64,1); }
.pv-modal-anim-leave-active { transition: all .18s ease; }
.pv-modal-anim-enter-from { opacity: 0; transform: scale(.93) translateY(10px); }
.pv-modal-anim-leave-to { opacity: 0; transform: scale(.96) translateY(4px); }
.pv-close { width: 30px; height: 30px; border-radius: 8px; background: var(--bg4); border: 1px solid var(--border); color: var(--text3); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .16s; flex-shrink: 0; font-size: 13px; }
.pv-close:hover { background: var(--bg5); color: var(--text); }
.pv-link-btn { background: none; border: none; color: var(--accent); font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: opacity .15s; }
.pv-link-btn:hover { opacity: .75; }

/* ════════════════════ PLAYER ════════════════════ */
.pv-overlay--player { padding: 6px; }
.pv-player { background: var(--bg3); width: 99%; max-width: 960px; border-radius: 18px; border: 1px solid var(--border); overflow: hidden; max-height: 96vh; display: flex; flex-direction: column; box-shadow: 0 24px 64px rgba(0,0,0,.7); }

/* Header topo */
.pv-player-top { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; gap: 10px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.pv-player-who { display: flex; align-items: center; gap: 10px; cursor: pointer; flex: 1; min-width: 0; transition: opacity .15s; }
.pv-player-who:hover { opacity: .8; }
.pv-player-av { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border3); flex-shrink: 0; }
.pv-player-t { font-size: 13.5px; font-weight: 700; margin-bottom: 2px; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 260px; }
.pv-player-d { font-size: 11px; color: var(--text3); }
.pv-player-top-right { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
.pv-icon-btn--del:hover { background: rgba(255,44,44,.1) !important; color: #ff5555 !important; border-color: rgba(255,44,44,.3) !important; }

/* Corpo: vídeo + comentários lado a lado */
.pv-player-body { display: flex; flex: 1; overflow: hidden; min-height: 0; }

/* Coluna esquerda */
.pv-player-left { display: flex; flex-direction: column; flex-shrink: 0; width: 380px; }
.pv-player-media { flex: 1; background: #000; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; min-height: 0; }
.pv-player-video { width: 100%; height: 100%; max-height: 80vh; object-fit: contain; display: block; }
.pv-player-img { width: 100%; max-height: 80vh; object-fit: contain; }
.pv-player-null { display: flex; flex-direction: column; align-items: center; gap: 10px; color: var(--text4); font-size: 13px; }

/* Botões laterais TikTok-style */
.pv-player-tkt-side { position: absolute; right: 10px; bottom: 70px; display: flex; flex-direction: column; align-items: center; gap: 12px; z-index: 5; }
.pv-player-tkt-btn { display: flex; flex-direction: column; align-items: center; gap: 4px; background: rgba(0,0,0,.58); backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,.12); border-radius: 14px; padding: 11px 9px; cursor: pointer; color: #fff; min-width: 54px; font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 700; transition: all .18s cubic-bezier(.34,1.56,.64,1); }
.pv-player-tkt-btn:hover { background: rgba(255,255,255,.2); transform: scale(1.08); }
.pv-player-tkt-btn:active { transform: scale(.92); }
.pv-player-tkt-btn--static { cursor: default; }
.pv-player-tkt-btn--static:hover { background: rgba(0,0,0,.58); transform: none; }
.pv-player-tkt-btn--liked svg { fill: #ff4e8a; filter: drop-shadow(0 0 8px rgba(247,37,133,.7)); }
.pv-player-tkt-btn--liked { border-color: rgba(247,37,133,.45) !important; }
.pv-player-tkt-btn--saved svg { fill: var(--gold); }
.pv-player-tkt-btn--repost svg { fill: var(--cyan); }

/* Descrição sobre o vídeo */
.pv-player-bio { position: absolute; bottom: 0; left: 0; right: 0; padding: 28px 14px 12px; background: linear-gradient(transparent, rgba(0,0,0,.78)); pointer-events: none; }
.pv-player-bio p { font-size: 12.5px; color: rgba(255,255,255,.88); line-height: 1.55; text-shadow: 0 1px 4px rgba(0,0,0,.8); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* Coluna direita: comentários */
.pv-player-side { flex: 1; background: var(--bg2); border-left: 1px solid var(--border); display: flex; flex-direction: column; overflow: hidden; min-width: 0; }

/* Area de comentário (input + gif picker) */
.pv-cmt-area { flex-shrink: 0; position: relative; }

/* GIF Picker */
.pv-gif-picker { position: absolute; bottom: 100%; left: 0; right: 0; background: var(--bg3); border: 1px solid var(--border2); border-radius: 14px 14px 0 0; overflow: hidden; z-index: 20; display: flex; flex-direction: column; max-height: 280px; box-shadow: 0 -8px 32px rgba(0,0,0,.4); }
.pv-gif-header { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.pv-gif-search { flex: 1; display: flex; align-items: center; gap: 7px; background: var(--bg2); border: 1px solid var(--border); border-radius: 20px; padding: 6px 12px; }
.pv-gif-input { flex: 1; background: none; border: none; color: var(--text); font-size: 12.5px; outline: none; font-family: 'DM Sans', sans-serif; }
.pv-gif-input::placeholder { color: var(--text4); }
.pv-gif-close { width: 26px; height: 26px; border-radius: 50%; background: var(--bg4); border: none; color: var(--text3); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 11px; transition: all .15s; flex-shrink: 0; }
.pv-gif-close:hover { background: rgba(255,44,44,.15); color: #ff5555; }
.pv-gif-loading { display: flex; justify-content: center; padding: 20px; }
.pv-gif-hint { display: flex; flex-direction: column; align-items: center; gap: 6px; color: var(--text4); font-size: 12px; padding: 24px 12px; text-align: center; }
.pv-gif-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; padding: 8px; overflow-y: auto; flex: 1; }
.pv-gif-item { width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: 8px; cursor: pointer; transition: all .18s cubic-bezier(.34,1.2,.64,1); border: 2px solid transparent; }
.pv-gif-item:hover { transform: scale(1.04); border-color: var(--accent); box-shadow: 0 4px 14px rgba(255,107,53,.3); }

/* Botão GIF no input */
.pv-gif-btn { height: 30px; padding: 0 9px; border-radius: 8px; background: var(--bg4); border: 1px solid var(--border2); color: var(--text3); cursor: pointer; font-family: 'Syne', sans-serif; transition: all .16s; flex-shrink: 0; display: flex; align-items: center; }
.pv-gif-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(255,107,53,.07); }
.pv-gif-btn--on { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #fff !important; border-color: transparent; }

/* Botão comentários ativo */
.pv-player-tkt-btn--cmt-on { border-color: var(--accent) !important; background: rgba(255,107,53,.18) !important; }
.pv-player-tkt-btn--cmt-on svg { fill: var(--accent); filter: drop-shadow(0 0 6px rgba(255,107,53,.6)); }

/* Slide da coluna de comentários */
.pv-slide-right-enter-active { transition: all .28s cubic-bezier(.34,1.2,.64,1); }
.pv-slide-right-leave-active { transition: all .2s ease; }
.pv-slide-right-enter-from { opacity: 0; transform: translateX(32px); }
.pv-slide-right-leave-to   { opacity: 0; transform: translateX(16px); }

/* GIF no comentário */
.pv-cmt-gif { max-width: 180px; width: 100%; border-radius: 8px; margin-top: 4px; display: block; border: 1px solid var(--border); }

@media (max-width: 640px) {
  .pv-player { max-height: 100vh; border-radius: 0; }
  .pv-player-body { flex-direction: column; }
  .pv-player-left { width: 100%; flex: none; }
  .pv-player-media { max-height: 52vh; }
  .pv-player-side { border-left: none; border-top: 1px solid var(--border); max-height: 45vh; }
}

.pv-comments { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.pv-comments-head { display: flex; align-items: center; gap: 7px; padding: 12px 12px 7px; flex-shrink: 0; }
.pv-comments-head span:first-child { font-size: 10px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: .8px; }
.pv-cmt-badge { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #fff; font-size: 9px; font-weight: 800; padding: 1px 6px; border-radius: 10px; }
.pv-comments-list { flex: 1; overflow-y: auto; padding: 0 8px 8px; display: flex; flex-direction: column; gap: 5px; scrollbar-width: thin; scrollbar-color: var(--bg4) transparent; }
.pv-cmt-loading { display: flex; align-items: center; justify-content: center; padding: 20px; }
.pv-cmt-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: var(--text4); font-size: 12px; padding: 40px 20px; flex: 1; }
.pv-cmt { display: flex; align-items: flex-start; gap: 7px; padding: 8px; border-radius: 10px; background: var(--bg3); border: 1px solid var(--border); transition: background .12s; animation: pv-cmt-in .22s ease; }
@keyframes pv-cmt-in { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
.pv-cmt:hover { background: var(--bg4); }
.pv-cmt-av { width: 26px; height: 26px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 1px solid var(--border2); }
.pv-cmt-body { flex: 1; }
.pv-cmt-meta { display: flex; align-items: center; gap: 5px; margin-bottom: 3px; }
.pv-cmt-user { font-size: 11px; font-weight: 700; color: var(--accent); }
.pv-cmt-time { font-size: 10px; color: var(--text4); }
.pv-cmt-txt { font-size: 12px; color: var(--text2); line-height: 1.45; word-break: break-word; margin-bottom: 4px; }
.pv-cmt-acts { display: flex; gap: 10px; }
.pv-cmt-like { background: none; border: none; color: var(--text3); font-size: 11px; cursor: pointer; padding: 0; font-family: 'DM Sans', sans-serif; transition: color .15s; display: flex; align-items: center; gap: 3px; }
.pv-cmt-like:hover, .pv-cmt-like.active { color: var(--accent); }
.pv-cmt-reply { background: none; border: none; color: var(--text3); font-size: 11px; cursor: pointer; padding: 0; font-family: 'DM Sans', sans-serif; transition: color .15s; }
.pv-cmt-reply:hover { color: var(--text2); }
.pv-cmt-del { background: transparent; border: none; color: var(--text4); cursor: pointer; padding: 2px; transition: color .15s; }
.pv-cmt-del:hover { color: #ff5555; }
.pv-cmt-del-inline { background: none; border: none; color: var(--text4); font-size: 10.5px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: color .14s; padding: 0; }
.pv-cmt-del-inline:hover { color: #ff5555; }
.pv-cmt-input-row { display: flex; align-items: center; gap: 7px; padding: 10px; border-top: 1px solid var(--border); flex-shrink: 0; background: var(--bg); }
.pv-cmt-input { flex: 1; background: var(--bg3); border: 1px solid var(--border); border-radius: 20px; padding: 7px 12px; color: var(--text); font-size: 12px; outline: none; font-family: 'DM Sans', sans-serif; transition: border-color .2s; }
.pv-cmt-input:focus { border-color: var(--accent); }
.pv-cmt-input::placeholder { color: var(--text4); }
.pv-cmt-send { width: 32px; height: 32px; border-radius: 50%; border: none; background: var(--bg4); color: var(--text4); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .18s cubic-bezier(.34,1.2,.64,1); }
.pv-cmt-send--on { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #fff; box-shadow: 0 2px 10px rgba(255,107,53,.35); }
.pv-cmt-send--on:hover { transform: scale(1.1); }

.pv-notif-list { display: flex; flex-direction: column; gap: 1px; max-height: 58vh; overflow-y: auto; }
.pv-notif-row { display: flex; align-items: flex-start; gap: 10px; padding: 10px 8px; border-radius: 10px; cursor: pointer; transition: background .12s; position: relative; }
.pv-notif-row:hover { background: var(--bg4); }
.pv-notif-row--unread { background: rgba(255,107,53,.03); }
.pv-notif-av { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 1.5px solid var(--border3); }
.pv-notif-body { flex: 1; }
.pv-notif-txt { font-size: 12px; color: var(--text2); line-height: 1.5; margin-bottom: 2px; }
.pv-notif-txt strong { color: var(--text); }
.pv-notif-time { font-size: 10px; color: var(--text4); }
.pv-notif-dot { width: 7px; height: 7px; background: var(--accent); border-radius: 50%; flex-shrink: 0; margin-top: 5px; }

.pv-cfg-modal { max-width: 640px; width: 98%; padding: 0; overflow: hidden; }
.pv-cfg-layout { display: flex; max-height: 76vh; }
.pv-cfg-nav { width: 160px; flex-shrink: 0; background: var(--bg2); border-right: 1px solid var(--border); padding: 12px 8px 16px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
.pv-cfg-tab { display: flex; align-items: center; gap: 8px; width: 100%; padding: 9px 11px; border: none; background: none; color: var(--text3); font-size: 13px; font-weight: 500; cursor: pointer; border-radius: 8px; transition: all .16s; font-family: 'DM Sans', sans-serif; text-align: left; }
.pv-cfg-tab:hover { background: var(--bg4); color: var(--text2); }
.pv-cfg-tab.active { background: rgba(255,107,53,.08); color: var(--text); border-left: 2px solid var(--accent); padding-left: 9px; }
.pv-cfg-logout { color: #ff5555; margin-top: auto; }
.pv-cfg-logout:hover { background: rgba(255,44,44,.06) !important; }
.pv-cfg-sep { height: 1px; background: var(--border); margin: 8px 0; }
.pv-cfg-body { flex: 1; padding: 22px; overflow-y: auto; }
.pv-cfg-sec { font-size: 10px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: .7px; margin: 0 0 12px; }
.pv-cfg-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border); gap: 10px; }
.pv-cfg-row-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.pv-cfg-row-label { font-size: 12px; color: var(--text2); font-weight: 500; }
.pv-cfg-val { font-size: 12px; color: var(--text3); }
.pv-cfg-masked { font-family: monospace; letter-spacing: .5px; }
.pv-cfg-edit-btn { background: var(--bg4); border: 1px solid var(--border2); color: var(--text2); font-size: 11px; font-weight: 700; padding: 5px 11px; border-radius: 7px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .15s; flex-shrink: 0; white-space: nowrap; }
.pv-cfg-edit-btn:hover { border-color: var(--accent); color: var(--accent); }
.pv-cfg-edit-btn:disabled { opacity: .5; cursor: not-allowed; }
.pv-cfg-eye-btn { background: var(--bg4); border: 1px solid var(--border); color: var(--text3); width: 30px; height: 30px; border-radius: 7px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .15s; flex-shrink: 0; }
.pv-cfg-eye-btn:hover { border-color: var(--border3); color: var(--text); }
.pv-cfg-toggle { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border); gap: 12px; }
.pv-cfg-toggle-info { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.pv-cfg-toggle-info > span { font-size: 13px; color: var(--text2); font-weight: 500; }
.pv-cfg-toggle-sub { font-size: 10.5px; color: var(--text4); line-height: 1.4; }
.pv-cfg-sync-hint { display: flex; align-items: center; gap: 5px; font-size: 10px; color: var(--green); margin-top: 14px; opacity: .8; }
.pv-cfg-apps-empty { text-align: center; padding: 16px; color: var(--text4); font-size: 12px; border: 1px dashed var(--border2); border-radius: var(--r-sm); }
.pv-tema-row { display: flex; gap: 10px; flex-wrap: wrap; }
.pv-tema-opt { display: flex; align-items: center; gap: 7px; padding: 10px 18px; background: var(--bg3); border: 1.5px solid var(--border); border-radius: 10px; color: var(--text2); font-size: 13px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all .18s; font-weight: 600; }
.pv-tema-opt.active { border-color: var(--accent); color: var(--text); background: rgba(255,107,53,.06); }
.pv-danger-zone { display: flex; gap: 8px; flex-wrap: wrap; }
.pv-danger-btn { flex: 1; min-width: 140px; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px; background: rgba(255,44,44,.04); color: #ff7070; border: 1px solid rgba(255,44,44,.14); border-radius: 9px; font-size: 12.5px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background .14s; }
.pv-danger-btn--red { color: #ff3333; border-color: rgba(255,44,44,.25); }
.pv-danger-btn--red:hover { background: rgba(255,44,44,.15); }
.pv-danger-btn:disabled { opacity: .5; cursor: not-allowed; }
.pv-blocklist-input-row { display: flex; gap: 8px; margin-bottom: 12px; }
.pv-field-inp { flex: 1; background: var(--bg2); border: 1px solid var(--border); padding: 9px 12px; color: var(--text); border-radius: var(--r-sm); font-size: 13px; outline: none; font-family: 'DM Sans', sans-serif; transition: border-color .2s; }
.pv-field-inp:focus { border-color: var(--accent); }
.pv-blocklist-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.pv-blocklist-tag { display: flex; align-items: center; gap: 5px; background: var(--bg3); border: 1px solid var(--border2); color: var(--text2); font-size: 11px; padding: 4px 10px; border-radius: 20px; }
.pv-blocklist-tag button { background: none; border: none; color: var(--text4); cursor: pointer; font-size: 11px; transition: color .14px; padding: 0; }
.pv-blocklist-tag button:hover { color: #ff5555; }

.pv-confirm-modal {
  background: var(--bg3);
  border: 1px solid var(--border2);
  border-radius: 20px;
  padding: 28px 24px 22px;
  max-width: 320px;
  width: 92%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  box-shadow: 0 22px 60px rgba(0,0,0,.7);
}
.pv-confirm-icon {
  width: 56px; height: 56px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 4px;
}
.pv-confirm-icon--lixeira { background: rgba(255,44,44,.1); color: #ff5555; }
.pv-confirm-icon--foto    { background: rgba(255,107,53,.1); color: var(--accent); }
.pv-confirm-icon--todos   { background: rgba(180,0,0,.15); color: #ff3333; }
.pv-confirm-titulo {
  font-family: 'Syne', sans-serif;
  font-size: 17px; font-weight: 700;
  color: var(--text);
}
.pv-confirm-sub {
  font-size: 13px; color: var(--text3);
  line-height: 1.55; max-width: 260px;
}
.pv-confirm-btns {
  display: flex; gap: 10px;
  margin-top: 8px; width: 100%;
}
.pv-confirm-del-btn {
  flex: 1.5;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  padding: 11px;
  background: linear-gradient(135deg, #ff3333, #cc0000);
  color: #fff;
  border: none; border-radius: 10px;
  font-size: 14px; font-weight: 700;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  box-shadow: 0 2px 14px rgba(220,0,0,.35);
  transition: all .18s;
}
.pv-confirm-del-btn:hover {
  box-shadow: 0 4px 22px rgba(220,0,0,.55);
  transform: translateY(-1px);
}

@media (max-width: 560px) {
  .pv-cfg-layout { flex-direction: column; }
  .pv-cfg-nav { width: 100%; flex-direction: row; overflow-x: auto; gap: 2px; padding: 8px; }
  .pv-cfg-tab { white-space: nowrap; border-left: none !important; padding-left: 11px !important; border-bottom: 2px solid transparent; flex-shrink: 0; }
  .pv-cfg-tab.active { border-bottom-color: var(--accent); }
}

.pv-sw { position: relative; display: inline-block; width: 40px; height: 22px; flex-shrink: 0; }
.pv-sw input { opacity: 0; width: 0; height: 0; }
.pv-sw-track { position: absolute; cursor: pointer; inset: 0; background: var(--bg4); border-radius: 22px; transition: .3s; border: 1px solid var(--border2); }
.pv-sw-track:before { content: ''; position: absolute; height: 16px; width: 16px; left: 2px; bottom: 2px; background: var(--text3); border-radius: 50%; transition: .3s; }
input:checked + .pv-sw-track { background: linear-gradient(90deg, var(--accent), var(--accent2)); border-color: transparent; }
input:checked + .pv-sw-track:before { transform: translateX(18px); background: #fff; box-shadow: 0 0 7px rgba(255,107,53,.4); }

.pv-crop-panel { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r); padding: 18px; margin-bottom: 18px; animation: pv-cmt-in .22s ease; }
.pv-crop-wrap { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.pv-crop-canvas { border-radius: 50%; border: 2.5px solid var(--border3); display: block; width: 200px; height: 200px; cursor: grab; touch-action: none; box-shadow: 0 0 0 4px rgba(255,107,53,.08); transition: box-shadow .2s; }
.pv-crop-canvas:active { cursor: grabbing; box-shadow: 0 0 0 6px rgba(255,107,53,.16); }
.pv-crop-canvas--capa { border-radius: 8px; width: 100%; height: auto; max-width: 560px; aspect-ratio: 960/330; }
.pv-crop-hint { font-size: 11px; color: var(--text4); text-align: center; }
.pv-crop-zoom { display: flex; align-items: center; gap: 10px; margin-top: 14px; padding: 0 2px; }
.pv-crop-zoom-label { font-size: 11px; color: var(--text3); flex-shrink: 0; }
.pv-crop-slider { flex: 1; accent-color: var(--accent); cursor: pointer; height: 4px; }
.pv-crop-zoom-val { font-size: 11px; color: var(--text3); min-width: 38px; text-align: right; flex-shrink: 0; }
.pv-crop-open-btn:hover { border-color: var(--accent) !important; color: var(--accent) !important; }

.pv-field { margin-bottom: 14px; }
.pv-field label { display: flex; justify-content: space-between; align-items: center; font-size: 10px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: .6px; margin-bottom: 6px; }
.pv-field-count { font-weight: 400; color: var(--text4); text-transform: none; }
.pv-field input, .pv-field textarea { width: 100%; background: var(--bg2); border: 1px solid var(--border); padding: 10px 12px; color: var(--text); border-radius: var(--r-sm); font-size: 14px; outline: none; font-family: 'DM Sans', sans-serif; transition: border-color .2s, box-shadow .2s; resize: vertical; }
.pv-field input:focus, .pv-field textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(255,107,53,.07); }
.pv-prefix-wrap { display: flex; align-items: center; background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r-sm); overflow: hidden; }
.pv-prefix-wrap:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(255,107,53,.07); }
.pv-prefix { padding: 0 0 0 12px; color: var(--text4); font-size: 14px; }
.pv-prefix-wrap input { border: none !important; padding-left: 4px; background: transparent; box-shadow: none !important; }
.pv-sel { width: 100%; background: var(--bg2); border: 1px solid var(--border); color: var(--text); padding: 10px 12px; border-radius: var(--r-sm); font-size: 13px; font-family: 'DM Sans', sans-serif; outline: none; }
.pv-erro { background: rgba(255,44,44,.05); border: 1px solid rgba(255,44,44,.18); color: #ff6666; border-radius: var(--r-sm); padding: 9px 12px; font-size: 12px; margin-bottom: 13px; }
.pv-edit-capa-wrap { margin-bottom: 15px; }
.pv-edit-capa { width: 100%; height: 110px; border-radius: 12px; background: var(--bg2); border: 1px solid var(--border); background-size: cover; background-position: center; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.pv-edit-capa-empty { display: flex; flex-direction: column; align-items: center; gap: 5px; color: var(--text4); font-size: 12px; }
.pv-edit-capa-btn { position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,.65); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,.15); color: #fff; font-size: 11px; font-weight: 600; padding: 6px 11px; border-radius: 16px; cursor: pointer; transition: all .16s; font-family: 'DM Sans', sans-serif; }
.pv-edit-capa-btn:hover { background: rgba(255,107,53,.7); }
.pv-edit-av-row { display: flex; align-items: center; gap: 12px; background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r-sm); padding: 12px; margin-bottom: 14px; }
.pv-edit-av-wrap { position: relative; width: 54px; height: 54px; flex-shrink: 0; }
.pv-edit-av { width: 54px; height: 54px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border2); }
.pv-edit-av-over { position: absolute; inset: 0; background: rgba(0,0,0,.6); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0; transition: opacity .2s; }
.pv-edit-av-wrap:hover .pv-edit-av-over { opacity: 1; }
.pv-edit-av-hint { font-size: 12px; color: var(--text3); }
.pv-btn { height: 40px; padding: 0 20px; border-radius: var(--r-sm); font-size: 13px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all .2s cubic-bezier(.34,1.2,.64,1); border: none; letter-spacing: -.1px; }
.pv-btn--primary { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #fff; box-shadow: 0 2px 14px rgba(255,107,53,.28); }
.pv-btn--primary:hover { box-shadow: 0 4px 26px rgba(255,107,53,.45); transform: translateY(-1px) scale(1.02); }
.pv-btn--primary:active { transform: scale(.96); }
.pv-btn--primary:disabled { background: rgba(255,107,53,.3); cursor: not-allowed; box-shadow: none; transform: none; }
.pv-btn--ghost { background: transparent; color: var(--text); border: 1px solid var(--border2); flex: 1; justify-content: center; }
.pv-btn--ghost:hover { background: var(--bg3); border-color: var(--border3); transform: translateY(-1px); }
.pv-btn--ghost:active { transform: scale(.96); }
.pv-btn--ghost:disabled { opacity: .5; cursor: not-allowed; transform: none; }
.pv-btn.pv-btn--primary { flex: 2; justify-content: center; }
.pv-icon-btn { width: 40px; height: 40px; border-radius: var(--r-sm); background: transparent; border: 1px solid var(--border2); color: var(--text2); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .18s; position: relative; }
.pv-icon-btn:hover { background: var(--bg3); border-color: var(--border3); color: var(--text); transform: scale(1.06); }

.pv-share-who { display: flex; align-items: center; gap: 11px; padding: 11px; background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r-sm); margin-bottom: 14px; }
.pv-share-av { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border3); }
.pv-share-user { font-size: 13.5px; font-weight: 700; color: var(--text); margin-bottom: 2px; }
.pv-share-nome { font-size: 11px; color: var(--text3); }
.pv-qr-box { display: flex; justify-content: center; align-items: center; background: var(--bg2); border-radius: 10px; padding: 14px; border: 1px solid var(--border); min-height: 190px; margin-bottom: 11px; }
.pv-qr-load { display: flex; align-items: center; gap: 8px; color: var(--text4); font-size: 12px; }
.pv-qr-img { width: 180px; height: 180px; border-radius: 8px; }
.pv-link-box { display: flex; align-items: center; gap: 7px; background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r-sm); padding: 10px 12px; margin-bottom: 13px; overflow: hidden; }
.pv-link-txt { flex: 1; color: var(--text3); font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pv-link-copy { background: var(--bg3); border: 1px solid var(--border2); color: var(--text); padding: 5px 10px; border-radius: 6px; cursor: pointer; transition: all .16s; display: flex; align-items: center; justify-content: center; }
.pv-link-copy:hover { transform: scale(1.05); }
.pv-link-copy.copied { background: rgba(16,185,129,.1); color: var(--green); border-color: rgba(16,185,129,.3); }

.pv-report-hint { font-size: 12px; color: var(--text3); margin-bottom: 11px; }
.pv-report-list { display: flex; flex-direction: column; gap: 2px; }
.pv-report-opt { display: flex; align-items: center; gap: 10px; padding: 9px 11px; border-radius: 9px; cursor: pointer; transition: background .12s; font-size: 13px; color: var(--text2); }
.pv-report-opt:hover { background: var(--bg4); }
.pv-report-opt input { accent-color: var(--accent); }

.pv-hl-fotos-row { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
.pv-hl-fotos-row::-webkit-scrollbar { display: none; }
.pv-hl-add-card { width: 74px; min-width: 74px; height: 74px; border-radius: 10px; border: 1.5px dashed var(--border2); background: var(--bg2); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; cursor: pointer; color: var(--text4); font-size: 10px; font-weight: 600; transition: all .16s; flex-shrink: 0; }
.pv-hl-add-card:hover { border-color: var(--accent); color: var(--accent); }
.pv-hl-thumb { position: relative; width: 74px; min-width: 74px; height: 74px; border-radius: 10px; overflow: hidden; flex-shrink: 0; border: 1px solid var(--border); }
.pv-hl-thumb img { width: 100%; height: 100%; object-fit: cover; }
.pv-hl-rm { position: absolute; top: 3px; right: 3px; width: 18px; height: 18px; border-radius: 50%; background: rgba(0,0,0,.75); border: none; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 9px; transition: background .14s; }
.pv-hl-rm:hover { background: var(--accent2); }
.pv-hl-capa-badge { position: absolute; bottom: 3px; left: 3px; background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #fff; font-size: 8px; font-weight: 800; padding: 2px 5px; border-radius: 5px; }
.pv-hl-cor-row { display: flex; gap: 8px; flex-wrap: wrap; }
.pv-hl-cor { width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: transform .18s cubic-bezier(.34,1.56,.64,1); }
.pv-hl-cor:hover { transform: scale(1.2); }
.pv-hl-cor--on { border-color: rgba(255,255,255,.65); transform: scale(1.12); box-shadow: 0 0 10px rgba(0,0,0,.4); }

.pv-list-loading { display: flex; align-items: center; justify-content: center; padding: 34px; }
.pv-list-empty { text-align: center; color: var(--text4); font-size: 13px; padding: 34px 20px; }
.pv-list-scroll { overflow-y: auto; max-height: 55vh; display: flex; flex-direction: column; scrollbar-width: thin; scrollbar-color: var(--bg4) transparent; padding-bottom: 14px; }
.pv-list-row { display: flex; align-items: center; gap: 10px; padding: 9px 16px; cursor: pointer; transition: background .12s; border-radius: 8px; }
.pv-list-row:hover { background: var(--bg4); }
.pv-list-av { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--border3); flex-shrink: 0; }
.pv-list-info { flex: 1; display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.pv-list-user { font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text); }
.pv-list-nome { font-size: 11px; color: var(--text3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.pv-spinner { display: inline-block; width: 12px; height: 12px; border: 2px solid rgba(255,255,255,.2); border-top-color: #fff; border-radius: 50%; animation: pv-spin .7s linear infinite; }
.pv-spin { width: 30px; height: 30px; border: 2.5px solid var(--border2); border-top-color: var(--accent); border-radius: 50%; animation: pv-spin .8s linear infinite; }
.pv-spin-sm { width: 16px; height: 16px; border: 2px solid var(--border2); border-top-color: var(--accent); border-radius: 50%; animation: pv-spin .7s linear infinite; }
@keyframes pv-spin { to { transform: rotate(360deg); } }

.pv-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); color: #fff; padding: 10px 22px; border-radius: 50px; font-weight: 700; font-size: 13px; z-index: 9999; white-space: nowrap; box-shadow: 0 4px 22px rgba(0,0,0,.52); pointer-events: none; }
.pv-toast--success { background: rgba(4,30,4,.97); border: 1px solid rgba(32,200,60,.3); }
.pv-toast--error   { background: rgba(34,4,4,.97); border: 1px solid rgba(220,40,40,.3); }
.pv-toast--info    { background: var(--bg3); border: 1px solid var(--border2); }
.pv-toast--warning { background: rgba(34,18,0,.97); border: 1px solid rgba(255,150,0,.3); }
.pv-toast-anim-enter-active, .pv-toast-anim-leave-active { transition: all .22s cubic-bezier(.34,1.2,.64,1); }
.pv-toast-anim-enter-from, .pv-toast-anim-leave-to { opacity: 0; transform: translateX(-50%) translateY(8px) scale(.92); }

/* ── "Seguir de volta" — botão azul-ciano ── */
.pv-sugg-btn--back { background: linear-gradient(135deg, var(--accent), var(--accent2)) !important; box-shadow: 0 2px 8px rgba(255,107,53,.22) !important; }
.pv-sugg-btn--back:hover { box-shadow: 0 4px 16px rgba(255,107,53,.4) !important; }

/* ── Badge "segue você" ── */
.pv-list-segue-badge { display: inline-block; background: rgba(255,107,53,.1); border: 1px solid rgba(255,107,53,.25); color: var(--accent); font-size: 9px; font-weight: 700; padding: 1px 6px; border-radius: 10px; margin-left: 5px; vertical-align: middle; letter-spacing: .2px; }

/* ── Botões na linha da lista ── */
.pv-list-btns { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.pv-list-remove-btn { height: 30px; padding: 0 10px; border-radius: 7px; background: rgba(255,44,44,.06); border: 1px solid rgba(255,44,44,.2); color: #ff7070; font-size: 11px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .16s; white-space: nowrap; }
.pv-list-remove-btn:hover { background: rgba(255,44,44,.14); border-color: rgba(255,44,44,.4); color: #ff4444; }

.pv-back-row {
  padding: 14px 0 6px;
}

.pv-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: var(--bg3);
  border: 1px solid var(--border2);
  color: var(--text2);
  padding: 7px 14px 7px 10px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: all .18s;
}

.pv-back-btn:hover {
  background: var(--bg4);
  color: var(--text);
  border-color: var(--border3);
  transform: translateX(-2px);
}
@media (max-width: 560px) {
  .pv-body { padding: 0 12px 80px; }
  .pv-ig-top { gap: 16px; }
  .pv-av-ring { width: 80px; height: 80px; }
  .pv-name { font-size: 17px; }
  .pv-ig-stat { padding: 0 12px 0 0; }
  .pv-ig-stat-n { font-size: 13px; }
  .pv-ig-stat-l { font-size: 12px; }
  .pv-ig-btn { height: 30px; padding: 0 12px; font-size: 12.5px; }
  .pv-modal { padding: 16px 12px; }
  .pv-grid { grid-template-columns: repeat(3, 1fr); gap: 3px; }
  .pv-sugg-nav { display: none; }
  .pv-crop-canvas { width: 160px; height: 160px; }
  .pv-crop-canvas--capa { width: 260px; height: 89px; }
}
/* ════════════════════ PLAYER SIMPLES ════════════════════ */
.pv-player-simple {
  position: relative;
  width: min(420px, 98vw);
  max-height: 94vh;
  border-radius: 16px;
  overflow: hidden;
  background: #000;
  box-shadow: 0 24px 64px rgba(0,0,0,.85);
}
.pv-player-simple-video {
  width: 100%;
  max-height: 94vh;
  object-fit: contain;
  display: block;
}
.pv-player-simple-close {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0,0,0,.65);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,.15);
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .15s;
}
.pv-player-simple-close:hover { background: rgba(255,255,255,.2); }
.pv-player-simple-null {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 300px;
  color: rgba(255,255,255,.4);
  font-size: 13px;
}
</style>