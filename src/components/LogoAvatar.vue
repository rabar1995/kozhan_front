<template>
    <span class="inline-flex rounded-full overflow-hidden items-center justify-center shrink-0 font-bold text-white"
        :class="size === 'lg' ? 'w-11 h-11 text-base' : 'w-9 h-9 text-sm'"
        :style="`background: ${colorFor(name)}`">
        <img v-if="url && ! failed" :src="url" :alt="name" class="w-full h-full object-cover bg-white" @error="failed = true" />
        <span v-else>{{ (name || '?').trim().charAt(0).toUpperCase() }}</span>
    </span>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    name: { type: String, default: '' },
    url: { type: String, default: '' },
    size: { type: String, default: '' },
})

const failed = ref(false)

watch(() => props.url, () => { failed.value = false })

function colorFor(name) {
    const colors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6']
    let hash = 0
    for (const ch of name || '') hash = (hash + ch.charCodeAt(0)) % colors.length
    return colors[hash]
}
</script>
