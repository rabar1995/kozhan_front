<template>
    <Teleport to="body">
        <Transition name="modal-backdrop">
            <div v-if="open" class="fixed inset-0 bg-black/50 backdrop-blur-[2px]" :style="{ zIndex }" @click="$emit('close')" />
        </Transition>
        <Transition name="modal">
            <div v-if="open" class="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none" :style="{ zIndex }">
                <div
                    ref="dialogRef"
                    class="relative w-full pointer-events-auto rounded-t-2xl sm:rounded-xl bg-white shadow-2xl"
                    :class="[maxWidth, 'max-h-[92vh] sm:max-h-[85vh]']"
                    role="dialog"
                    aria-modal="true"
                    @keydown.esc="$emit('close')"
                    @keydown.tab="trapFocus"
                >
                    <div class="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl sm:rounded-t-xl z-10">
                        <h3 class="text-base sm:text-lg font-semibold text-gray-900 truncate pe-4">{{ title }}</h3>
                        <button
                            class="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
                            aria-label="Close"
                            @click="$emit('close')"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div class="px-5 sm:px-6 py-4 overflow-y-auto" style="max-height: calc(92vh - 65px);">
                        <slot />
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
    open: { type: Boolean, default: false },
    title: { type: String, default: '' },
    maxWidth: { type: String, default: 'sm:max-w-lg' },
    zIndex: { type: Number, default: 50 },
})

defineEmits(['close'])

const dialogRef = ref(null)

// ── Body scroll lock ──
watch(() => props.open, (isOpen) => {
    if (isOpen) {
        document.body.style.overflow = 'hidden'
        // Focus the dialog after it mounts
        nextTick(() => {
            const firstFocusable = dialogRef.value?.querySelector(
                'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'
            )
            firstFocusable?.focus()
        })
    } else {
        document.body.style.overflow = ''
    }
})

onBeforeUnmount(() => {
    document.body.style.overflow = ''
})

// ── Focus trapping ──
function trapFocus(event) {
    if (!dialogRef.value) return

    const focusable = dialogRef.value.querySelectorAll(
        'button:not(:disabled), [href], input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
    )
    if (!focusable.length) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (event.shiftKey) {
        if (document.activeElement === first) {
            event.preventDefault()
            last.focus()
        }
    } else {
        if (document.activeElement === last) {
            event.preventDefault()
            first.focus()
        }
    }
}
</script>
