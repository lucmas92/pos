import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, handleSupabaseError } from '@/utils/supabase'
import type { Order } from '@/types/models'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { getStartOfDay, getEndOfDay } from '@/utils/date'
import { useAudit } from '@/composables/useAudit'

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const realtimeChannel = ref<RealtimeChannel | null>(null)

  const { logAction } = useAudit()

  // Computed
  const pendingOrders = computed(() => orders.value.filter((o) => o.status === 'pending'))

  const paidOrders = computed(() => orders.value.filter((o) => o.status === 'paid'))

  const completedOrders = computed(() => orders.value.filter((o) => o.status === 'completed'))

  const cancelledOrders = computed(() => orders.value.filter((o) => o.status === 'cancelled'))

  const todayOrders = computed(() => {
    const today = new Date()
    return orders.value.filter((o) => {
      const orderDate = new Date(o.created_at)
      return (
        orderDate.getDate() === today.getDate() &&
        orderDate.getMonth() === today.getMonth() &&
        orderDate.getFullYear() === today.getFullYear()
      )
    })
  })

  const todayRevenue = computed(() =>
    todayOrders.value
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total_amount, 0),
  )

  const totalRevenue = computed(() =>
    orders.value
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total_amount, 0),
  )

  const ordersCount = computed(() => orders.value.length)

  /**
   * Carica tutti gli ordini (solo manager)
   */
  async function fetchOrders(limit?: number) {
    try {
      loading.value = true
      error.value = null

      let query = supabase
        .from('orders')
        .select(
          `
          *,
          items:order_items(
            *,
            product:products(*),
            variant:product_variants(*)
          )
        `,
        )
        .order('created_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      orders.value = data || []
      return { success: true, data }
    } catch (err: any) {
      error.value = handleSupabaseError(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Carica ordini di oggi
   */
  async function fetchTodayOrders() {
    try {
      loading.value = true
      error.value = null

      const startOfDay = getStartOfDay().toISOString()
      const endOfDay = getEndOfDay().toISOString()

      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(
          `
          *,
          items:order_items(
            *,
            product:products(*),
            variant:product_variants(*)
          )
        `,
        )
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      orders.value = data || []
      return { success: true, data }
    } catch (err: any) {
      error.value = handleSupabaseError(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Carica ordini per stato
   */
  async function fetchOrdersByStatus(status: 'pending' | 'paid' | 'completed' | 'cancelled') {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(
          `
          *,
          items:order_items(
            *,
            product:products(*),
            variant:product_variants(*)
          )
        `,
        )
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      return { success: true, data: data || [] }
    } catch (err: any) {
      error.value = handleSupabaseError(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Ottiene un ordine per ID
   */
  async function fetchOrderById(id: string):Promise<{ success: boolean; data?: Order; error?: string }> {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(
          `
          *,
          items:order_items(
            *,
            product:products(*),
            variant:product_variants(*)
          )
        `,
        )
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      currentOrder.value = data
      return { success: true, data }
    } catch (err: any) {
      error.value = handleSupabaseError(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Ottiene un ordine per numero ordine
   */
  async function fetchOrderByNumber(orderNumber: number):Promise<{ success: boolean; data?: Order; error?: string }> {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(
          `
          *,
          items:order_items(
            *,
            product:products(*),
            variant:product_variants(*)
          )
        `,
        )
        .eq('order_number', orderNumber)
        .single()

      if (fetchError) throw fetchError

      currentOrder.value = data
      return { success: true, data }
    } catch (err: any) {
      error.value = handleSupabaseError(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Crea un nuovo ordine
   */
  async function createOrder(orderData: {
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
    try {
      loading.value = true
      error.value = null

      // Crea l'ordine
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            guest_name: orderData.guest_name,
            covers: orderData.covers,
            total_amount: orderData.total_amount,
            notes: orderData.notes,
            status: 'pending',
          },
        ])
        .select()
        .single()

      if (orderError) throw orderError

      // Crea gli items dell'ordine
      const orderItems = orderData.items.map((item) => ({
        ...item,
        order_id: (order as Order).id,
      }))

      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems).select(`
          *,
          product:products(*),
          variant:product_variants(*)
        `)

      if (itemsError) throw itemsError

      const fullOrder = { ...order, items }
      currentOrder.value = fullOrder
      orders.value.unshift(fullOrder)

      // Audit (opzionale, se vogliamo tracciare anche gli ordini creati dagli ospiti, ma user_id sarà null)
      // await logAction('CREATE_ORDER', 'order', order.id, { total: order.total_amount })

      return { success: true, data: fullOrder }
    } catch (err: any) {
      error.value = handleSupabaseError(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Aggiorna lo stato di un ordine
   */
  async function updateOrderStatus(
    id: string,
    status: 'pending' | 'paid' | 'completed' | 'cancelled',
  ) {
    try {
      loading.value = true
      error.value = null

      const oldOrder = orders.value.find((o) => o.id === id)

      const updateData: any = { status }

      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString()
      }

      const { data, error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id)
        .select(
          `
          *,
          items:order_items(
            *,
            product:products(*),
            variant:product_variants(*)
          )
        `,
        )
        .single()

      if (updateError) throw updateError

      const index = orders.value.findIndex((o) => o.id === id)
      if (index > -1) {
        orders.value[index] = data
      }

      if (currentOrder.value?.id === id) {
        currentOrder.value = data
      }

      // Audit
      await logAction('UPDATE_ORDER_STATUS', 'order', id, {
        old_status: oldOrder?.status,
        new_status: status,
        order_number: (data as Order).order_number,
      })

      return { success: true, data }
    } catch (err: any) {
      error.value = handleSupabaseError(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Completa un ordine
   */
  async function completeOrder(id: string) {
    return await updateOrderStatus(id, 'completed')
  }

  /**
   * Annulla un ordine
   */
  async function cancelOrder(id: string) {
    return await updateOrderStatus(id, 'cancelled')
  }

  /**
   * Ottiene statistiche ordini
   */
  function getOrderStats() {
    return {
      total: orders.value.length,
      today: todayOrders.value.length,
      pending: pendingOrders.value.length,
      paid: paidOrders.value.length,
      completed: completedOrders.value.length,
      cancelled: cancelledOrders.value.length,
      todayRevenue: todayRevenue.value,
      totalRevenue: totalRevenue.value,
      averageOrderValue: orders.value.length > 0 ? totalRevenue.value / orders.value.length : 0,
    }
  }

  /**
   * Sottoscrivi agli aggiornamenti real-time
   */
  function subscribeToChanges() {
    realtimeChannel.value = supabase
      .channel('orders_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Ricarica l'ordine completo con items
            const { data } = await supabase
              .from('orders')
              .select(
                `
                *,
                items:order_items(
                  *,
                  product:products(*),
                  variant:product_variants(*)
                )
              `,
              )
              .eq('id', payload.new.id)
              .single()

            if (data) {
              orders.value.unshift(data)
            }
          } else if (payload.eventType === 'UPDATE') {
            // Ricarica l'ordine completo con items
            const { data } = await supabase
              .from('orders')
              .select(
                `
                *,
                items:order_items(
                  *,
                  product:products(*),
                  variant:product_variants(*)
                )
              `,
              )
              .eq('id', payload.new.id)
              .single()

            if (data) {
              const index = orders.value.findIndex((o) => o.id === (data as Order).id)
              if (index > -1) {
                orders.value[index] = data
              } else {
                // Se non lo troviamo (es. filtro data), lo aggiungiamo
                orders.value.unshift(data)
              }
            }
          } else if (payload.eventType === 'DELETE') {
            orders.value = orders.value.filter((o) => o.id !== payload.old.id)
          }
        },
      )
      .subscribe()
  }

  /**
   * Annulla sottoscrizione real-time
   */
  function unsubscribeFromChanges() {
    if (realtimeChannel.value) {
      supabase.removeChannel(realtimeChannel.value)
      realtimeChannel.value = null
    }
  }

  /**
   * Reset dello store
   */
  function $reset() {
    orders.value = []
    currentOrder.value = null
    loading.value = false
    error.value = null
    unsubscribeFromChanges()
  }

  return {
    // State
    orders,
    currentOrder,
    loading,
    error,

    // Getters
    pendingOrders,
    paidOrders,
    completedOrders,
    cancelledOrders,
    todayOrders,
    todayRevenue,
    totalRevenue,
    ordersCount,

    // Actions
    fetchOrders,
    fetchTodayOrders,
    fetchOrdersByStatus,
    fetchOrderById,
    fetchOrderByNumber,
    createOrder,
    updateOrderStatus,
    completeOrder,
    cancelOrder,
    getOrderStats,
    subscribeToChanges,
    unsubscribeFromChanges,
    $reset,
  }
})
