/**
 * Gestione localStorage con type-safety
 */

const STORAGE_KEYS = {
  CART: 'proloco_cart',
  LAST_ORDER: 'proloco_last_order',
  PREFERENCES: 'proloco_preferences',
} as const

/**
 * Salva dati in localStorage
 */
export function saveToStorage<T>(key: string, data: T): void {
  try {
    const serialized = JSON.stringify(data)
    localStorage.setItem(key, serialized)
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

/**
 * Recupera dati da localStorage
 */
export function getFromStorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key)
    if (!item) return null
    return JSON.parse(item) as T
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return null
  }
}

/**
 * Rimuove un item da localStorage
 */
export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error removing from localStorage:', error)
  }
}

/**
 * Pulisce tutto il localStorage dell'app
 */
export function clearAppStorage(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    removeFromStorage(key)
  })
}

/**
 * Verifica se localStorage è disponibile
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

export { STORAGE_KEYS }
