import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  db: {
    schema: 'public',
  },
})

// Helper per gestire errori Supabase
export function handleSupabaseError(error: any): string {
  if (error?.message) {
    return error.message
  }
  if (error?.error_description) {
    return error.error_description
  }
  return 'Si è verificato un errore sconosciuto'
}

// Helper per verificare se siamo autenticati
export async function getAuthUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Helper per il logout
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
