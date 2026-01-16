<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useOrders } from '@/composables/useOrders'
import type { Order } from '@/types/models'
import AppModal from '@/components/common/AppModal.vue'
import AppButton from '@/components/common/AppButton.vue'
import { formatCurrency } from '@/utils/currency.ts'
import { formatDate } from '@/utils/date.ts'

interface Props {
  orders: Order[]
}

interface Emits {
  (e: 'refetch'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { updateStatus } = useOrders()

// State
const selectedOrder = ref<Order | null>(null)
const showDetails = ref(false)
const sortDirection = ref<'asc' | 'desc'>('desc')

// Computed
const sortedOrders = computed(() => {
  return [...props.orders].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return sortDirection.value === 'asc' ? dateA - dateB : dateB - dateA
  })
})

// Watch for changes in the orders list to update the selected order if it's open
watch(
  () => props.orders,
  (newOrders) => {
    if (selectedOrder.value && showDetails.value) {
      const updatedOrder = newOrders.find((o) => o.id === selectedOrder.value!.id)
      if (updatedOrder) {
        selectedOrder.value = updatedOrder
      }
    }
  },
  { deep: true },
)

// Methods
function toggleSort() {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
}

function handleViewDetails(order: Order) {
  selectedOrder.value = order
  showDetails.value = true
}

async function handleStatusChange(
  order: Order,
  status: 'pending' | 'paid' | 'completed' | 'cancelled',
) {
  showDetails.value = false
  if (status === 'cancelled' && !confirm('Sei sicuro di voler annullare questo ordine?')) return

  await updateStatus(order.id, status)
  emit('refetch')

  if (selectedOrder.value?.id === order.id) {
    selectedOrder.value = { ...order, status }
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-100">
        <thead class="bg-gray-50">
          <tr>
            <th
              scope="col"
              class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
            >
              Ordine
            </th>
            <th
              scope="col"
              class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
            >
              Ospite
            </th>
            <th
              scope="col"
              class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
            >
              Totale
            </th>
            <th
              scope="col"
              class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
            >
              Stato
            </th>
            <th
              scope="col"
              class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
              @click="toggleSort"
            >
              <div class="flex items-center gap-1">
                Data
                <svg
                  class="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors"
                  :class="{ 'rotate-180': sortDirection === 'asc' }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </th>
            <th scope="col" class="relative px-6 py-4">
              <span class="sr-only">Azioni</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-100">
          <tr
            v-for="order in sortedOrders"
            :key="order.id"
            class="hover:bg-gray-50 transition-colors cursor-pointer"
            @click="handleViewDetails(order)"
          >
            <!-- Order Number -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div
                  class="h-10 w-10 flex-shrink-0 rounded-lg bg-primary-50 flex items-center justify-center text-primary-700 font-bold"
                >
                  #{{ order.order_number }}
                </div>
              </div>
            </td>

            <!-- Guest -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">
                {{ order.guest_name || 'Ospite' }}
              </div>
              <div class="text-xs text-gray-500">{{ order.covers }} coperti</div>
            </td>

            <!-- Total -->
            <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
              {{ formatCurrency(order.total_amount) }}
            </td>

            <!-- Status -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                :class="{
                  'bg-yellow-100 text-yellow-800': order.status === 'pending',
                  'bg-blue-100 text-blue-800': order.status === 'paid',
                  'bg-green-100 text-green-800': order.status === 'completed',
                  'bg-red-100 text-red-800': order.status === 'cancelled',
                }"
              >
                {{
                  order.status === 'pending'
                    ? 'In attesa'
                    : order.status === 'paid'
                      ? 'Pagato'
                      : order.status === 'completed'
                        ? 'Completato'
                        : 'Annullato'
                }}
              </span>
            </td>

            <!-- Date -->
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(order.created_at, true) }}
            </td>

            <!-- Actions -->
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" @click.stop>
              <div class="flex items-center justify-end space-x-2">
                <!-- Mark as Paid -->
                <button
                  v-if="order.status === 'pending'"
                  @click="handleStatusChange(order, 'paid')"
                  class="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-50 transition-colors"
                  title="Segna come Pagato"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </button>

                <!-- Complete -->
                <button
                  v-if="order.status === 'paid'"
                  @click="handleStatusChange(order, 'completed')"
                  class="text-green-600 hover:text-green-900 p-1 rounded-lg hover:bg-green-50 transition-colors"
                  title="Completa"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </button>

                <!-- Cancel -->
                <button
                  v-if="order.status !== 'cancelled' && order.status !== 'completed'"
                  @click="handleStatusChange(order, 'cancelled')"
                  class="text-red-600 hover:text-red-900 p-1 rounded-lg hover:bg-red-50 transition-colors"
                  title="Annulla"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Order Details Modal -->
    <AppModal
      :isOpen="showDetails"
      @close="showDetails = false"
      :title="selectedOrder ? `Ordine #${selectedOrder.order_number}` : 'Dettagli Ordine'"
      maxWidth="lg"
    >
      <div v-if="selectedOrder" class="space-y-6">
        <!-- Info Header -->
        <div class="flex justify-between items-start bg-gray-50 p-4 rounded-xl">
          <div>
            <p class="text-sm text-gray-500">Ospite</p>
            <p class="font-bold text-gray-900">{{ selectedOrder.guest_name || 'Anonimo' }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ selectedOrder.covers }} coperti</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500">Data</p>
            <p class="font-medium text-gray-900">{{ formatDate(selectedOrder.created_at) }}</p>
          </div>
        </div>

        <!-- Items List -->
        <div>
          <h4 class="font-bold text-gray-900 mb-3">Prodotti Ordinati</h4>
          <div class="border border-gray-100 rounded-xl overflow-hidden">
            <div
              v-for="item in selectedOrder.items"
              :key="item.id"
              class="flex justify-between items-center p-3 border-b border-gray-100 last:border-0 bg-white"
            >
              <div class="flex items-center gap-3">
                <span class="bg-primary-50 text-primary-700 font-bold px-2 py-1 rounded text-sm">
                  {{ item.quantity }}x
                </span>
                <div>
                  <p class="font-medium text-gray-900">{{ item.product?.name }}</p>
                  <p v-if="item.variant" class="text-xs text-gray-500">{{ item.variant.name }}</p>
                  <p v-if="item.notes" class="text-xs text-orange-600 italic mt-0.5">
                    Note: {{ item.notes }}
                  </p>
                </div>
              </div>
              <p class="font-medium text-gray-900">
                {{ formatCurrency(item.unit_price * item.quantity) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Order Notes -->
        <div
          v-if="selectedOrder.notes"
          class="bg-yellow-50 p-4 rounded-xl border border-yellow-100"
        >
          <h4 class="text-sm font-bold text-yellow-800 mb-1">Note Ordine</h4>
          <p class="text-sm text-yellow-700">{{ selectedOrder.notes }}</p>
        </div>

        <!-- Total -->
        <div class="flex justify-between items-center pt-4 border-t border-gray-100">
          <span class="text-lg font-bold text-gray-900">Totale</span>
          <span class="text-2xl font-bold text-primary-600">{{
            formatCurrency(selectedOrder.total_amount)
          }}</span>
        </div>
      </div>

      <template #footer>
        <div class="flex gap-3 w-full" v-if="selectedOrder">
          <AppButton @click="showDetails = false" variant="secondary" class="flex-1">
            Chiudi
          </AppButton>

          <AppButton
            v-if="selectedOrder.status === 'pending'"
            @click="handleStatusChange(selectedOrder, 'paid')"
            variant="primary"
            class="flex-1 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
          >
            Segna come Pagato
          </AppButton>

          <AppButton
            v-if="selectedOrder.status === 'paid'"
            @click="handleStatusChange(selectedOrder, 'completed')"
            variant="primary"
            class="flex-1"
          >
            Completa Ordine
          </AppButton>
        </div>
      </template>
    </AppModal>
  </div>
</template>
