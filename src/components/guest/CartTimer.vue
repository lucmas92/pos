<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { storeToRefs } from 'pinia'

const cartStore = useCartStore()
const { lastUpdated, expirationMinutes } = storeToRefs(cartStore)

const now = ref(Date.now())
let timer: number

const timeRemaining = computed(() => {
  const expirationMs = expirationMinutes.value * 60 * 1000
  const elapsed = now.value - lastUpdated.value
  const remaining = expirationMs - elapsed
  return Math.max(0, remaining)
})

const minutes = computed(() => Math.floor(timeRemaining.value / 60000))
const seconds = computed(() => Math.floor((timeRemaining.value % 60000) / 1000))

const formattedTime = computed(() => {
  return `${minutes.value}:${seconds.value.toString().padStart(2, '0')}`
})

const isWarning = computed(() => timeRemaining.value < 5 * 60 * 1000) // Meno di 5 minuti
const isCritical = computed(() => timeRemaining.value < 1 * 60 * 1000) // Meno di 1 minuto

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()

    // Se scaduto, forza refresh (lo store gestirà la pulizia al prossimo accesso/azione,
    // ma qui possiamo forzare un controllo visivo o ricaricare lo store)
    if (timeRemaining.value <= 0) {
      cartStore.loadFromStorage() // Questo triggererà la pulizia se scaduto
    }
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <div
    v-if="timeRemaining > 0"
    class="flex items-center justify-center gap-2 text-xs font-medium py-1 px-3 rounded-full transition-colors"
    :class="[
      isCritical
        ? 'bg-red-100 text-red-700 animate-pulse'
        : isWarning
          ? 'bg-orange-100 text-orange-700'
          : 'bg-gray-100 text-gray-600',
    ]"
  >
    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <span>Scade in {{ formattedTime }}</span>
  </div>
</template>
