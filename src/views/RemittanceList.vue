<template>
    <div class="space-y-4">
        <!-- ═══════ TOP HEADER & FILTERS CARD ═══════ -->
        <div class="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <!-- Top Row: Title + Action Buttons -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div class="flex items-center gap-2.5">
                    <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                        </svg>
                    </div>
                    <div>
                        <h2 class="font-bold text-gray-900 text-sm sm:text-base">{{ $t('nav.allRemittances') }}</h2>
                        <p class="text-xs text-gray-400 mt-0.5">{{ $t('remittances.detailsFallback') }}</p>
                    </div>
                </div>

                <!-- Quick Action Buttons -->
                <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <router-link
                        v-if="can('create-remittance')"
                        to="/remittances/incoming"
                        class="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow-xs transition-colors"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                        </svg>
                        <span>{{ $t('filters.newIncoming') }}</span>
                    </router-link>

                    <router-link
                        v-if="can('create-remittance')"
                        to="/remittances/outgoing"
                        class="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-xs transition-colors"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                        </svg>
                        <span>{{ $t('filters.newOutgoing') }}</span>
                    </router-link>
                </div>
            </div>

            <!-- Filters Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <!-- Direction -->
                <div>
                    <label class="block text-xs font-semibold text-gray-500 mb-1">{{ $t('filters.direction') }}</label>
                    <select
                        v-model="filters.direction"
                        class="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs sm:text-sm bg-gray-50/50 hover:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                    >
                        <option value="">{{ $t('common.all') }}</option>
                        <option value="incoming">{{ $t('filters.incoming') }}</option>
                        <option value="outgoing">{{ $t('filters.outgoing') }}</option>
                    </select>
                </div>

                <!-- Status -->
                <div>
                    <label class="block text-xs font-semibold text-gray-500 mb-1">{{ $t('filters.status') }}</label>
                    <select
                        v-model="filters.status"
                        class="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs sm:text-sm bg-gray-50/50 hover:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                    >
                        <option value="">{{ $t('common.all') }}</option>
                        <option value="pending">{{ $t('filters.pending') }}</option>
                        <option value="completed">{{ $t('filters.completed') }}</option>
                        <option value="cancelled">{{ $t('filters.cancelled') }}</option>
                    </select>
                </div>

                <!-- Agent -->
                <div>
                    <label class="block text-xs font-semibold text-gray-500 mb-1">{{ $t('filters.agent') }}</label>
                    <select
                        v-model="filters.agent_id"
                        class="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs sm:text-sm bg-gray-50/50 hover:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                    >
                        <option value="">{{ $t('filters.allAgents') }}</option>
                        <option v-for="agent in agentStore.agents" :key="agent.id" :value="agent.id">
                            {{ agent.name }}
                        </option>
                    </select>
                </div>

                <!-- Date From -->
                <div>
                    <label class="block text-xs font-semibold text-gray-500 mb-1">{{ $t('filters.from') }}</label>
                    <input
                        v-model="filters.date_from"
                        type="date"
                        class="w-full rounded-xl border border-gray-200 px-3 py-1.5 text-xs sm:text-sm bg-gray-50/50 hover:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                    />
                </div>

                <!-- Date To & Apply -->
                <div>
                    <label class="block text-xs font-semibold text-gray-500 mb-1">{{ $t('filters.to') }}</label>
                    <div class="flex items-center gap-2">
                        <input
                            v-model="filters.date_to"
                            type="date"
                            class="w-full rounded-xl border border-gray-200 px-3 py-1.5 text-xs sm:text-sm bg-gray-50/50 hover:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                        />
                        <button
                            class="px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-xs transition-colors shrink-0"
                            @click="load(1)"
                        >
                            {{ $t('common.apply') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ═══════ REMITTANCES LIST ═══════ -->
        <RemittanceTable :rows="store.items" :loading="store.loading" @refresh="load(filters.page || 1)" />
        <Pagination :meta="store.meta" @page="load" />
    </div>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import { useRemittanceStore } from '../stores/remittance'
import { useAgentStore } from '../stores/agent'
import { usePermissions } from '../composables/usePermissions'
import RemittanceTable from '../components/RemittanceTable.vue'
import Pagination from '../components/Pagination.vue'

const store = useRemittanceStore()
const agentStore = useAgentStore()
const { can } = usePermissions()

const filters = reactive({ direction: '', status: '', agent_id: '', date_from: '', date_to: '', page: 1 })

async function load(page = 1) {
    filters.page = page
    const params = { page }
    for (const key of ['direction', 'status', 'agent_id', 'date_from', 'date_to']) {
        if (filters[key]) params[key] = filters[key]
    }
    await store.fetch(params)
}

onMounted(() => {
    load()
    agentStore.fetchAgents().catch(() => {})
})
</script>
