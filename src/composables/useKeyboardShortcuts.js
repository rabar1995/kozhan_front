import { onMounted, onBeforeUnmount } from 'vue'

/**
 * Global keyboard shortcuts.
 * - Ctrl+K / Cmd+K or "/": focus the page's search box.
 *   Search boxes are marked with data-search (works in every language).
 * - Escape is handled by Modal.vue.
 */
export function useKeyboardShortcuts() {
    function focusSearch() {
        const input = document.querySelector('[data-search]')
        if (input) {
            input.focus()
            input.select?.()
        }
    }

    function isTyping(el) {
        if (! el) return false
        const tag = el.tagName.toLowerCase()
        return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable
    }

    function handler(event) {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
            event.preventDefault()
            focusSearch()
        } else if (event.key === '/' && ! isTyping(event.target)) {
            event.preventDefault()
            focusSearch()
        }
    }

    onMounted(() => document.addEventListener('keydown', handler))
    onBeforeUnmount(() => document.removeEventListener('keydown', handler))
}
