<script setup lang="ts">
import { onMounted } from 'vue'
import { useAudit } from '@/composables/useAudit'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { formatDate } from '@/utils/date.ts'

const { logs, loading, fetchLogs } = useAudit()

onMounted(() => {
  fetchLogs()
})

function getActionColor(action: string) {
  if (action.includes('LOGIN')) return 'bg-blue-100 text-blue-800'
  if (action.includes('CREATE')) return 'bg-green-100 text-green-800'
  if (action.includes('UPDATE')) return 'bg-yellow-100 text-yellow-800'
  if (action.includes('DELETE') || action.includes('CANCEL')) return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-800'
}

function formatDetails(details: any) {
  if (!details) return '-'
  return JSON.stringify(details, null, 2)
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Audit Logs</h1>
      <p class="text-gray-600 mt-1">Cronologia delle azioni critiche</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <LoadingSpinner size="xl" />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="logs.length === 0"
      icon="📋"
      title="Nessun log trovato"
      description="Non ci sono ancora azioni registrate nel sistema."
    />

    <!-- Logs Table -->
    <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-100">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Utente
              </th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Azione
              </th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Entità
              </th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Dettagli
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(log.created_at, true) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ log.user_email || 'Sistema' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                  :class="getActionColor(log.action)"
                >
                  {{ log.action }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ log.entity_type }} <span v-if="log.entity_id" class="text-xs text-gray-400">({{ log.entity_id.substring(0, 8) }}...)</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 font-mono text-xs">
                <pre class="whitespace-pre-wrap max-w-xs overflow-hidden">{{ formatDetails(log.details) }}</pre>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
