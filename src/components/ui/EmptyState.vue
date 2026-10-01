<template>
    <div class="card px-6 py-10 sm:py-14 text-center">
        <div class="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-400 mx-auto flex items-center justify-center mb-3">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" :d="icon || defaultIcon" />
            </svg>
        </div>
        <h3 class="text-sm font-semibold text-gray-800">{{ title }}</h3>
        <p v-if="text" class="text-sm text-gray-500 mt-1 max-w-sm mx-auto">{{ text }}</p>
        <div v-if="$slots.default" class="mt-5 flex flex-wrap justify-center gap-2">
            <slot />
        </div>
    </div>
</template>

<script setup>
defineProps({
    title: { type: String, required: true },
    text: { type: String, default: '' },
    icon: { type: String, default: '' },
})

const defaultIcon = 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z'
</script>
