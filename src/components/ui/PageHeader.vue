<template>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-5">
        <p v-if="text" class="text-sm text-gray-500 dark:text-slate-400 max-w-2xl">{{ text }}</p>
        <span v-else />
        <div v-if="$slots.default" class="flex flex-wrap items-center gap-2 shrink-0">
            <slot />
        </div>
    </div>
</template>

<script setup>
/**
 * Page intro + main actions. The page title itself lives in the app
 * header, so it is not repeated here.
 */
defineProps({
    text: { type: String, default: '' },
})
</script>
