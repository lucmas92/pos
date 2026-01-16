import { computed, onMounted, onUnmounted } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { storeToRefs } from 'pinia'
import type { Order } from '@/types/models'

/**
 * Composable per gestire gli ordini
 */
export function useOrders(options?: {
  autoFetch?: boolean
  limit?: number
  todayOnly?: boolean
  status?: 'pending' | 'completed' | 'cancelled'
  realtime?: boolean
}) {
  const { autoFetch = true, limit, todayOnly = false, status, realtime = false } = options || {}

  const ordersStore = useOrdersStore()

  // Refs reattivi dallo store
  const {
    orders,
    currentOrder,
    loading,
    error,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    todayOrders,
    todayRevenue,
    totalRevenue,
    ordersCount,
  } = storeToRefs(ordersStore)

  /**
   * Lista ordini da usare in base alle opzioni
   */
  const ordersList = computed(() => {
    if (todayOnly) {
      return todayOrders.value
    }

    if (status === 'pending') {
      return pendingOrders.value
    }

    if (status === 'completed') {
      return completedOrders.value
    }

    if (status === 'cancelled') {
      return cancelledOrders.value
    }

    return orders.value
  })

  /**
   * Carica gli ordini
   */
  async function fetch() {
    if (todayOnly) {
      return await ordersStore.fetchTodayOrders()
    }

    if (status) {
      return await ordersStore.fetchOrdersByStatus(status)
    }

    return await ordersStore.fetchOrders(limit)
  }

  /**
   * Ricarica gli ordini
   */
  async function refetch() {
    return await fetch()
  }

  /**
   * Ottiene un ordine per ID
   */
  async function fetchById(id: string) {
    return await ordersStore.fetchOrderById(id)
  }

  /**
   * Ottiene un ordine per numero ordine
   */
  async function fetchByNumber(orderNumber: number) {
    return await ordersStore.fetchOrderByNumber(orderNumber)
  }

  /**
   * Crea un nuovo ordine
   */
  async function create(orderData: {
    guest_name?: string
    covers: number
    total_amount: number
    notes?: string
    items: Array<{
      product_id: string
      variant_id?: string
      quantity: number
      unit_price: number
      notes?: string
    }>
  }) {
    return await ordersStore.createOrder(orderData)
  }

  /**
   * Aggiorna lo stato di un ordine
   */
  async function updateStatus(id: string, newStatus: 'pending' | 'completed' | 'cancelled') {
    return await ordersStore.updateOrderStatus(id, newStatus)
  }

  /**
   * Completa un ordine
   */
  async function complete(id: string) {
    return await ordersStore.completeOrder(id)
  }

  /**
   * Annulla un ordine
   */
  async function cancel(id: string) {
    return await ordersStore.cancelOrder(id)
  }

  /**
   * Ottiene le statistiche ordini
   */
  const stats = computed(() => ordersStore.getOrderStats())

  /**
   * Verifica se ci sono ordini
   */
  const hasOrders = computed(() => ordersList.value.length > 0)

  /**
   * Ordini recenti (ultimi 10)
   */
  const recentOrders = computed(() =>
    [...ordersList.value]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10),
  )

  /**
   * Cerca ordini per numero o nome ospite
   */
  function search(query: string): Order[] {
    const searchTerm = query.toLowerCase().trim()

    if (!searchTerm) return ordersList.value

    return ordersList.value.filter((order) => {
      const orderNumber = order.order_number.toString()
      const guestName = order.guest_name?.toLowerCase() || ''

      return orderNumber.includes(searchTerm) || guestName.includes(searchTerm)
    })
  }

  /**
   * Filtra ordini per data
   */
  function filterByDate(startDate: Date, endDate: Date): Order[] {
    return ordersList.value.filter((order) => {
      const orderDate = new Date(order.created_at)
      return orderDate >= startDate && orderDate <= endDate
    })
  }

  /**
   * Filtra ordini per importo minimo
   */
  function filterByMinAmount(minAmount: number): Order[] {
    return ordersList.value.filter((order) => order.total_amount >= minAmount)
  }

  /**
   * Ordina ordini
   */
  function sort(compareFn: (a: Order, b: Order) => number): Order[] {
    return [...ordersList.value].sort(compareFn)
  }

  /**
   * Ordina per data (più recenti prima)
   */
  function sortByDateDesc(): Order[] {
    return sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  /**
   * Ordina per importo (dal più alto)
   */
  function sortByAmountDesc(): Order[] {
    return sort((a, b) => b.total_amount - a.total_amount)
  }

  /**
   * Calcola totale coperti
   */
  const totalCovers = computed(() =>
    ordersList.value.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.covers, 0),
  )

  /**
   * Calcola scontrino medio
   */
  const averageOrderValue = computed(() => {
    const validOrders = ordersList.value.filter((o) => o.status !== 'cancelled')
    if (validOrders.length === 0) return 0

    const total = validOrders.reduce((sum, o) => sum + o.total_amount, 0)
    return Math.round((total / validOrders.length) * 100) / 100
  })

  /**
   * Calcola media coperti per ordine
   */
  const averageCoversPerOrder = computed(() => {
    const validOrders = ordersList.value.filter((o) => o.status !== 'cancelled')
    if (validOrders.length === 0) return 0

    const total = validOrders.reduce((sum, o) => sum + o.covers, 0)
    return Math.round((total / validOrders.length) * 10) / 10
  })

  /**
   * Ottiene i prodotti più venduti
   */
  function getTopProducts(limit: number = 10) {
    const productSales = new Map<
      string,
      {
        name: string
        quantity: number
        revenue: number
      }
    >()

    ordersList.value
      .filter((o) => o.status !== 'cancelled')
      .forEach((order) => {
        order.items?.forEach((item) => {
          const productName = item.product?.name || 'Prodotto sconosciuto'
          const existing = productSales.get(item.product_id)

          if (existing) {
            existing.quantity += item.quantity
            existing.revenue += item.unit_price * item.quantity
          } else {
            productSales.set(item.product_id, {
              name: productName,
              quantity: item.quantity,
              revenue: item.unit_price * item.quantity,
            })
          }
        })
      })

    return Array.from(productSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit)
  }

  /**
   * Ottiene revenue per categoria
   */
  function getRevenueByCategory() {
    const categoryRevenue = new Map<
      string,
      {
        category_name: string
        total_revenue: number
        items_sold: number
        orders_count: number
        percentage: number
      }
    >()

    const total = totalRevenue.value

    ordersList.value
      .filter((o) => o.status !== 'cancelled')
      .forEach((order) => {
        order.items?.forEach((item) => {
          const categoryId = item.product?.category_id || 'unknown'
          const categoryName = item.product?.category?.name || 'Altro'
          const itemRevenue = item.unit_price * item.quantity

          const existing = categoryRevenue.get(categoryId)

          if (existing) {
            existing.total_revenue += itemRevenue
            existing.items_sold += item.quantity
            existing.orders_count++
          } else {
            categoryRevenue.set(categoryId, {
              category_name: categoryName,
              total_revenue: itemRevenue,
              items_sold: item.quantity,
              orders_count: 1,
              percentage: 0,
            })
          }
        })
      })

    // Calcola percentuali
    const result = Array.from(categoryRevenue.values())
    result.forEach((cat) => {
      cat.percentage = total > 0 ? Math.round((cat.total_revenue / total) * 100) : 0
    })

    return result.sort((a, b) => b.total_revenue - a.total_revenue)
  }

  /**
   * Raggruppa ordini per stato
   */
  const ordersByStatus = computed(() => ({
    pending: pendingOrders.value.length,
    completed: completedOrders.value.length,
    cancelled: cancelledOrders.value.length,
  }))

  /**
   * Statistiche complete per dashboard
   */
  const dashboardStats = computed(() => ({
    // Ordini
    totalOrders: orders.value.length,
    todayOrders: todayOrders.value.length,
    pendingOrders: pendingOrders.value.length,
    completedOrders: completedOrders.value.length,
    cancelledOrders: cancelledOrders.value.length,

    // Revenue
    totalRevenue: totalRevenue.value,
    todayRevenue: todayRevenue.value,
    averageOrderValue: averageOrderValue.value,

    // Coperti
    totalCovers: totalCovers.value,
    todayCovers: todayOrders.value
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.covers, 0),
    averageCoversPerOrder: averageCoversPerOrder.value,
  }))

  /**
   * Ottiene statistiche per periodo
   */
  function getStatsByDate(startDate: Date, endDate: Date) {
    const filtered = filterByDate(startDate, endDate)
    const validOrders = filtered.filter((o) => o.status !== 'cancelled')

    return {
      orders: filtered.length,
      revenue: validOrders.reduce((sum, o) => sum + o.total_amount, 0),
      covers: validOrders.reduce((sum, o) => sum + o.covers, 0),
      averageOrderValue:
        validOrders.length > 0
          ? validOrders.reduce((sum, o) => sum + o.total_amount, 0) / validOrders.length
          : 0,
    }
  }

  /**
   * Ottiene andamento ordini per ora (ultimo giorno)
   */
  function getOrdersByHour() {
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      orders_count: 0,
      revenue: 0,
    }))

    todayOrders.value
      .filter((o) => o.status !== 'cancelled')
      .forEach((order) => {
        const hour = new Date(order.created_at).getHours()
        hourlyData[hour].orders_count++
        hourlyData[hour].revenue += order.total_amount
      })

    return hourlyData.filter((h) => h.orders_count > 0)
  }

  // Lifecycle hooks
  onMounted(async () => {
    if (autoFetch && ordersList.value.length === 0) {
      await fetch()
    }

    if (realtime) {
      ordersStore.subscribeToChanges()
    }
  })

  onUnmounted(() => {
    if (realtime) {
      ordersStore.unsubscribeFromChanges()
    }
  })

  return {
    // State
    orders: ordersList,
    currentOrder,
    loading,
    error,
    ordersCount,
    hasOrders,
    stats,
    recentOrders,
    todayRevenue,
    totalRevenue,
    totalCovers,
    averageOrderValue,
    averageCoversPerOrder,
    ordersByStatus,
    dashboardStats,

    // Refs per accesso diretto
    pendingOrders,
    completedOrders,
    cancelledOrders,
    todayOrders,

    // Methods
    fetch,
    refetch,
    fetchById,
    fetchByNumber,
    create,
    updateStatus,
    complete,
    cancel,
    search,
    filterByDate,
    filterByMinAmount,
    sort,
    sortByDateDesc,
    sortByAmountDesc,
    getTopProducts,
    getRevenueByCategory,
    getStatsByDate,
    getOrdersByHour,
  }
}
