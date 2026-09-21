<template>
    <div ref="root" class="relative">
        <button
            type="button"
            class="text-sm px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors"
            :class="dark
                ? 'border-white/20 text-slate-200 hover:bg-white/10'
                : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'"
            @click="open = !open"
        >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0c2.5-2.5 3.5-5.5 3.5-9S14.5 5.5 12 3m0 18c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3M3.5 9h17m-17 6h17" />
            </svg>
            {{ current?.label }}
        </button>
        <div
            v-if="open"
            class="absolute end-0 mt-1.5 w-36 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-100 dark:border-slate-700 z-50 overflow-hidden"
        >
            <button
                v-for="l in locales"
                :key="l.code"
                type="button"
                class="w-full text-start px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-700/60 transition-colors"
                :class="l.code === current?.code ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-slate-300'"
                @click="choose(l.code)"
            >
                {{ l.label }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { i18n, locales, setLocale } from '../i18n'

defineProps({
    dark: { type: Boolean, default: false },
})

const open = ref(false)
const root = ref(null)
const current = computed(() => locales.find((l) => l.code === i18n.global.locale.value))

function choose(code) {
    setLocale(code)
    open.value = false
}

function onClickOutside(e) {
    if (root.value && ! root.value.contains(e.target)) open.value = false
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>
