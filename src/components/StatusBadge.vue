<template>
    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="classes">
        {{ label }}
    </span>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { statusClass, classificationClass, directionClass } from '../utils/format'

const props = defineProps({
    value: { type: String, required: true },
})

const { t, te } = useI18n()

const classes = computed(() => {
    if (statusClass[props.value]) return statusClass[props.value]
    if (classificationClass[props.value]) return classificationClass[props.value]
    if (directionClass[props.value]) return directionClass[props.value]
    return 'bg-gray-100 text-gray-700'
})

const label = computed(() => {
    const key = `status.${props.value}`
    return te(key) ? t(key) : props.value.charAt(0).toUpperCase() + props.value.slice(1)
})
</script>
