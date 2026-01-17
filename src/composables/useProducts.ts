import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useProductsStore } from '@/stores/products'
import { storeToRefs } from 'pinia'
import type { Product, ProductVariant } from '@/types/models'

/**
 * Composable per gestire i prodotti
 */
export function useProducts(options?: {
  autoFetch?: boolean
  onlyActive?: boolean
  onlyAvailable?: boolean
  categoryId?: string
  realtime?: boolean
}) {
  const {
    autoFetch = true,
    onlyActive = false,
    onlyAvailable = false,
    categoryId,
    realtime = false,
  } = options || {}

  const productsStore = useProductsStore()

  // Refs reattivi dallo store
  const {
    products,
    loading,
    error,
    activeProducts,
    availableProducts,
    outOfStockProducts,
    lowStockProducts,
    kitProducts,
    productsCount,
  } = storeToRefs(productsStore)

  // Ref locale per prodotti filtrati per categoria
  const categoryProducts = ref<Product[]>([])

  /**
   * Lista prodotti da usare in base alle opzioni
   */
  const productsList = computed(() => {
    if (categoryId) {
      return categoryProducts.value
    }

    if (onlyAvailable) {
      return availableProducts.value
    }

    if (onlyActive) {
      return activeProducts.value
    }

    return products.value
  })

  /**
   * Carica i prodotti
   */
  async function fetch() {
    if (categoryId) {
      const result = await productsStore.fetchProductsByCategory(categoryId)
      if (result.success && result.data) {
        categoryProducts.value = result.data
      }
      return result
    }

    if (onlyAvailable) {
      return await productsStore.fetchAvailableProducts()
    }

    return await productsStore.fetchProducts()
  }

  /**
   * Ricarica i prodotti
   */
  async function refetch() {
    return await fetch()
  }

  /**
   * Ottiene un prodotto per ID
   */
  function getById(id: string): Product | undefined {
    return productsStore.getProductById(id)
  }

  /**
   * Ottiene prodotti per categoria (da cache)
   */
  function getByCategory(catId: string): Product[] {
    return productsStore.getProductsByCategory(catId)
  }

  /**
   * Crea un nuovo prodotto
   */
  async function create(data: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    return await productsStore.createProduct(data)
  }

  /**
   * Aggiorna un prodotto
   */
  async function update(id: string, data: Partial<Product>) {
    return await productsStore.updateProduct(id, data)
  }

  /**
   * Elimina un prodotto
   */
  async function remove(id: string) {
    return await productsStore.deleteProduct(id)
  }

  /**
   * Aggiorna la quantità disponibile
   */
  async function updateQuantity(id: string, quantity: number) {
    return await productsStore.updateQuantity(id, quantity)
  }

  /**
   * Attiva/disattiva un prodotto
   */
  async function toggleStatus(id: string) {
    return await productsStore.toggleProductStatus(id)
  }

  /**
   * Verifica se un prodotto è disponibile
   */
  function isAvailable(product: Product): boolean {
    return product.is_active && product.quantity_available > 0
  }

  /**
   * Verifica se un prodotto è in esaurimento
   */
  function isLowStock(product: Product): boolean {
    return product.quantity_available > 0 && product.quantity_available < 10
  }

  /**
   * Verifica se un prodotto è esaurito
   */
  function isOutOfStock(product: Product): boolean {
    return product.quantity_available === 0
  }

  /**
   * Ottiene il prezzo finale con variante
   */
  function getFinalPrice(product: Product, variant?: ProductVariant): number {
    const basePrice = product.price
    const variantModifier = variant?.price_modifier || 0
    return basePrice + variantModifier
  }

  /**
   * Gestione varianti
   */
  const variants = {
    async create(data: Omit<ProductVariant, 'id' | 'created_at'>) {
      return await productsStore.createVariant(data)
    },

    async update(id: string, data: Partial<ProductVariant>) {
      return await productsStore.updateVariant(id, data)
    },

    async remove(id: string) {
      return await productsStore.deleteVariant(id)
    },
  }

  /**
   * Gestione kit
   */
  const kits = {
    async addItem(kitProductId: string, includedProductId: string, quantity: number = 1) {
      return await productsStore.addKitItem(kitProductId, includedProductId, quantity)
    },

    async removeItem(kitItemId: string) {
      return await productsStore.removeKitItem(kitItemId)
    },

    /**
     * Ottiene i prodotti inclusi in un kit
     */
    getItems(kitProduct: Product) {
      return kitProduct.kit_items || []
    },

    /**
     * Calcola il prezzo totale dei prodotti in un kit
     */
    calculateItemsPrice(kitProduct: Product): number {
      if (!kitProduct.kit_items) return 0

      return kitProduct.kit_items.reduce((total, item) => {
        const product = item.product
        if (!product) return total
        return total + product.price * item.quantity
      }, 0)
    },
  }

  /**
   * Verifica se ci sono prodotti
   */
  const hasProducts = computed(() => productsList.value.length > 0)

  /**
   * Conta prodotti per categoria
   */
  function countByCategory(catId: string): number {
    return productsList.value.filter((p) => p.category_id === catId).length
  }

  /**
   * Cerca prodotti per nome
   */
  function search(query: string): Product[] {
    const searchTerm = query.toLowerCase().trim()

    if (!searchTerm) return productsList.value

    return productsList.value.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm),
    )
  }

  /**
   * Filtra prodotti
   */
  function filter(predicate: (product: Product) => boolean): Product[] {
    return productsList.value.filter(predicate)
  }

  /**
   * Ordina prodotti
   */
  function sort(compareFn: (a: Product, b: Product) => number): Product[] {
    return [...productsList.value].sort(compareFn)
  }

  // Lifecycle hooks
  onMounted(async () => {
    if (autoFetch && productsList.value.length === 0) {
      await fetch()
    }

    if (realtime) {
      productsStore.subscribeToChanges()
    }
  })

  onUnmounted(() => {
    if (realtime) {
      productsStore.unsubscribeFromChanges()
    }
  })

  return {
    // State
    products: productsList,
    loading,
    error,
    productsCount,
    hasProducts,
    outOfStockProducts,
    lowStockProducts,
    kitProducts,

    // Methods
    fetch,
    refetch,
    getById,
    getByCategory,
    create,
    update,
    remove,
    updateQuantity,
    toggleStatus,
    isAvailable,
    isLowStock,
    isOutOfStock,
    getFinalPrice,
    countByCategory,
    search,
    filter,
    sort,

    // Sub-modules
    variants,
    kits,
  }
}
