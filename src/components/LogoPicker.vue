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
                    type="button"
                    class="px-2.5 py-1.5 text-xs rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 font-medium disabled:opacity-50 whitespace-nowrap shrink-0"
                    :title="$t('logos.upload')"
                    :disabled="uploading"
                    @click="fileInput?.click()"
                >
                    <svg v-if="uploading" class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-.75m-6-9.75h.008v.008H9V7.5zm9.75 1.5v11.25A2.25 2.25 0 0116.5 22.5H3.75A2.25 2.25 0 011.5 20.25V9A2.25 2.25 0 013.75 6.75h11.25" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 7.5v-.75A2.25 2.25 0 0014.25 4.5H13.5m3 3l3-3m0 0l-3-3m3 3h-1.5M21 12v.008V12z" />
                    </svg>
                </button>
                <button
                    v-if="value"
                    type="button"
                    class="px-2 py-1 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                    :title="$t('logos.remove')"
                    @click="value = ''"
                >&times;</button>
            </div>
            <p v-if="uploadError" class="text-xs text-red-600 mt-1">{{ uploadError }}</p>
        </div>
        <input
            ref="fileInput"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            class="hidden"
            @change="onFileChange"
        />
    </div>
</template>

<script setup>
import { computed, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { api, apiError } from '../api/client'

const props = defineProps({
    name: { type: String, default: '' },
    modelValue: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()

const imgFailed = ref(false)
const uploading = ref(false)
const uploadError = ref('')
const fileInput = useTemplateRef('fileInput')

const value = computed({
    get: () => props.modelValue,
    set: (v) => {
        imgFailed.value = false
        emit('update:modelValue', v || '')
    },
})

const initial = computed(() => (props.name || '?').trim().charAt(0).toUpperCase())

async function onFileChange(event) {
    const file = event.target.files?.[0]
    uploadError.value = ''
    event.target.value = ''
    if (! file) return

    if (file.size > 2 * 1024 * 1024) {
        uploadError.value = t('logos.tooLarge')
        return
    }

    uploading.value = true
    try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await api.post('/uploads/logo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        value.value = res.data?.data?.url || ''
    } catch (e) {
        const parsed = apiError(e)
        uploadError.value = parsed.message + (parsed.errors?.file ? ` — ${parsed.errors.file[0]}` : '')
    } finally {
        uploading.value = false
    }
}
</script>
