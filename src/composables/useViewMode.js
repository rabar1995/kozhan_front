import { ref, watch } from 'vue'

/**
 * Cards/Table preference, remembered per list. Phones default to
 * cards, wide screens to the table.
 */
export function useViewMode(key) {
    const storageKey = `kozhan_view_${key}`
    const fallback = typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'table' : 'cards'
    const stored = localStorage.getItem(storageKey)
    const mode = ref(stored === 'cards' || stored === 'table' ? stored : fallback)

    watch(mode, (v) => localStorage.setItem(storageKey, v))

    return mode
}
