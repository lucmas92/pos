import { ref } from 'vue'
import { supabase } from '@/utils/supabase'
import { useAuthStore } from '@/stores/auth'
import type { AuditLog } from '@/types/models'

// Definiamo un tipo più rilassato per l'inserimento se quello stretto fallisce
// A volte i tipi generati possono avere discrepanze sottili con l'inferenza
type AuditLogInsert = {
  user_id: string | null
  user_email: string | null
  action: string
  entity_type: string
  entity_id: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details: any
}

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details?: any,
  ) {
    try {
      // Se non c'è utente loggato (es. ordine ospite), non logghiamo o logghiamo come 'system'
      // Ma per ora logghiamo solo azioni manageriali
      if (!authStore.user) return

      const logEntry: AuditLogInsert = {
        user_id: authStore.user.id,
        user_email: authStore.user.email || null,
        action,
        entity_type: entityType,
        entity_id: entityId || null,
        details: details || null,
      }

      // Cast esplicito a 'any' per bypassare il controllo stretto di TypeScript su insert
      // quando i tipi generati non si allineano perfettamente
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from('audit_logs').insert(logEntry as any)

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
    fetchLogs,
  }
}
