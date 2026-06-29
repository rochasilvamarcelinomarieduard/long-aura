import { supabase } from './supabase.js'
import { authState } from './auth.js'
import { criarNotificacao } from './notificacoes.js'

// 🎬 Lista vídeos do feed (com join no perfil do autor)
export async function fetchVideos({ limit = 20, offset = 0 } = {}) {
  const { data, error } = await supabase
    .from('videos')
    .select(`
      *,
      profiles:user_id (
        id, nome, username, avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data
}

// 🎬 Lista vídeos do For You (somente for_you = true)
export async function fetchVideosForYou({ limit = 20, offset = 0 } = {}) {
  const { data, error } = await supabase
    .from('videos')
    .select(`
      *,
      profiles:user_id (
        id, nome, username, avatar_url
      )
    `)
    .eq('for_you', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data
}

// 🎬 Busca vídeos por query
export async function searchVideos(query) {
  const { data, error } = await supabase
    .from('videos')
    .select(`
      *,
      profiles:user_id (
        id, nome, username, avatar_url
      )
    `)
    .or(`descricao.ilike.%${query}%,titulo.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(30)

  if (error) throw error
  return data
}

// 🎬 Vídeos de um usuário específico
export async function fetchUserVideos(userId) {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// 📤 Upload de vídeo para Supabase Storage
export async function uploadVideo({ file, titulo, descricao, musica, forYou = false }) {
  if (!authState.user) throw new Error('Não autenticado')

  const userId = authState.user.id
  const ext = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${ext}`

  // 1. Envia arquivo para Storage
  const { error: uploadError } = await supabase.storage
    .from('videos')
    .upload(fileName, file)

  if (uploadError) throw uploadError

  // 2. Pega URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('videos')
    .getPublicUrl(fileName)

  // 3. Salva registro na tabela videos
  const { data, error: dbError } = await supabase
    .from('videos')
    .insert({
      user_id:      userId,
      titulo,
      descricao,
      musica:       musica || 'Música original',
      video_url:    publicUrl,
      storage_path: fileName,
      likes:        0,
      reposts:      0,
      comentarios:  0,
      for_you:      forYou,
    })
    .select()
    .single()

  if (dbError) throw dbError
  return data
}

// ❤️ Curtir/descurtir vídeo
export async function toggleLike(videoId) {
  if (!authState.user) throw new Error('Não autenticado')

  const userId = authState.user.id

  // maybeSingle() não lança erro quando não encontra nenhuma linha
  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', userId)
    .eq('video_id', videoId)
    .maybeSingle()

  if (existing) {
    await supabase.from('likes').delete().eq('id', existing.id)
    await supabase.rpc('decrement_likes', { video_id: videoId })
    return false
  } else {
    await supabase.from('likes').insert({ user_id: userId, video_id: videoId })
    await supabase.rpc('increment_likes', { video_id: videoId })
    // Notifica dono do vídeo
    const { data: video } = await supabase
      .from('videos')
      .select('user_id')
      .eq('id', videoId)
      .maybeSingle()
    if (video && video.user_id !== userId) {
      await criarNotificacao({ toUserId: video.user_id, fromUserId: userId, tipo: 'like', videoId })
    }
    return true
  }
}

// 🔁 Repostar/desrepostar vídeo
export async function toggleRepost(videoId) {
  if (!authState.user) throw new Error('Não autenticado')

  const userId = authState.user.id

  const { data: existing } = await supabase
    .from('reposts')
    .select('id')
    .eq('user_id', userId)
    .eq('video_id', videoId)
    .maybeSingle()

  if (existing) {
    await supabase.from('reposts').delete().eq('id', existing.id)
    await supabase.rpc('decrement_reposts', { video_id: videoId })
    return false
  } else {
    await supabase.from('reposts').insert({ user_id: userId, video_id: videoId })
    await supabase.rpc('increment_reposts', { video_id: videoId })
    // Notifica dono do vídeo
    const { data: video } = await supabase
      .from('videos')
      .select('user_id')
      .eq('id', videoId)
      .maybeSingle()
    if (video && video.user_id !== userId) {
      await criarNotificacao({ toUserId: video.user_id, fromUserId: userId, tipo: 'repost', videoId })
    }
    return true
  }
}

// 💬 Busca comentários de um vídeo (com respostas)
export async function fetchComentarios(videoId) {
  const { data, error } = await supabase
    .from('comentarios')
    .select('*, profiles:user_id(username, avatar_url)')
    .eq('video_id', videoId)
    .is('parent_id', null)
    .order('created_at', { ascending: true })
  if (error) throw error
  const comRespostas = await Promise.all((data || []).map(async c => {
    const { data: resps } = await supabase
      .from('comentarios')
      .select('*, profiles:user_id(username, avatar_url)')
      .eq('parent_id', c.id)
      .order('created_at', { ascending: true })
    return { ...c, respostas: resps || [] }
  }))
  return comRespostas
}

// 💬 Adiciona comentário ou resposta
export async function addComentario(videoId, texto, parentId = null) {
  if (!authState.user) throw new Error('Não autenticado')

  // Passo 1: inserir
  const { data: inserted, error: insertError } = await supabase
    .from('comentarios')
    .insert({ video_id: videoId, user_id: authState.user.id, texto })
    .select('id')
    .single()

  if (insertError) throw insertError

  // Passo 2: buscar com join
  let comentario = null
  try {
    const { data } = await supabase
      .from('comentarios')
      .select('*, profiles:user_id(username, avatar_url)')
      .eq('id', inserted.id)
      .single()
    comentario = data
  } catch {}

  // Passo 3: atualizar contador
  try { await supabase.rpc('increment_comentarios', { video_id: videoId }) } catch {}

  // Passo 4: notificar dono do vídeo
  try {
    const { data: video } = await supabase
      .from('videos')
      .select('user_id')
      .eq('id', videoId)
      .maybeSingle()
    if (video?.user_id && video.user_id !== authState.user.id) {
      await criarNotificacao({
        toUserId:   video.user_id,
        fromUserId: authState.user.id,
        tipo:       'comentario',
        videoId,
        texto:      texto.length > 80 ? texto.slice(0, 80) + '…' : texto,
      })
    }
  } catch {}

  return comentario || { id: inserted.id }
}

// 📋 Busca quais vídeos o usuário curtiu (para marcar no feed)
export async function fetchMeusLikes() {
  if (!authState.user) return []

  const { data } = await supabase
    .from('likes')
    .select('video_id')
    .eq('user_id', authState.user.id)

  return data?.map(l => l.video_id) ?? []
}

// 🔁 Busca quais vídeos o usuário repostou
export async function fetchMeusReposts() {
  if (!authState.user) return []

  const { data } = await supabase
    .from('reposts')
    .select('video_id')
    .eq('user_id', authState.user.id)

  return data?.map(r => r.video_id) ?? []
}