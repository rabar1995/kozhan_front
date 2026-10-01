import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import './assets/main.css'
import { initPwaUpdate } from './composables/usePwaUpdate'

// Service worker: PwaPrompt shows "New version available" when an update is ready.
initPwaUpdate()

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
