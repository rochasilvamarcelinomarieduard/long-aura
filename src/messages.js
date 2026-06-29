import { supabase } from './supabase.js'
import { authState } from './auth.js'

// 📋 Lista conversas do usuário — funciona se ele for user1 OU user2
export async function fetchConversas() {
  if (!authState.user) return []
  const eu = authState.user.id

  const { data, error } = await supabase
    .from('conversas')
    .select(`
      id,
      ultima_mensagem,
      updated_at,
      user1_id,
      user2_id,
      user1:profiles!conversas_user1_id_fkey(id, nome, username, avatar_url),
      user2:profiles!conversas_user2_id_fkey(id, nome, username, avatar_url)
    `)
    .or(`user1_id.eq.${eu},user2_id.eq.${eu}`)
    .order('updated_at', { ascending: false })

  if (error) throw error

  return (data || []).map(c => ({
    ...c,
    outro_usuario: c.user1_id === eu ? c.user2 : c.user1,
  }))
}

// 💬 Busca todas mensagens de uma conversa
export async function fetchMensagens(conversaId) {
  const { data, error } = await supabase
    .from('mensagens')
    .select('id, texto, user_id, created_at')
    .eq('conversa_id', conversaId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

// 💬 Busca apenas mensagens novas (após um created_at específico)
export async function fetchMensagensNovas(conversaId, apos) {
  const { data, error } = await supabase
    .from('mensagens')
    .select('id, texto, user_id, created_at')
    .eq('conversa_id', conversaId)
    .gt('created_at', apos)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

// 📨 Envia mensagem e atualiza preview da conversa
export async function enviarMensagem(conversaId, texto) {
  if (!authState.user) throw new Error('Não autenticado')

  const { data, error } = await supabase
    .from('mensagens')
    .insert({ conversa_id: conversaId, user_id: authState.user.id, texto })
    .select()
    .single()

  if (error) throw error

  await supabase
    .from('conversas')
    .update({ updated_at: new Date().toISOString(), ultima_mensagem: texto })
    .eq('id', conversaId)

  return data
}

// 🔴 Realtime com fallback em polling (2s)
// Retorna { unsubscribe() } para cleanup uniforme
export function subscribeToMensagens(conversaId, onNovaMensagem) {
  const channelName = `room-${conversaId}`

  // Remove canal zumbi se existir
  const existing = supabase.getChannels().find(c => c.topic === `realtime:${channelName}`)
  if (existing) supabase.removeChannel(existing)

  let ultimoTimestamp = new Date().toISOString()
  let pollingInterval = null
  let realtimeConfirmado = false

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'mensagens', filter: `conversa_id=eq.${conversaId}` },
      payload => {
        realtimeConfirmado = true
        if (pollingInterval) { clearInterval(pollingInterval); pollingInterval = null }
        ultimoTimestamp = payload.new.created_at
        onNovaMensagem(payload.new)
      }
    )
    .subscribe(status => {
      if (status === 'SUBSCRIBED') {
        // Se em 3s não chegou nenhum evento, ativa polling de segurança
        setTimeout(() => {
          if (!realtimeConfirmado && !pollingInterval) ativarPolling()
        }, 3000)
      }
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        if (!pollingInterval) ativarPolling()
      }
    })

  function ativarPolling() {
    pollingInterval = setInterval(async () => {
      try {
        const novas = await fetchMensagensNovas(conversaId, ultimoTimestamp)
        for (const m of novas) {
          ultimoTimestamp = m.created_at
          onNovaMensagem(m)
        }
      } catch (_) {}
    }, 2000)
  }

  return {
    unsubscribe() {
      clearInterval(pollingInterval)
      supabase.removeChannel(channel)
    }
  }
}

// 🔴 Realtime da lista de conversas com fallback em polling (3s)
export function subscribeToConversas(onAtualizado) {
  if (!authState.user) return { unsubscribe() {} }

  const channelName = `convs-${authState.user.id}`

  const existing = supabase.getChannels().find(c => c.topic === `realtime:${channelName}`)
  if (existing) supabase.removeChannel(existing)

  let ultimoCheck = new Date().toISOString()
  let pollingInterval = null
  let realtimeConfirmado = false

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'conversas' },
      payload => {
        realtimeConfirmado = true
        if (pollingInterval) { clearInterval(pollingInterval); pollingInterval = null }
        onAtualizado(payload.new)
      }
    )
    .subscribe(status => {
      if (status === 'SUBSCRIBED') {
        setTimeout(() => {
          if (!realtimeConfirmado && !pollingInterval) ativarPolling()
        }, 3000)
      }
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        if (!pollingInterval) ativarPolling()
      }
    })

  function ativarPolling() {
    pollingInterval = setInterval(async () => {
      try {
        const eu = authState.user?.id
        if (!eu) return
        const { data } = await supabase
          .from('conversas')
          .select('id, ultima_mensagem, updated_at, user1_id, user2_id')
          .or(`user1_id.eq.${eu},user2_id.eq.${eu}`)
          .gt('updated_at', ultimoCheck)
          .order('updated_at', { ascending: false })

        for (const c of (data || [])) {
          ultimoCheck = c.updated_at
          onAtualizado(c)
        }
      } catch (_) {}
    }, 3000)
  }

  return {
    unsubscribe() {
      clearInterval(pollingInterval)
      supabase.removeChannel(channel)
    }
  }
}