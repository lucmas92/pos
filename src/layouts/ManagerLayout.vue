<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const route = useRoute()
const auth = useAuth()

// State
const sidebarOpen = ref(true)
const mobileMenuOpen = ref(false)

// Menu items
const menuItems = [
  {
    name: 'Dashboard',
    path: '/manager/dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    name: 'Prodotti',
    path: '/manager/products',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
  {
    name: 'Ordini',
    path: '/manager/orders',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  },
  {
    name: 'Cucina (KDS)',
    path: '/manager/kitchen',
    icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
  },
  {
    name: 'Statistiche',
    path: '/manager/stats',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    name: 'Audit',
    path: '/manager/audit',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    name: 'Impostazioni',
    path: '/manager/settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  },
]

// Computed
const isActive = (path: string) => route.path === path

const currentPageName = computed(() => {
  const item = menuItems.find((item) => item.path === route.path)
  return item?.name || 'Manager'
})

// Methods
function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

async function handleLogout() {
  if (confirm('Sei sicuro di voler uscire?')) {
    await auth.logout()
  }
}

function goToGuestMenu() {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gray-200">
    <!-- Mobile Header -->
    <header
      class="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 safe-area-inset-top"
    >
      <div class="flex items-center justify-between h-16 px-4">
        <!-- Menu Button -->
        <button @click="toggleMobileMenu" class="btn btn-ghost -ml-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <!-- Title -->
        <h1 class="text-lg font-bold text-gray-900">{{ currentPageName }}</h1>

        <!-- User Menu -->
        <div class="flex items-center">
          <span class="text-sm text-gray-600 truncate max-w-25">{{ auth.userEmail.value }}</span>
        </div>
      </div>
    </header>

    <!-- Desktop Sidebar -->
    <aside
      :class="[
        'hidden lg:flex lg:flex-col fixed top-0 left-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40',
        sidebarOpen ? 'w-64' : 'w-20',
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center h-16 px-4 border-b border-gray-200">
        <div class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
          <span class="text-white font-bold text-xl">P</span>
        </div>
        <div v-if="sidebarOpen" class="ml-3 flex-1 min-w-0">
          <h2 class="text-lg font-bold text-gray-900 truncate">Proloco</h2>
          <p class="text-xs text-gray-500 truncate">Area Manager</p>
        </div>
        <button @click="toggleSidebar" class="ml-auto btn btn-ghost p-2 shrink-0">
          <svg
            class="w-5 h-5 transition-transform"
            :class="{ 'rotate-180': !sidebarOpen }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-4">
        <ul class="space-y-1 px-3">
          <li v-for="item in menuItems" :key="item.path">
            <router-link
              :to="item.path"
              :class="[
                'flex items-center px-3 py-3 rounded-lg transition-colors',
                isActive(item.path)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100',
              ]"
            >
              <svg
                class="w-6 h-6 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="item.icon"
                />
              </svg>
              <span v-if="sidebarOpen" class="ml-3 font-medium">{{ item.name }}</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- Footer -->
      <div class="border-t border-gray-200 p-4">
        <!-- View Guest Menu -->
        <button
          @click="goToGuestMenu"
          :class="[
            'flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors mb-2',
            !sidebarOpen && 'justify-center',
          ]"
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <span v-if="sidebarOpen" class="ml-3 text-sm">Vedi Menu</span>
        </button>

        <!-- User Info & Logout -->
        <div :class="['flex items-center', !sidebarOpen && 'flex-col space-y-2']">
          <div v-if="sidebarOpen" class="flex-1 min-w-0 mr-2">
            <p class="text-sm font-medium text-gray-900 truncate">Manager</p>
            <p class="text-xs text-gray-500 truncate">{{ auth.userEmail.value }}</p>
          </div>
          <button
            @click="handleLogout"
            :class="['btn btn-ghost p-2 text-red-600 hover:bg-red-50', !sidebarOpen && 'w-full']"
            :title="sidebarOpen ? '' : 'Logout'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Mobile Menu Overlay -->
    <Transition name="fade">
      <div
        v-if="mobileMenuOpen"
        class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
        @click="closeMobileMenu"
      />
    </Transition>

    <!-- Mobile Menu -->
    <Transition name="slide-left">
      <aside
        v-if="mobileMenuOpen"
        class="lg:hidden fixed top-0 left-0 h-full w-64 bg-white z-50 flex flex-col safe-area-inset-top safe-area-inset-bottom"
      >
        <!-- Header -->
        <div class="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-xl">P</span>
            </div>
            <div class="ml-3">
              <h2 class="text-lg font-bold text-gray-900">Proloco</h2>
              <p class="text-xs text-gray-500">Area Manager</p>
            </div>
          </div>
          <button @click="closeMobileMenu" class="btn btn-ghost p-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto py-4">
          <ul class="space-y-1 px-3">
            <li v-for="item in menuItems" :key="item.path">
              <router-link
                :to="item.path"
                @click="closeMobileMenu"
                :class="[
                  'flex items-center px-3 py-3 rounded-lg transition-colors',
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100',
                ]"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    :d="item.icon"
                  />
                </svg>
                <span class="ml-3 font-medium">{{ item.name }}</span>
              </router-link>
            </li>
          </ul>
        </nav>

        <!-- Footer -->
        <div class="border-t border-gray-200 p-4">
          <!-- View Guest Menu -->
          <button
            @click="goToGuestMenu"
            class="flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors mb-3"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span class="ml-3 text-sm">Vedi Menu Ospiti</span>
          </button>

          <!-- User Info -->
          <div class="mb-3 px-3">
            <p class="text-sm font-medium text-gray-900">Manager</p>
            <p class="text-xs text-gray-500 truncate">{{ auth.userEmail.value }}</p>
          </div>

          <!-- Logout -->
          <button
            @click="handleLogout"
            class="flex items-center w-full px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span class="ml-3 text-sm font-medium">Disconnetti</span>
          </button>
        </div>
      </aside>
    </Transition>

    <!-- Main Content -->
    <main
      :class="[
        'min-h-screen flex justify-center',
        'transition-all duration-300',
        'lg:ml-64',
        !sidebarOpen && 'lg:ml-20',
        'pt-16 lg:pt-0',
      ]"
    >
      <div class="p-4 w-full mx-auto lg:p-6">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}
</style>
