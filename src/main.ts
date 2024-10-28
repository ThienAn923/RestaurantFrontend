import { createApp } from 'vue'
import App from './App.vue'
import './assets/index.css'
import router from './router'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { useAuthStore } from './components/pinia/auth'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)

const authStore = useAuthStore()

// Check authentication before setting up the router
authStore.checkAuth().then(() => {
  app.use(router)
  app.mount('#app')
})