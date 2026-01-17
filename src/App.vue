<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useConfigStore } from '@/stores/config'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import GuestLayout from '@/layouts/GuestLayout.vue'
import ManagerLayout from '@/layouts/ManagerLayout.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'

const route = useRoute()
const authStore = useAuthStore()
const configStore = useConfigStore()

// Determina quale layout usare in base alla route
const layout = computed(() => {
  // Se la query param 'fullscreen' è presente, usa un layout vuoto (DefaultLayout)
  if (route.query.fullscreen === 'true') {
    return DefaultLayout
  }

  const layoutName = (route.meta.layout as string) || 'default'

  switch (layoutName) {
    case 'guest':
      return GuestLayout
    case 'manager':
      return ManagerLayout
    default:
      return DefaultLayout
  }
})

// Inizializza l'autenticazione e la configurazione all'avvio
onMounted(async () => {
  // Sottoscrivi ai cambiamenti PRIMA di inizializzare per catturare eventuali eventi iniziali
  authStore.subscribeToAuthChanges()

  // Inizializza sessione e configurazione in parallelo
  await Promise.all([
    authStore.initialize(),
    configStore.fetchConfig()
  ])
})
</script>

<template>
  <div id="app" class="h-screen bg-gray-500">
    <component :is="layout">
      <RouterView />
    </component>

    <!-- Global Toast Container -->
    <ToastContainer />
  </div>
</template>
