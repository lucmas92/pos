import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/main.css'

// Crea l'app Vue
const app = createApp(App)

// Crea l'istanza Pinia
const pinia = createPinia()

// Usa i plugin
app.use(pinia)
app.use(router)

// Monta l'app
app.mount('#app')

// Gestione errori globali
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Error info:', info)
}

// Performance monitoring in development
if (import.meta.env.DEV) {
  app.config.performance = true
}
