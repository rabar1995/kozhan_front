<template>
    <section class="card card-pad">
        <h3 class="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-4">
            <span v-if="step" class="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{{ step }}</span>
            {{ title }}
        </h3>
        <slot />
    </section>
</template>

<script setup>
defineProps({
    title: { type: String, required: true },
    step: { type: [Number, String], default: null },
})
</script>
