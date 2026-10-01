<template>
    <div class="inline-flex items-center rounded-xl bg-gray-100 p-0.5 border border-gray-200/80 shrink-0" role="group">
        <button
            v-for="opt in options"
            :key="opt.value"
            type="button"
            class="inline-flex items-center justify-center w-10 h-10 sm:w-9 sm:h-9 rounded-lg transition-all"
            :class="modelValue === opt.value ? 'bg-white text-indigo-600 shadow-xs' : 'text-gray-500 hover:text-gray-800'"
            :title="$t(opt.label)"
            :aria-label="$t(opt.label)"
            :aria-pressed="modelValue === opt.value"
            @click="$emit('update:modelValue', opt.value)"
        >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" :d="opt.icon" />
            </svg>
        </button>
    </div>
</template>

<script setup>
defineProps({
    modelValue: { type: String, default: 'cards' },
})

defineEmits(['update:modelValue'])

const options = [
    {
        value: 'cards',
        label: 'common.cards',
        icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z',
    },
    {
        value: 'table',
        label: 'common.table',
        icon: 'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 011.875 1.875v13.5a1.875 1.875 0 01-1.875 1.875H5.625A1.875 1.875 0 013.75 19.875V6.375A1.875 1.875 0 015.625 4.5z',
    },
]
</script>
