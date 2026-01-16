<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useOrders } from '@/composables/useOrders'
import { useProducts } from '@/composables/useProducts'
import StatsCards from '@/components/manager/StatsCards.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AppButton from '@/components/common/AppButton.vue'
import { formatCurrency } from '@/utils/currency'
import { formatNumber } from '@/utils/helpers'
import type { TimeRange } from '@/types/enums'

const orders = useOrders({ autoFetch: true })
const products = useProducts({ autoFetch: true })

// State
const timeRange = ref<TimeRange>('today' as TimeRange)
const loading = ref(false)

// Computed
const dashboardStats = computed(() => {
  const allOrders = orders.orders.value
  const todayOrders = orders.todayOrders.value

  return {
    totalOrders: allOrders.length,
    todayOrders: todayOrders.length,
    pendingOrders: orders.pendingOrders.value.length,
    completedOrders: orders.completedOrders.value.length,
    cancelledOrders: orders.cancelledOrders.value.length,

    totalRevenue: orders.totalRevenue.value,
    todayRevenue: orders.todayRevenue.value,
    averageOrderValue: orders.averageOrderValue.value,

    totalProducts: products.productsCount.value,
    activeProducts: products.products.value.filter(p => p.is_active).length,
    outOfStock: products.outOfStockProducts.value.length,
    lowStock: products.lowStockProducts.value.length,

    totalCovers: allOrders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.covers, 0),
    todayCovers: todayOrders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.covers, 0),
    averageCoversPerOrder:
      allOrders.length > 0 ? allOrders.reduce((sum, o) => sum + o.covers, 0) / allOrders.length : 0,
  }
})

const topProducts = computed(() => {
  return orders.getTopProducts(10)
})

const revenueByCategory = computed(() => {
  const categoryRevenue = new Map<string, { name: string; revenue: number; items: number }>()

  orders.orders.value
    .filter((o) => o.status !== 'cancelled')
    .forEach((order) => {
      order.items?.forEach((item) => {
        const categoryName = item.product?.category?.name || 'Altro'
        const existing = categoryRevenue.get(categoryName)

        if (existing) {
          existing.revenue += item.unit_price * item.quantity
          existing.items += item.quantity
        } else {
          categoryRevenue.set(categoryName, {
            name: categoryName,
            revenue: item.unit_price * item.quantity,
            items: item.quantity,
          })
        }
      })
    })

  return Array.from(categoryRevenue.values()).sort((a, b) => b.revenue - a.revenue)
})

// Methods
async function handleExport() {
  // TODO: Implementare export CSV/Excel
  alert('Funzionalità export in arrivo!')
}

onMounted(() => {
  // Data already loaded by composables
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Statistiche</h1>
        <p class="text-gray-500 mt-1">Analisi e report dettagliati</p>
      </div>
      <AppButton @click="handleExport" variant="secondary">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Esporta Report
      </AppButton>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-20">
      <LoadingSpinner size="xl" />
    </div>

    <div v-else class="space-y-8">
      <!-- Main Stats Cards -->
      <StatsCards :stats="dashboardStats" />

      <!-- Charts & Tables -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Top Products -->
        <div class="card h-full">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-900">🏆 Prodotti Più Venduti</h2>
            <span class="text-sm text-gray-500">Top 10</span>
          </div>

          <div v-if="topProducts.length === 0" class="flex flex-col items-center justify-center h-64 text-gray-400">
            <svg class="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>Nessun dato disponibile</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="(item, index) in topProducts"
              :key="index"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow"
            >
              <div class="flex items-center space-x-4">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm"
                  :class="index < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'"
                >
                  {{ index + 1 }}
                </div>
                <div>
                  <p class="font-bold text-gray-900">{{ item.name }}</p>
                  <p class="text-xs text-gray-500 font-medium">{{ item.quantity }} venduti</p>
                </div>
              </div>
              <p class="font-bold text-gray-900">{{ formatCurrency(item.revenue) }}</p>
            </div>
          </div>
        </div>

        <!-- Revenue by Category -->
        <div class="card h-full">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-900">📊 Incasso per Categoria</h2>
          </div>

          <div v-if="revenueByCategory.length === 0" class="flex flex-col items-center justify-center h-64 text-gray-400">
            <svg class="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            <p>Nessun dato disponibile</p>
          </div>

          <div v-else class="space-y-5">
            <div v-for="category in revenueByCategory" :key="category.name" class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center">
                  <span class="font-bold text-gray-900 mr-2">{{ category.name }}</span>
                  <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{{ category.items }} pz</span>
                </div>
                <span class="font-bold text-gray-900">{{ formatCurrency(category.revenue) }}</span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  class="bg-primary-600 h-full rounded-full transition-all duration-500"
                  :style="{ width: `${(category.revenue / dashboardStats.totalRevenue) * 100}%` }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Orders Summary -->
        <div class="card">
          <h3 class="text-lg font-bold text-gray-900 mb-5 flex items-center">
            <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Riepilogo Ordini
          </h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span class="text-gray-600 text-sm font-medium">Totali</span>
              <span class="font-bold text-gray-900">{{ dashboardStats.totalOrders }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span class="text-blue-700 text-sm font-medium">Oggi</span>
              <span class="font-bold text-blue-700">{{ dashboardStats.todayOrders }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span class="text-yellow-700 text-sm font-medium">In attesa</span>
              <span class="font-bold text-yellow-700">{{ dashboardStats.pendingOrders }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span class="text-green-700 text-sm font-medium">Completati</span>
              <span class="font-bold text-green-700">{{ dashboardStats.completedOrders }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span class="text-red-700 text-sm font-medium">Annullati</span>
              <span class="font-bold text-red-700">{{ dashboardStats.cancelledOrders }}</span>
            </div>
          </div>
        </div>

        <!-- Revenue Summary -->
        <div class="card">
          <h3 class="text-lg font-bold text-gray-900 mb-5 flex items-center">
            <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Riepilogo Incassi
          </h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span class="text-gray-600 text-sm font-medium">Totale</span>
              <span class="font-bold text-gray-900">{{ formatCurrency(dashboardStats.totalRevenue) }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span class="text-green-700 text-sm font-medium">Oggi</span>
              <span class="font-bold text-green-700">{{ formatCurrency(dashboardStats.todayRevenue) }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span class="text-blue-700 text-sm font-medium">Scontrino medio</span>
              <span class="font-bold text-blue-700">{{ formatCurrency(dashboardStats.averageOrderValue) }}</span>
            </div>
          </div>
        </div>

        <!-- Covers Summary -->
        <div class="card">
          <h3 class="text-lg font-bold text-gray-900 mb-5 flex items-center">
            <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Riepilogo Coperti
          </h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span class="text-gray-600 text-sm font-medium">Totali</span>
              <span class="font-bold text-gray-900">{{ formatNumber(dashboardStats.totalCovers) }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span class="text-blue-700 text-sm font-medium">Oggi</span>
              <span class="font-bold text-blue-700">{{ formatNumber(dashboardStats.todayCovers) }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span class="text-purple-700 text-sm font-medium">Media per ordine</span>
              <span class="font-bold text-purple-700">{{ dashboardStats.averageCoversPerOrder.toFixed(1) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
