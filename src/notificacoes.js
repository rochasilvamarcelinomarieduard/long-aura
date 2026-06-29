import { supabase } from './supabase.js'
import { authState } from './auth.js'

// ── Busca notificações ────────────────────────────────────────────────────────
export async function fetchNotificacoes() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('notificacoes')
    .select(`*, profiles:from_user_id(username, avatar_url)`)
    .eq('to_user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) { console.error('Erro ao carregar notificações:', error.message); return [] }
  return data
}

export async function marcarLida(id) {
  await supabase.from('notificacoes').update({ lida: true }).eq('id', id)
}

export async function marcarTodasLidas() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('notificacoes').update({ lida: true }).eq('to_user_id', user.id)
}

export async function removerNotificacao(id) {
  await supabase.from('notificacoes').delete().eq('id', id)
}

export async function criarNotificacao({ toUserId, fromUserId, tipo, videoId = null, texto = null }) {
  if (!toUserId || !fromUserId || toUserId === fromUserId) return
  const { error } = await supabase.from('notificacoes').insert({
    to_user_id: toUserId, from_user_id: fromUserId, tipo,
    video_id: videoId, texto, lida: false,
  })
  if (error) console.error('criarNotificacao:', error.message)
}

// ── Realtime ──────────────────────────────────────────────────────────────────
// Estratégia: polling + realtime juntos.
// O realtime pega eventos instantâneos quando a conexão WS está ativa.
// O polling (a cada 15s) garante que nada seja perdido se o WS falhou.
// ─────────────────────────────────────────────────────────────────────────────
export function subscribeToNotificacoes(callback) {
  let _destroyed   = false
  let _channel     = null
  let _busy        = false
  let _retryTimer  = null
  let _pollTimer   = null
  let _lastSeenId  = null   // evita disparar callback para notificações já conhecidas

  async function _teardown() {
    if (_channel) {
      try { await supabase.removeChannel(_channel) } catch {}
      _channel = null
    }
  }

  async function _createChannel(user, retryCount = 0) {
    if (_destroyed || _busy) return
    _busy = true
    await _teardown()
    if (_destroyed) { _busy = false; return }

    const ch = supabase.channel(`notif_${user.id}_${Date.now()}`)

    ch.on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'notificacoes',
      filter: `to_user_id=eq.${user.id}`,
    }, (payload) => {
      if (_destroyed) return
      const n = payload.new
      if (n.id === _lastSeenId) return
      _lastSeenId = n.id
      callback(n)
    })

    ch.subscribe((status) => {
      _busy = false
      if (status === 'SUBSCRIBED') {
        console.log('[notif] realtime ativo')
        return
      }
      if ((status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') && !_destroyed) {
        const delay = Math.min(1000 * 2 ** retryCount, 30_000)
        console.warn(`[notif] ${status} — retry em ${delay}ms`)
        _retryTimer = setTimeout(() => _createChannel(user, Math.min(retryCount + 1, 5)), delay)
      }
    })

    _channel = ch
  }

  // Polling como fallback — busca notificações novas a cada 15s
  async function _poll(user) {
    if (_destroyed) return
    try {
      const query = supabase
        .from('notificacoes')
        .select('*')
        .eq('to_user_id', user.id)
        .eq('lida', false)
        .order('created_at', { ascending: false })
        .limit(5)

      const { data } = await query
      if (!data?.length) return

      // Dispara callback só para notificações que ainda não foram processadas
      for (const n of data) {
        if (n.id !== _lastSeenId && !_destroyed) {
          _lastSeenId = n.id
          callback(n)
          break  // uma por vez para evitar flood
        }
      }
    } catch {}
    if (!_destroyed) _pollTimer = setTimeout(() => _poll(user), 15_000)
  }

  function _onVisibility() {
    if (_destroyed || document.visibilityState !== 'visible') return
    const user = authState.user
    if (!user) return
    clearTimeout(_retryTimer)
    // Recriar canal ao voltar à aba
    _createChannel(user, 0)
    // Polling imediato ao voltar
    _poll(user)
  }

  function _start(tentativa = 0) {
    if (_destroyed) return
    const user = authState.user
    if (!user) {
      if (tentativa < 20) setTimeout(() => _start(tentativa + 1), 300)
      return
    }
    _createChannel(user)
    _pollTimer = setTimeout(() => _poll(user), 15_000)
  }

  document.addEventListener('visibilitychange', _onVisibility)
  _start()

  return {
    unsubscribe() {
      _destroyed = true
      clearTimeout(_retryTimer)
      clearTimeout(_pollTimer)
      document.removeEventListener('visibilitychange', _onVisibility)
      _teardown()
    },
  }
}
