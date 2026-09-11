<template>
    <div class="space-y-4">
        <!-- ═══════ URGENT QUEUE BANNER ═══════ -->
        <div class="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0 ring-1 ring-amber-500/30">
                    <svg class="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <h2 class="font-bold text-gray-900 text-sm sm:text-base">{{ $t('nav.pendingPayouts') }}</h2>
                        <span class="text-xs font-black px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                            {{ store.items.length }}
                        </span>
                    </div>
                    <p class="text-xs text-gray-500 mt-0.5">{{ $t('remittances.urgentQueue') }}</p>
                </div>
            </div>

            <button
                class="px-3.5 py-1.5 rounded-xl bg-white border border-amber-200 text-amber-800 text-xs font-semibold hover:bg-amber-50 transition-colors shadow-2xs self-start sm:self-auto flex items-center gap-1.5"
                @click="load(1)"
            >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span>{{ $t('common.apply') }}</span>
            </button>
        </div>

        <!-- ═══════ REMITTANCE TABLE / CARDS ═══════ -->
        <RemittanceTable :rows="store.items" :loading="store.loading" @refresh="load(1)" />
        <Pagination :meta="store.meta" @page="load" />
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRemittanceStore } from '../stores/remittance'
import RemittanceTable from '../components/RemittanceTable.vue'
import Pagination from '../components/Pagination.vue'

const store = useRemittanceStore()

async function load(page = 1) {
    await store.fetchPending({ page })
}

onMounted(() => load())
</script>
