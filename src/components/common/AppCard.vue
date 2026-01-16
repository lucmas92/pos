<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
  noPadding?: boolean
}>()
</script>

<template>
  <div
    class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md"
  >
    <div
      v-if="title || $slots.header"
      class="px-6 py-4 border-b border-gray-50 flex items-center justify-between"
    >
      <div>
        <h3 v-if="title" class="text-lg font-bold text-gray-900">{{ title }}</h3>
        <p v-if="subtitle" class="text-sm text-gray-500 mt-0.5">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.header">
        <slot name="header" />
      </div>
    </div>

    <div :class="[noPadding ? '' : 'p-6']">
      <slot />
    </div>

    <div v-if="$slots.footer" class="px-6 py-4 bg-gray-50 border-t border-gray-100">
      <slot name="footer" />
    </div>
  </div>
</template>
