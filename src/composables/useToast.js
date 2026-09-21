import { reactive } from 'vue'

const toasts = reactive([])

let _id = 0

/**
 * Composable for showing auto-dismissing toast notifications.
 * Usage:
 *   const { showToast } = useToast()
 *   showToast({ message: 'Saved!', type: 'success' })
 */
export function useToast() {
    function showToast({ message, type = 'success', duration = 4000 }) {
        const id = ++_id
        toasts.push({ id, message, type, duration })

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }
    }

    function removeToast(id) {
        const idx = toasts.findIndex((t) => t.id === id)
        if (idx !== -1) toasts.splice(idx, 1)
    }

    return { toasts, showToast, removeToast }
}
