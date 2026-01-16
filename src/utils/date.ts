/**
 * Formatta una data in formato italiano
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

/**
 * Formatta data e ora in formato italiano
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Formatta solo l'ora
 */
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Verifica se una data è oggi
 */
export function isToday(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  )
}

/**
 * Ottiene l'inizio della giornata (00:00:00)
 */
export function getStartOfDay(date?: Date): Date {
  const d = date || new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
}

/**
 * Ottiene la fine della giornata (23:59:59)
 */
export function getEndOfDay(date?: Date): Date {
  const d = date || new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
}

/**
 * Ottiene una data relativa (es: -7 giorni)
 */
export function getRelativeDate(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

/**
 * Formatta una data in ISO string per database
 */
export function toISOString(date: Date): string {
  return date.toISOString()
}

/**
 * Calcola la differenza in minuti tra due date
 */
export function getMinutesDifference(date1: Date, date2: Date): number {
  return Math.floor((date2.getTime() - date1.getTime()) / 60000)
}

/**
 * Formatta tempo relativo (es: "2 minuti fa", "1 ora fa")
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Adesso'
  if (diffMins < 60) return `${diffMins} minuti fa`
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'ora' : 'ore'} fa`
  if (diffDays === 1) return 'Ieri'
  if (diffDays < 7) return `${diffDays} giorni fa`

  return formatDate(d)
}
