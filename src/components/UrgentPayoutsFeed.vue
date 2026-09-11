<template>
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-gray-700">{{ $t('dashboard.urgentFeed') }}</h3>
            <router-link to="/remittances/pending"
                class="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                {{ $t('dashboard.viewAll') }} →
            </router-link>
        </div>

        <div v-if="loading" class="space-y-3">
            <div v-for="i in 3" :key="i" class="flex justify-between items-center py-2">
                <div class="space-y-1.5">
                    <div class="h-4 w-36 bg-gray-100 rounded animate-pulse" />
                    <div class="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                </div>
                <div class="h-7 w-20 bg-gray-100 rounded-lg animate-pulse" />
            </div>
        </div>

        <div v-else-if="pendingRows.length" class="space-y-1">
            <div v-for="row in pendingRows" :key="row.id"
                class="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-amber-50/50 transition-colors group">
                <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 text-sm">
                        <span class="font-semibold text-gray-800 truncate">{{ row.receiver_name }}</span>
                        <span class="text-xs text-gray-400">←</span>
                        <span class="text-gray-500 truncate text-xs">{{ row.sender_name }}</span>
                    </div>
                    <div class="flex items-center gap-2 mt-0.5">
                        <span class="text-xs font-medium text-amber-600">{{ row.remittance_number }}</span>
                        <span class="text-[10px] text-gray-400">{{ elapsedText(row.created_at) }}</span>
                    </div>
                </div>
                <div class="flex items-center gap-2 shrink-0 ms-3">
                    <span class="text-sm font-bold text-gray-900 tabular-nums">
                        {{ money(row.receive_amount, row.receive_currency?.code) }}
                    </span>
                    <button
                        v-if="can('complete-remittance')"
                        class="opacity-0 group-hover:opacity-100 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all duration-200 whitespace-nowrap"
                        @click="$emit('complete', row)"
                    >
                        {{ $t('dashboard.completeNow') }}
                    </button>
                </div>
            </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-6 text-center">
            <svg class="w-10 h-10 text-gray-200 mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm text-gray-400">{{ $t('dashboard.noPending') }}</p>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '../api/client'
import { usePermissions } from '../composables/usePermissions'
import { money } from '../utils/format'

const { t } = useI18n()
const { can } = usePermissions()

defineEmits(['complete'])

const pendingRows = ref([])
const loading = ref(false)

function elapsedText(dateStr) {
    if (!dateStr) return ''
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
    if (mins < 1) return '< 1 min'
    if (mins > 1440) return `${Math.floor(mins / 1440)}d`
    if (mins > 60) return `${Math.floor(mins / 60)}h`
    return t('dashboard.elapsed', { mins })
}

async function load() {
    loading.value = true
    try {
        const res = await api.get('/remittances/pending', { params: { per_page: 5 } })
        pendingRows.value = res.data.data?.data || res.data.data || []
    } catch { /* handled */ } finally {
        loading.value = false
    }
}

defineExpose({ load })

onMounted(() => load())
</script>
