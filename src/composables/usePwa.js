import { ref } from 'vue'

const deferredPrompt = ref(null)
const isInstallable = ref(false)
const isInstalled = ref(false)
const isOffline = ref(!navigator.onLine)
const showGuideModal = ref(false)

// Check if running in standalone mode
if (typeof window !== 'undefined') {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
        isInstalled.value = true
    }

    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('[PWA] beforeinstallprompt event captured')
        e.preventDefault()
        deferredPrompt.value = e
        isInstallable.value = true
    })

    window.addEventListener('appinstalled', () => {
        console.log('[PWA] App successfully installed')
        isInstalled.value = true
        isInstallable.value = false
        deferredPrompt.value = null
        showGuideModal.value = false
    })

    window.addEventListener('online', () => {
        isOffline.value = false
    })

    window.addEventListener('offline', () => {
        isOffline.value = true
    })
}

export function usePwa() {
    async function promptInstall() {
        if (deferredPrompt.value) {
            console.log('[PWA] Triggering native install prompt')
            deferredPrompt.value.prompt()
            const { outcome } = await deferredPrompt.value.userChoice
            console.log('[PWA] User response:', outcome)
            if (outcome === 'accepted') {
                isInstallable.value = false
                deferredPrompt.value = null
            }
            return outcome
        } else {
            console.log('[PWA] Native prompt not available, showing manual install guide')
            showGuideModal.value = true
            return 'unavailable'
        }
    }

    return {
        deferredPrompt,
        isInstallable,
        isInstalled,
        isOffline,
        showGuideModal,
        promptInstall,
    }
}
