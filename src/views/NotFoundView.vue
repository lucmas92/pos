<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="text-center">
      <h1 class="text-9xl font-bold text-gray-200 mb-4">404</h1>
      <h2 class="text-3xl font-bold text-gray-900 mb-2">Pagina non trovata</h2>
      <p class="text-gray-600 mb-8">La pagina che stai cercando non esiste.</p>
      <button @click="goHome" class="btn btn-primary">Torna alla home</button>
    </div>
  </div>
</template>
