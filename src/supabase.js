import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = 'https://dctvfbmjhbwnljublxjt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjdHZmYm1qaGJ3bmxqdWJseGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNzcxODYsImV4cCI6MjA5MDY1MzE4Nn0.H5BXnUpcVR7Teb2CVadOMoCvlOYzaoxvQeI9qmEKSDM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession:     true,
    autoRefreshToken:   true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
})