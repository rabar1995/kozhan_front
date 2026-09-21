import { reactive, ref } from 'vue'

const state = reactive({
    open: false,
    title: '',
    message: '',
    type: 'danger',        // 'danger' | 'warning' | 'info'
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    resolve: null,
})

/**
 * Composable for imperative confirmation dialogs.
 * Usage:
 *   const { confirm } = useConfirm()
 *   const ok = await confirm({ title: 'Delete?', message: 'Cannot undo.', type: 'danger' })
 *   if (ok) { ... }
 */
export function useConfirm() {
    function confirm({ title = '', message = '', type = 'danger', confirmText = 'Confirm', cancelText = 'Cancel' } = {}) {
        state.title = title
        state.message = message
        state.type = type
        state.confirmText = confirmText
        state.cancelText = cancelText
        state.open = true

        return new Promise((resolve) => {
            state.resolve = resolve
        })
    }

    function accept() {
        state.open = false
        if (state.resolve) state.resolve(true)
        state.resolve = null
    }

    function reject() {
        state.open = false
        if (state.resolve) state.resolve(false)
        state.resolve = null
    }

    return { state, confirm, accept, reject }
}
