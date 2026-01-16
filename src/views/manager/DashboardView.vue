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
  totalProducts: products.productsCount.value,
  outOfStock: products.outOfStockProducts.value.length,
  lowStock: products.lowStockProducts.value.length,
}))

const recentOrders = computed(() => orders.recentOrders.value.slice(0, 5))

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

      <!-- Recent Orders & Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Recent Orders -->
        <div class="lg:col-span-2">
          <div class="card h-full">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-gray-900">Ordini Recenti</h2>
              <router-link
                to="/manager/orders"
                class="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
              >
                Vedi tutti →
              </router-link>
            </div>

            <div v-if="recentOrders.length === 0" class="flex flex-col items-center justify-center h-64 text-gray-400">
              <svg class="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>Nessun ordine recente</p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="order in recentOrders"
                :key="order.id"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-sm transition-all"
              >
                <div class="flex items-center space-x-4">
                  <div
                    class="w-12 h-12 bg-primary-100 text-primary-700 rounded-xl flex items-center justify-center font-bold text-sm"
                  >
                    #{{ order.order_number }}
                  </div>
                  <div>
                    <p class="font-bold text-gray-900">
                      {{ order.guest_name || 'Ospite' }}
                    </p>
                    <p class="text-sm text-gray-500">
                      {{ order.items?.length || 0 }} prodotti • {{ order.covers }} coperti
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-bold text-gray-900">{{ formatCurrency(order.total_amount) }}</p>
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold mt-1"
                    :class="[
                      order.status === 'pending' && 'bg-yellow-100 text-yellow-800',
                      order.status === 'completed' && 'bg-green-100 text-green-800',
                      order.status === 'cancelled' && 'bg-red-100 text-red-800',
                    ]"
                  >
                    {{
                      order.status === 'pending'
                        ? 'In attesa'
                        : order.status === 'completed'
                          ? 'Completato'
                          : 'Annullato'
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card h-full">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Azioni Rapide</h2>
          <div class="grid grid-cols-2 gap-4">
            <router-link
              to="/manager/products"
              class="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all group text-center"
            >
              <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span class="text-sm font-bold text-gray-700">Nuovo Prodotto</span>
            </router-link>

            <router-link
              to="/manager/orders"
              class="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all group text-center"
            >
              <div class="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span class="text-sm font-bold text-gray-700">Gestisci Ordini</span>
            </router-link>

            <router-link
              to="/manager/stats"
              class="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all group text-center"
            >
              <div class="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span class="text-sm font-bold text-gray-700">Statistiche</span>
            </router-link>

            <router-link
              to="/"
              class="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all group text-center"
            >
              <div class="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
