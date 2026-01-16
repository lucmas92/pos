<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

defineProps<{
  isOpen: boolean
  title?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// Close on escape key
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="relative z-50"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
          @click="$emit('close')"
        ></div>

        <div class="fixed inset-0 z-10 overflow-y-auto">
          <div
            class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
          >
            <!-- Modal Panel -->
            <Transition
              enter-active-class="transition ease-out duration-300"
              enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enter-to-class="opacity-100 translate-y-0 sm:scale-100"
              leave-active-class="transition ease-in duration-200"
              leave-from-class="opacity-100 translate-y-0 sm:scale-100"
              leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div
                class="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 w-full"
                :class="[
                  maxWidth === 'sm'
                    ? 'sm:max-w-sm'
                    : maxWidth === 'lg'
                      ? 'sm:max-w-lg'
                      : maxWidth === 'xl'
                        ? 'sm:max-w-xl'
                        : maxWidth === '2xl'
                          ? 'sm:max-w-2xl'
                          : 'sm:max-w-md',
                ]"
              >
                <!-- Header -->
                <div
                  v-if="title"
                  class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100"
                >
                  <div class="flex items-center justify-between">
                    <h3 class="text-lg leading-6 font-bold text-gray-900" id="modal-title">
                      {{ title }}
                    </h3>
                    <button
                      @click="$emit('close')"
                      class="bg-white rounded-full p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-500 focus:outline-none transition-colors"
                    >
                      <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Content -->
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6">
                  <slot />
                </div>

                <!-- Footer -->
                <div
                  v-if="$slots.footer"
                  class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-100 gap-3"
                >
                  <slot name="footer" />
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
