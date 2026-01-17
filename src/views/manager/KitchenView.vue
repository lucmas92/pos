<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrders } from '@/composables/useOrders'
import { formatCurrency, formatDate } from '@/utils/helpers'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { Order, OrderItem } from '@/types/models'

const route = useRoute()
const router = useRouter()
const orders = useOrders({ autoFetch: true, realtime: true })

// Filtra solo gli ordini "paid" (pagati e pronti per la cucina)
const kitchenOrders = computed(() => {
  return orders.orders.value
    .filter((o) => o.status === 'paid')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) // Ordina per data crescente (FIFO)
})

// Raggruppa gli articoli per nome prodotto e variante
const groupedItems = computed(() => {
  const itemsMap = new Map<string, {
    name: string,
    variant?: string,
    quantity: number,
    notes: string[],
    orderNumbers: number[]
  }>()

  kitchenOrders.value.forEach(order => {
    order.items?.forEach(item => {
      // Chiave unica per raggruppamento: ID prodotto + ID variante (se esiste) + Note (per non mischiare richieste diverse)
      // Nota: Raggruppiamo per note identiche. Se le note sono diverse, teniamo separati.
      const key = `${item.product_id}-${item.variant_id || ''}-${(item.notes || '').trim().toLowerCase()}`

      const existing = itemsMap.get(key)

      if (existing) {
        existing.quantity += item.quantity
        if (!existing.orderNumbers.includes(order.order_number)) {
          existing.orderNumbers.push(order.order_number)
        }
      } else {
        itemsMap.set(key, {
          name: item.product?.name || 'Prodotto sconosciuto',
          variant: item.variant?.name,
          quantity: item.quantity,
          notes: item.notes ? [item.notes] : [],
          orderNumbers: [order.order_number]
        })
      }
    })
  })

  return Array.from(itemsMap.values()).sort((a, b) => b.quantity - a.quantity)
})

const loading = computed(() => orders.loading.value)
const isFullscreen = computed(() => route.query.fullscreen === 'true')
const viewMode = ref<'orders' | 'items'>('orders') // 'orders' = vista classica, 'items' = vista raggruppata

// Methods
async function handleCompleteOrder(order: Order) {
  if (!confirm(`Completare l'ordine #${order.order_number}?`)) return
  await orders.updateStatus(order.id, 'completed')
}

function goToScan() {
  router.push('/manager/scan')
}

// Calcola il tempo trascorso dall'ordine
function getTimeElapsed(dateString: string) {
  const diff = now.value.getTime() - new Date(dateString).getTime()
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return 'Adesso'
  if (minutes < 60) return `${minutes} min`

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

// Aggiorna il tempo trascorso ogni minuto
const now = ref(new Date())
let timer: number

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 60000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-white p-4">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6 border-b border-gray-700 pb-4">
      <div>
        <h1 class="text-3xl font-bold text-white">Cucina (KDS)</h1>
        <p class="text-gray-400 mt-1">
          {{ viewMode === 'orders' ? `Ordini in preparazione: ${kitchenOrders.length}` : `Articoli totali da preparare` }}
        </p>
      </div>

      <div class="flex items-center gap-4">
        <!-- Scan Button -->
        <button
          @click="goToScan"
          class="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-bold flex items-center gap-2 transition-colors border border-gray-600"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          Scansiona
        </button>

        <!-- View Toggle -->
        <div class="bg-gray-800 p-1 rounded-lg flex">
          <button
            @click="viewMode = 'orders'"
            class="px-4 py-2 rounded-md text-sm font-bold transition-colors"
            :class="viewMode === 'orders' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'"
          >
            Per Ordine
          </button>
          <button
            @click="viewMode = 'items'"
            class="px-4 py-2 rounded-md text-sm font-bold transition-colors"
            :class="viewMode === 'items' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'"
          >
            Per Articolo
          </button>
        </div>

        <div class="text-right hidden sm:block">
          <p class="text-xl font-mono font-bold">{{ now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</p>
          <p class="text-sm text-gray-400">{{ now.toLocaleDateString() }}</p>
        </div>

        <!-- Fullscreen Toggle -->
        <a
          v-if="!isFullscreen"
          href="/manager/kitchen?fullscreen=true"
          target="_blank"
          class="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
          title="Apri in Fullscreen"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </a>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading && kitchenOrders.length === 0" class="flex justify-center py-20">
      <LoadingSpinner size="xl" color="text-white" />
    </div>

    <!-- Empty State -->
    <div v-else-if="kitchenOrders.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-500">
      <svg class="w-24 h-24 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h2 class="text-2xl font-bold">Nessun ordine in preparazione</h2>
      <p>La cucina è libera!</p>
    </div>

    <!-- ITEMS VIEW (Aggregated) -->
    <div v-else-if="viewMode === 'items'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="(item, index) in groupedItems"
        :key="index"
        class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col shadow-lg"
      >
        <div class="p-5 flex items-start gap-4">
          <div class="bg-blue-600 text-white font-bold text-3xl min-w-[3.5rem] h-14 rounded-lg flex items-center justify-center shadow-lg">
            {{ item.quantity }}
          </div>
          <div class="flex-1">
            <h3 class="text-xl font-bold text-white leading-tight mb-1">{{ item.name }}</h3>
            <p v-if="item.variant" class="text-blue-300 font-medium text-lg">{{ item.variant }}</p>

            <!-- Notes -->
            <div v-if="item.notes.length > 0" class="mt-3 space-y-1">
              <p v-for="(note, idx) in item.notes" :key="idx" class="text-sm text-yellow-400 font-bold bg-yellow-900/30 p-1.5 rounded border border-yellow-900/50">
                ⚠️ {{ note }}
              </p>
            </div>

            <!-- Order References -->
            <div class="mt-4 pt-3 border-t border-gray-700">
              <p class="text-xs text-gray-400 mb-1">Ordini:</p>
              <div class="flex flex-wrap gap-1">
                <span v-for="num in item.orderNumbers" :key="num" class="bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded text-xs font-mono">
                  #{{ num }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ORDERS VIEW (Classic) -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="order in kitchenOrders"
        :key="order.id"
        class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col shadow-lg transition-transform hover:scale-[1.01]"
      >
        <!-- Card Header -->
        <div class="bg-gray-700 p-4 flex justify-between items-start">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl font-bold text-white">#{{ order.order_number }}</span>
              <span class="px-2 py-0.5 rounded text-xs font-bold bg-blue-900 text-blue-200 border border-blue-700">
                {{ getTimeElapsed(order.created_at) }}
              </span>
            </div>
            <p class="text-gray-300 font-medium mt-1 truncate max-w-[150px]">{{ order.guest_name || 'Ospite' }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-400">Coperti: {{ order.covers }}</p>
          </div>
        </div>

        <!-- Items List -->
        <div class="p-4 flex-1 overflow-y-auto max-h-[400px]">
          <ul class="space-y-3">
            <li v-for="item in order.items" :key="item.id" class="border-b border-gray-700 pb-2 last:border-0 last:pb-0">
              <div class="flex items-start gap-3">
                <span class="bg-gray-600 text-white font-bold px-2 py-1 rounded text-lg min-w-[2rem] text-center">
                  {{ item.quantity }}
                </span>
                <div class="flex-1">
                  <p class="text-lg font-bold text-white leading-tight">{{ item.product?.name }}</p>
                  <p v-if="item.variant" class="text-sm text-blue-300 font-medium mt-0.5">{{ item.variant.name }}</p>
                  <p v-if="item.notes" class="text-sm text-yellow-400 font-bold mt-1 bg-yellow-900/30 p-1 rounded border border-yellow-900/50">
                    ⚠️ {{ item.notes }}
                  </p>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <!-- Order Notes -->
        <div v-if="order.notes" class="px-4 pb-4">
          <div class="bg-red-900/30 border border-red-900/50 p-3 rounded-lg">
            <p class="text-xs text-red-300 font-bold uppercase mb-1">Note Ordine:</p>
            <p class="text-sm text-white font-medium">{{ order.notes }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="p-4 bg-gray-750 border-t border-gray-700 mt-auto">
          <button
            @click="handleCompleteOrder(order)"
            class="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-xl rounded-lg shadow-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
            PRONTO
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
