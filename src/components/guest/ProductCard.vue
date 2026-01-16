<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Product, ProductVariant } from '@/types/models'
import { formatCurrency } from '@/utils/currency'
import AppModal from '@/components/common/AppModal.vue'
import AppButton from '@/components/common/AppButton.vue'

interface Props {
  product: Product
  inCart?: boolean
  cartQuantity?: number
}

interface Emits {
  (
    e: 'add-to-cart',
    product: Product,
    variant?: ProductVariant,
    notes?: string,
    quantity?: number,
  ): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showVariants = ref(false)
const selectedVariant = ref<ProductVariant | undefined>()
const notes = ref('')
const quantity = ref(1)

const finalPrice = computed(() => {
  const basePrice = props.product.price
  const variantModifier = selectedVariant.value?.price_modifier || 0
  return (basePrice + variantModifier) * quantity.value
})

const isLowStock = computed(
  () => props.product.quantity_available > 0 && props.product.quantity_available < 10,
)

const isOutOfStock = computed(() => props.product.quantity_available === 0)

const hasVariants = computed(() => props.product.variants && props.product.variants.length > 0)

// Un prodotto richiede il modale se ha varianti OPPURE se è un kit (per vedere cosa contiene) OPPURE se vogliamo sempre permettere di aggiungere note/quantità
const requiresModal = computed(() => hasVariants.value || props.product.is_kit)

function handleAddToCart() {
  if (isOutOfStock.value) return

  if (requiresModal.value && !selectedVariant.value && hasVariants.value) {
    // Se ha varianti, deve selezionarne una
    showVariants.value = true
    return
  }

  emit(
    'add-to-cart',
    props.product,
    selectedVariant.value,
    notes.value || undefined,
    quantity.value,
  )

  // Reset
  selectedVariant.value = undefined
  notes.value = ''
  quantity.value = 1
  showVariants.value = false
}

function handleQuickAdd() {
  if (isOutOfStock.value) return

  // Apri sempre il modale per permettere di scegliere quantità e note,
  // specialmente per i kit o prodotti con varianti
  showVariants.value = true
}

function incrementQuantity() {
  if (quantity.value < props.product.quantity_available) {
    quantity.value++
  }
}

function decrementQuantity() {
  if (quantity.value > 1) {
    quantity.value--
  }
}
</script>

<template>
  <div
    class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
  >
    <!-- Image -->
    <div
      class="relative h-48 bg-gray-100 overflow-hidden group cursor-pointer"
      @click="handleQuickAdd"
    >
      <img
        v-if="product.image_url"
        :src="product.image_url"
        :alt="product.name"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>

      <!-- Badges -->
      <div class="absolute top-3 left-3 flex flex-col gap-2">
        <span
          v-if="inCart"
          class="px-2 py-1 bg-primary-600 text-white text-xs font-bold rounded-lg shadow-sm"
        >
          {{ cartQuantity }} nel carrello
        </span>
        <span
          v-if="isLowStock"
          class="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-lg shadow-sm"
        >
          Ultimi {{ product.quantity_available }}
        </span>
        <span
          v-if="product.is_kit"
          class="px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded-lg shadow-sm"
        >
          Menu
        </span>
      </div>

      <!-- Out of Stock Overlay -->
      <div
        v-if="isOutOfStock"
        class="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center"
      >
        <span
          class="px-4 py-2 bg-red-100 text-red-800 font-bold rounded-xl border border-red-200 shadow-sm"
        >
          Esaurito
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-5 flex-1 flex flex-col">
      <div class="flex-1 cursor-pointer" @click="handleQuickAdd">
        <h3 class="text-lg font-bold text-gray-900 mb-1 leading-tight">
          {{ product.name }}
        </h3>
        <p class="text-sm text-gray-500 line-clamp-2 mb-3">
          {{ product.description }}
        </p>

        <!-- Kit items preview (small) -->
        <div
          v-if="product.is_kit && product.kit_items && product.kit_items.length > 0"
          class="mb-3"
        >
          <p class="text-xs text-gray-500 font-medium mb-1">Include:</p>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="item in product.kit_items.slice(0, 3)"
              :key="item.id"
              class="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
            >
              {{ item.product?.name }}
            </span>
            <span v-if="product.kit_items.length > 3" class="text-xs text-gray-400 px-1">
              +{{ product.kit_items.length - 3 }}
            </span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
        <div>
          <span class="text-xl font-bold text-primary-600 block">
            {{ formatCurrency(product.price) }}
          </span>
          <span v-if="hasVariants" class="text-xs text-gray-400 font-medium"> + opzioni </span>
        </div>

        <button
          @click="handleQuickAdd"
          :disabled="isOutOfStock"
          class="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm"
          :class="[
            isOutOfStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white hover:shadow-md hover:-translate-y-0.5',
          ]"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

    <!-- Variants / Details Modal -->
    <AppModal :isOpen="showVariants" @close="showVariants = false" :title="product.name">
      <div class="space-y-6">
        <!-- Description -->
        <p v-if="product.description" class="text-gray-600 text-sm">
          {{ product.description }}
        </p>

        <!-- Kit Details -->
        <div
          v-if="product.is_kit && product.kit_items && product.kit_items.length > 0"
          class="bg-purple-50 p-4 rounded-xl border border-purple-100"
        >
          <h4 class="font-bold text-purple-900 mb-2 text-sm">Il menu include:</h4>
          <ul class="space-y-2">
            <li
              v-for="item in product.kit_items"
              :key="item.id"
              class="flex items-center text-sm text-purple-800"
            >
              <span class="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>
              <span class="font-bold mr-1">{{ item.quantity }}x</span>
              {{ item.product?.name }}
            </li>
          </ul>
        </div>

        <!-- Variants -->
        <div v-if="hasVariants">
          <label class="block text-sm font-bold text-gray-700 mb-3">Scegli una variante</label>
          <div class="grid grid-cols-1 gap-2">
            <button
              v-for="variant in product.variants"
              :key="variant.id"
              @click="selectedVariant = variant"
              class="relative flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left group"
              :class="[
                selectedVariant?.id === variant.id
                  ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600'
                  : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50',
              ]"
            >
              <span class="font-medium text-gray-900">{{ variant.name }}</span>
              <span
                class="text-sm font-bold"
                :class="selectedVariant?.id === variant.id ? 'text-primary-700' : 'text-gray-500'"
              >
                {{ variant.price_modifier > 0 ? '+' : ''
                }}{{ formatCurrency(variant.price_modifier) }}
              </span>

              <!-- Check icon -->
              <div
                v-if="selectedVariant?.id === variant.id"
                class="absolute right-0 top-0 -mt-2 -mr-2 bg-primary-600 text-white rounded-full p-1 shadow-sm"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </button>
          </div>
        </div>

        <!-- Quantity Selector -->
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">Quantità</label>
          <div class="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-200 w-fit">
            <button
              @click="decrementQuantity"
              :disabled="quantity <= 1"
              class="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm hover:text-primary-600 disabled:opacity-50 disabled:shadow-none transition-all"
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

            <span class="w-12 text-center font-bold text-gray-900 text-lg">
              {{ quantity }}
            </span>

            <button
              @click="incrementQuantity"
              :disabled="quantity >= product.quantity_available"
              class="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm hover:text-primary-600 disabled:opacity-50 disabled:shadow-none transition-all"
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

        <!-- Notes -->
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2"
            >Note per la cucina (opzionale)</label
          >
          <textarea
            v-model="notes"
            placeholder="Es: senza cipolla, ben cotto..."
            rows="3"
            maxlength="100"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none text-sm bg-gray-50 focus:bg-white transition-colors"
          />
          <div class="flex justify-end mt-1">
            <span class="text-xs text-gray-400">{{ notes.length }}/100</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex gap-3 w-full">
          <AppButton @click="showVariants = false" variant="secondary" class="flex-1">
            Annulla
          </AppButton>
          <AppButton
            @click="handleAddToCart"
            :disabled="hasVariants && !selectedVariant"
            variant="primary"
            class="flex-1"
          >
            Aggiungi - {{ formatCurrency(finalPrice) }}
          </AppButton>
        </div>
      </template>
    </AppModal>
  </div>
</template>
