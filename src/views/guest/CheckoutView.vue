<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '@/composables/useCart'
import { useOrders } from '@/composables/useOrders'
import CartItem from '@/components/guest/CartItem.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { formatCurrency } from '@/utils/currency'
import { saveToStorage, getFromStorage } from '@/utils/storage'
import { useConfig } from '@/composables/useConfig.ts'

const router = useRouter()
const cart = useCart()
const orders = useOrders({ autoFetch: false })
const { config } = useConfig()

// State
const guestName = ref('')
const orderNotes = ref('')
const isSubmitting = ref(false)
const error = ref('')

// Computed
const canSubmit = computed(() => {
  return (
    !cart.isEmpty.value && cart.covers.value >= 1 && cart.covers.value <= 100 && !isSubmitting.value
  )
})

const itemsTotal = computed(() => cart.totalAmount.value)

// Per ora non abbiamo costi aggiuntivi, ma lasciamo la struttura
const serviceFee = computed(() => 0)
const total = computed(() => itemsTotal.value + serviceFee.value)

// Methods
function goBack() {
  router.push('/')
}

async function handleSubmit() {
  if (!canSubmit.value) return

  // Valida carrello
  const validation = cart.validate()
  if (!validation.valid) {
    error.value = validation.error || 'Errore nella validazione'
    return
  }

  isSubmitting.value = true
  error.value = ''

  try {
    // Prepara dati ordine
    const orderData = {
      guest_name: guestName.value.trim() || undefined,
      covers: cart.covers.value,
      total_amount: total.value,
      notes: orderNotes.value.trim() || undefined,
      items: cart.items.value.map((item) => ({
        product_id: item.product.id,
        variant_id: item.variant?.id,
        quantity: item.quantity,
        unit_price: item.product.price + (item.variant?.price_modifier || 0),
        notes: item.notes,
      })),
    }

    // Crea ordine
    const result = await orders.create(orderData)

    if (result.success && result.data) {
      // Salva l'ordine completato nello storage locale per riferimento futuro
      saveCompletedOrder(result.data)

      // Svuota carrello
      cart.clear()

      // Redirect a success page
      router.push({
        name: 'order-success',
        params: { orderNumber: result.data.order_number },
      })
    } else {
      error.value = result.error || "Errore nella creazione dell'ordine"
    }
  } catch (err: any) {
    error.value = err.message || 'Errore imprevisto'
  } finally {
    isSubmitting.value = false
  }
}

function saveCompletedOrder(order: any) {
  const completedOrders = getFromStorage<any[]>('completed_orders') || []
  completedOrders.unshift({
    id: order.id,
    order_number: order.order_number,
    total_amount: order.total_amount,
    created_at: order.created_at,
    items_count: order.items?.length || 0,
  })
  // Mantieni solo gli ultimi 10 ordini
  if (completedOrders.length > 10) {
    completedOrders.pop()
  }
  saveToStorage('completed_orders', completedOrders)
}

// Lifecycle
onMounted(() => {
  // Se carrello vuoto, torna al menu
  if (cart.isEmpty.value) {
    router.replace('/')
  }

  // Carica dati salvati
  guestName.value = cart.guestName.value
  orderNotes.value = cart.orderNotes.value
})
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
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <!-- Title -->
          <h1 class="text-xl font-bold text-gray-900 ml-2">Conferma Ordine</h1>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container-custom py-6 pb-32">
      <div class="max-w-2xl mx-auto space-y-6">
        <!-- Error Message -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex">
            <svg
              class="w-5 h-5 text-red-600 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>
        </div>

        <!-- Guest Info -->
        <div class="card">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Informazioni</h2>

          <div class="space-y-4">
            <!-- Guest Name -->
            <div class="form-group">
              <label class="form-label"> Nome (opzionale) </label>
              <input
                v-model="guestName"
                type="text"
                placeholder="Il tuo nome..."
                maxlength="100"
                class="input"
              />
              <p class="text-xs text-gray-500 mt-1">
                Il nome aiuta a identificare l'ordine alla cassa
              </p>
            </div>

            <!-- Covers -->
            <div class="form-group" v-if="config.enable_covers">
              <label class="form-label">
                Numero di coperti <span class="text-red-500">*</span>
              </label>
              <div class="flex items-center space-x-3">
                <button
                  @click="cart.setCovers(cart.covers.value - 1)"
                  :disabled="cart.covers.value <= 1"
                  class="btn btn-secondary w-12 h-12 p-0"
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
                  class="input text-center text-xl font-bold flex-1"
                />

                <button
                  @click="cart.setCovers(cart.covers.value + 1)"
                  :disabled="cart.covers.value >= 100"
                  class="btn btn-secondary w-12 h-12 p-0"
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

            <!-- Order Notes -->
            <div class="form-group">
              <label class="form-label"> Note per l'ordine (opzionale) </label>
              <textarea
                v-model="orderNotes"
                placeholder="Es: allergie, intolleranze, richieste particolari..."
                rows="3"
                maxlength="200"
                class="input resize-none"
              />
              <p class="text-xs text-gray-500 mt-1">{{ orderNotes.length }}/200</p>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="card">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Riepilogo Ordine</h2>

          <!-- Items -->
          <div class="space-y-3 mb-6">
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

          <!-- Totals -->
          <div class="border-t border-gray-200 pt-4 space-y-2">
            <div class="flex justify-between text-gray-700">
              <span>Subtotale ({{ cart.totalItems.value }} prodotti)</span>
              <span class="font-medium">{{ formatCurrency(itemsTotal) }}</span>
            </div>

            <div v-if="serviceFee > 0" class="flex justify-between text-gray-700">
              <span>Costo servizio</span>
              <span class="font-medium">{{ formatCurrency(serviceFee) }}</span>
            </div>

            <div
              class="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200"
            >
              <span>Totale</span>
              <span class="text-primary-600">{{ formatCurrency(total) }}</span>
            </div>

            <div v-if="config.enable_covers" class="flex justify-between text-sm text-gray-600">
              <span>Coperti</span>
              <span>{{ cart.covers.value }}</span>
            </div>
          </div>
        </div>

        <!-- Info Box -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex">
            <svg
              class="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div class="text-sm text-blue-900">
              <p class="font-medium mb-1">Come funziona</p>
              <ol class="list-decimal list-inside space-y-1">
                <li>Conferma il tuo ordine</li>
                <li>Riceverai un numero d'ordine</li>
                <li>Vai alla cassa con il numero per pagare</li>
                <li>Ritira il tuo ordine quando pronto</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Fixed Footer -->
    <div
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-inset-bottom"
    >
      <div class="container-custom max-w-2x mx-auto mb-4">
        <button @click="handleSubmit" :disabled="!canSubmit" class="btn btn-primary btn-lg w-full">
          <LoadingSpinner v-if="isSubmitting" size="sm" color="text-white" class="mr-2" />
          <span v-else> Conferma Ordine - {{ formatCurrency(total) }} </span>
        </button>
      </div>
    </div>
  </div>
</template>
