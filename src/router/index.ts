import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Guest routes - usano GuestLayout
    {
      path: '/',
      name: 'menu',
      component: () => import('@/views/guest/MenuView.vue'),
      meta: { layout: 'guest' },
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('@/views/guest/CheckoutView.vue'),
      meta: { layout: 'guest' },
    },
    {
      path: '/order-success/:orderNumber',
      name: 'order-success',
      component: () => import('@/views/guest/OrderSuccessView.vue'),
      meta: { layout: 'guest' },
    },
    {
      path: '/my-orders',
      name: 'my-orders',
      component: () => import('@/views/guest/MyOrdersView.vue'),
      meta: { layout: 'guest' },
    },

    // Manager routes - usano DefaultLayout per login, ManagerLayout per il resto
    {
      path: '/manager/login',
      name: 'manager-login',
      component: () => import('@/views/manager/LoginView.vue'),
      meta: { layout: 'default' },
    },
    {
      path: '/manager',
      redirect: '/manager/dashboard',
      meta: { requiresAuth: true },
    },
    {
      path: '/manager/dashboard',
      name: 'manager-dashboard',
      component: () => import('@/views/manager/DashboardView.vue'),
      meta: { requiresAuth: true, layout: 'manager' },
    },
    {
      path: '/manager/products',
      name: 'manager-products',
      component: () => import('@/views/manager/ProductsView.vue'),
      meta: { requiresAuth: true, layout: 'manager' },
    },
    {
      path: '/manager/orders',
      name: 'manager-orders',
      component: () => import('@/views/manager/OrdersView.vue'),
      meta: { requiresAuth: true, layout: 'manager' },
    },
    {
      path: '/manager/stats',
      name: 'manager-stats',
      component: () => import('@/views/manager/StatsView.vue'),
      meta: { requiresAuth: true, layout: 'manager' },
    },
    {
      path: '/manager/kitchen',
      name: 'manager-kitchen',
      component: () => import('@/views/manager/KitchenView.vue'),
      meta: { requiresAuth: true, layout: 'manager' },
    },
    {
      path: '/manager/scan',
      name: 'manager-scan',
      component: () => import('@/views/manager/ScanView.vue'),
      meta: { requiresAuth: true, layout: 'default' }, // Layout vuoto per fullscreen
    },
    {
      path: '/manager/audit',
      name: 'manager-audit',
      component: () => import('@/views/manager/AuditView.vue'),
      meta: { requiresAuth: true, layout: 'manager' },
    },

    // 404 - usa DefaultLayout
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { layout: 'default' },
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Se la rotta richiede auth, assicurati che l'inizializzazione sia completata
  if (to.meta.requiresAuth) {
    if (authStore.loading) {
      // Se sta ancora caricando (es. refresh pagina), attendi l'inizializzazione
      await authStore.initialize()
    } else if (authStore.user === null) {
      // Se non sta caricando e non c'è utente, prova un ultimo check
      await authStore.checkSession()
    }

    if (!authStore.isAuthenticated) {
      next('/manager/login')
      return
    }
  }

  // Se l'utente è già loggato e prova ad andare al login, reindirizza alla dashboard
  if (to.name === 'manager-login') {
    if (authStore.loading) {
      await authStore.initialize()
    }

    if (authStore.isAuthenticated) {
      next('/manager/dashboard')
      return
    }
  }

  next()
})

export default router
