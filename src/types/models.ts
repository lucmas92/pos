/**
 * Modelli dell'applicazione con relazioni
 */

import type { Database } from './database.types'

// Tipi base dalle tabelle
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type ProductBase = Database['public']['Tables']['products']['Row']
export type ProductVariant = Database['public']['Tables']['product_variants']['Row']
export type KitItemBase = Database['public']['Tables']['kit_items']['Row']
export type OrderBase = Database['public']['Tables']['orders']['Row']
export type OrderItemBase = Database['public']['Tables']['order_items']['Row']

/**
 * Prodotto con relazioni
 */
export interface Product extends ProductBase {
  category?: Category
  variants?: ProductVariant[]
  kit_items?: KitItem[]
}

/**
 * Item di un kit con il prodotto incluso
 */
export interface KitItem extends KitItemBase {
  product?: Product
}

/**
 * Ordine con items
 */
export interface Order extends OrderBase {
  items?: OrderItem[]
}

/**
 * Item dell'ordine con prodotto e variante
 */
export interface OrderItem extends OrderItemBase {
  product?: Product
  variant?: ProductVariant
}

/**
 * Item del carrello (solo client-side)
 */
export interface CartItem {
  product: Product
  variant?: ProductVariant
  quantity: number
  notes?: string
}

/**
 * Dati per creare un prodotto
 */
export type CreateProductData = Database['public']['Tables']['products']['Insert']

/**
 * Dati per aggiornare un prodotto
 */
export type UpdateProductData = Database['public']['Tables']['products']['Update']

/**
 * Dati per creare una categoria
 */
export type CreateCategoryData = Database['public']['Tables']['categories']['Insert']

/**
 * Dati per aggiornare una categoria
 */
export type UpdateCategoryData = Database['public']['Tables']['categories']['Update']

/**
 * Dati per creare un ordine
 */
export interface CreateOrderData {
  guest_name?: string
  covers: number
  total_amount: number
  notes?: string
  items: CreateOrderItemData[]
}

/**
 * Dati per creare un item dell'ordine
 */
export interface CreateOrderItemData {
  product_id: string
  variant_id?: string
  quantity: number
  unit_price: number
  notes?: string
}

/**
 * Dati per creare una variante
 */
export type CreateVariantData = Database['public']['Tables']['product_variants']['Insert']

/**
 * Dati per aggiornare una variante
 */
export type UpdateVariantData = Database['public']['Tables']['product_variants']['Update']
