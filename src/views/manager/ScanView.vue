<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useOrders } from '@/composables/useOrders'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { QrcodeStream } from 'vue-qrcode-reader'

const router = useRouter()
const { fetchById, updateStatus } = useOrders()

const loading = ref(false)
const message = ref<{ text: string; type: 'success' | 'error' } | null>(null)
const lastScannedOrder = ref<any>(null)
const manualInput = ref('')
const cameraError = ref('')
const showCamera = ref(true)

// Gestione scansione da fotocamera
async function onDetect(detectedCodes: any[]) {
  const code = detectedCodes[0]?.rawValue
  if (code) {
    await processCode(code)
  }
}

// Gestione errori fotocamera
function onInit(promise: Promise<any>) {
  promise.catch((error) => {
    if (error.name === 'NotAllowedError') {
      cameraError.value = 'Permesso fotocamera negato.'
    } else if (error.name === 'NotFoundError') {
      cameraError.value = 'Nessuna fotocamera trovata.'
    } else if (error.name === 'NotSupportedError') {
      cameraError.value = 'Contesto sicuro richiesto (HTTPS).'
    } else if (error.name === 'NotReadableError') {
      cameraError.value = 'Fotocamera già in uso.'
    } else if (error.name === 'OverconstrainedError') {
      cameraError.value = 'Fotocamera non adatta.'
    } else if (error.name === 'StreamApiNotSupportedError') {
      cameraError.value = 'Browser non supportato.'
    } else {
      cameraError.value = `Errore fotocamera: ${error.message}`
    }
    showCamera.value = false
  })
}

// Gestione input manuale
async function handleManualInput() {
  if (!manualInput.value.trim()) return
  await processCode(manualInput.value.trim())
  manualInput.value = ''
}

// Logica comune di elaborazione
async function processCode(code: string) {
  if (loading.value) return // Evita scansioni multiple

  loading.value = true
  message.value = null
  lastScannedOrder.value = null

  try {
    // Il QR code contiene l'UUID dell'ordine
    const result = await fetchById(code)

    if (result.success && result.data) {
      const order = result.data

      if (order.status === 'completed') {
        message.value = { text: `Ordine #${order.order_number} già completato!`, type: 'error' }
        playErrorSound()
      } else if (order.status === 'cancelled') {
        message.value = { text: `Ordine #${order.order_number} è stato annullato!`, type: 'error' }
        playErrorSound()
      } else {
        // Completa l'ordine
        await updateStatus(order.id, 'completed')
        message.value = { text: `Ordine #${order.order_number} completato!`, type: 'success' }
        lastScannedOrder.value = order
        playSuccessSound()

        // Pausa breve per mostrare il successo prima di riprendere
        await new Promise((resolve) => setTimeout(resolve, 1500))
        message.value = null
      }
    } else {
      message.value = { text: 'Ordine non trovato.', type: 'error' }
      playErrorSound()
    }
  } catch (e) {
    message.value = { text: 'Codice non valido.', type: 'error' }
    playErrorSound()
  } finally {
    loading.value = false

    // Pausa breve per mostrare il successo prima di riprendere
    await new Promise((resolve) => setTimeout(resolve, 3000))
    message.value = null
  }
}

function playSuccessSound() {
  try {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3')
    audio.volume = 0.5
    audio.play()
  } catch (e) {
    /* ignore */
  }
}

function playErrorSound() {
  try {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3')
    audio.volume = 0.5
    audio.play()
  } catch (e) {
    /* ignore */
  }
}

function goBack() {
  router.push('/manager/kitchen')
}
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-white flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800 z-10">
      <h1 class="text-xl font-bold">Scansione Ordini</h1>
      <button
        @click="goBack"
        class="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
      >
        Chiudi
      </button>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col relative overflow-hidden">
      <!-- Camera View -->
      <div v-if="showCamera" class="flex-1 relative bg-black">
        <QrcodeStream @detect="onDetect" @init="onInit">
          <!-- Overlay -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="w-64 h-64 border-2 border-white/50 rounded-xl relative">
              <div
                class="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1"
              ></div>
              <div
                class="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1"
              ></div>
              <div
                class="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1"
              ></div>
              <div
                class="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1"
              ></div>
            </div>
          </div>

          <!-- Loading Overlay -->
          <div
            v-if="loading"
            class="absolute inset-0 bg-black/50 flex items-center justify-center z-20 backdrop-blur-sm"
          >
            <LoadingSpinner size="xl" color="text-white" />
          </div>
        </QrcodeStream>
      </div>

      <!-- Error State -->
      <div
        v-else
        class="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gray-900"
      >
        <svg
          class="w-16 h-16 text-red-500 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
        <h3 class="text-xl font-bold mb-2">Fotocamera non disponibile</h3>
        <p class="text-gray-400 mb-6">
          {{ cameraError || 'Impossibile accedere alla fotocamera' }}
        </p>
      </div>

      <!-- Feedback Message (Toast style) -->
      <div
        v-if="message"
        class="absolute top-4 left-4 right-4 p-4 rounded-xl shadow-lg z-30 flex items-center justify-center text-center animate-bounce-in"
        :class="message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'"
      >
        <span class="text-lg font-bold">{{ message.text }}</span>
      </div>

      <!-- Manual Input Footer -->
      <div class="p-4 bg-gray-800 border-t border-gray-700">
        <p class="text-xs text-gray-400 mb-2 text-center">Oppure inserisci ID manualmente</p>
        <div class="flex gap-2 max-w-md mx-auto">
          <input
            v-model="manualInput"
            @keydown.enter="handleManualInput"
            type="text"
            class="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="ID Ordine..."
          />
          <button
            @click="handleManualInput"
            class="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes bounce-in {
  0% {
    transform: translateY(-20px);
    opacity: 0;
  }
  50% {
    transform: translateY(5px);
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
.animate-bounce-in {
  animation: bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
</style>
