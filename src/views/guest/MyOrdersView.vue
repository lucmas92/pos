<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getFromStorage } from '@/utils/storage'
import EmptyState from '@/components/common/EmptyState.vue'
import { formatDate } from '@/utils/date.ts'
import { formatCurrency } from '@/utils/currency.ts'

const router = useRouter()
const orders = ref<any[]>([])

onMounted(() => {
  orders.value = getFromStorage<any[]>('completed_orders') || []
})

function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="sticky top-0 z-40 bg-white shadow-sm safe-area-inset-top">
      <div class="container-custom">
        <div class="flex items-center h-16">
          <!-- Back Button -->
          <button @click="goBack" class="btn btn-ghost -ml-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Title -->
          <h1 class="text-xl font-bold text-gray-900 ml-2">I Miei Ordini</h1>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container-custom py-6 pb-32">
      <div class="max-w-2xl mx-auto space-y-6">

        <!-- Empty State -->
        <EmptyState
          v-if="orders.length === 0"
          icon="🧾"
          title="Nessun ordine recente"
          description="Non hai ancora effettuato ordini su questo dispositivo."
          action-label="Vai al Menu"
          @action="goBack"
        />

        <!-- Orders List -->
        <div v-else class="space-y-4">
          <div
            v-for="order in orders"
            :key="order.id"
            class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
          >
            <div class="flex justify-between items-start mb-4">
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-2xl font-bold text-primary-600">#{{ order.order_number }}</span>
                  <span class="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                    Inviato
                  </span>
                </div>
                <p class="text-sm text-gray-500 mt-1">{{ formatDate(order.created_at) }}</p>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-gray-900">{{ formatCurrency(order.total_amount) }}</p>
                <p class="text-xs text-gray-500">{{ order.items_count }} prodotti</p>
              </div>
            </div>

            <div class="pt-4 border-t border-gray-50 flex justify-end">
              <p class="text-xs text-gray-400 italic">
                Conserva questo numero per il ritiro
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>
