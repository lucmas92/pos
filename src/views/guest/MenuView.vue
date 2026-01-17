<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '@/composables/useCart'
import { useCategories } from '@/composables/useCategories'
import { useProducts } from '@/composables/useProducts'
import { useAuth } from '@/composables/useAuth'
import { useConfig } from '@/composables/useConfig'
import CategoryTabs from '@/components/guest/CategoryTabs.vue'
import ProductCard from '@/components/guest/ProductCard.vue'
import CartButton from '@/components/guest/CartButton.vue'
import CartSidebar from '@/components/guest/CartSidebar.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { Product, ProductVariant } from '@/types/models'
import { ALLERGENS } from '@/constants/allergens'

// Composables
const router = useRouter()
const cart = useCart()
const auth = useAuth()
const { config } = useConfig()
const { categories, loading: loadingCategories } = useCategories({
  onlyActive: true,
  realtime: true,
})
const { products, loading: loadingProducts } = useProducts({
  onlyAvailable: true,
  realtime: true,
})

// State
const selectedCategoryId = ref<string | null>(null)
const showCart = ref(false)
const searchQuery = ref('')
const selectedAllergenFilter = ref<string | null>(null)

// Computed
const filteredProducts = computed(() => {
  let filtered = products.value

  // Filtra per categoria selezionata
  if (selectedCategoryId.value) {
    filtered = filtered.filter((p) => p.category_id === selectedCategoryId.value)
  }

  // Filtra per ricerca
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query),
    )
  }

  // Filtra per allergene (escludi prodotti che contengono l'allergene selezionato)
  if (selectedAllergenFilter.value) {
    filtered = filtered.filter((p) => !p.allergens?.includes(selectedAllergenFilter.value!))
  }

  return filtered
})

const isLoading = computed(() => loadingCategories.value || loadingProducts.value)

const currentCategoryName = computed(() => {
  if (!selectedCategoryId.value) return 'Tutti i prodotti'
  const category = categories.value.find((c) => c.id === selectedCategoryId.value)
  return category?.name || 'Prodotti'
})

const isOrderingOpen = computed(() => config.value?.is_ordering_open ?? true)
const eventName = computed(() => config.value?.event_name || 'Proloco')

// Methods
function handleCategoryChange(categoryId: string | null) {
  selectedCategoryId.value = categoryId
}

function handleAddToCart(
  product: Product,
  variant?: ProductVariant,
  notes?: string,
  quantity: number = 1,
) {
  if (!isOrderingOpen.value) {
    alert('Siamo spiacenti, le ordinazioni sono momentaneamente chiuse.')
    return
  }

  const result = cart.addToCart(product, variant, notes, quantity)

  if (result.success) {
    // Mostra messaggio di successo
    console.log('Prodotto aggiunto al carrello')
  } else {
    // Mostra errore
    alert(result.error)
  }
}

function handleOpenCart() {
  showCart.value = true
}

function handleCloseCart() {
  showCart.value = false
}

function goToManager() {
  router.push('/manager/dashboard')
}

function goToMyOrders() {
  router.push('/my-orders')
}

// Lifecycle
onMounted(() => {
  cart.initialize()

  // Seleziona la prima categoria di default se presente
  if (categories.value.length > 0) {
    selectedCategoryId.value = categories.value[0]!.id
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Service Closed Banner -->
    <div
      v-if="!isOrderingOpen"
      class="bg-red-600 text-white text-center py-2 px-4 font-bold text-sm sticky top-0 z-50"
    >
      ⚠️ Le ordinazioni sono momentaneamente chiuse
    </div>

    <!-- Header -->
    <header
      class="sticky top-0 z-40 bg-white shadow-sm safe-area-inset-top"
      :class="{ 'top-9': !isOrderingOpen }"
    >
      <div class="container-custom">
        <div class="flex items-center justify-between h-20">
          <!-- Logo/Title -->
          <div class="flex items-center space-x-3">
            <div
              class="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30"
            >
              <span class="text-white font-bold text-xl">{{ eventName.charAt(0) }}</span>
            </div>
            <div>
              <h1 class="text-lg font-bold text-gray-900 leading-none">{{ eventName }}</h1>
              <p class="text-xs text-gray-500 font-medium mt-1">Sagra Paesana</p>
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <!-- My Orders Button -->
            <button
              @click="goToMyOrders"
              class="hidden md:flex items-center px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              I Miei Ordini
            </button>

            <!-- Manager Button (Visible only if authenticated) -->
            <button
              v-if="auth.isAuthenticated.value"
              @click="goToManager"
              class="hidden md:flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Area Manager
            </button>

            <!-- Cart Button -->
            <CartButton
              :items-count="cart.totalItems.value"
              :total="cart.totalAmount.value"
              @click="handleOpenCart"
            />
          </div>
        </div>

        <!-- Search & Filters -->
        <div class="pb-4 space-y-3">
          <!-- Search Bar -->
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cerca prodotti..."
              class="input pl-11 py-3.5 bg-gray-50 border-transparent focus:bg-white transition-all shadow-sm"
            />
            <svg
              class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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

          <!-- Allergen Filter -->
          <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            <span class="text-xs font-bold text-gray-500 uppercase whitespace-nowrap mr-1"
              >Senza:</span
            >
            <button
              @click="selectedAllergenFilter = null"
              class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap border"
              :class="
                selectedAllergenFilter === null
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              "
            >
              Tutti
            </button>
            <button
              v-for="allergen in ALLERGENS"
              :key="allergen.id"
              @click="
                selectedAllergenFilter = selectedAllergenFilter === allergen.id ? null : allergen.id
              "
              class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap border flex items-center gap-1"
              :class="
                selectedAllergenFilter === allergen.id
                  ? 'bg-red-100 text-red-800 border-red-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              "
            >
              <span>{{ allergen.icon }}</span>
              {{ allergen.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Category Tabs -->
      <CategoryTabs
        :categories="categories"
        :selected-category-id="selectedCategoryId"
        @select="handleCategoryChange"
      />
    </header>

    <!-- Main Content -->
    <main class="container-custom py-8 pb-32">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-20">
        <LoadingSpinner size="xl" />
      </div>

      <!-- Empty State -->
      <EmptyState
        v-else-if="filteredProducts.length === 0 && !searchQuery && !selectedAllergenFilter"
        icon="📦"
        title="Nessun prodotto disponibile"
        description="Al momento non ci sono prodotti disponibili in questa categoria."
      />

      <!-- Search Empty State -->
      <EmptyState
        v-else-if="filteredProducts.length === 0"
        icon="🔍"
        title="Nessun risultato"
        description="Nessun prodotto trovato con i filtri selezionati."
      />

      <!-- Products Grid -->
      <div v-else>
        <!-- Category Title -->
        <div class="mb-6 flex items-end justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">{{ currentCategoryName }}</h2>
            <p class="text-sm text-gray-500 mt-1">
              {{ filteredProducts.length }} prodotti disponibili
            </p>
          </div>
        </div>

        <!-- Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-30 gap-6">
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
            :in-cart="cart.hasProduct(product.id)"
            :cart-quantity="cart.getQuantity(product.id)"
            @add-to-cart="handleAddToCart"
          />
        </div>
      </div>
    </main>

    <!-- Cart Sidebar -->
    <CartSidebar :show="showCart" @close="handleCloseCart" />

    <!-- Floating Action Button (mobile only) -->
    <div class="fixed bottom-6 right-6 z-30 flex flex-col gap-5 md:hidden safe-area-inset-bottom">
      <!-- My Orders FAB -->
      <button
        @click="goToMyOrders"
        class="bg-white text-gray-700 border border-gray-200 rounded-full p-4 shadow-lg hover:bg-gray-50 transition-transform active:scale-95 flex items-center justify-center"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </button>

      <!-- Manager FAB (Visible only if authenticated) -->
      <button
        v-if="auth.isAuthenticated.value"
        @click="goToManager"
        class="bg-gray-800 text-white rounded-full p-4 shadow-lg hover:bg-gray-700 transition-transform active:scale-95 flex items-center justify-center"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      <!-- Cart FAB -->
      <button
        v-if="cart.totalItems.value > 0"
        @click="handleOpenCart"
        class="bg-primary-600 text-white rounded-full p-4 shadow-xl shadow-primary-600/40 hover:bg-primary-700 transition-transform active:scale-95 flex items-center space-x-2 animate-bounce-slow"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <span class="font-bold text-lg">{{ cart.totalItems.value }}</span>
      </button>
    </div>
  </div>
</template>
