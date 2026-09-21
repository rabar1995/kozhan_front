<template>
    <div v-if="meta && meta.last_page > 1" class="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
        <p class="text-xs text-gray-500 order-2 sm:order-1">
            {{ $t('common.pageInfo', { page: meta.current_page, last: meta.last_page, total: meta.total }) }}
        </p>
        <div class="flex items-center gap-1 order-1 sm:order-2">
            <!-- Previous -->
            <button
                class="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                :disabled="meta.current_page <= 1"
                :aria-label="$t('common.previous')"
                @click="$emit('page', meta.current_page - 1)"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>

            <!-- Page numbers -->
            <template v-for="p in pages" :key="p">
                <span v-if="p === '...'" class="px-1.5 py-1 text-xs text-gray-400 select-none">…</span>
                <button
                    v-else
                    class="min-w-[32px] px-2 py-1.5 text-xs font-medium rounded-lg border transition-all"
                    :class="p === meta.current_page
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'"
                    @click="$emit('page', p)"
                >
                    {{ p }}
                </button>
            </template>

            <!-- Next -->
            <button
                class="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                :disabled="meta.current_page >= meta.last_page"
                :aria-label="$t('common.next')"
                @click="$emit('page', meta.current_page + 1)"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    meta: { type: Object, default: null },
})

defineEmits(['page'])

const pages = computed(() => {
    if (!props.meta) return []
    const { current_page: current, last_page: last } = props.meta
    if (last <= 7) {
        return Array.from({ length: last }, (_, i) => i + 1)
    }

    const items = []
    // Always show first page
    items.push(1)

    if (current > 3) {
        items.push('...')
    }

    // Pages around current
    const start = Math.max(2, current - 1)
    const end = Math.min(last - 1, current + 1)
    for (let i = start; i <= end; i++) {
        items.push(i)
    }

    if (current < last - 2) {
        items.push('...')
    }

    // Always show last page
    items.push(last)

    return items
})
</script>
