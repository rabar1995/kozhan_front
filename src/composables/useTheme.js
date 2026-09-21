import { ref } from 'vue'

const STORAGE_KEY = 'kozhan-theme'

const isDark = ref(false)
const themeMode = ref('system') // 'light' | 'dark' | 'system'

function getSystemPreference() {
    if (typeof window === 'undefined') return false
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme() {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    if (isDark.value) {
        root.classList.add('dark')
        root.style.colorScheme = 'dark'
    } else {
        root.classList.remove('dark')
        root.style.colorScheme = 'light'
    }
}

// Initialize from localStorage or system preference
function initTheme() {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark') {
        themeMode.value = 'dark'
        isDark.value = true
    } else if (stored === 'light') {
        themeMode.value = 'light'
        isDark.value = false
    } else {
        themeMode.value = 'system'
        isDark.value = getSystemPreference()
    }
    applyTheme()
}

function setTheme(mode) {
    themeMode.value = mode
    if (mode === 'dark') {
        isDark.value = true
        localStorage.setItem(STORAGE_KEY, 'dark')
    } else if (mode === 'light') {
        isDark.value = false
        localStorage.setItem(STORAGE_KEY, 'light')
    } else {
        // system mode
        isDark.value = getSystemPreference()
        localStorage.removeItem(STORAGE_KEY)
    }
    applyTheme()
}

function toggleTheme() {
    if (isDark.value) {
        setTheme('light')
    } else {
        setTheme('dark')
    }
}

// Listen to OS system theme changes when in 'system' mode
if (typeof window !== 'undefined' && window.matchMedia) {
    try {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (themeMode.value === 'system') {
                isDark.value = e.matches
                applyTheme()
            }
        })
    } catch (_) {}
}

/**
 * Theme composable for dark/light/system mode.
 */
export function useTheme() {
    return {
        isDark,
        themeMode,
        setTheme,
        toggleTheme,
        initTheme,
    }
}
