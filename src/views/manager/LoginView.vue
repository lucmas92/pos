<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { isValidEmail } from '@/utils/validators'

const auth = useAuth()

// Form state
const email = ref('admin@proloco.test')
const password = ref('password123')
const showPassword = ref(false)
const errors = ref<{ email?: string; password?: string }>({})

// Validate form
function validate(): boolean {
  errors.value = {}

  if (!email.value.trim()) {
    errors.value.email = 'Email richiesta'
    return false
  }

  if (!isValidEmail(email.value)) {
    errors.value.email = 'Email non valida'
    return false
  }

  if (!password.value) {
    errors.value.password = 'Password richiesta'
    return false
  }

  if (password.value.length < 6) {
    errors.value.password = 'La password deve contenere almeno 6 caratteri'
    return false
  }

  return true
}

// Handle submit
async function handleSubmit() {
  if (!validate()) return

  auth.clearError()
  await auth.login(email.value, password.value)
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gray-50 relative overflow-hidden">
    <!-- Background decoration -->
    <div class="absolute inset-0 bg-primary-600 skew-y-6 origin-top-left transform -translate-y-1/2 z-0"></div>

    <div class="w-full max-w-md z-10">
      <!-- Card -->
      <div class="bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div class="p-8 sm:p-12">
          <!-- Header -->
          <div class="text-center mb-10">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-primary-50 rounded-2xl mb-6 text-primary-600 shadow-sm transform rotate-3 hover:rotate-6 transition-transform duration-300">
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Benvenuto</h1>
            <p class="text-gray-500 mt-2 text-base">Accedi per gestire il POS</p>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="space-y-8 p-2">
            <!-- Error Alert -->
            <div v-if="auth.error.value" class="rounded-2xl bg-red-50 p-4 text-sm text-red-600 flex items-center border border-red-100 animate-pulse">
              <svg class="w-5 h-5 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <span class="font-medium">{{ auth.error.value }}</span>
            </div>

            <div class="space-y-5 m-2">
              <!-- Email Input -->
              <div class="group">
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg class="h-6 w-6 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    v-model="email"
                    type="email"
                    class="block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-0 transition-all duration-300 font-medium"
                    :class="{ 'border-red-300! bg-red-50!': errors.email }"
                    placeholder="Email Address"
                    :disabled="auth.loading.value"
                  />
                </div>
                <p v-if="errors.email" class="text-sm text-red-600 mt-2 pl-4 font-medium flex items-center">
                  <span class="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></span>
                  {{ errors.email }}
                </p>
              </div>

              <!-- Password Input -->
              <div class="group">
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg class="h-6 w-6 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    class="block w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-0 transition-all duration-300 font-medium"
                    :class="{ 'border-red-300! bg-red-50!': errors.password }"
                    placeholder="Password"
                    :disabled="auth.loading.value"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  >
                    <svg v-if="showPassword" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  </button>
                </div>
                <p v-if="errors.password" class="text-sm text-red-600 mt-2 pl-4 font-medium flex items-center">
                  <span class="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></span>
                  {{ errors.password }}
                </p>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="auth.loading.value"
              class="w-full flex justify-center py-4 px-6 border border-transparent rounded-2xl shadow-lg shadow-primary-500/30 text-base font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <LoadingSpinner v-if="auth.loading.value" size="sm" color="text-white" class="mr-2" />
              <span v-else>Accedi</span>
            </button>
          </form>
        </div>

        <!-- Footer -->
        <div class="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-center">
          <router-link to="/" class="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center transition-colors group">
            <svg class="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Torna al menu ospiti
          </router-link>
        </div>
      </div>

      <!-- Demo Credentials -->
      <div class="mt-8 text-center">
        <div class="inline-block px-6 py-3 bg-gray-500/80 backdrop-blur-md rounded-full border border-white/20 shadow-lg text-sm text-white">
          <span class="font-bold opacity-90">Demo:</span> admin@proloco.test <span class="mx-2 opacity-50">|</span> password123
        </div>
      </div>
    </div>
  </div>
</template>
