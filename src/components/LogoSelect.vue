<template>
    <div class="relative" @keydown.esc="open = false">
        <button
            type="button"
            class="w-full flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:border-gray-400"
            @click="open = ! open"
        >
            <LogoAvatar v-if="selected" :name="labelFor(selected)" :url="urlFor(selected)" />
            <span :class="selected ? '' : 'text-gray-400'" class="truncate">{{ selected ? labelFor(selected) : placeholder }}</span>
            <svg class="w-4 h-4 ms-auto text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        </button>

        <div v-if="open" class="absolute z-30 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
            <button
                v-for="item in options"
                :key="valueKey ? item[valueKey] : item.id"
                type="button"
                class="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-indigo-50"
                :class="modelValue === (valueKey ? item[valueKey] : item.id) ? 'bg-indigo-50 font-medium' : ''"
                @click="pick(item)"
            >
                <LogoAvatar :name="labelFor(item)" :url="urlFor(item)" />
                <span class="truncate text-gray-700">{{ labelFor(item) }}</span>
                <span v-if="sublabelKey && item[sublabelKey]" class="ms-auto text-xs text-gray-400">{{ item[sublabelKey] }}</span>
            </button>
            <p v-if="! options.length" class="px-3 py-4 text-center text-sm text-gray-400">{{ emptyText }}</p>
        </div>

        <div v-if="open" class="fixed inset-0 z-20" @click="open = false" />
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import LogoAvatar from './LogoAvatar.vue'

const props = defineProps({
    options: { type: Array, default: () => [] },
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    emptyText: { type: String, default: '' },
    labelKey: { type: String, default: 'name' },
    sublabelKey: { type: String, default: '' },
    urlKey: { type: String, default: 'logo_url' },
    valueKey: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const open = ref(false)

const valueField = computed(() => props.valueKey || 'id')

const selected = computed(() =>
    props.options.find(o => o[valueField.value] === props.modelValue) || null)

function labelFor(item) {
    return item[props.labelKey] ?? ''
}

function urlFor(item) {
    return item[props.urlKey] || ''
}

function pick(item) {
    open.value = false
    emit('update:modelValue', item[valueField.value])
}
</script>
