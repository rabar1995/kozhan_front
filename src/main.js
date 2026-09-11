import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import './assets/main.css'
import { registerSW } from 'virtual:pwa-register'

// Register Service Worker for PWA (both dev and prod)
registerSW({
    immediate: true,
    onNeedRefresh() {
        console.log('[PWA] New content available, reload to update.')
    },
    onOfflineReady() {
        console.log('[PWA] App is ready to work offline.')
    },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
