import { onMounted, onUnmounted, ref } from 'vue'
import { supabase } from '@/utils/supabase'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

/**
 * Tipo per gli eventi real-time
 */
type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

/**
 * Callback per gestire i cambiamenti
 */
type ChangeCallback<T = any> = (payload: RealtimePostgresChangesPayload<T>) => void

/**
 * Opzioni per il real-time
 */
interface RealtimeOptions {
  table: string
  event?: RealtimeEvent
  schema?: string
  filter?: string
  autoSubscribe?: boolean
}

/**
 * Composable per gestire le sottoscrizioni real-time di Supabase
 */
export function useRealtime<T = any>(options: RealtimeOptions, callback: ChangeCallback<T>) {
  const { table, event = '*', schema = 'public', filter, autoSubscribe = true } = options

  const channel = ref<RealtimeChannel | null>(null)
  const isSubscribed = ref(false)
  const error = ref<string | null>(null)

  /**
   * Sottoscrivi ai cambiamenti
   */
  function subscribe() {
    try {
      // Crea il canale con nome univoco
      const channelName = `${table}_${event}_${Date.now()}`

      channel.value = supabase.channel(channelName)

      // Configura il listener
      const config: any = {
        event,
        schema,
        table,
      }

      if (filter) {
        config.filter = filter
      }

      channel.value.on(('postgres_changes' as any), config, callback).subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          isSubscribed.value = true
          error.value = null
        } else if (status === 'CLOSED') {
          isSubscribed.value = false
        } else if (status === 'CHANNEL_ERROR') {
          error.value = 'Errore nella sottoscrizione real-time'
          isSubscribed.value = false
        }
      })
    } catch (err: any) {
      error.value = err.message || 'Errore nella sottoscrizione'
      isSubscribed.value = false
    }
  }

  /**
   * Annulla la sottoscrizione
   */
  function unsubscribe() {
    if (channel.value) {
      supabase.removeChannel(channel.value)
      channel.value = null
      isSubscribed.value = false
    }
  }

  /**
   * Riconnetti
   */
  function reconnect() {
    unsubscribe()
    subscribe()
  }

  // Lifecycle hooks
  onMounted(() => {
    if (autoSubscribe) {
      subscribe()
    }
  })

  onUnmounted(() => {
    unsubscribe()
  })

  return {
    channel,
    isSubscribed,
    error,
    subscribe,
    unsubscribe,
    reconnect,
  }
}

/**
 * Composable semplificato per ascoltare una singola tabella
 */
export function useRealtimeTable<T = any>(
  tableName: string,
  onInsert?: (record: T) => void,
  onUpdate?: (record: T) => void,
  onDelete?: (record: T) => void,
) {
  const callback = (payload: RealtimePostgresChangesPayload<T>) => {
    switch (payload.eventType) {
      case 'INSERT':
        if (onInsert) onInsert(payload.new as T)
        break
      case 'UPDATE':
        if (onUpdate) onUpdate(payload.new as T)
        break
      case 'DELETE':
        if (onDelete) onDelete(payload.old as T)
        break
    }
  }

  return useRealtime<T>({ table: tableName, event: '*' }, callback)
}

/**
 * Composable per monitorare più tabelle
 */
export function useRealtimeMultiple(
  subscriptions: Array<{
    table: string
    event?: RealtimeEvent
    callback: ChangeCallback
  }>,
) {
  const channels = ref<RealtimeChannel[]>([])
  const isSubscribed = ref(false)
  const errors = ref<string[]>([])

  function subscribe() {
    subscriptions.forEach((sub, index) => {
      try {
        const channelName = `${sub.table}_${sub.event || '*'}_${index}_${Date.now()}`
        const ch = supabase.channel(channelName)

        ch.on(
          'postgres_changes',
          {
            event: sub.event || '*',
            schema: 'public',
            table: sub.table,
          },
          sub.callback,
        ).subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            isSubscribed.value = true
          } else if (status === 'CHANNEL_ERROR') {
            errors.value.push(`Errore su tabella ${sub.table}`)
          }
        })

        channels.value.push(ch)
      } catch (err: any) {
        errors.value.push(err.message)
      }
    })
  }

  function unsubscribe() {
    channels.value.forEach((ch:any) => {
      supabase.removeChannel(ch)
    })
    channels.value = []
    isSubscribed.value = false
  }

  onMounted(() => {
    subscribe()
  })

  onUnmounted(() => {
    unsubscribe()
  })

  return {
    channels,
    isSubscribed,
    errors,
    subscribe,
    unsubscribe,
  }
}
