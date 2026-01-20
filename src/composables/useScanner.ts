import { onMounted, onUnmounted } from 'vue'

export function useScanner(onScan: (code: string) => void) {
  let buffer = ''
  let lastKeyTime = 0
  const SCANNER_THRESHOLD = 50 // ms

  const handleKeyDown = (e: KeyboardEvent) => {
    // Ignore if focus is on an input or textarea
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return
    }

    const currentTime = Date.now()
    const timeDiff = currentTime - lastKeyTime
    lastKeyTime = currentTime

    if (e.key === 'Enter') {
      if (buffer.length > 0) {
        onScan(buffer)
        buffer = ''
      }
    } else if (e.key.length === 1) {
      // Printable characters
      if (timeDiff > SCANNER_THRESHOLD) {
        // Too slow, likely human typing. Reset buffer to just this key.
        buffer = e.key
      } else {
        buffer += e.key
      }
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
}
