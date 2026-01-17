import { onMounted } from 'vue'
import { useConfigStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import type { UpdateConfigurationData } from '@/types/models'

export function useConfig(autoFetch = true) {
  const configStore = useConfigStore()
  const { config, loading, error } = storeToRefs(configStore)

  onMounted(() => {
    if (autoFetch && !config.value) {
      configStore.fetchConfig()
    }
  })

  return {
    config,
    loading,
    error,
    fetch: configStore.fetchConfig,
    update: (data: UpdateConfigurationData) => configStore.updateConfig(data)
  }
}
