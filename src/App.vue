<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useConfigStore } from '@/stores/config'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import GuestLayout from '@/layouts/GuestLayout.vue'
import ManagerLayout from '@/layouts/ManagerLayout.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const configStore = useConfigStore()

const isNavigating = ref(false)

// Determina quale layout usare in base alla route
const layout = computed(() => {
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

// Gestione animazione caricamento pagina
router.beforeEach((to, from, next) => {
  isNavigating.value = true
  next()
})

router.afterEach(() => {
  // Piccolo ritardo per rendere l'animazione fluida e percepibile
  setTimeout(() => {
    isNavigating.value = false
  }, 400)
})

// Inizializza l'autenticazione e la configurazione all'avvio
onMounted(async () => {
  authStore.subscribeToAuthChanges()

  await Promise.all([authStore.initialize(), configStore.fetchConfig()])
})
</script>

<template>
  <div id="app" class="h-screen bg-gray-500">
    <!-- Page Loading Overlay -->
    <Transition name="fade">
      <div
        v-if="isNavigating"
        class="fixed inset-0 z-[9999] bg-white flex items-center justify-center"
      >
        <div class="text-center">
          <LoadingSpinner size="xl" color="text-primary-600" />
          <p class="mt-4 text-gray-500 font-medium animate-pulse">Caricamento...</p>
        </div>
      </div>
    </Transition>

    <!-- Main Content with Transition -->
    <component :is="layout">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </component>

    <!-- Global Toast Container -->
    <ToastContainer />
  </div>
</template>

<style scoped>
/* Page Transitions */
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Fade Transition for Overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
