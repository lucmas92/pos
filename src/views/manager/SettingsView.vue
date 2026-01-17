<script setup lang="ts">
import { ref, watch } from 'vue'
import { useConfig } from '@/composables/useConfig'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const { config, loading, update } = useConfig()

const form = ref({
  event_name: '',
  receipt_header: '',
  receipt_footer: '',
  logo_url: '',
  is_ordering_open: true,
  enable_takeaway: true,
  enable_covers: true,
  cover_price: 0,
  printer_kitchen_ip: '',
  printer_bar_ip: '',
})

const saving = ref(false)
const successMessage = ref('')

// Sync form with config when loaded
watch(
  config,
  (newConfig) => {
    if (newConfig) {
      form.value = {
        event_name: newConfig.event_name || '',
        receipt_header: newConfig.receipt_header || '',
        receipt_footer: newConfig.receipt_footer || '',
        logo_url: newConfig.logo_url || '',
        is_ordering_open: newConfig.is_ordering_open ?? true,
        enable_takeaway: newConfig.enable_takeaway ?? true,
        enable_covers: newConfig.enable_covers ?? true,
        cover_price: newConfig.cover_price || 0,
        printer_kitchen_ip: newConfig.printer_kitchen_ip || '',
        printer_bar_ip: newConfig.printer_bar_ip || '',
      }
    }
  },
  { immediate: true },
)

async function handleSave() {
  saving.value = true
  successMessage.value = ''

  const result = await update(form.value)

  if (result.success) {
    successMessage.value = 'Impostazioni salvate con successo!'
    setTimeout(() => (successMessage.value = ''), 3000)
  }

  saving.value = false
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Impostazioni</h1>
      <p class="text-gray-600 mt-1">Configurazione generale del sistema</p>
    </div>

    <!-- Loading -->
    <div v-if="loading && !config" class="flex justify-center py-12">
      <LoadingSpinner size="xl" />
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- General Settings -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Event Info -->
        <div class="card">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Informazioni Evento</h2>
          <div class="space-y-4">
            <AppInput
              v-model="form.event_name"
              label="Nome Evento"
              placeholder="Es. Sagra del Risotto"
            />
            <AppInput v-model="form.logo_url" label="URL Logo" placeholder="https://..." />
          </div>
        </div>

        <!-- Receipt Settings -->
        <div class="card">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Scontrino</h2>
          <div class="space-y-4">
            <AppInput
              v-model="form.receipt_header"
              label="Intestazione"
              placeholder="Es. Associazione Pro Loco"
            />
            <AppInput
              v-model="form.receipt_footer"
              label="Piè di pagina"
              placeholder="Es. Grazie e arrivederci!"
            />
          </div>
        </div>

        <!-- Printers (Placeholder for future implementation) -->
        <div class="card">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Stampanti (IP)</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AppInput
              v-model="form.printer_kitchen_ip"
              label="Stampante Cucina"
              placeholder="192.168.1.100"
            />
            <AppInput
              v-model="form.printer_bar_ip"
              label="Stampante Bar"
              placeholder="192.168.1.101"
            />
          </div>
        </div>
      </div>

      <!-- Toggles & Actions -->
      <div class="space-y-6">
        <!-- Service Status -->
        <div class="card">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Stato Servizio</h2>

          <div class="space-y-4">
            <!-- Ordering Open -->
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900">Accetta Ordini</p>
                <p class="text-xs text-gray-500">Abilita/disabilita l'invio di nuovi ordini</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="form.is_ordering_open" class="sr-only peer" />
                <div
                  class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"
                ></div>
              </label>
            </div>

            <hr class="border-gray-100" />

            <!-- Takeaway -->
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900">Abilita Asporto</p>
                <p class="text-xs text-gray-500">Permetti di selezionare "Asporto"</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="form.enable_takeaway" class="sr-only peer" />
                <div
                  class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"
                ></div>
              </label>
            </div>

            <hr class="border-gray-100" />

            <!-- Covers -->
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900">Richiedi Coperti</p>
                <p class="text-xs text-gray-500">Chiedi numero di persone</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="form.enable_covers" class="sr-only peer" />
                <div
                  class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"
                ></div>
              </label>
            </div>

            <div v-if="form.enable_covers">
              <AppInput
                v-model.number="form.cover_price"
                type="number"
                label="Prezzo Coperto (€)"
                :step="0.1"
                :min="0"
              />
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="sticky bottom-6">
          <div
            v-if="successMessage"
            class="mb-4 p-4 bg-green-100 text-green-700 rounded-xl text-sm font-bold text-center animate-fade-in"
          >
            {{ successMessage }}
          </div>

          <AppButton
            @click="handleSave"
            :disabled="saving"
            variant="primary"
            size="lg"
            block
            class="shadow-xl"
          >
            <LoadingSpinner v-if="saving" size="sm" color="text-white" class="mr-2" />
            Salva Impostazioni
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>
