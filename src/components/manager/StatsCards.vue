<script setup lang="ts">
import { formatCurrency } from '@/utils/currency'
import { formatNumber } from '@/utils/helpers'
import KpiCard from '@/components/manager/KpiCard.vue'

interface Stats {
  todayOrders: number
  todayRevenue: number
  pendingOrders: number
  totalProducts?: number
  outOfStock?: number
  lowStock?: number
}

defineProps<{
  stats: Stats
}>()
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <!-- Today Orders -->
    <KpiCard title="Ordini Oggi" :value="formatNumber(stats.todayOrders)" variant="blue">
      <template #icon>
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </template>
    </KpiCard>

    <!-- Today Revenue -->
    <KpiCard title="Incasso Oggi" :value="formatCurrency(stats.todayRevenue)" variant="green">
      <template #icon>
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </template>
    </KpiCard>

    <!-- Pending Orders -->
    <KpiCard
      title="Ordini in Attesa"
      :value="formatNumber(stats.pendingOrders)"
      variant="yellow"
      to="/manager/orders?status=pending"
    >
      <template #icon>
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </template>
    </KpiCard>

    <!-- Total Products -->
    <KpiCard
      v-if="stats.totalProducts"
      title="Prodotti Totali"
      :value="formatNumber(stats.totalProducts)"
      variant="white"
      to="/manager/products"
    >
      <template #icon>
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      </template>
    </KpiCard>

    <!-- Out of Stock -->
    <KpiCard
      v-if="stats.outOfStock"
      title="Prodotti Esauriti"
      :value="formatNumber(stats.outOfStock)"
      variant="red"
      to="/manager/products?status=out-of-stock"
    >
      <template #icon>
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </template>
    </KpiCard>

    <!-- Low Stock -->
    <KpiCard
      v-if="stats.lowStock"
      title="Scorte Basse"
      :value="formatNumber(stats.lowStock)"
      variant="orange"
      to="/manager/products"
    >
      <template #icon>
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
          />
        </svg>
      </template>
    </KpiCard>
  </div>
</template>
