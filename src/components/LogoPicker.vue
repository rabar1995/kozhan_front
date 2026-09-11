<template>
    <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
            <img v-if="value && ! imgFailed" :src="value" class="w-full h-full object-cover" @error="imgFailed = true" />
            <span v-else class="text-sm font-bold text-gray-400">{{ initial }}</span>
        </div>
        <div class="min-w-0 flex-1">
            <label class="block text-xs font-medium text-gray-500 mb-1">{{ $t('logos.title') }}</label>
            <div class="flex gap-2">
                <input v-model="value" type="url" :placeholder="$t('logos.urlPlaceholder')" class="flex-1 min-w-0 rounded-lg border border-gray-300 px-2 py-1.5 text-xs" />
                <button
                    v-if="value"
                    type="button"
                    class="px-2 py-1 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                    :title="$t('logos.remove')"
                    @click="value = ''"
                >&times;</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
    name: { type: String, default: '' },
    modelValue: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const imgFailed = ref(false)

const value = computed({
    get: () => props.modelValue,
    set: (v) => {
        imgFailed.value = false
        emit('update:modelValue', v || '')
    },
})

const initial = computed(() => (props.name || '?').trim().charAt(0).toUpperCase())
</script>
