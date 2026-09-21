<template>
    <Teleport to="body">
        <!-- Backdrop -->
        <Transition name="modal-backdrop">
            <div v-if="state.open" class="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[110]" @click="reject" />
        </Transition>

        <!-- Dialog -->
        <Transition name="confirm">
            <div v-if="state.open" class="fixed inset-0 flex items-center justify-center p-4 z-[110]">
                <div class="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <!-- Color accent bar -->
                    <div class="h-1" :class="accentColor" />

                    <div class="p-6">
                        <!-- Icon + Title -->
                        <div class="flex items-start gap-4 mb-4">
                            <div
                                class="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
                                :class="iconBg"
                            >
                                <!-- Danger -->
                                <svg v-if="state.type === 'danger'" class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                                <!-- Warning -->
                                <svg v-else-if="state.type === 'warning'" class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                </svg>
                                <!-- Info -->
                                <svg v-else class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                </svg>
                            </div>
                            <div class="min-w-0">
                                <h3 class="text-base font-bold text-gray-900">{{ state.title }}</h3>
                                <p class="text-sm text-gray-600 mt-1 leading-relaxed">{{ state.message }}</p>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex justify-end gap-2.5 pt-2">
                            <button
                                class="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                                @click="reject"
                            >
                                {{ state.cancelText }}
                            </button>
                            <button
                                class="px-4 py-2 text-sm font-bold rounded-xl text-white shadow-xs transition-colors"
                                :class="confirmBtnClass"
                                @click="accept"
                            >
                                {{ state.confirmText }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useConfirm } from '../composables/useConfirm'

const { state, accept, reject } = useConfirm()

const accentColor = computed(() => {
    switch (state.type) {
        case 'danger':  return 'bg-gradient-to-r from-red-400 to-red-600'
        case 'warning': return 'bg-gradient-to-r from-amber-400 to-amber-600'
        default:        return 'bg-gradient-to-r from-blue-400 to-blue-600'
    }
})

const iconBg = computed(() => {
    switch (state.type) {
        case 'danger':  return 'bg-red-50'
        case 'warning': return 'bg-amber-50'
        default:        return 'bg-blue-50'
    }
})

const confirmBtnClass = computed(() => {
    switch (state.type) {
        case 'danger':  return 'bg-red-600 hover:bg-red-700'
        case 'warning': return 'bg-amber-600 hover:bg-amber-700'
        default:        return 'bg-blue-600 hover:bg-blue-700'
    }
})
</script>
