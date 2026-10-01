import { ref } from 'vue'
import { registerSW } from 'virtual:pwa-register'

const needRefresh = ref(false)
let updateSW = null

/** Call once at startup. */
export function initPwaUpdate() {
    updateSW = registerSW({
        immediate: true,
        onNeedRefresh() {
            needRefresh.value = true
        },
    })
}

/** "New version available" state + reload action for the UI. */
export function usePwaUpdate() {
    function reload() {
        needRefresh.value = false
        if (updateSW) updateSW(true)
        else window.location.reload()
    }

    function dismiss() {
        needRefresh.value = false
    }

    return { needRefresh, reload, dismiss }
}
