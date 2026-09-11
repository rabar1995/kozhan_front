<template>
    <div v-if="meta && meta.last_page > 1" class="flex items-center justify-between mt-4">
        <p class="text-sm text-gray-500">
            {{ $t('common.pageInfo', { page: meta.current_page, last: meta.last_page, total: meta.total }) }}
        </p>
        <div class="flex gap-2">
            <button
                class="px-3 py-1 text-sm border rounded-md disabled:opacity-40 hover:bg-gray-50"
                :disabled="meta.current_page <= 1"
                @click="$emit('page', meta.current_page - 1)"
            >
                {{ $t('common.previous') }}
            </button>
            <button
                class="px-3 py-1 text-sm border rounded-md disabled:opacity-40 hover:bg-gray-50"
                :disabled="meta.current_page >= meta.last_page"
                @click="$emit('page', meta.current_page + 1)"
            >
                {{ $t('common.next') }}
            </button>
        </div>
    </div>
</template>

<script setup>
defineProps({
    meta: { type: Object, default: null },
})

defineEmits(['page'])
</script>
