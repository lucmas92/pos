import { computed, onMounted, onUnmounted } from 'vue'
import { useCategoriesStore } from '@/stores/categories'
import { storeToRefs } from 'pinia'
import type { Category } from '@/types/models'

/**
 * Composable per gestire le categorie
 */
export function useCategories(options?: {
  autoFetch?: boolean
  onlyActive?: boolean
  realtime?: boolean
}) {
  const { autoFetch = true, onlyActive = false, realtime = false } = options || {}

  const categoriesStore = useCategoriesStore()

  // Refs reattivi dallo store
  const { categories, loading, error, activeCategories, categoriesCount, activeCategoriesCount } =
    storeToRefs(categoriesStore)

  /**
   * Lista categorie da usare (attive o tutte)
   */
  const categoriesList = computed(() => (onlyActive ? activeCategories.value : categories.value))

  /**
   * Carica le categorie
   */
  async function fetch() {
    if (onlyActive) {
      return await categoriesStore.fetchActiveCategories()
    }
    return await categoriesStore.fetchCategories()
  }

  /**
   * Ricarica le categorie
   */
  async function refetch() {
    return await fetch()
  }

  /**
   * Ottiene una categoria per ID
   */
  function getById(id: string): Category | undefined {
    return categoriesStore.getCategoryById(id)
  }

  /**
   * Crea una nuova categoria
   */
  async function create(data: Omit<Category, 'id' | 'created_at'>) {
    return await categoriesStore.createCategory(data)
  }

  /**
   * Aggiorna una categoria
   */
  async function update(id: string, data: Partial<Category>) {
    return await categoriesStore.updateCategory(id, data)
  }

  /**
   * Elimina una categoria
   */
  async function remove(id: string) {
    return await categoriesStore.deleteCategory(id)
  }

  /**
   * Attiva/disattiva una categoria
   */
  async function toggleStatus(id: string) {
    return await categoriesStore.toggleCategoryStatus(id)
  }

  /**
   * Riordina le categorie
   */
  async function reorder(categoryIds: string[]) {
    return await categoriesStore.reorderCategories(categoryIds)
  }

  /**
   * Verifica se ci sono categorie
   */
  const hasCategories = computed(() => categoriesList.value.length > 0)

  /**
   * Ottiene il nome di una categoria
   */
  function getCategoryName(id: string): string {
    const category = getById(id)
    return category?.name || 'Categoria sconosciuta'
  }

  // Lifecycle hooks
  onMounted(async () => {
    if (autoFetch && categoriesList.value.length === 0) {
      await fetch()
    }

    if (realtime) {
      categoriesStore.subscribeToChanges()
    }
  })

  onUnmounted(() => {
    if (realtime) {
      categoriesStore.unsubscribeFromChanges()
    }
  })

  return {
    // State
    categories: categoriesList,
    loading,
    error,
    categoriesCount: onlyActive ? activeCategoriesCount : categoriesCount,
    hasCategories,

    // Methods
    fetch,
    refetch,
    getById,
    getCategoryName,
    create,
    update,
    remove,
    toggleStatus,
    reorder,
  }
}
