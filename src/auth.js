import { reactive, readonly } from 'vue'
import { supabase } from './supabase.js'

const state = reactive({
  user:    null,
  profile: null,
  loading: true,
  ready:   false,
})

async function loadProfile(userId) {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    state.profile = data
  } catch (err) {
    console.warn('Erro ao carregar perfil:', err.message)
  }
}

export async function reloadProfile() {
  if (!state.user) return
  await loadProfile(state.user.id)
}

export async function initAuth() {
  try {
    state.loading = true
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      state.user = session.user
      await loadProfile(session.user.id)
    }
  } catch (err) {
    console.warn('initAuth falhou:', err.message)
  } finally {
    state.loading = false
    state.ready   = true
  }

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'INITIAL_SESSION') return

    if (event === 'SIGNED_OUT') {
      state.user    = null
      state.profile = null
      return
    }

    if (session?.user) {
      const newUser = session.user
      const oldId   = state.user?.id

      state.user = newUser

      if (newUser.id !== oldId) {
        await loadProfile(newUser.id)
      }
    }
  })
}

export async function signUp({ nome, username, email, senha, nascimento, genero }) {
  const { data, error: authError } = await supabase.auth.signUp({
    email, password: senha, options: { data: { nome, username } },
  })
  if (authError) throw authError
  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id, nome, username, email, nascimento, genero,
      avatar_url: null, bio: '', seguidores: 0, seguindo: 0, curtidas: 0, videos: 0,
    })
    if (profileError) throw profileError
  }
  return data
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: { prompt: 'select_account' }
    }
  })
  if (error) throw error
}

export async function signInWithEmail(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true }
  })
  if (error) throw error
}

export async function signInWithPassword(email, senha) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
  if (error) throw error
  return data
}

export async function verifyOtp(email, token) {
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'magiclink',
  })
  if (error) throw error
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function updateProfile(updates) {
  if (!state.user) throw new Error('Não autenticado')
  const { data, error } = await supabase
    .from('profiles').update(updates).eq('id', state.user.id).select().single()
  if (error) throw error
  state.profile = data
  return data
}

export async function uploadAvatar(file) {
  if (!state.user) throw new Error('Não autenticado')
  const ext      = file.name.split('.').pop()
  const fileName = `${state.user.id}/avatar.${ext}`
  const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true })
  if (uploadError) throw uploadError
  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
  await updateProfile({ avatar_url: publicUrl })
  return publicUrl
}
export const authState = state