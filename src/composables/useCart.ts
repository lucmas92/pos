import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { storeToRefs } from 'pinia'
import type { Product, ProductVariant } from '@/types/models'

/**
 * Composable per gestire il carrello
 */
export function useCart() {
  const cartStore = useCartStore()
  const router = useRouter()

  // Refs reattivi dallo store
  const { items, covers, orderNotes, guestName, totalItems, totalAmount, isEmpty, itemsCount } =
    storeToRefs(cartStore)

  /**
   * Aggiunge un prodotto al carrello con gestione errori
   */
  function addToCart(product: Product, variant?: ProductVariant, notes?: string, quantity: number = 1) {
    try {
      cartStore.addItem(product, variant, notes, quantity)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Rimuove un item dal carrello
   */
  function removeFromCart(index: number) {
    cartStore.removeItem(index)
  }

  /**
   * Incrementa la quantità con gestione errori
   */
  function incrementItem(index: number) {
    try {
      cartStore.incrementQuantity(index)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Decrementa la quantità
   */
  function decrementItem(index: number) {
    cartStore.decrementQuantity(index)
  }

  /**
   * Aggiorna la quantità con gestione errori
   */
  function updateItemQuantity(index: number, quantity: number) {
    try {
      cartStore.updateQuantity(index, quantity)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Aggiorna le note di un item
   */
  function updateNotes(index: number, notes: string) {
    cartStore.updateItemNotes(index, notes)
  }

  /**
   * Imposta il numero di coperti
   */
  function setCovers(count: number) {
    if (count >= 1 && count <= 100) {
      cartStore.setCovers(count)
      return { success: true }
    }
    return { success: false, error: 'Il numero di coperti deve essere tra 1 e 100' }
  }

  /**
   * Imposta le note dell'ordine
   */
  function setNotes(notes: string) {
    if (notes.length <= 200) {
      cartStore.setOrderNotes(notes)
      return { success: true }
    }
    return { success: false, error: 'Le note possono contenere massimo 200 caratteri' }
  }

  /**
   * Imposta il nome dell'ospite
   */
  function setGuest(name: string) {
    cartStore.setGuestName(name)
  }

  /**
   * Svuota il carrello
   */
  function clear() {
    cartStore.clearCart()
  }

  /**
   * Verifica se un prodotto è nel carrello
   */
  function hasProduct(productId: string, variantId?: string): boolean {
    return cartStore.hasProduct(productId, variantId)
  }

  /**
   * Ottiene la quantità di un prodotto nel carrello
   */
  function getQuantity(productId: string, variantId?: string): number {
    return cartStore.getProductQuantity(productId, variantId)
  }

  /**
   * Calcola il prezzo di un item
   */
  function getItemPrice(index: number): number {
    const item = items.value[index]
    if (!item) return 0
    return cartStore.getItemPrice(item)
  }

  /**
   * Naviga al checkout
   */
  async function goToCheckout() {
    if (isEmpty.value) {
      return { success: false, error: 'Il carrello è vuoto' }
    }

    await router.push('/checkout')
    return { success: true }
  }

  /**
   * Inizializza il carrello dal localStorage
   */
  function initialize() {
    cartStore.loadFromStorage()
  }

  /**
   * Valida il carrello prima del checkout
   */
  function validate(): { valid: boolean; error?: string } {
    if (isEmpty.value) {
      return { valid: false, error: 'Il carrello è vuoto' }
    }

    if (covers.value < 1 || covers.value > 100) {
      return { valid: false, error: 'Il numero di coperti deve essere tra 1 e 100' }
    }

    if (orderNotes.value.length > 200) {
      return { valid: false, error: 'Le note sono troppo lunghe (max 200 caratteri)' }
    }

    // Verifica che tutti i prodotti abbiano quantità disponibile
    for (const item of items.value) {
      if (item.quantity > item.product.quantity_available) {
        return {
          valid: false,
          error: `${item.product.name} non ha quantità sufficiente disponibile`,
        }
      }
    }

    return { valid: true }
  }

  /**
   * Prepara i dati per l'ordine
   */
  function prepareOrderData() {
    return {
      guest_name: guestName.value || undefined,
      covers: covers.value,
      total_amount: totalAmount.value,
      notes: orderNotes.value || undefined,
      items: items.value.map((item) => ({
        product_id: item.product.id,
        variant_id: item.variant?.id,
        quantity: item.quantity,
        unit_price: item.product.price + (item.variant?.price_modifier || 0),
        notes: item.notes,
      })),
    }
  }

  return {
    // State
    items,
    covers,
    orderNotes,
    guestName,
    totalItems,
    totalAmount,
    isEmpty,
    itemsCount,

    // Methods
    addToCart,
    removeFromCart,
    incrementItem,
    decrementItem,
    updateItemQuantity,
    updateNotes,
    setCovers,
    setNotes,
    setGuest,
    clear,
    hasProduct,
    getQuantity,
    getItemPrice,
    goToCheckout,
    initialize,
    validate,
    prepareOrderData,
  }
}
