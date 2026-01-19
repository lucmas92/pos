import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ToastMessage {
  id: number
  text: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<ToastMessage[]>([])
  let nextId = 0

  function add(text: string, type: ToastMessage['type'] = 'info', duration = 3000) {
    const id = nextId++
    const toast: ToastMessage = { id, text, type, duration }

    toasts.value.push(toast)

    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }
  }

  function remove(id: number) {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  return {
    toasts,
    add,
    remove,
  }
})
