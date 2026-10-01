<template>
    <div class="relative" @keydown.esc="open = false">
        <button
            :id="id"
            type="button"
            class="form-input flex items-center gap-2 text-start"
            :aria-expanded="open"
            aria-haspopup="listbox"
            @click="toggle"
        >
            <LogoAvatar v-if="selected" :name="labelFor(selected)" :url="urlFor(selected)" />
            <span class="truncate" :class="selected ? 'text-gray-900' : 'text-gray-400'">{{ selected ? labelFor(selected) : placeholder }}</span>
            <span v-if="selected && sublabelKey && selected[sublabelKey]" class="text-xs text-gray-400 truncate hidden sm:inline">{{ selected[sublabelKey] }}</span>
            <svg class="w-4 h-4 ms-auto text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        </button>

        <div v-if="open" class="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <div v-if="options.length > 6" class="p-2 border-b border-gray-100">
                <input
                    ref="searchRef"
                    v-model="query"
                    type="search"
                    class="form-input"
                    :placeholder="$t('common.search')"
                    @keydown.enter.prevent="filtered[0] && pick(filtered[0])"
                />
            </div>
            <div class="max-h-64 overflow-y-auto" role="listbox">
                <button
                    v-for="item in filtered"
                    :key="valueOf(item)"
                    type="button"
                    role="option"
                    :aria-selected="modelValue === valueOf(item)"
                    class="w-full flex items-center gap-2 px-3 min-h-11 text-sm text-start hover:bg-indigo-50"
                    :class="modelValue === valueOf(item) ? 'bg-indigo-50 font-medium' : ''"
                    @click="pick(item)"
                >
                    <LogoAvatar :name="labelFor(item)" :url="urlFor(item)" />
                    <span class="truncate text-gray-800">{{ labelFor(item) }}</span>
                    <span v-if="sublabelKey && item[sublabelKey]" class="ms-auto text-xs text-gray-400 truncate">{{ item[sublabelKey] }}</span>
                </button>
                <p v-if="!filtered.length" class="px-3 py-4 text-center text-sm text-gray-400">{{ emptyText }}</p>
            </div>
        </div>

        <div v-if="open" class="fixed inset-0 z-20" @click="open = false" />
    </div>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'
import LogoAvatar from './LogoAvatar.vue'

const props = defineProps({
    id: { type: String, default: undefined },
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
const query = ref('')
const searchRef = ref(null)

const valueOf = (item) => item[props.valueKey || 'id']
const labelFor = (item) => item[props.labelKey] ?? ''
const urlFor = (item) => item[props.urlKey] || ''

const selected = computed(() => props.options.find((o) => valueOf(o) === props.modelValue) || null)

const filtered = computed(() => {
    const q = query.value.trim().toLowerCase()
    if (! q) return props.options
    return props.options.filter((o) => String(labelFor(o)).toLowerCase().includes(q)
        || String(o[props.sublabelKey] ?? '').toLowerCase().includes(q))
})

function toggle() {
    open.value = ! open.value
    query.value = ''
    if (open.value) nextTick(() => searchRef.value?.focus())
}

function pick(item) {
    open.value = false
    emit('update:modelValue', valueOf(item))
}
</script>
