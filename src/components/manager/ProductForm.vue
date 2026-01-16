<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useCategories } from '@/composables/useCategories'
import { useProducts } from '@/composables/useProducts'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import type { Database } from '@/types/supabase'
import type { Product, ProductVariant } from '@/types/models'
import { formatCurrency } from '@/utils/currency'

type ProductInsert = Database['public']['Tables']['products']['Insert']

const props = defineProps<{
  product?: Product | null
}>()

const emit = defineEmits<{
  (e: 'saved'): void
  (e: 'cancel'): void
}>()

const categories = useCategories()
const products = useProducts()

// Tabs configuration
const activeTab = ref<'general' | 'variants' | 'kit'>('general')

// Form state
const form = ref<ProductInsert>({
  name: '',
  description: '',
  price: 0,
  category_id: '',
  quantity_available: 0,
  is_active: true,
  is_kit: false,
  image_url: null,
})

// Variants State
const newVariant = ref({ name: '', price_modifier: 0 })
const variantsList = ref<ProductVariant[]>([])

// Kit State
const kitSearchQuery = ref('')
const kitItemsList = ref<any[]>([]) // Local cache of kit items

const errors = ref<Record<string, string>>({})
const isEditMode = computed(() => !!props.product)
const loading = ref(false)

// Initialize form
onMounted(async () => {
  await categories.fetch()
  initializeData()
})

// Watch for product changes (re-opening modal)
watch(() => props.product, initializeData)

function initializeData() {
  if (props.product) {
    form.value = {
      name: props.product.name,
      description: props.product.description,
      price: props.product.price,
      category_id: props.product.category_id,
      quantity_available: props.product.quantity_available,
      is_active: props.product.is_active,
      is_kit: props.product.is_kit,
      image_url: props.product.image_url,
    }
    // Load variants and kit items locally
    variantsList.value = props.product.variants || []
    kitItemsList.value = props.product.kit_items || []
  } else {
    resetForm()
    if (categories.categories.value.length > 0) {
      form.value.category_id = categories.categories.value[0].id
    }
  }
}

function resetForm() {
  form.value = {
    name: '',
    description: '',
    price: 0,
    category_id: '',
    quantity_available: 0,
    is_active: true,
    is_kit: false,
    image_url: null,
  }
  variantsList.value = []
  kitItemsList.value = []
  activeTab.value = 'general'
}

// Validation
function validate(): boolean {
  errors.value = {}

  if (!form.value.name?.trim()) errors.value.name = 'Il nome è obbligatorio'
  if (!form.value.category_id) errors.value.category_id = 'La categoria è obbligatoria'
  if (form.value.price < 0) errors.value.price = 'Il prezzo non può essere negativo'
  if (form.value.quantity_available !== undefined && form.value.quantity_available < 0) {
    errors.value.quantity_available = 'La quantità non può essere negativa'
  }

  return Object.keys(errors.value).length === 0
}

// Submit Main Product
async function handleSubmit() {
  if (!validate()) return

  loading.value = true
  try {
    if (isEditMode.value && props.product) {
      await products.update(props.product.id, form.value)
    } else {
      await products.create(form.value)
    }
    emit('saved')
  } catch (e) {
    console.error('Error saving product:', e)
  } finally {
    loading.value = false
  }
}

// --- Variants Logic ---
async function addVariant() {
  if (!newVariant.value.name) return
  if (!props.product) return

  loading.value = true
  try {
    const result = await products.variants.create({
      product_id: props.product.id,
      name: newVariant.value.name,
      price_modifier: newVariant.value.price_modifier,
      is_active: true
    })

    if (result.success && result.data) {
      variantsList.value.push(result.data)
      newVariant.value = { name: '', price_modifier: 0 }
    }
  } finally {
    loading.value = false
  }
}

async function removeVariant(id: string) {
  if (!confirm('Eliminare questa variante?')) return
  loading.value = true
  try {
    await products.variants.remove(id)
    variantsList.value = variantsList.value.filter(v => v.id !== id)
  } finally {
    loading.value = false
  }
}

// --- Kit Logic ---
const availableProductsForKit = computed(() => {
  if (!kitSearchQuery.value) return []
  const query = kitSearchQuery.value.toLowerCase()

  return products.products.value.filter(p =>
    p.id !== props.product?.id && // Exclude self
    !p.is_kit && // Exclude other kits (optional rule)
    (p.name.toLowerCase().includes(query)) &&
    !kitItemsList.value.some(k => k.included_product_id === p.id) // Exclude already added
  ).slice(0, 5)
})

async function addProductToKit(product: Product) {
  if (!props.product) return

  loading.value = true
  try {
    const result = await products.kits.addItem(props.product.id, product.id, 1)
    if (result.success && result.data) {
      kitItemsList.value.push(result.data)
      kitSearchQuery.value = ''
    }
  } finally {
    loading.value = false
  }
}

async function removeProductFromKit(kitItemId: string) {
  loading.value = true
  try {
    await products.kits.removeItem(kitItemId)
    kitItemsList.value = kitItemsList.value.filter(k => k.id !== kitItemId)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col h-full max-h-[80vh]">
    <!-- Tabs Header -->
    <div class="flex border-b border-gray-100 mb-6">
      <button
        @click="activeTab = 'general'"
        class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
        :class="activeTab === 'general' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
      >
        Generale
      </button>
      <button
        v-if="isEditMode"
        @click="activeTab = 'variants'"
        class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
        :class="activeTab === 'variants' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
      >
        Varianti ({{ variantsList.length }})
      </button>
      <button
        v-if="isEditMode && form.is_kit"
        @click="activeTab = 'kit'"
        class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
        :class="activeTab === 'kit' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
      >
        Composizione Menu ({{ kitItemsList.length }})
      </button>
    </div>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto px-1">

      <!-- TAB: GENERAL -->
      <form v-if="activeTab === 'general'" @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Name -->
        <AppInput
          v-model="form.name"
          label="Nome Prodotto"
          placeholder="Es. Margherita"
          :error="errors.name"
          required
        />

        <!-- Description -->
        <div class="form-group">
          <label class="form-label">Descrizione</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="input"
            placeholder="Ingredienti, dettagli..."
          ></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Price -->
          <AppInput
            v-model.number="form.price"
            type="number"
            label="Prezzo Base (€)"
            placeholder="0.00"
            :step="0.01"
            :min="0"
            :error="errors.price"
            required
          />

          <!-- Category -->
          <div class="form-group">
            <label class="form-label">Categoria</label>
            <select
              v-model="form.category_id"
              class="input"
              :class="{ 'input-error': errors.category_id }"
            >
              <option value="" disabled>Seleziona una categoria</option>
              <option
                v-for="category in categories.categories.value"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
            <p v-if="errors.category_id" class="form-error">{{ errors.category_id }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Stock -->
          <AppInput
            v-model.number="form.quantity_available"
            type="number"
            label="Quantità in Stock"
            placeholder="0"
            :min="0"
            :error="errors.quantity_available"
          />

          <!-- Image URL -->
          <AppInput
            v-model="form.image_url"
            label="URL Immagine"
            placeholder="https://..."
          />
        </div>

        <!-- Toggles -->
        <div class="flex flex-col sm:flex-row gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <!-- Status -->
          <div class="flex items-center justify-between sm:justify-start gap-4">
            <span class="text-sm font-bold text-gray-700">Stato:</span>
            <div class="flex items-center space-x-4">
              <label class="flex items-center cursor-pointer">
                <input type="radio" v-model="form.is_active" :value="true" class="w-4 h-4 text-primary-600" />
                <span class="ml-2 text-sm text-gray-700">Attivo</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input type="radio" v-model="form.is_active" :value="false" class="w-4 h-4 text-red-600" />
                <span class="ml-2 text-sm text-gray-700">Inattivo</span>
              </label>
            </div>
          </div>

          <div class="w-px h-6 bg-gray-300 hidden sm:block"></div>

          <!-- Is Kit -->
          <div class="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_kit"
              v-model="form.is_kit"
              class="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
            />
            <label for="is_kit" class="text-sm font-bold text-gray-700 cursor-pointer">
              È un Menu / Kit?
              <span class="block text-xs font-normal text-gray-500">Abilita la composizione di prodotti</span>
            </label>
          </div>
        </div>

        <div v-if="!isEditMode" class="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
          ℹ️ Salva il prodotto per poter aggiungere varianti o comporre il menu.
        </div>
      </form>

      <!-- TAB: VARIANTS -->
      <div v-else-if="activeTab === 'variants'" class="space-y-6">
        <div class="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <h4 class="text-sm font-bold text-gray-700 mb-3">Aggiungi Variante</h4>
          <div class="flex gap-3 items-end">
            <div class="flex-1">
              <AppInput v-model="newVariant.name" placeholder="Es. Grande, Piccola..." label="Nome" />
            </div>
            <div class="w-32">
              <AppInput v-model.number="newVariant.price_modifier" type="number" :step="0.01" placeholder="0.00" label="Prezzo +/-" />
            </div>
            <AppButton @click="addVariant" :disabled="!newVariant.name || loading" variant="secondary" class="mb-[2px]">
              Aggiungi
            </AppButton>
          </div>
        </div>

        <div class="space-y-2">
          <div v-for="variant in variantsList" :key="variant.id" class="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
            <div>
              <p class="font-bold text-gray-900">{{ variant.name }}</p>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm font-medium" :class="variant.price_modifier > 0 ? 'text-green-600' : 'text-gray-500'">
                {{ variant.price_modifier > 0 ? '+' : '' }}{{ formatCurrency(variant.price_modifier) }}
              </span>
              <button @click="removeVariant(variant.id)" class="text-red-500 hover:text-red-700 p-1">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          <p v-if="variantsList.length === 0" class="text-center text-gray-500 py-4 italic">Nessun variante aggiunta</p>
        </div>
      </div>

      <!-- TAB: KIT -->
      <div v-else-if="activeTab === 'kit'" class="space-y-6">
        <div class="bg-purple-50 p-4 rounded-xl border border-purple-100">
          <label class="form-label text-purple-900">Cerca prodotti da includere</label>
          <div class="relative">
            <input
              v-model="kitSearchQuery"
              type="text"
              class="input border-purple-200 focus:ring-purple-500"
              placeholder="Cerca per nome..."
            />
            <!-- Autocomplete Results -->
            <div v-if="availableProductsForKit.length > 0" class="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
              <button
                v-for="p in availableProductsForKit"
                :key="p.id"
                @click="addProductToKit(p)"
                class="w-full text-left px-4 py-3 hover:bg-purple-50 flex justify-between items-center border-b border-gray-50 last:border-0"
              >
                <span class="font-medium text-gray-800">{{ p.name }}</span>
                <span class="text-sm text-gray-500">{{ formatCurrency(p.price) }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <h4 class="text-sm font-bold text-gray-700">Prodotti inclusi nel menu</h4>
          <div v-for="item in kitItemsList" :key="item.id" class="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
            <div class="flex items-center gap-3">
              <span class="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">x{{ item.quantity }}</span>
              <p class="font-bold text-gray-900">{{ item.product?.name }}</p>
            </div>
            <button @click="removeProductFromKit(item.id)" class="text-red-500 hover:text-red-700 p-1">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p v-if="kitItemsList.length === 0" class="text-center text-gray-500 py-4 italic">Nessun prodotto incluso nel menu</p>
        </div>
      </div>

    </div>

    <!-- Footer Actions -->
    <div class="pt-4 mt-4 border-t border-gray-100 flex justify-end space-x-3">
      <AppButton variant="secondary" @click="$emit('cancel')" type="button">
        {{ activeTab === 'general' ? 'Annulla' : 'Chiudi' }}
      </AppButton>

      <AppButton
        v-if="activeTab === 'general'"
        variant="primary"
        @click="handleSubmit"
        :disabled="loading"
      >
        <LoadingSpinner v-if="loading" size="sm" color="text-white" class="mr-2" />
        {{ isEditMode ? 'Salva Modifiche' : 'Crea Prodotto' }}
      </AppButton>
    </div>
  </div>
</template>
