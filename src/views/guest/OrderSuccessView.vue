<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrders } from '@/composables/useOrders'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { formatCurrency } from '@/utils/currency'
import { formatDateTime } from '@/utils/date'
import type { Order } from '@/types/models'
import { useConfig } from '@/composables/useConfig.ts'

const route = useRoute()
const router = useRouter()
const orders = useOrders({ autoFetch: false })
const { config } = useConfig()

// State
const order = ref<Order | null>(null)
const loading = ref(true)
const error = ref('')

const orderNumber = parseInt(route.params.orderNumber as string)

// Methods
function goToMenu() {
  router.push('/')
}

function handlePrint() {
  window.print()
}

async function loadOrder() {
  loading.value = true
  error.value = ''

  try {
    const result = await orders.fetchByNumber(orderNumber)

    if (result.success && result.data) {
      order.value = result.data
    } else {
      error.value = 'Ordine non trovato'
    }
  } catch (err: any) {
    error.value = err.message || "Errore nel caricamento dell'ordine"
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  if (!orderNumber || isNaN(orderNumber)) {
    router.replace('/')
    return
  }

  loadOrder()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="xl" />
    </div>

    <!-- Error -->
    <div v-else-if="error || !order" class="flex items-center justify-center min-h-screen p-4">
      <div class="text-center">
        <div class="text-6xl mb-4">❌</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Errore</h2>
        <p class="text-gray-600 mb-6">{{ error || 'Ordine non trovato' }}</p>
        <button @click="goToMenu" class="btn btn-primary">Torna al menu</button>
      </div>
    </div>

    <!-- Success -->
    <div v-else class="container-custom py-8 pb-32">
      <div class="max-w-2xl mx-auto">
        <!-- Success Animation -->
        <div class="text-center mb-8">
          <div
            class="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-bounce-slow"
          >
            <svg
              class="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Ordine Confermato!</h1>
          <p class="text-gray-600">Il tuo ordine è stato ricevuto con successo</p>
        </div>

        <!-- Order Number Card -->
        <div
          class="card mb-6 text-center bg-linear-to-br from-primary-500 to-primary-700 text-white"
        >
          <p class="text-sm opacity-90 mb-2">Il tuo numero d'ordine</p>
          <div class="text-6xl font-bold mb-2">{{ order.order_number }}</div>
          <p class="text-sm opacity-90">Mostra questo numero alla cassa per pagare</p>
        </div>

        <!-- Instructions -->
        <div class="card mb-6 bg-blue-50 border-2 border-blue-200">
          <h3 class="font-bold text-blue-900 mb-3">📋 Prossimi Passi</h3>
          <ol class="space-y-2 text-sm text-blue-900">
            <li class="flex">
              <span class="font-bold mr-2">1.</span>
              <span
                >Recati alla cassa e comunica il numero d'ordine
                <strong class="font-bold">{{ order.order_number }}</strong></span
              >
            </li>
            <li class="flex">
              <span class="font-bold mr-2">2.</span>
              <span
                >Effettua il pagamento
                <strong class="font-bold">{{ formatCurrency(order.total_amount) }}</strong></span
              >
            </li>
            <li class="flex">
              <span class="font-bold mr-2">3.</span>
              <span>Attendi che il tuo ordine venga preparato</span>
            </li>
            <li class="flex">
              <span class="font-bold mr-2">4.</span>
              <span>Ritira il tuo ordine quando chiamato</span>
            </li>
          </ol>
        </div>

        <!-- Order Details -->
        <div class="card mb-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Dettagli Ordine</h2>

          <div class="space-y-3">
            <!-- Guest Name -->
            <div v-if="order.guest_name" class="flex justify-between py-2 border-b border-gray-100">
              <span class="text-gray-600">Nome</span>
              <span class="font-medium text-gray-900">{{ order.guest_name }}</span>
            </div>

            <!-- Covers -->
            <div
              v-if="config.enable_covers"
              class="flex justify-between py-2 border-b border-gray-100"
            >
              <span class="text-gray-600">Coperti</span>
              <span class="font-medium text-gray-900">{{ order.covers }}</span>
            </div>

            <!-- Date/Time -->
            <div class="flex justify-between py-2 border-b border-gray-100">
              <span class="text-gray-600">Data e ora</span>
              <span class="font-medium text-gray-900">{{ formatDateTime(order.created_at) }}</span>
            </div>

            <!-- Notes -->
            <div v-if="order.notes" class="py-2">
              <p class="text-gray-600 text-sm mb-1">Note</p>
              <p class="text-gray-900 text-sm bg-gray-50 rounded p-2">{{ order.notes }}</p>
            </div>
          </div>
        </div>

        <!-- Items -->
        <div class="card mb-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Prodotti Ordinati</h2>

          <div class="space-y-3">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="flex justify-between items-start py-3 border-b border-gray-100 last:border-0"
            >
              <div class="flex-1">
                <p class="font-medium text-gray-900">
                  {{ item.product?.name }}
                </p>
                <p v-if="item.variant" class="text-sm text-gray-600">
                  {{ item.variant.name }}
                </p>
                <p v-if="item.notes" class="text-xs text-gray-500 italic mt-1">
                  Note: {{ item.notes }}
                </p>
                <p class="text-sm text-gray-600 mt-1">
                  {{ formatCurrency(item.unit_price) }} × {{ item.quantity }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-bold text-gray-900">
                  {{ formatCurrency(item.unit_price * item.quantity) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Total -->
          <div class="mt-4 pt-4 border-t-2 border-gray-200">
            <div class="flex justify-between items-center">
              <span class="text-xl font-bold text-gray-900">Totale</span>
              <span class="text-2xl font-bold text-primary-600">
                {{ formatCurrency(order.total_amount) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="space-y-3 no-print">
          <button @click="goToMenu" class="btn btn-primary w-full">Torna al Menu</button>

          <button @click="handlePrint" class="btn btn-secondary w-full">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Stampa Ricevuta
          </button>
        </div>

        <!-- Support -->
        <div class="text-center mt-8 text-sm text-gray-500">
          <p>Hai problemi con l'ordine?</p>
          <p>Rivolgiti al personale alla cassa</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }

  .card {
    box-shadow: none;
    border: 1px solid #e5e7eb;
  }
}
</style>
