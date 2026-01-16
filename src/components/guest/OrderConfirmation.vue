<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/common/AppButton.vue'

const router = useRouter()

onMounted(() => {
  // Auto redirect after 10 seconds
  setTimeout(() => {
    router.push('/')
  }, 10000)
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gray-50">
    <div
      class="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden text-center p-8 sm:p-12"
    >
      <!-- Success Animation -->
      <div class="mb-8 flex justify-center">
        <div
          class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce-slow"
        >
          <svg
            class="w-12 h-12 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      <h1 class="text-3xl font-bold text-gray-900 mb-4">Ordine Confermato!</h1>
      <p class="text-gray-600 mb-8 text-lg">
        Grazie per il tuo ordine. Lo stiamo preparando e sarà pronto a breve.
      </p>

      <div class="space-y-4">
        <AppButton @click="router.push('/')" variant="primary" size="lg" block>
          Torna al Menu
        </AppButton>
        <p class="text-sm text-gray-400">
          Verrai reindirizzato automaticamente tra pochi secondi...
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes bounce-slow {
  0%,
  100% {
    transform: translateY(-5%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}
.animate-bounce-slow {
  animation: bounce-slow 2s infinite;
}
</style>
