<template>
    <div class="flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm" :class="tone.box" role="alert">
        <svg class="w-5 h-5 shrink-0 mt-px" :class="tone.icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" :d="tone.path" />
        </svg>
        <div class="min-w-0 flex-1"><slot /></div>
        <button
            v-if="dismissible"
            type="button"
            class="-m-1 p-1 rounded-lg opacity-60 hover:opacity-100 shrink-0"
            :aria-label="$t('common.close')"
            @click="$emit('dismiss')"
        >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    type: { type: String, default: 'error' }, // error | success | warning | info
    dismissible: { type: Boolean, default: false },
})

defineEmits(['dismiss'])

const TONES = {
    error: {
        box: 'bg-red-50 border-red-200 text-red-800',
        icon: 'text-red-500',
        path: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z',
    },
    success: {
        box: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        icon: 'text-emerald-500',
        path: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    warning: {
        box: 'bg-amber-50 border-amber-200 text-amber-800',
        icon: 'text-amber-500',
        path: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
    },
    info: {
        box: 'bg-blue-50 border-blue-200 text-blue-800',
        icon: 'text-blue-500',
        path: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
    },
}

const tone = computed(() => TONES[props.type] || TONES.error)
</script>
