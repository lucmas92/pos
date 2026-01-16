/**
 * Export centrale di tutti i tipi
 */

// Database e modelli
export * from './database.types'
export * from './models'
export * from './enums'

// API
export * from './api'

// Statistiche
export * from './stats'

// Form
export * from './forms'

// UI
export * from './ui'

// Type guards
export function isProduct(obj: any): obj is import('./models').Product {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string'
}

export function isOrder(obj: any): obj is import('./models').Order {
  return obj && typeof obj.id === 'string' && typeof obj.order_number === 'number'
}

export function isCategory(obj: any): obj is import('./models').Category {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string'
}

// Utility types
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type Maybe<T> = T | null | undefined

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never }
export type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U
