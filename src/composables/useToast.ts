import { useToastStore } from '@/stores/toast'

export function useToast() {
  const store = useToastStore()

  return {
    success: (text: string, duration?: number) => store.add(text, 'success', duration),
    error: (text: string, duration?: number) => store.add(text, 'error', duration),
    info: (text: string, duration?: number) => store.add(text, 'info', duration),
    warning: (text: string, duration?: number) => store.add(text, 'warning', duration),
    remove: store.remove,
  }
}
