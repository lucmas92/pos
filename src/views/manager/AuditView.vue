<script setup lang="ts">
import { onMounted } from 'vue'
import { useAudit } from '@/composables/useAudit'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { formatDate } from '@/utils/date.ts'
import { formatCurrency } from '@/utils/currency.ts'

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

function formatValue(key: string, value: any): string {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? 'Sì' : 'No'
  if (key.includes('price') || key.includes('amount')) return formatCurrency(Number(value))
  return String(value)
}

function getChangedFields(details: any) {
  if (!details || !details.changes) return []
  return Object.entries(details.changes).map(([key, value]) => ({
    key,
    value,
  }))
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
              <th
                scope="col"
                class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-40"
              >
                Data
              </th>
              <th
                scope="col"
                class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-48"
              >
                Utente
              </th>
              <th
                scope="col"
                class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32"
              >
                Azione
              </th>
              <th
                scope="col"
                class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
              >
                Dettagli Modifica
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50 transition-colors">
              <!-- Date -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                {{ formatDate(log.created_at, true) }}
              </td>

              <!-- User -->
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 align-top">
                <div class="flex items-center">
                  <div
                    class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mr-2 text-xs font-bold"
                  >
                    {{ (log.user_email || 'S').charAt(0).toUpperCase() }}
                  </div>
                  {{ log.user_email || 'Sistema' }}
                </div>
              </td>

              <!-- Action & Entity -->
              <td class="px-6 py-4 whitespace-nowrap align-top">
                <div class="flex flex-col gap-1">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold w-fit"
                    :class="getActionColor(log.action)"
                  >
                    {{ log.action }}
                  </span>
                  <span class="text-xs text-gray-400 font-mono">
                    {{ log.entity_type }} #{{ log.entity_id?.slice(-8) }}
                  </span>
                </div>
              </td>

              <!-- Details (Smart Rendering) -->
              <td class="px-6 py-4 text-sm text-gray-600 align-top">
                <!-- Case: Update Product (Show changes) -->
                <div
                  v-if="log.action === 'UPDATE_PRODUCT' && (log as any).details.changes"
                  class="space-y-1"
                >
                  <div
                    v-for="field in getChangedFields((log as any).details)"
                    :key="field.key"
                    class="flex items-center gap-2"
                  >
                    <span
                      class="font-medium text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-xs"
                      >{{ field.key }}</span
                    >
                    <span class="text-gray-400">→</span>
                    <span class="font-medium text-gray-900">{{
                      formatValue(field.key, field.value)
                    }}</span>

                    <!-- Show old price if available -->
                    <span
                      v-if="field.key === 'price' && (log as any).details.old_price"
                      class="text-xs text-gray-400 line-through ml-1"
                    >
                      {{ formatCurrency((log as any).details.old_price) }}
                    </span>
                  </div>
                </div>

                <!-- Case: Update Order Status -->
                <div
                  v-else-if="log.action === 'UPDATE_ORDER_STATUS'"
                  class="flex items-center gap-2"
                >
                  <span class="text-gray-500">Stato:</span>
                  <span
                    class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs line-through"
                    >{{ (log as any).details?.old_status }}</span
                  >
                  <span class="text-gray-400">→</span>
                  <span class="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-bold">{{
                    (log as any).details?.new_status
                  }}</span>
                  <span v-if="(log as any).details?.order_number" class="text-xs text-gray-400 ml-2"
                    >(Ordine #{{ (log as any).details.order_number }})</span
                  >
                </div>

                <!-- Case: Create/Delete Product -->
                <div v-else-if="log.action.includes('_PRODUCT')" class="flex items-center gap-2">
                  <span class="text-gray-500">Nome:</span>
                  <span class="font-bold text-gray-900">{{
                    (log as any).details?.name || '-'
                  }}</span>
                  <span v-if="(log as any).details?.price" class="text-gray-500 ml-2"
                    >Prezzo: {{ formatCurrency((log as any).details.price) }}</span
                  >
                </div>

                <!-- Case: Login -->
                <div v-else-if="log.action === 'LOGIN'" class="text-gray-500 italic">
                  Accesso effettuato con successo
                </div>

                <!-- Fallback: Key-Value List -->
                <div v-else class="grid grid-cols-1 gap-1">
                  <div
                    v-for="(value, key) in (log as any).details"
                    :key="key"
                    class="flex gap-2 text-xs"
                  >
                    <span class="font-medium text-gray-500">{{ key }}:</span>
                    <span class="text-gray-900 truncate max-w-xs">{{ value }}</span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
