<script setup lang="ts">
import AppButton from './AppButton.vue'

interface Props {
  icon?: string
  title: string
  description?: string
  actionLabel?: string
}

interface Emits {
  (e: 'action'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center py-16 px-4 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200"
  >
    <!-- Icon -->
    <div
      v-if="icon"
      class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-3xl"
    >
      {{ icon }}
    </div>
    <div
      v-else
      class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-gray-400"
    >
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
    </div>

    <!-- Title -->
    <h3 class="text-lg font-bold text-gray-900 mb-1">
      {{ title }}
    </h3>

    <!-- Description -->
    <p v-if="description" class="text-sm text-gray-500 max-w-xs mb-6">
      {{ description }}
    </p>

    <!-- Action -->
    <AppButton v-if="actionLabel" @click="emit('action')" variant="primary" size="sm">
      {{ actionLabel }}
    </AppButton>
  </div>
</template>
