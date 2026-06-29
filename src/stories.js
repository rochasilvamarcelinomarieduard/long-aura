// ══════════════════════════════════════════════════════
//  stories.js  —  Integração Supabase para Stories
//  Coloque em src/stories.js (mesmo nível de messages.js)
// ══════════════════════════════════════════════════════

import { supabase } from './supabase.js'

// ─── FETCH ─────────────────────────────────────────────

/**
 * Busca todos os stories ativos (últimas 24h), agrupados por usuário.
 * Retorna array de { userId, username, nomeUsuario, avatarUrl, stories[] }
 */
export async function fetchStoriesAtivos() {
  const { data, error } = await supabase
    .from('stories_com_perfil')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  // Agrupa por user_id
  const mapa = new Map()
  for (const s of data || []) {
    if (!mapa.has(s.user_id)) {
      mapa.set(s.user_id, {
        userId:      s.user_id,
        username:    s.username,
        nomeUsuario: s.nome_usuario || s.username,
        avatarUrl:   s.avatar_url,
        stories:     [],
      })
    }
    mapa.get(s.user_id).stories.push(normalizeStory(s))
  }

  return Array.from(mapa.values())
}

/**
 * Busca os stories de um usuário específico.
 */
export async function fetchStoriesDoUsuario(userId) {
  const { data, error } = await supabase
    .from('stories_com_perfil')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data || []).map(normalizeStory)
}

/**
 * Busca os IDs de stories que o usuário atual já visualizou.
 */
export async function fetchStoriesVistos(userId) {
  const { data } = await supabase
    .from('story_views')
    .select('story_id')
    .eq('viewer_id', userId)

  return new Set((data || []).map(v => v.story_id))
}

// ─── PUBLICAR ──────────────────────────────────────────

/**
 * Publica um novo story.
 * @param {Object} opts
 * @param {File|null}  opts.arquivo     - arquivo de imagem (opcional)
 * @param {string|null} opts.texto      - texto sobreposto
 * @param {string}     opts.textoCor
 * @param {number}     opts.textoSize
 * @param {string|null} opts.sticker
 * @param {string}     opts.corFundo    - CSS gradient/cor de fundo
 * @param {string|null} opts.musica
 * @param {string|null} opts.mencao
 */
export async function publicarStory({
  arquivo     = null,
  texto       = null,
  textoCor    = '#ffffff',
  textoSize   = 22,
  sticker     = null,
  corFundo    = 'linear-gradient(135deg,#1a0a00,#0a0500)',
  musica      = null,
  mencao      = null,
}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  let mediaUrl = null

  // Upload da imagem se houver
  if (arquivo) {
    const ext  = arquivo.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('stories')
      .upload(path, arquivo, { contentType: arquivo.type, upsert: false })

    if (upErr) throw upErr

    const { data: urlData } = supabase.storage.from('stories').getPublicUrl(path)
    mediaUrl = urlData.publicUrl
  }

  const { data, error } = await supabase
    .from('stories')
    .insert({
      user_id:    user.id,
      media_url:  mediaUrl,
      media_type: arquivo ? 'image' : 'text',
      texto,
      texto_cor:  textoCor,
      texto_size: textoSize,
      sticker,
      cor_fundo:  corFundo,
      musica,
      mencao,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return normalizeStory(data)
}

/**
 * Deleta um story (e remove do Storage se houver mídia).
 */
export async function deletarStory(storyId, mediaUrl) {
  if (mediaUrl) {
    // Extrai o path do storage a partir da URL pública
    const url    = new URL(mediaUrl)
    const parts  = url.pathname.split('/stories/')
    if (parts[1]) {
      await supabase.storage.from('stories').remove([parts[1]])
    }
  }

  const { error } = await supabase.from('stories').delete().eq('id', storyId)
  if (error) throw error
}

// ─── INTERAÇÕES ────────────────────────────────────────

/**
 * Registra que o usuário atual visualizou um story.
 */
export async function registrarView(storyId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.rpc('incrementar_view_story', {
    p_story_id:  storyId,
    p_viewer_id: user.id,
  })
}

/**
 * Adiciona ou troca a reação do usuário num story.
 */
export async function reagirStory(storyId, emoji) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('story_reactions')
    .upsert(
      { story_id: storyId, user_id: user.id, emoji },
      { onConflict: 'story_id,user_id' }
    )

  if (error) throw error
}

/**
 * Remove a reação do usuário num story.
 */
export async function removerReacao(storyId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('story_reactions')
    .delete()
    .eq('story_id', storyId)
    .eq('user_id',  user.id)
}

/**
 * Envia um reply para um story (abre conversa ou envia msg direto).
 */
export async function responderStory(storyId, texto) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('story_replies')
    .insert({ story_id: storyId, user_id: user.id, texto })

  if (error) throw error
}

/**
 * Busca a reação atual do usuário em um conjunto de stories.
 */
export async function fetchMinhasReacoes(storyIds) {
  if (!storyIds.length) return {}
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return {}

  const { data } = await supabase
    .from('story_reactions')
    .select('story_id, emoji')
    .in('story_id', storyIds)
    .eq('user_id', user.id)

  const mapa = {}
  for (const r of data || []) mapa[r.story_id] = r.emoji
  return mapa
}

// ─── REALTIME ──────────────────────────────────────────

/**
 * Subscreve novos stories em tempo real.
 * @param {Function} onNovo  - cb(storyNormalizado)
 * @param {Function} onDelet - cb(storyId)
 * @returns subscription object com .unsubscribe()
 */
export function subscribeToStories(onNovo, onDelet) {
  const channel = supabase
    .channel('stories-realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'stories' },
      async (payload) => {
        // Busca com perfil completo
        const { data } = await supabase
          .from('stories_com_perfil')
          .select('*')
          .eq('id', payload.new.id)
          .single()

        if (data) onNovo(normalizeStory(data))
      }
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'stories' },
      (payload) => onDelet(payload.old.id)
    )
    .subscribe()

  return channel
}

/**
 * Subscreve reações de um story específico.
 */
export function subscribeToReacoes(storyId, onChange) {
  return supabase
    .channel(`reacoes-${storyId}`)
    .on(
      'postgres_changes',
      {
        event:  '*',
        schema: 'public',
        table:  'story_reactions',
        filter: `story_id=eq.${storyId}`,
      },
      onChange
    )
    .subscribe()
}

// ─── UTILS ─────────────────────────────────────────────

function normalizeStory(s) {
  return {
    id:         s.id,
    userId:     s.user_id,
    username:   s.username,
    nomeUsuario:s.nome_usuario || s.username,
    avatarUrl:  s.avatar_url,
    mediaUrl:   s.media_url,
    mediaType:  s.media_type || 'image',
    texto:      s.texto,
    textoCor:   s.texto_cor  || '#ffffff',
    textoSize:  s.texto_size || 22,
    sticker:    s.sticker,
    corFundo:   s.cor_fundo  || '#111',
    musica:     s.musica,
    mencao:     s.mencao,
    duracao:    s.duracao    || 5,
    views:      s.views_count ?? 0,
    expiresAt:  s.expires_at,
    criadoEm:   s.created_at,
    hora:       horaRelativa(s.created_at),
  }
}

function horaRelativa(ts) {
  if (!ts) return ''
  const diff = Date.now() - new Date(ts).getTime()
  const h    = Math.floor(diff / 3600000)
  if (h < 1) return 'agora'
  if (h < 24) return `${h}h`
  return '23h'
}