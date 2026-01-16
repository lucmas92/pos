import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

/**
 * Composable per gestire l'autenticazione
 */
export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  // Refs reattivi dallo store
  const { user, loading, error, isAuthenticated, userEmail } = storeToRefs(authStore)

  /**
   * Effettua il login
   */
  async function login(email: string, password: string) {
    const result = await authStore.login(email, password)
    console.log('Login result:', result)

    if (result.success) {
      // Redirect alla dashboard dopo login
      await router.push('/manager/dashboard')
    }

    return result
  }

  /**
   * Effettua il logout
   */
  async function logout() {
    const result = await authStore.logout()

    if (result.success) {
      // Redirect al login dopo logout
      await router.push('/manager/login')
    }

    return result
  }

  /**
   * Inizializza l'autenticazione
   */
  async function initialize() {
    await authStore.initialize()
  }

  /**
   * Verifica se l'utente è autenticato
   */
  async function checkAuth() {
    await authStore.checkSession()
    return isAuthenticated.value
  }

  /**
   * Reindirizza al login se non autenticato
   */
  async function requireAuth() {
    const authenticated = await checkAuth()

    if (!authenticated) {
      await router.push('/manager/login')
      return false
    }

    return true
  }

  /**
   * Pulisce gli errori
   */
  function clearError() {
    authStore.clearError()
  }

  return {
    // State
    user,
    loading,
    error,
    isAuthenticated,
    userEmail,

    // Methods
    login,
    logout,
    initialize,
    checkAuth,
    requireAuth,
    clearError,
  }
}
