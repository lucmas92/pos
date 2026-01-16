<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

interface Props {
  title: string
  value: string | number
  variant?: 'blue' | 'green' | 'yellow' | 'red' | 'orange' | 'white'
  to?: string | object
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'white',
})

const isClickable = computed(() => !!props.to)
const componentType = computed(() => (props.to ? RouterLink : 'div'))

const styles = computed(() => {
  switch (props.variant) {
    case 'blue':
      return {
        card: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg shadow-blue-500/30',
        text: 'text-blue-100',
        iconBg: 'bg-white/20 backdrop-blur-sm',
        iconColor: 'text-white',
      }
    case 'green':
      return {
        card: 'bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg shadow-green-500/30',
        text: 'text-green-100',
        iconBg: 'bg-white/20 backdrop-blur-sm',
        iconColor: 'text-white',
      }
    case 'yellow':
      return {
        card: 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-lg shadow-yellow-500/30',
        text: 'text-yellow-100',
        iconBg: 'bg-white/20 backdrop-blur-sm',
        iconColor: 'text-white',
      }
    case 'red':
      return {
        card: 'bg-white border border-red-100 shadow-sm',
        text: 'text-red-600',
        value: 'text-red-700',
        iconBg: 'bg-red-50',
        iconColor: 'text-red-600',
      }
    case 'orange':
      return {
        card: 'bg-white border border-orange-100 shadow-sm',
        text: 'text-orange-600',
        value: 'text-orange-700',
        iconBg: 'bg-orange-50',
        iconColor: 'text-orange-600',
      }
    default: // white/gray
      return {
        card: 'bg-white border border-gray-100 shadow-sm',
        text: 'text-gray-500',
        value: 'text-gray-900',
        iconBg: 'bg-gray-50',
        iconColor: 'text-gray-600',
      }
  }
})
</script>

<template>
  <component
    :is="componentType"
    :to="to"
    class="card relative overflow-hidden transition-all duration-300 flex flex-col justify-between h-full"
    :class="[
      styles.card,
      isClickable && 'hover:-translate-y-1 hover:shadow-md cursor-pointer group',
    ]"
  >
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium mb-1" :class="styles.text">{{ title }}</p>
        <p class="text-3xl font-bold tracking-tight" :class="styles.value || 'text-white'">
          {{ value }}
        </p>
      </div>

      <div
        class="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300"
        :class="[styles.iconBg, styles.iconColor, isClickable && 'group-hover:scale-110']"
      >
        <slot name="icon">
          <!-- Default Icon -->
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        </slot>
      </div>
    </div>

    <!-- Click indicator (optional) -->
    <div
      v-if="isClickable"
      class="absolute bottom-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <svg
        class="w-4 h-4"
        :class="styles.text"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M14 5l7 7m0 0l-7 7m7-7H3"
        />
      </svg>
    </div>
  </component>
</template>
