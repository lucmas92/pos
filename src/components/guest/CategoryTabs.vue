<script setup lang="ts">
import type { Category } from '@/types/models'

interface Props {
  categories: Category[]
  selectedCategoryId: string | null
}

interface Emits {
  (e: 'select', categoryId: string | null): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function handleSelect(categoryId: string | null) {
  emit('select', categoryId)
}
</script>

<template>
  <div class="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
    <div class="container-custom">
      <div class="flex overflow-x-auto scrollbar-hide py-3 space-x-2">
        <!-- Tab "Tutti" -->
        <button
          @click="handleSelect(null)"
          class="px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 transform active:scale-95"
          :class="[
            selectedCategoryId === null
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
          ]"
        >
          Tutti
        </button>

        <!-- Tabs Categorie -->
        <button
          v-for="category in categories"
          :key="category.id"
          @click="handleSelect(category.id)"
          class="px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 transform active:scale-95"
          :class="[
            selectedCategoryId === category.id
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
          ]"
        >
          {{ category.name }}
        </button>
      </div>
    </div>
  </div>
</template>
