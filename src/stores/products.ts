import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, handleSupabaseError } from '@/utils/supabase'
import type { Product, ProductVariant } from '@/types/models'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useAudit } from '@/composables/useAudit'

export const useProductsStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const realtimeChannel = ref<RealtimeChannel | null>(null)

  const { logAction } = useAudit()

  // Computed
  const activeProducts = computed(() => products.value.filter((p) => p.is_active))

  const availableProducts = computed(() =>
    activeProducts.value.filter((p) => p.quantity_available > 0),
  )

  const outOfStockProducts = computed(() =>
    products.value.filter((p) => p.quantity_available === 0),
  )

  const lowStockProducts = computed(() =>
    products.value.filter((p) => p.quantity_available > 0 && p.quantity_available < 10),
  )

  const kitProducts = computed(() => products.value.filter((p) => p.is_kit))

  const productsCount = computed(() => products.value.length)

  /**
   * Carica tutti i prodotti con relazioni
   */
  async function fetchProducts() {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('products')
        .select(
          `
        *,
        category:categories!inner (
          id,
          name,
          display_order,
          is_active
        ),
        variants:product_variants (
          id,
          name,
          price_modifier,
          is_active
        ),
        kit_items!kit_items_included_product_id_fkey (
          id,
          quantity,
          included_product:products!kit_items_included_product_id_fkey (
            id,
            name,
            price,
            category:categories (
              name
            )
          )
        )
      `,
        )
        .order('display_order', { ascending: true })

      if (fetchError) {
        console.warn('Errore fetch completo, riprovo senza kit_items:', fetchError)

        const { data: fallbackData, error: fallbackError } = await supabase
          .from('products')
          .select(
            `
          *,
          category:categories(*),
          variants:product_variants(*)
        `,
          )
          .order('display_order', { ascending: true })

        if (fallbackError) throw fallbackError
        products.value = fallbackData || []
        return { success: true, data: fallbackData }
      }

      products.value = data || []
      return { success: true, data }
    } catch (err: any) {
      error.value = handleSupabaseError(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Carica solo prodotti attivi e disponibili (per area ospiti)
   */
  async function fetchAvailableProducts() {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('products')
        .select(
          `
          *,
          category:categories(*),
          variants:product_variants(*),
          kit_items!kit_items_included_product_id_fkey(
            *,
            product:included_product_id(*)
          )
        `,
        )
        .eq('is_active', true)
        .gt('quantity_available', 0)
        .order('display_order', { ascending: true })

      if (fetchError) throw fetchError

      products.value = data || []
      return { success: true, data }
    } catch (err: any) {
      error.value = handleSupabaseError(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Carica prodotti per categoria
   */
  async function fetchProductsByCategory(categoryId: string) {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('products')
        .select(
          `
          *,
          category:categories(*),
          variants:product_variants(*)
        `,
        )
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (fetchError) throw fetchError

      return { success: true, data: data || [] }
    } catch (err: any) {
      error.value = handleSupabaseError(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Ottiene prodotti per categoria (da cache locale)
   */
  function getProductsByCategory(categoryId: string): Product[] {
    return activeProducts.value
      .filter((p) => p.category_id === categoryId)
      .sort((a, b) => a.display_order - b.display_order)
  }

  /**
   * Ottiene un prodotto per ID
   */
  function getProductById(id: string): Product | undefined {
    return products.value.find((p) => p.id === id)
  }

  /**
   * Crea un nuovo prodotto (solo manager)
   */
  async function createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    try {
      loading.value = true
      error.value = null

      const { data, error: insertError } = await supabase
        .from('products')
        .insert([productData])
        .select(
          `
          *,
          category:categories(*),
          variants:product_variants(*)
        `,
        )
        .single()

      if (insertError) throw insertError

      products.value.push(data)

      // Audit
      await logAction('CREATE_PRODUCT', 'product', (data as Product).id, {
        name: (data as Product).name,
        price: (data as Product).price,
      })

      return { success: true, data }
    } catch (err: any) {
      error.value = handleSupabaseError(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Aggiorna un prodotto (solo manager)
   */
  async function updateProduct(id: string, updates: Partial<Product>) {
    try {
      loading.value = true
      error.value = null

      // Recupera stato precedente per diff (opzionale, per semplicità logghiamo solo l'update)
      const oldProduct = getProductById(id)

      const { data, error: updateError } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(
          `
          *,
          category:categories(*),
          variants:product_variants(*)
        `,
        )
        .single()

      if (updateError) throw updateError

      const index = products.value.findIndex((p) => p.id === id)
      if (index > -1) {
        products.value[index] = data
      }

      // Audit
      await logAction('UPDATE_PRODUCT', 'product', id, {
        changes: updates,
        old_price: oldProduct?.price,
        new_price: updates.price,
      })

      return { success: true, data }
    } catch (err: any) {
      error.value = handleSupabaseError(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Elimina un prodotto (solo manager)
   */
  async function deleteProduct(id: string) {
    try {
      loading.value = true
      error.value = null

      const product = getProductById(id)

      const { error: deleteError } = await supabase.from('products').delete().eq('id', id)

      if (deleteError) throw deleteError

      products.value = products.value.filter((p) => p.id !== id)

      // Audit
      await logAction('DELETE_PRODUCT', 'product', id, { name: product?.name })

      return { success: true }
    } catch (err: any) {
      error.value = handleSupabaseError(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Aggiorna la quantità disponibile
   */
  async function updateQuantity(id: string, quantity: number) {
    return await updateProduct(id, { quantity_available: quantity })
  }

  /**
   * Attiva/disattiva un prodotto
   */
  async function toggleProductStatus(id: string) {
    const product = getProductById(id)
    if (!product) return { success: false, error: 'Prodotto non trovato' }

    return await updateProduct(id, { is_active: !product.is_active })
  }

  /**
   * Crea una variante per un prodotto
   */
  async function createVariant(variantData: Omit<ProductVariant, 'id' | 'created_at'>) {
    try {
      loading.value = true
      error.value = null

      const { data, error: insertError } = await supabase
        .from('product_variants')
        .insert([variantData])
        .select()
        .single()

      if (insertError) throw insertError

      // Aggiorna il prodotto locale
      const product = getProductById(variantData.product_id)
      if (product) {
        if (!product.variants) product.variants = []
        product.variants.push(data)
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
   * Aggiorna una variante
   */
  async function updateVariant(id: string, updates: Partial<ProductVariant>) {
    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('product_variants')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      // Aggiorna la variante locale
      const product = products.value.find((p) => p.variants?.some((v) => v.id === id))
      if (product?.variants) {
        const variantIndex = product.variants.findIndex((v) => v.id === id)
        if (variantIndex > -1) {
          product.variants[variantIndex] = data
        }
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
   * Elimina una variante
   */
  async function deleteVariant(id: string) {
    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase.from('product_variants').delete().eq('id', id)

      if (deleteError) throw deleteError

      // Rimuovi la variante locale
      products.value.forEach((product) => {
        if (product.variants) {
          product.variants = product.variants.filter((v) => v.id !== id)
        }
      })

      return { success: true }
    } catch (err: any) {
      error.value = handleSupabaseError(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Aggiungi prodotto a un kit
   */
  async function addKitItem(kitProductId: string, includedProductId: string, quantity: number = 1) {
    try {
      loading.value = true
      error.value = null

      const { data, error: insertError } = await supabase
        .from('kit_items')
        .insert([
          { kit_product_id: kitProductId, included_product_id: includedProductId, quantity },
        ] as any)
        .select(
          `
          *,
          product:included_product_id(*)
        `,
        )
        .single()

      if (insertError) throw insertError

      // Aggiorna il kit locale
      const kit = getProductById(kitProductId)
      if (kit) {
        if (!kit.kit_items) kit.kit_items = []
        kit.kit_items.push(data)
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
   * Rimuovi prodotto da un kit
   */
  async function removeKitItem(kitItemId: string) {
    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase.from('kit_items').delete().eq('id', kitItemId)

      if (deleteError) throw deleteError

      // Rimuovi dal kit locale
      products.value.forEach((product) => {
        if (product.kit_items) {
          product.kit_items = product.kit_items.filter((item) => item.id !== kitItemId)
        }
      })

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
      .channel('products_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        async (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            // Ricarica il prodotto completo con relazioni
            const { data } = await supabase
              .from('products')
              .select(
                `
                *,
                category:categories(*),
                variants:product_variants(*)
              `,
              )
              .eq('id', payload.new.id)
              .single()

            if (data) {
              const index = products.value.findIndex((p) => p.id === (data as Product).id)
              if (index > -1) {
                products.value[index] = data
              } else {
                products.value.push(data)
              }
            }
          } else if (payload.eventType === 'DELETE') {
            products.value = products.value.filter((p) => p.id !== payload.old.id)
          }
        },
      )
      .subscribe()
  }

  /**
   * Annulla sottoscrizione real-time
   */
  function unsubscribeFromChanges() {
    if (realtimeChannel.value) {
      supabase.removeChannel(realtimeChannel.value as any)
      realtimeChannel.value = null
    }
  }

  /**
   * Reset dello store
   */
  function $reset() {
    products.value = []
    loading.value = false
    error.value = null
    unsubscribeFromChanges()
  }

  return {
    // State
    products,
    loading,
    error,

    // Getters
    activeProducts,
    availableProducts,
    outOfStockProducts,
    lowStockProducts,
    kitProducts,
    productsCount,

    // Actions
    fetchProducts,
    fetchAvailableProducts,
    fetchProductsByCategory,
    getProductsByCategory,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    updateQuantity,
    toggleProductStatus,
    createVariant,
    updateVariant,
    deleteVariant,
    addKitItem,
    removeKitItem,
    subscribeToChanges,
    unsubscribeFromChanges,
    $reset,
  }
})
