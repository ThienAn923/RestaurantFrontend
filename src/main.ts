import { createApp } from 'vue'
import App from './App.vue'
import './assets/index.css'
import router from './router'
import { createPinia } from 'pinia'

// Create the Vue app instance
const app = createApp(App)

// Create the Pinia instance
const pinia = createPinia()

// Use Pinia and Router
app.use(pinia)
app.use(router)

// Mount the app to the DOM
app.mount('#app')
