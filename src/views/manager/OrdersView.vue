<script setup lang="ts">
import { ref, computed } from 'vue'
import { useOrders } from '@/composables/useOrders'
import OrdersTable from '@/components/manager/OrdersTable.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { formatCurrency } from '@/utils/currency'

const orders = useOrders({ autoFetch: true, realtime: true })

// State
const searchQuery = ref('')
const filterStatus = ref<'all' | 'pending' | 'completed' | 'cancelled'>('all')
const filterDate = ref<'all' | 'today'>('all')

// Computed
const filteredOrders = computed(() => {
  let filtered = orders.orders.value

  // Filter by search (order number or guest name)
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (o) =>
        o.order_number.toString().includes(query) || o.guest_name?.toLowerCase().includes(query),
    )
  }

  // Filter by status
  if (filterStatus.value !== 'all') {
    filtered = filtered.filter((o) => o.status === filterStatus.value)
  }

  // Filter by date
  if (filterDate.value === 'today') {
    const today = new Date()
    filtered = filtered.filter((o) => {
      const orderDate = new Date(o.created_at)
      return (
        orderDate.getDate() === today.getDate() &&
        orderDate.getMonth() === today.getMonth() &&
        orderDate.getFullYear() === today.getFullYear()
      )
    })
  }

  return filtered
})

const stats = computed(() => {
  const all = filteredOrders.value
  const pending = all.filter((o) => o.status === 'pending')
  const completed = all.filter((o) => o.status === 'completed')
  const cancelled = all.filter((o) => o.status === 'cancelled')
  const revenue = all
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total_amount, 0)

  return {
    all: all.length,
    pending: pending.length,
    completed: completed.length,
    cancelled: cancelled.length,
    revenue,
  }
})

const hasFilters = computed(
  () =>
    searchQuery.value.trim() !== '' || filterStatus.value !== 'all' || filterDate.value !== 'all',
)

// Methods
function clearFilters() {
  searchQuery.value = ''
  filterStatus.value = 'all'
  filterDate.value = 'all'
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Ordini</h1>
      <p class="text-gray-600 mt-1">Gestisci tutti gli ordini ricevuti</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div class="card text-center">
        <p class="text-sm text-gray-600">Totali</p>
        <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats.all }}</p>
      </div>
      <div class="card text-center">
        <p class="text-sm text-yellow-600">In Attesa</p>
        <p class="text-3xl font-bold text-yellow-600 mt-1">{{ stats.pending }}</p>
      </div>
      <div class="card text-center">
        <p class="text-sm text-green-600">Completati</p>
        <p class="text-3xl font-bold text-green-600 mt-1">{{ stats.completed }}</p>
      </div>
      <div class="card text-center">
        <p class="text-sm text-red-600">Annullati</p>
        <p class="text-3xl font-bold text-red-600 mt-1">{{ stats.cancelled }}</p>
      </div>
      <div class="card text-center">
        <p class="text-sm text-primary-600">Incasso</p>
        <p class="text-2xl font-bold text-primary-600 mt-1">{{ formatCurrency(stats.revenue) }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Search -->
        <div>
          <label class="form-label">Cerca</label>
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Numero ordine o nome..."
              class="input pl-10"
            />
            <svg
              class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <!-- Status Filter -->
        <div>
          <label class="form-label">Stato</label>
          <select v-model="filterStatus" class="input">
            <option value="all">Tutti</option>
            <option value="pending">In attesa</option>
            <option value="completed">Completati</option>
            <option value="cancelled">Annullati</option>
          </select>
        </div>

        <!-- Date Filter -->
        <div>
          <label class="form-label">Data</label>
          <select v-model="filterDate" class="input">
            <option value="all">Tutti</option>
            <option value="today">Oggi</option>
          </select>
        </div>
      </div>

      <!-- Clear Filters -->
      <div v-if="hasFilters" class="mt-4 flex items-center justify-between">
        <p class="text-sm text-gray-600">{{ filteredOrders.length }} ordini trovati</p>
        <button @click="clearFilters" class="btn btn-ghost btn-sm">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Cancella filtri
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="orders.loading.value" class="flex justify-center py-12">
      <LoadingSpinner size="xl" />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="filteredOrders.length === 0 && !hasFilters"
      icon="📋"
      title="Nessun ordine"
      description="Gli ordini ricevuti appariranno qui"
    />

    <!-- No Results -->
    <EmptyState
      v-else-if="filteredOrders.length === 0 && hasFilters"
      icon="🔍"
      title="Nessun risultato"
      description="Prova a modificare i filtri di ricerca"
    />

    <!-- Orders Table -->
    <OrdersTable v-else :orders="filteredOrders" @refetch="orders.refetch" />
  </div>
</template>
