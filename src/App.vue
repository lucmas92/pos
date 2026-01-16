<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import GuestLayout from '@/layouts/GuestLayout.vue'
import ManagerLayout from '@/layouts/ManagerLayout.vue'

const route = useRoute()
const authStore = useAuthStore()

// Determina quale layout usare in base alla route
const layout = computed(() => {
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

// Inizializza l'autenticazione all'avvio
onMounted(async () => {
  // Sottoscrivi ai cambiamenti PRIMA di inizializzare per catturare eventuali eventi iniziali
  authStore.subscribeToAuthChanges()

  // Inizializza la sessione
  await authStore.initialize()
})
</script>

<template>
  <div id="app" class="h-screen bg-gray-500">
    <component :is="layout">
      <RouterView />
    </component>
  </div>
</template>
