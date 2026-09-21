<template>
    <Teleport to="body">
        <div class="fixed top-4 end-4 z-[100] flex flex-col gap-2 toast-container pointer-events-none" style="max-width: 380px;">
            <TransitionGroup name="toast">
                <div
                    v-for="toast in toasts"
                    :key="toast.id"
                    class="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md text-sm font-medium cursor-pointer"
                    :class="toastClasses(toast.type)"
                    @click="removeToast(toast.id)"
                >
                    <!-- Icon -->
                    <div class="shrink-0 mt-0.5">
                        <!-- Success -->
                        <svg v-if="toast.type === 'success'" class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <!-- Error -->
                        <svg v-else-if="toast.type === 'error'" class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        <!-- Warning -->
                        <svg v-else-if="toast.type === 'warning'" class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        <!-- Info -->
                        <svg v-else class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                    </div>

                    <!-- Message -->
                    <p class="flex-1 leading-snug">{{ toast.message }}</p>

                    <!-- Close button -->
                    <button
                        class="shrink-0 p-0.5 rounded-md hover:bg-black/5 transition-colors"
                        @click.stop="removeToast(toast.id)"
                        aria-label="Dismiss"
                    >
                        <svg class="w-4 h-4 opacity-50" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <!-- Progress bar -->
                    <div class="absolute bottom-0 start-0 h-0.5 rounded-b-xl transition-all" :class="progressColor(toast.type)" :style="{ animation: `shrink ${toast.duration || 4000}ms linear forwards` }" />
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>

<script setup>
import { useToast } from '../composables/useToast'

const { toasts, removeToast } = useToast()

function toastClasses(type) {
    switch (type) {
        case 'success': return 'bg-white/95 border-emerald-200 text-emerald-900'
        case 'error':   return 'bg-white/95 border-red-200 text-red-900'
        case 'warning': return 'bg-white/95 border-amber-200 text-amber-900'
        case 'info':    return 'bg-white/95 border-blue-200 text-blue-900'
        default:        return 'bg-white/95 border-gray-200 text-gray-900'
    }
}

function progressColor(type) {
    switch (type) {
        case 'success': return 'bg-emerald-500'
        case 'error':   return 'bg-red-500'
        case 'warning': return 'bg-amber-500'
        case 'info':    return 'bg-blue-500'
        default:        return 'bg-gray-400'
    }
}
</script>

<style scoped>
@keyframes shrink {
    from { width: 100%; }
    to   { width: 0%; }
}
</style>
