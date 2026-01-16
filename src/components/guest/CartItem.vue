<script setup lang="ts">
import { ref } from 'vue'
import type { CartItem } from '@/types/models'
import { formatCurrency } from '@/utils/currency'

interface Props {
  item: CartItem
  index: number
}

interface Emits {
  (e: 'increment', index: number): void
  (e: 'decrement', index: number): void
  (e: 'remove', index: number): void
  (e: 'update-notes', index: number, notes: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showNotes = ref(false)
const localNotes = ref(props.item.notes || '')

const itemPrice = props.item.product.price + (props.item.variant?.price_modifier || 0)
const totalPrice = itemPrice * props.item.quantity

function handleIncrement() {
  emit('increment', props.index)
}

function handleDecrement() {
  emit('decrement', props.index)
}

function handleRemove() {
  if (confirm(`Rimuovere ${props.item.product.name} dal carrello?`)) {
    emit('remove', props.index)
  }
}

function handleSaveNotes() {
  emit('update-notes', props.index, localNotes.value)
  showNotes.value = false
}
</script>

<template>
  <div class="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div class="flex gap-4">
      <!-- Image (optional) -->
      <div v-if="item.product.image_url" class="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
        <img :src="item.product.image_url" :alt="item.product.name" class="w-full h-full object-cover" />
      </div>
      <div v-else class="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-start">
          <div>
            <h4 class="font-bold text-gray-900 truncate pr-2">
              {{ item.product.name }}
            </h4>
            <p v-if="item.variant" class="text-sm text-gray-500">
              {{ item.variant.name }}
            </p>
          </div>
          <span class="font-bold text-primary-600 whitespace-nowrap">
            {{ formatCurrency(totalPrice) }}
          </span>
        </div>

        <p v-if="item.notes" class="text-xs text-gray-500 mt-1 italic bg-gray-50 p-1.5 rounded-md border border-gray-100">
          Note: {{ item.notes }}
        </p>

        <!-- Controls -->
        <div class="mt-3 flex items-center justify-between">
          <!-- Quantity -->
          <div class="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100">
            <button
              @click="handleDecrement"
              class="w-7 h-7 flex items-center justify-center rounded-md bg-white text-gray-600 shadow-sm hover:text-primary-600 disabled:opacity-50 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
              </svg>
            </button>

            <span class="w-8 text-center font-bold text-gray-900 text-sm">
              {{ item.quantity }}
            </span>

            <button
              @click="handleIncrement"
              class="w-7 h-7 flex items-center justify-center rounded-md bg-white text-gray-600 shadow-sm hover:text-primary-600 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-1">
            <button
              @click="showNotes = !showNotes"
              class="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              :class="{ 'text-primary-600 bg-primary-50': item.notes }"
              title="Aggiungi note"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>

            <button
              @click="handleRemove"
              class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Rimuovi"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Notes Input -->
    <div v-if="showNotes" class="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
      <textarea
        v-model="localNotes"
        placeholder="Aggiungi note per la cucina (es: senza cipolla)..."
        rows="2"
        maxlength="100"
        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
      />
      <div class="mt-2 flex justify-between items-center">
        <span class="text-xs text-gray-400">{{ localNotes.length }}/100</span>
        <div class="flex gap-2">
          <button
            @click="showNotes = false"
            class="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Annulla
          </button>
          <button
            @click="handleSaveNotes"
            class="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            Salva Note
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
