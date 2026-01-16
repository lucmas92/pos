<script setup lang="ts">
import { formatCurrency } from '@/utils/currency'

interface Props {
  itemsCount: number
  total: number
}

defineProps<Props>()
</script>

<template>
  <button
    class="relative group flex items-center space-x-3 bg-white text-gray-900 px-5 py-3 rounded-2xl shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border border-gray-100"
  >
    <div class="relative">
      <!-- Cart Icon -->
      <div
        class="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      </div>

      <!-- Badge -->
      <span
        v-if="itemsCount > 0"
        class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm ring-2 ring-white"
      >
        {{ itemsCount }}
      </span>
    </div>

    <!-- Total -->
    <div class="text-left">
      <div class="text-xs text-gray-500 font-medium">Il tuo ordine</div>
      <div class="text-sm font-bold text-gray-900">{{ formatCurrency(total) }}</div>
    </div>
  </button>
</template>
