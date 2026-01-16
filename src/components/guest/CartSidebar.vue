<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '@/composables/useCart'
import CartItem from '@/components/guest/CartItem.vue'
import { formatCurrency } from '@/utils/currency'
import AppButton from '@/components/common/AppButton.vue'

interface Props {
  show: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const router = useRouter()
const cart = useCart()

const canCheckout = computed(() => {
  return !cart.isEmpty.value && cart.covers.value >= 1
})

function handleClose() {
  emit('close')
}

function handleCheckout() {
  const validation = cart.validate()

  if (!validation.valid) {
    alert(validation.error)
    return
  }

  handleClose()
  router.push('/checkout')
}

function handleClear() {
  if (confirm('Vuoi svuotare il carrello?')) {
    cart.clear()
  }
}
</script>

<template>
  <!-- Overlay -->
  <Transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50"
      @click="handleClose"
    />
  </Transition>

  <!-- Sidebar -->
  <Transition name="slide">
    <div
      v-if="show"
      class="fixed top-0 right-0 h-full w-full md:w-[450px] bg-white shadow-2xl z-50 flex flex-col"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100 bg-white z-10">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Il tuo ordine</h2>
          <p class="text-sm text-gray-500 mt-1">{{ cart.totalItems.value }} prodotti selezionati</p>
        </div>
        <button
          @click="handleClose"
          class="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Empty State -->
      <div
        v-if="cart.isEmpty.value"
        class="flex-1 flex flex-col items-center justify-center p-8 text-center"
      >
        <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <svg
            class="w-12 h-12 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Il carrello è vuoto</h3>
        <p class="text-gray-500 mb-8 max-w-xs">
          Non hai ancora aggiunto nessun prodotto. Torna al menu per iniziare.
        </p>
        <AppButton @click="handleClose" variant="primary"> Torna al menu </AppButton>
      </div>

      <!-- Cart Items -->
      <div v-else class="flex-1 overflow-y-auto bg-gray-50">
        <!-- Coperti -->
        <div class="p-6 bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-bold text-gray-700">Numero di coperti</label>
            <span class="text-xs text-gray-400">Obbligatorio</span>
          </div>

          <div class="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-200">
            <button
              @click="cart.setCovers(cart.covers.value - 1)"
              :disabled="cart.covers.value <= 1"
              class="w-12 h-10 flex items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm hover:text-primary-600 disabled:opacity-50 disabled:shadow-none transition-all"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 12H4"
                />
              </svg>
            </button>

            <input
              :value="cart.covers.value"
              @input="cart.setCovers(parseInt(($event.target as HTMLInputElement).value) || 1)"
              type="number"
              min="1"
              max="100"
              class="flex-1 bg-transparent text-center font-bold text-gray-900 focus:outline-none"
            />

            <button
              @click="cart.setCovers(cart.covers.value + 1)"
              :disabled="cart.covers.value >= 100"
              class="w-12 h-10 flex items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm hover:text-primary-600 disabled:opacity-50 disabled:shadow-none transition-all"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Items List -->
        <div class="p-6 space-y-4">
          <CartItem
            v-for="(item, index) in cart.items.value"
            :key="`${item.product.id}-${item.variant?.id || ''}-${index}`"
            :item="item"
            :index="index"
            @increment="cart.incrementItem"
            @decrement="cart.decrementItem"
            @remove="cart.removeFromCart"
            @update-notes="cart.updateNotes"
          />
        </div>

        <!-- Clear Cart -->
        <div class="px-6 pb-6">
          <button
            @click="handleClear"
            class="w-full py-3 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center font-medium"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Svuota intero carrello
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div
        v-if="!cart.isEmpty.value"
        class="border-t border-gray-100 p-6 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20"
      >
        <!-- Subtotals -->
        <div class="space-y-2 mb-4 text-sm text-gray-500">
          <div class="flex justify-between">
            <span>Subtotale</span>
            <span>{{ formatCurrency(cart.totalAmount.value) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Coperti ({{ cart.covers.value }})</span>
            <span>Incluso</span>
          </div>
        </div>

        <!-- Total -->
        <div class="flex justify-between items-center mb-6 pt-4 border-t border-gray-100">
          <span class="text-xl font-bold text-gray-900">Totale</span>
          <span class="text-2xl font-bold text-primary-600">{{
            formatCurrency(cart.totalAmount.value)
          }}</span>
        </div>

        <!-- Checkout Button -->
        <AppButton
          @click="handleCheckout"
          :disabled="!canCheckout"
          variant="primary"
          size="lg"
          block
        >
          Riepilogo ordine
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </AppButton>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
