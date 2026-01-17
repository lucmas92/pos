import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, handleSupabaseError } from '@/utils/supabase'
import type { User } from '@supabase/supabase-js'
import { useAudit } from '@/composables/useAudit'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  // Audit
  const { logAction } = useAudit()

  const isAuthenticated = computed(() => !!user.value)
  const userEmail = computed(() => user.value?.email || '')

  /**
   * Inizializza la sessione controllando se c'è un utente loggato
   */
  async function initialize() {
    try {
      loading.value = true

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) throw sessionError

      if (session?.user) {
        user.value = session.user
      } else {
        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser()
        if (!userError && currentUser) {
          user.value = currentUser
        } else {
          user.value = null
        }
      }
    } catch (err) {
      console.error('Error initializing auth:', err)
      user.value = null
    } finally {
      loading.value = false
    }
  }

  /**
   * Login con email e password
   */
  async function login(email: string, password: string) {
    try {
      loading.value = true
      error.value = null

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      user.value = data.user

      // Log Login
      await logAction('LOGIN', 'auth', user.value?.id, { email })

      return { success: true }
    } catch (err: any) {
      error.value = handleSupabaseError(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Logout
   */
  async function logout() {
    try {
      loading.value = true
      error.value = null

      // Log Logout prima di cancellare l'utente locale
      if (user.value) {
        await logAction('LOGOUT', 'auth', user.value.id)
      }

      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) throw signOutError

      user.value = null
      return { success: true }
    } catch (err: any) {
      error.value = handleSupabaseError(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Verifica lo stato della sessione (alias per initialize, per compatibilità)
   */
  async function checkSession() {
    await initialize()
  }

  /**
   * Sottoscrivi ai cambiamenti di autenticazione
   */
  function subscribeToAuthChanges() {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        user.value = session?.user || null
      } else if (event === 'SIGNED_OUT') {
        user.value = null
      }
    })
  }

  /**
   * Reset errori
   */
  function clearError() {
    error.value = null
  }

  return {
    // State
    user,
    loading,
    error,

    // Getters
    isAuthenticated,
    userEmail,

    // Actions
    initialize,
    login,
    logout,
    checkSession,
    subscribeToAuthChanges,
    clearError,
  }
})
