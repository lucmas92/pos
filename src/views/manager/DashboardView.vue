<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useOrders } from '@/composables/useOrders'
import { useProducts } from '@/composables/useProducts'
import { formatCurrency } from '@/utils/currency'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import StatsCards from '@/components/manager/StatsCards.vue'

const orders = useOrders({ todayOnly: true, realtime: true })
const products = useProducts({ autoFetch: true })

// Computed stats
const stats = computed(() => ({
  todayOrders: orders.todayOrders.value.length,
  todayRevenue: orders.todayRevenue.value,
  pendingOrders: orders.pendingOrders.value.length,
}))

const loading = computed(() => orders.loading.value || products.loading.value)

// Lifecycle
onMounted(async () => {
  await orders.fetch()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-gray-500 mt-1">Panoramica generale del sistema</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-20">
      <LoadingSpinner size="xl" />
    </div>

    <div v-else class="space-y-8">
      <!-- Stats Grid -->
      <StatsCards :stats="stats" />

      <!-- Quick Actions -->
      <div class="">
        <!-- Quick Actions -->
        <div class="card h-full">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Azioni Rapide</h2>
          <div class="grid grid-cols-2 gap-4">
            <router-link
              to="/manager/products"
              class="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-200 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all group text-center"
            >
              <div
                class="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <span class="text-sm font-bold text-gray-700">Nuovo Prodotto</span>
            </router-link>

            <router-link
              to="/manager/orders"
              class="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-200 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all group text-center"
            >
              <div
                class="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <span class="text-sm font-bold text-gray-700">Gestisci Ordini</span>
            </router-link>

            <router-link
              to="/manager/stats"
              class="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-200 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all group text-center"
            >
              <div
                class="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <span class="text-sm font-bold text-gray-700">Statistiche</span>
            </router-link>

            <router-link
              to="/"
              class="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-200 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all group text-center"
            >
              <div
                class="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <span class="text-sm font-bold text-gray-700">Vedi Menu</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
