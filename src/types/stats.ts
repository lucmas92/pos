/**
 * Tipi per statistiche e analytics
 */

import type { TimeRange } from './enums'

/**
 * Statistiche dashboard
 */
export interface DashboardStats {
  // Ordini
  totalOrders: number
  todayOrders: number
  pendingOrders: number
  completedOrders: number
  cancelledOrders: number

  // Revenue
  totalRevenue: number
  todayRevenue: number
  averageOrderValue: number

  // Prodotti
  totalProducts: number
  activeProducts: number
  outOfStock: number
  lowStock: number

  // Ospiti
  totalCovers: number
  todayCovers: number
  averageCoversPerOrder: number
}

/**
 * Prodotto più venduto
 */
export interface TopProduct {
  product_id: string
  product_name: string
  quantity_sold: number
  revenue: number
  orders_count: number
}

/**
 * Revenue per categoria
 */
export interface CategoryRevenue {
  category_id: string
  category_name: string
  total_revenue: number
  items_sold: number
  orders_count: number
  percentage: number
}

/**
 * Statistiche per periodo
 */
export interface PeriodStats {
  period: string // Data o etichetta periodo
  orders: number
  revenue: number
  covers: number
  averageOrderValue: number
}

/**
 * Confronto periodi
 */
export interface PeriodComparison {
  current: PeriodStats
  previous: PeriodStats
  change: {
    orders: number // Percentuale
    revenue: number
    covers: number
    averageOrderValue: number
  }
}

/**
 * Parametri per query statistiche
 */
export interface StatsQueryParams {
  timeRange: TimeRange
  startDate?: string
  endDate?: string
  categoryId?: string
}

/**
 * Statistiche prodotto
 */
export interface ProductStats {
  product_id: string
  product_name: string
  times_ordered: number
  total_quantity: number
  total_revenue: number
  average_quantity_per_order: number
  last_ordered_at: string | null
}

/**
 * Andamento vendite (per grafici)
 */
export interface SalesTrend {
  date: string
  orders: number
  revenue: number
  covers: number
}

/**
 * Distribuzione ordini per ora
 */
export interface OrdersByHour {
  hour: number // 0-23
  orders_count: number
  revenue: number
}

/**
 * Performance categoria
 */
export interface CategoryPerformance {
  category_id: string
  category_name: string
  products_count: number
  orders_count: number
  items_sold: number
  revenue: number
  average_item_price: number
  conversion_rate: number // Percentuale prodotti venduti vs disponibili
}
