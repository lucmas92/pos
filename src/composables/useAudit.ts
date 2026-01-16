import { ref } from 'vue'
import { supabase } from '@/utils/supabase'
import { useAuthStore } from '@/stores/auth'
import type { AuditLog } from '@/types/models'

export function useAudit() {
  const authStore = useAuthStore()
  const logs = ref<AuditLog[]>([])
  const loading = ref(false)

  /**
   * Registra un'azione nel log
   */
  async function logAction(
    action: string,
    entityType: string,
    entityId?: string,
    details?: any
  ) {
    try {
      console.log('Logging action:', action)
      // Se non c'è utente loggato (es. ordine ospite), non logghiamo o logghiamo come 'system'
      // Ma per ora logghiamo solo azioni manageriali
      if (!authStore.user) return

      const { error } = await supabase.from('audit_logs').insert({
        user_id: authStore.user.id,
        user_email: authStore.user.email,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details
      })

      if (error) console.error('Failed to log action:', error)
    } catch (e) {
      console.error('Audit log error:', e)
    }
  }

  /**
   * Recupera i log (per la vista admin)
   */
  async function fetchLogs(limit = 50) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      logs.value = data
    } catch (e) {
      console.error('Fetch logs error:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    logs,
    loading,
    logAction,
    fetchLogs
  }
}
