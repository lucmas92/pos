/**
 * Valida un indirizzo email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida una password (minimo 6 caratteri)
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6
}

/**
 * Valida che una stringa non sia vuota
 */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0
}

/**
 * Valida che un numero sia positivo
 */
export function isPositiveNumber(value: number): boolean {
  return !isNaN(value) && isFinite(value) && value > 0
}

/**
 * Valida che un numero sia >= 0
 */
export function isNonNegativeNumber(value: number): boolean {
  return !isNaN(value) && isFinite(value) && value >= 0
}

/**
 * Valida un numero di coperti (1-100)
 */
export function isValidCovers(covers: number): boolean {
  return Number.isInteger(covers) && covers >= 1 && covers <= 100
}

/**
 * Valida una quantità (deve essere intero positivo)
 */
export function isValidQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity >= 0
}

/**
 * Valida che una stringa sia un UUID valido
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Sanitizza input testuale (rimuove spazi extra e caratteri pericolosi)
 */
export function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Rimuovi spazi multipli
    .replace(/[<>]/g, '') // Rimuovi < e > per sicurezza
}

/**
 * Valida lunghezza stringa
 */
export function isValidLength(text: string, min: number, max: number): boolean {
  const length = text.trim().length
  return length >= min && length <= max
}

/**
 * Valida un nome prodotto (2-100 caratteri)
 */
export function isValidProductName(name: string): boolean {
  return isValidLength(name, 2, 100)
}

/**
 * Valida una descrizione (max 500 caratteri)
 */
export function isValidDescription(description: string): boolean {
  return description.trim().length <= 500
}

/**
 * Valida note ordine (max 200 caratteri)
 */
export function isValidOrderNotes(notes: string): boolean {
  return notes.trim().length <= 200
}

/**
 * Interfaccia per risultato validazione
 */
export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Valida un prodotto completo
 */
export function validateProduct(data: {
  name: string
  description?: string
  price: number
  quantity_available: number
  category_id: string
}): ValidationResult {
  if (!isValidProductName(data.name)) {
    return { valid: false, error: 'Il nome deve essere tra 2 e 100 caratteri' }
  }

  if (data.description && !isValidDescription(data.description)) {
    return { valid: false, error: 'La descrizione deve essere massimo 500 caratteri' }
  }

  if (!isPositiveNumber(data.price)) {
    return { valid: false, error: 'Il prezzo deve essere maggiore di 0' }
  }

  if (!isValidQuantity(data.quantity_available)) {
    return { valid: false, error: 'La quantità deve essere un numero intero >= 0' }
  }

  if (!isValidUUID(data.category_id)) {
    return { valid: false, error: 'Categoria non valida' }
  }

  return { valid: true }
}

/**
 * Valida un ordine prima dell'invio
 */
export function validateOrder(data: {
  covers: number
  items: any[]
  total_amount: number
}): ValidationResult {
  if (!isValidCovers(data.covers)) {
    return { valid: false, error: 'Il numero di coperti deve essere tra 1 e 100' }
  }

  if (!data.items || data.items.length === 0) {
    return { valid: false, error: "L'ordine deve contenere almeno un prodotto" }
  }

  if (!isPositiveNumber(data.total_amount)) {
    return { valid: false, error: "Il totale dell'ordine non è valido" }
  }

  return { valid: true }
}
