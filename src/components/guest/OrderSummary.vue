<script setup lang="ts">
import { useCart } from '@/composables/useCart'
import { formatCurrency } from '@/utils/currency'

const cart = useCart()
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="p-6 border-b border-gray-100">
      <h3 class="text-lg font-bold text-gray-900">Riepilogo Ordine</h3>
    </div>

    <div class="p-6 space-y-4">
      <!-- Items -->
      <div class="space-y-3 max-h-96 overflow-y-auto pr-2">
        <div
          v-for="(item, index) in cart.items.value"
          :key="index"
          class="flex justify-between items-start text-sm"
        >
          <div class="flex-1 pr-4">
            <div class="font-medium text-gray-900">
              <span class="text-primary-600 font-bold mr-1">{{ item.quantity }}x</span>
              {{ item.product.name }}
            </div>
            <div v-if="item.variant" class="text-gray-500 text-xs mt-0.5">
              {{ item.variant.name }}
            </div>
            <div v-if="item.notes" class="text-gray-400 text-xs italic mt-0.5">
              Note: {{ item.notes }}
            </div>
          </div>
          <div class="font-medium text-gray-900 whitespace-nowrap">
            {{
              formatCurrency(
                (item.product.price + (item.variant?.price_modifier || 0)) * item.quantity,
              )
            }}
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-dashed border-gray-200 my-4"></div>

      <!-- Totals -->
      <div class="space-y-2">
        <div class="flex justify-between text-sm text-gray-600">
          <span>Subtotale</span>
          <span>{{ formatCurrency(cart.totalAmount.value) }}</span>
        </div>
        <div class="flex justify-between text-sm text-gray-600">
          <span>Coperti ({{ cart.covers.value }})</span>
          <span>Incluso</span>
        </div>
        <div class="flex justify-between items-center pt-2 text-lg font-bold text-gray-900">
          <span>Totale</span>
          <span class="text-primary-600">{{ formatCurrency(cart.totalAmount.value) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
