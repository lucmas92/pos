import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartItem, Product, ProductVariant } from '@/types/models'
import { saveToStorage, getFromStorage, STORAGE_KEYS } from '@/utils/storage'
import { calculateTotal } from '@/utils/currency'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const covers = ref(1)
  const orderNotes = ref('')
  const guestName = ref('')

  // Computed
  const totalItems = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

  const totalAmount = computed(() => {
    const prices = items.value.map((item) => {
      const basePrice = item.product.price
      const variantModifier = item.variant?.price_modifier || 0
      return (basePrice + variantModifier) * item.quantity
    })
    return calculateTotal(prices)
  })

  const isEmpty = computed(() => items.value.length === 0)

  const itemsCount = computed(() => items.value.length)

  /**
   * Carica il carrello dal localStorage
   */
  function loadFromStorage() {
    const savedCart = getFromStorage<{
      items: CartItem[]
      covers: number
      orderNotes: string
      guestName: string
    }>(STORAGE_KEYS.CART)

    if (savedCart) {
      items.value = savedCart.items || []
      covers.value = savedCart.covers || 1
      orderNotes.value = savedCart.orderNotes || ''
      guestName.value = savedCart.guestName || ''
    }
  }

  /**
   * Salva il carrello nel localStorage
   */
  function saveCart() {
    saveToStorage(STORAGE_KEYS.CART, {
      items: items.value,
      covers: covers.value,
      orderNotes: orderNotes.value,
      guestName: guestName.value,
    })
  }

  /**
   * Aggiunge un prodotto al carrello
   */
  function addItem(
    product: Product,
    variant?: ProductVariant,
    notes?: string,
    quantity: number = 1,
  ) {
    // Verifica disponibilità
    if (product.quantity_available <= 0) {
      throw new Error('Prodotto non disponibile')
    }

    // Cerca se esiste già nel carrello
    const existingIndex = items.value.findIndex(
      (item) =>
        item.product.id === product.id && item.variant?.id === variant?.id && item.notes === notes,
    )

    if (existingIndex > -1) {
      // Incrementa quantità esistente
      const newQuantity = items.value[existingIndex]!.quantity + quantity

      // Verifica che non superi la disponibilità
      if (newQuantity > product.quantity_available) {
        throw new Error('Quantità non disponibile')
      }

      items.value[existingIndex]!.quantity = newQuantity
    } else {
      // Verifica che la quantità richiesta non superi la disponibilità
      if (quantity > product.quantity_available) {
        throw new Error('Quantità non disponibile')
      }

      // Aggiungi nuovo item
      items.value.push({
        product,
        variant,
        quantity,
        notes,
      })
    }

    saveCart()
  }

  /**
   * Rimuove un item dal carrello
   */
  function removeItem(index: number) {
    if (index >= 0 && index < items.value.length) {
      items.value.splice(index, 1)
      saveCart()
    }
  }

  /**
   * Rimuove un prodotto specifico (con variant e notes)
   */
  function removeProduct(productId: string, variantId?: string, notes?: string) {
    const index = items.value.findIndex(
      (item) =>
        item.product.id === productId && item.variant?.id === variantId && item.notes === notes,
    )

    if (index > -1) {
      removeItem(index)
    }
  }

  /**
   * Aggiorna la quantità di un item
   */
  function updateQuantity(index: number, quantity: number) {
    if (index < 0 || index >= items.value.length) return

    if (quantity <= 0) {
      removeItem(index)
      return
    }

    const item = items.value[index]

    // Verifica disponibilità
    if (!item || quantity > item.product.quantity_available) {
      throw new Error('Quantità non disponibile')
    }

    items.value[index]!.quantity = quantity
    saveCart()
  }

  /**
   * Incrementa quantità
   */
  function incrementQuantity(index: number) {
    if (index < 0 || index >= items.value.length) return

    const item = items.value[index]
    const newQuantity = item!.quantity + 1

    if (newQuantity > item!.product.quantity_available) {
      throw new Error('Quantità non disponibile')
    }

    items.value[index]!.quantity = newQuantity
    saveCart()
  }

  /**
   * Decrementa quantità
   */
  function decrementQuantity(index: number) {
    if (index < 0 || index >= items.value.length) return

    const newQuantity = items.value[index]!.quantity - 1

    if (newQuantity <= 0) {
      removeItem(index)
    } else {
      items!.value[index]!.quantity = newQuantity
      saveCart()
    }
  }

  /**
   * Aggiorna le note di un item
   */
  function updateItemNotes(index: number, notes: string) {
    if (index >= 0 && index < items.value.length) {
      items.value[index]!.notes = notes
      saveCart()
    }
  }

  /**
   * Imposta il numero di coperti
   */
  function setCovers(count: number) {
    if (count >= 1 && count <= 100) {
      covers.value = count
      saveCart()
    }
  }

  /**
   * Imposta le note dell'ordine
   */
  function setOrderNotes(notes: string) {
    orderNotes.value = notes
    saveCart()
  }

  /**
   * Imposta il nome dell'ospite
   */
  function setGuestName(name: string) {
    guestName.value = name
    saveCart()
  }

  /**
   * Svuota il carrello
   */
  function clearCart() {
    items.value = []
    covers.value = 1
    orderNotes.value = ''
    guestName.value = ''
    saveCart()
  }

  /**
   * Verifica se un prodotto è nel carrello
   */
  function hasProduct(productId: string, variantId?: string): boolean {
    return items.value.some(
      (item) => item.product.id === productId && item.variant?.id === variantId,
    )
  }

  /**
   * Ottiene la quantità di un prodotto nel carrello
   */
  function getProductQuantity(productId: string, variantId?: string): number {
    const item = items.value.find(
      (item) => item.product.id === productId && item.variant?.id === variantId,
    )
    return item?.quantity || 0
  }

  /**
   * Calcola il prezzo di un singolo item
   */
  function getItemPrice(item: CartItem): number {
    const basePrice = item.product.price
    const variantModifier = item.variant?.price_modifier || 0
    return (basePrice + variantModifier) * item.quantity
  }

  return {
    // State
    items,
    covers,
    orderNotes,
    guestName,

    // Getters
    totalItems,
    totalAmount,
    isEmpty,
    itemsCount,

    // Actions
    loadFromStorage,
    addItem,
    removeItem,
    removeProduct,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    updateItemNotes,
    setCovers,
    setOrderNotes,
    setGuestName,
    clearCart,
    hasProduct,
    getProductQuantity,
    getItemPrice,
  }
})
