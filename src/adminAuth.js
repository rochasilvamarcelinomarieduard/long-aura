// src/adminAuth.js
import { reactive } from 'vue'
import { supabase } from '@/supabase.js'

export const adminAuthState = reactive({
  user: null,
  profile: null,
  ready: false,
})

export async function initAdminAuth() {
  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      adminAuthState.ready = true
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profile?.is_admin) {
      adminAuthState.user    = session.user
      adminAuthState.profile = profile
    }
  } catch (err) {
    console.error('initAdminAuth erro:', err)
  } finally {
    adminAuthState.ready = true
  }
}