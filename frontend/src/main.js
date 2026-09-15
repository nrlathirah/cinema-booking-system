import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { useToastStore } from './stores/toast'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.config.errorHandler = (err, instance, info) => {
  console.error('Unhandled app error:', err, info)
  try {
    useToastStore().error('Something went wrong. Please try again.')
  } catch {
    // toast store not ready yet (error happened before mount) — swallow, console.error above is enough
  }
}

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})

app.mount('#app')
