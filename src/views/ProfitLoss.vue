<template>
    <div>
        <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
            {{ error }}
        </div>

        <div class="flex flex-wrap items-end gap-3 mb-6">
            <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">{{ $t('reports.startDate') }}</label>
                <input v-model="filters.start_date" type="date" class="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">{{ $t('reports.endDate') }}</label>
                <input v-model="filters.end_date" type="date" class="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <button
                class="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                :disabled="loading"
                @click="load"
            >
                {{ loading ? $t('common.loading') : $t('reports.runReport') }}
            </button>
        </div>

        <template v-if="rows">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <KpiCard :label="$t('reports.totalRevenue')" :value="totals.revenue" tone="green" money />
                <KpiCard :label="$t('reports.totalExpenses')" :value="totals.expense" tone="red" money />
                <KpiCard :label="$t('reports.netIncome')" :value="totals.net" :tone="totals.net >= 0 ? 'green' : 'red'" money />
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table class="min-w-full text-sm">
                    <thead class="bg-gray-50 text-start text-xs uppercase tracking-wide text-gray-500">
                        <tr>
                            <th class="px-4 py-3">{{ $t('reports.category') }}</th>
                            <th class="px-4 py-3">{{ $t('reports.account') }}</th>
                            <th class="px-4 py-3">{{ $t('reports.currency') }}</th>
                            <th class="px-4 py-3 text-end">{{ $t('reports.amount') }}</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr v-if="!rows.length">
                            <td colspan="4" class="px-4 py-8 text-center text-gray-400">{{ $t('reports.noData') }}</td>
                        </tr>
                        <tr v-for="(row, i) in rows" :key="i" class="hover:bg-gray-50">
                            <td class="px-4 py-3">
                                <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                                    :class="row.category === 'revenue' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'">
                                    {{ $t(`reports.categories.${row.category}`, row.category) }}
                                </span>
                            </td>
                            <td class="px-4 py-3 text-gray-800">{{ row.account_name }}</td>
                            <td class="px-4 py-3">{{ row.currency_code }}</td>
                            <td class="px-4 py-3 text-end font-semibold" :class="Number(row.amount) < 0 ? 'text-red-600' : 'text-gray-900'">
                                {{ money(row.amount) }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p class="text-xs text-gray-400 mt-3">
                {{ $t('reports.note') }}
            </p>
        </template>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { api, apiError } from '../api/client'
import { money } from '../utils/format'
import KpiCard from '../components/KpiCard.vue'

const filters = reactive({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
    end_date: new Date().toISOString().slice(0, 10),
})

const rows = ref(null)
const loading = ref(false)
const error = ref('')

const totals = computed(() => {
    const t = { revenue: 0, expense: 0, net: 0 }
    for (const row of rows.value || []) {
        if (row.category === 'revenue') t.revenue += Number(row.amount)
        if (row.category === 'expense') t.expense += Number(row.amount)
    }
    t.net = t.revenue - t.expense
    return t
})

async function load() {
    loading.value = true
    error.value = ''
    try {
        const res = await api.get('/reports/profit-loss', { params: { ...filters } })
        rows.value = res.data.data
    } catch (e) {
        error.value = apiError(e).message
    } finally {
        loading.value = false
    }
}

onMounted(() => load())
</script>
