import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, handleSupabaseError } from '@/utils/supabase'
import type { Category } from '@/types/models'
import type { RealtimeChannel } from '@supabase/supabase-js'

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const realtimeChannel = ref<RealtimeChannel | null>(null)

  // Computed
  const activeCategories = computed(() =>
    categories.value
      .filter((cat) => cat.is_active)
      .sort((a, b) => a.display_order - b.display_order),
  )

  const categoriesCount = computed(() => categories.value.length)

  const activeCategoriesCount = computed(() => activeCategories.value.length)

  /**
   * Carica tutte le categorie
   */
  async function fetchCategories() {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true })

      if (fetchError) throw fetchError

      categories.value = data || []
      return { success: true, data }
    } catch (err: any) {
      error.value = handleSupabaseError(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Carica solo categorie attive (per area ospiti)
   */
  async function fetchActiveCategories() {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (fetchError) throw fetchError

      categories.value = data || []
      return { success: true, data }
    } catch (err: any) {
      error.value = handleSupabaseError(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Ottiene una categoria per ID
   */
  function getCategoryById(id: string): Category | undefined {
    return categories.value.find((cat) => cat.id === id)
  }

  /**
   * Crea una nuova categoria (solo manager)
   */
  async function createCategory(categoryData: Omit<Category, 'id' | 'created_at'>) {
    try {
      loading.value = true
      error.value = null

      const { data, error: insertError } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single()

      if (insertError) throw insertError

      categories.value.push(data)
      return { success: true, data }
    } catch (err: any) {
      error.value = handleSupabaseError(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Aggiorna una categoria (solo manager)
   */
  async function updateCategory(id: string, updates: Partial<Category>) {
    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      const index = categories.value.findIndex((cat) => cat.id === id)
      if (index > -1) {
        categories.value[index] = data
      }

      return { success: true, data }
    } catch (err: any) {
      error.value = handleSupabaseError(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Elimina una categoria (solo manager)
   */
  async function deleteCategory(id: string) {
    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase.from('categories').delete().eq('id', id)

      if (deleteError) throw deleteError

      categories.value = categories.value.filter((cat) => cat.id !== id)
      return { success: true }
    } catch (err: any) {
      error.value = handleSupabaseError(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Attiva/disattiva una categoria
   */
  async function toggleCategoryStatus(id: string) {
    const category = getCategoryById(id)
    if (!category) return { success: false, error: 'Categoria non trovata' }

    return await updateCategory(id, { is_active: !category.is_active })
  }

  /**
   * Riordina le categorie
   */
  async function reorderCategories(categoryIds: string[]) {
    try {
      loading.value = true
      error.value = null

      // Aggiorna display_order per ogni categoria
      const updates = categoryIds.map((id, index) =>
        supabase.from('categories').update({ display_order: index }).eq('id', id),
      )

      await Promise.all(updates)

      // Ricarica le categorie
      await fetchCategories()
      return { success: true }
    } catch (err: any) {
      error.value = handleSupabaseError(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Sottoscrivi agli aggiornamenti real-time
   */
  function subscribeToChanges() {
    realtimeChannel.value = supabase
      .channel('categories_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          categories.value.push(payload.new as Category)
        } else if (payload.eventType === 'UPDATE') {
          const index = categories.value.findIndex((cat) => cat.id === payload.new.id)
          if (index > -1) {
            categories.value[index] = payload.new as Category
          }
        } else if (payload.eventType === 'DELETE') {
          categories.value = categories.value.filter((cat) => cat.id !== payload.old.id)
        }
      })
      .subscribe()
  }

  /**
   * Annulla sottoscrizione real-time
   */
  function unsubscribeFromChanges() {
    if (realtimeChannel.value) {
      supabase.removeChannel(realtimeChannel.value)
      realtimeChannel.value = null
    }
  }

  /**
   * Reset dello store
   */
  function $reset() {
    categories.value = []
    loading.value = false
    error.value = null
    unsubscribeFromChanges()
  }

  return {
    // State
    categories,
    loading,
    error,

    // Getters
    activeCategories,
    categoriesCount,
    activeCategoriesCount,

    // Actions
    fetchCategories,
    fetchActiveCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    reorderCategories,
    subscribeToChanges,
    unsubscribeFromChanges,
    $reset,
  }
})
