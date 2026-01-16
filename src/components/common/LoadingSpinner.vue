<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: string
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'text-primary-600',
})

const sizeClasses = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2.5 h-2.5',
  lg: 'w-3.5 h-3.5',
  xl: 'w-5 h-5',
}

const containerClasses = {
  sm: 'gap-1',
  md: 'gap-1.5',
  lg: 'gap-2',
  xl: 'gap-2.5',
}
</script>

<template>
  <div class="flex items-center justify-center" :class="containerClasses[size]">
    <div
      class="rounded-full animate-bounce-custom bg-current"
      :class="[sizeClasses[size], color]"
      style="animation-delay: 0s"
    ></div>
    <div
      class="rounded-full animate-bounce-custom bg-current"
      :class="[sizeClasses[size], color]"
      style="animation-delay: 0.15s"
    ></div>
    <div
      class="rounded-full animate-bounce-custom bg-current"
      :class="[sizeClasses[size], color]"
      style="animation-delay: 0.3s"
    ></div>
  </div>
</template>

<style scoped>
@keyframes bounce-custom {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-40%);
    opacity: 1;
  }
}

.animate-bounce-custom {
  animation: bounce-custom 1s infinite ease-in-out;
}
</style>
