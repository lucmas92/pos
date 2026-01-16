/**
 * Tipi per le risposte API
 */

/**
 * Risposta generica di successo
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Errore API
 */
export interface ApiError {
  code?: string
  message: string
  details?: any
}

/**
 * Risposta paginata
 */
export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Parametri per paginazione
 */
export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Parametri per filtri
 */
export interface FilterParams {
  search?: string
  categoryId?: string
  status?: string
  isActive?: boolean
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
}
