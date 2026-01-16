/**
 * Formatta un numero come valuta EUR
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formatta un numero senza simbolo di valuta
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Parse una stringa a numero valido per prezzi
 */
export function parsePrice(value: string): number {
  const cleaned = value.replace(',', '.').replace(/[^\d.]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100
}

/**
 * Valida che un prezzo sia valido
 */
export function isValidPrice(price: number): boolean {
  return !isNaN(price) && isFinite(price) && price >= 0
}

/**
 * Calcola il totale di un array di prezzi
 */
export function calculateTotal(prices: number[]): number {
  const total = prices.reduce((sum, price) => sum + price, 0)
  return Math.round(total * 100) / 100
}
