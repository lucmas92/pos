import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase, handleSupabaseError } from '@/utils/supabase'
import type { Configuration, UpdateConfigurationData } from '@/types/models'
import { useAudit } from '@/composables/useAudit'

export const useConfigStore = defineStore('config', () => {
  const config = ref<Configuration | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const { logAction } = useAudit()

  /**
   * Carica la configurazione
   */
  async function fetchConfig() {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('configurations')
        .select('*')
        .eq('id', 1)
        .single()

      if (fetchError) throw fetchError

      config.value = data
      return { success: true, data }
    } catch (err: any) {
      error.value = handleSupabaseError(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Aggiorna la configurazione
   */
  async function updateConfig(updates: UpdateConfigurationData) {
    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('configurations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', 1)
        .select()
        .single()

      if (updateError) throw updateError

      config.value = data

      // Audit
      await logAction('UPDATE_CONFIG', 'configuration', '1', { changes: updates })

      return { success: true, data }
    } catch (err: any) {
      error.value = handleSupabaseError(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  return {
    config,
    loading,
    error,
    fetchConfig,
    updateConfig,
  }
})
