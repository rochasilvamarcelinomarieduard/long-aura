import { supabase } from './supabase.js'

// ── GRUPOS ────────────────────────────────────────────────────────────────

export async function fetchGrupos(userId) {
  if (!userId) return []

  const { data: membros, error: e1 } = await supabase
    .from('grupo_membros')
    .select('grupo_id')
    .eq('user_id', userId)

  if (e1) throw e1
  if (!membros?.length) return []

  const ids = membros.map(m => m.grupo_id)

  const { data: grupos, error: e2 } = await supabase
    .from('grupos')
    .select('id, nome, descricao, criado_por, updated_at, ultima_mensagem')
    .in('id', ids)
    .order('updated_at', { ascending: false })

  if (e2) throw e2
  return grupos || []
}

export async function criarGrupo({ nome, descricao, membroIds, criadoPor }) {
  const { data: grupo, error: e1 } = await supabase
    .from('grupos')
    .insert({ nome, descricao, criado_por: criadoPor })
    .select()
    .single()

  if (e1) throw e1

  const todos = [...new Set([criadoPor, ...membroIds])]
  const membros = todos.map(user_id => ({
    grupo_id: grupo.id,
    user_id,
    role: user_id === criadoPor ? 'admin' : 'member',
  }))

  const { error: e2 } = await supabase.from('grupo_membros').insert(membros)
  if (e2) throw e2

  await enviarMensagemSistema(grupo.id, `Grupo criado.`)

  return grupo
}

// ── MEMBROS ───────────────────────────────────────────────────────────────

export async function fetchMembrosGrupo(grupoId) {
  if (!grupoId) return []

  const { data: membros, error: e1 } = await supabase
    .from('grupo_membros')
    .select('user_id, role')
    .eq('grupo_id', grupoId)

  if (e1) throw e1
  if (!membros?.length) return []

  const ids = membros.map(m => m.user_id)

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .in('id', ids)

  return membros.map(m => {
    const p = (profiles || []).find(p => p.id === m.user_id) || {}
    return {
      id:         p.id || m.user_id,
      username:   p.username || 'usuario',
      avatar_url: p.avatar_url || null,
      role:       m.role ?? 'member',
      online:     false,
    }
  })
}

export async function sairDoGrupo(grupoId, userId, username) {
  await enviarMensagemSistema(grupoId, `@${username || 'Usuário'} saiu do grupo.`)

  const { error } = await supabase
    .from('grupo_membros')
    .delete()
    .eq('grupo_id', grupoId)
    .eq('user_id', userId)

  if (error) throw error
}

// ── MENSAGENS ─────────────────────────────────────────────────────────────

export async function fetchMensagensGrupo(grupoId) {
  if (!grupoId) return []

  const { data, error } = await supabase
    .from('grupo_mensagens')
    .select('id, texto, user_id, created_at, tipo, profiles(username, avatar_url)')
    .eq('grupo_id', grupoId)
    .order('created_at', { ascending: true })
    .limit(200)

  if (!error) return data || []

  console.warn('fetchMensagensGrupo: tentando sem join', error)
  const { data: d2, error: e2 } = await supabase
    .from('grupo_mensagens')
    .select('id, texto, user_id, created_at, tipo')
    .eq('grupo_id', grupoId)
    .order('created_at', { ascending: true })
    .limit(200)

  if (e2) throw e2
  return (d2 || []).map(m => ({ ...m, profiles: null }))
}

export async function enviarMensagemGrupo(grupoId, userId, texto) {
  const { data, error } = await supabase
    .from('grupo_mensagens')
    .insert({ grupo_id: grupoId, user_id: userId, texto, tipo: 'texto' })
    .select()
    .single()

  if (error) throw error
  return data
}

async function enviarMensagemSistema(grupoId, texto) {
  await supabase
    .from('grupo_mensagens')
    .insert({ grupo_id: grupoId, user_id: null, texto, tipo: 'sistema' })
}

// ── REAÇÕES ───────────────────────────────────────────────────────────────

export async function fetchReacoesGrupo(grupoId) {
  if (!grupoId) return []

  const { data: msgIds } = await supabase
    .from('grupo_mensagens')
    .select('id')
    .eq('grupo_id', grupoId)

  if (!msgIds?.length) return []

  const ids = msgIds.map(m => m.id)

  const { data, error } = await supabase
    .from('grupo_reacoes')
    .select('mensagem_id, user_id, emoji')
    .in('mensagem_id', ids)

  if (error) {
    console.warn('fetchReacoesGrupo erro:', error)
    return []
  }
  return data || []
}

export async function toggleReacaoGrupo(mensagemId, userId, emoji) {
  const { data: existe } = await supabase
    .from('grupo_reacoes')
    .select('id')
    .eq('mensagem_id', mensagemId)
    .eq('user_id', userId)
    .eq('emoji', emoji)
    .maybeSingle()

  if (existe) {
    await supabase
      .from('grupo_reacoes')
      .delete()
      .eq('mensagem_id', mensagemId)
      .eq('user_id', userId)
      .eq('emoji', emoji)
    return 'removed'
  } else {
    await supabase
      .from('grupo_reacoes')
      .insert({ mensagem_id: mensagemId, user_id: userId, emoji })
    return 'added'
  }
}

// ── SUBSCRIPTIONS ─────────────────────────────────────────────────────────

export function subscribeGrupoMensagens(grupoId, callback) {
  return supabase
    .channel(`grupo-msgs-${grupoId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'grupo_mensagens', filter: `grupo_id=eq.${grupoId}` },
      (payload) => callback(payload.new)
    )
    .subscribe()
}

export function subscribeGrupoReacoes(grupoId, onAdd, onRemove) {
  return supabase
    .channel(`grupo-reacoes-${grupoId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'grupo_reacoes' },
      (payload) => onAdd(payload.new)
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'grupo_reacoes' },
      (payload) => onRemove(payload.old)
    )
    .subscribe()
}