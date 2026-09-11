<template>
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-gray-700">{{ $t('dashboard.liveRates') }}</h3>
            <router-link v-if="isOwner" to="/exchange-rates"
                class="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                {{ $t('dashboard.viewAll') }} →
            </router-link>
        </div>

        <div v-if="loading" class="space-y-3">
            <div v-for="i in 2" :key="i" class="flex justify-between items-center py-2">
                <div class="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                <div class="flex gap-4">
                    <div class="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                    <div class="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                </div>
            </div>
        </div>

        <div v-else-if="rates.length" class="space-y-1">
            <div v-for="rate in rates" :key="rate.id"
                class="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div class="flex items-center gap-2">
                    <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                        {{ rate.from_currency?.code }}
                    </span>
                    <svg class="w-3.5 h-3.5 text-gray-300 rtl:rotate-180" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 text-purple-600 text-[10px] font-bold">
                        {{ rate.to_currency?.code }}
                    </span>
                </div>
                <div class="flex items-center gap-4 text-sm tabular-nums">
                    <div class="text-center">
                        <p class="text-[10px] text-gray-400 uppercase">{{ $t('rates.buy') }}</p>
                        <p class="font-semibold text-emerald-600">{{ rate.buy_rate }}</p>
                    </div>
                    <div class="text-center">
                        <p class="text-[10px] text-gray-400 uppercase">{{ $t('rates.sell') }}</p>
                        <p class="font-semibold text-red-600">{{ rate.sell_rate }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-6 text-center">
            <svg class="w-10 h-10 text-gray-200 mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            <p class="text-sm text-gray-400">{{ $t('dashboard.noRates') }}</p>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { api } from '../api/client'

const auth = useAuthStore()
const isOwner = auth.isOwner

const rates = ref([])
const loading = ref(false)

async function load() {
    loading.value = true
    try {
        const res = await api.get('/exchange-rates')
        rates.value = res.data.data || []
    } catch { /* handled */ } finally {
        loading.value = false
    }
}

defineExpose({ load })

onMounted(() => load())
</script>
