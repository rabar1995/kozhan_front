import { onMounted, onBeforeUnmount } from 'vue'

/**
 * Global keyboard shortcuts composable.
 * - Escape: closes modals/drawers (handled in Modal.vue)
 * - Ctrl+K or /: focuses search input if present
 */
export function useKeyboardShortcuts() {
    function handler(event) {
        // Ctrl+K — focus search
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault()
            const searchInput = document.querySelector('input[type="text"][placeholder*="Search"], input[type="text"][placeholder*="search"], input[type="text"][placeholder*="بحث"]')
            if (searchInput) {
                searchInput.focus()
                searchInput.select()
            }
        }

        // "/" key — focus search (unless user is already typing in an input)
        if (event.key === '/' && !isTypingInInput(event.target)) {
            event.preventDefault()
            const searchInput = document.querySelector('input[type="text"][placeholder*="Search"], input[type="text"][placeholder*="search"], input[type="text"][placeholder*="بحث"]')
            if (searchInput) {
                searchInput.focus()
                searchInput.select()
            }
        }
    }

    function isTypingInInput(el) {
        if (!el) return false
        const tag = el.tagName.toLowerCase()
        return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable
    }

    onMounted(() => {
        document.addEventListener('keydown', handler)
    })

    onBeforeUnmount(() => {
        document.removeEventListener('keydown', handler)
    })
}
