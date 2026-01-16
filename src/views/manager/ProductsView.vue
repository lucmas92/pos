<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProducts } from '@/composables/useProducts'
import { useCategories } from '@/composables/useCategories'
import ProductForm from '@/components/manager/ProductForm.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppModal from '@/components/common/AppModal.vue'
import type { Product } from '@/types/models'
import ProductList from '@/components/manager/ProductList.vue'

const route = useRoute()
const products = useProducts({ autoFetch: true, realtime: true })
const categories = useCategories({ autoFetch: true })

// State
const showForm = ref(false)
const editingProduct = ref<Product | null>(null)
const searchQuery = ref('')
const selectedCategory = ref<string | null>(null)
const filterStatus = ref<'all' | 'active' | 'inactive' | 'out-of-stock' | 'low-stock'>('all')

// Initialize filters from URL query params
onMounted(() => {
  if (route.query.status) {
    const status = route.query.status as string
    if (['active', 'inactive', 'out-of-stock', 'low-stock'].includes(status)) {
      filterStatus.value = status as any
    }
  }
})

// Computed
const filteredProducts = computed(() => {
  let filtered = products.products.value

  // Filter by search
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query),
    )
  }

  // Filter by category
  if (selectedCategory.value) {
    filtered = filtered.filter((p) => p.category_id === selectedCategory.value)
  }

  // Filter by status
  if (filterStatus.value === 'active') {
    filtered = filtered.filter((p) => p.is_active)
  } else if (filterStatus.value === 'inactive') {
    filtered = filtered.filter((p) => !p.is_active)
  } else if (filterStatus.value === 'out-of-stock') {
    filtered = filtered.filter((p) => p.quantity_available === 0)
  } else if (filterStatus.value === 'low-stock') {
    filtered = filtered.filter((p) => p.quantity_available > 0 && p.quantity_available < 10)
  }

  return filtered
})

const hasFilters = computed(
  () =>
    searchQuery.value.trim() !== '' ||
    selectedCategory.value !== null ||
    filterStatus.value !== 'all',
)

// Methods
function handleNew() {
  editingProduct.value = null
  showForm.value = true
}

function handleEdit(product: Product) {
  editingProduct.value = product
  showForm.value = true
}

function handleFormClose() {
  showForm.value = false
  editingProduct.value = null
}

function handleFormSuccess() {
  showForm.value = false
  editingProduct.value = null
  products.refetch()
}

function clearFilters() {
  searchQuery.value = ''
  selectedCategory.value = null
  filterStatus.value = 'all'
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Prodotti</h1>
        <p class="text-gray-500 mt-1">Gestisci il catalogo e le disponibilità</p>
      </div>
      <AppButton @click="handleNew" variant="primary">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nuovo Prodotto
      </AppButton>
    </div>

    <!-- Filters -->
    <div class="card mb-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Search -->
        <div class="form-group mb-0">
          <label class="form-label">Cerca</label>
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Nome o descrizione..."
              class="input pl-11"
            />
            <svg
              class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <!-- Category Filter -->
        <div class="form-group mb-0">
          <label class="form-label">Categoria</label>
          <select v-model="selectedCategory" class="input">
            <option :value="null">Tutte le categorie</option>
            <option
              v-for="category in categories.categories.value"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>

        <!-- Status Filter -->
        <div class="form-group mb-0">
          <label class="form-label">Stato</label>
          <select v-model="filterStatus" class="input">
            <option value="all">Tutti</option>
            <option value="active">Attivi</option>
            <option value="inactive">Disattivati</option>
            <option value="out-of-stock">Esauriti</option>
            <option value="low-stock">In esaurimento</option>
          </select>
        </div>
      </div>

      <!-- Clear Filters -->
      <div v-if="hasFilters" class="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
        <p class="text-sm font-medium text-gray-600">{{ filteredProducts.length }} prodotti trovati</p>
        <button @click="clearFilters" class="text-sm text-red-600 hover:text-red-700 font-medium flex items-center transition-colors">
          <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Cancella filtri
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="products.loading.value" class="flex justify-center py-20">
      <LoadingSpinner size="xl" />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="filteredProducts.length === 0 && !hasFilters"
      icon="📦"
      title="Nessun prodotto"
      description="Inizia creando il tuo primo prodotto per popolare il menu."
      action-label="Crea Prodotto"
      @action="handleNew"
    />

    <!-- No Results -->
    <EmptyState
      v-else-if="filteredProducts.length === 0 && hasFilters"
      icon="🔍"
      title="Nessun risultato"
      description="Prova a modificare i filtri di ricerca per trovare quello che cerchi."
    />

    <!-- Products List -->
    <ProductList
      v-else
      :products="filteredProducts"
      @edit="handleEdit"
      @delete="products.remove"
    />

    <!-- Product Form Modal -->
    <AppModal
      :isOpen="showForm"
      @close="handleFormClose"
      :title="editingProduct ? 'Modifica Prodotto' : 'Nuovo Prodotto'"
      maxWidth="2xl"
    >
      <ProductForm
        :product="editingProduct"
        @saved="handleFormSuccess"
        @cancel="handleFormClose"
      />
    </AppModal>
  </div>
</template>
