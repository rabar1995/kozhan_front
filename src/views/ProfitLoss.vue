<template>
    <div>
        <Alert v-if="error" type="error" dismissible class="mb-4" @dismiss="error = ''">{{ error }}</Alert>

        <!-- Period: quick presets + custom dates, applies on change -->
        <div class="card card-pad mb-6">
            <div class="flex flex-wrap gap-2 mb-3">
                <button
                    v-for="p in presets"
                    :key="p.key"
                    class="btn btn-sm"
                    :class="activePreset === p.key ? 'btn-primary' : 'btn-secondary'"
                    @click="applyPreset(p.key)"
                >{{ $t(p.label) }}</button>
            </div>
            <div class="grid grid-cols-2 gap-3 max-w-md">
                <div>
                    <label class="form-label" for="pl-from">{{ $t('reports.startDate') }}</label>
                    <input id="pl-from" v-model="filters.start_date" type="date" class="form-input" @change="activePreset = ''" />
                </div>
                <div>
                    <label class="form-label" for="pl-to">{{ $t('reports.endDate') }}</label>
                    <input id="pl-to" v-model="filters.end_date" type="date" class="form-input" @change="activePreset = ''" />
                </div>
            </div>
        </div>

        <div v-if="loading && !rows" class="space-y-3">
            <div v-for="i in 3" :key="i" class="h-24 rounded-2xl animate-shimmer" />
        </div>

        <template v-else-if="rows">
            <EmptyState v-if="!byCurrency.length" :title="$t('reports.noData')" :text="$t('reports.noDataHint')" />

            <!-- One summary per currency: never add IQD and USD together -->
            <section v-for="cur in byCurrency" :key="cur.currency" class="mb-6">
                <h3 class="section-title">{{ cur.currency }}</h3>
                <div class="grid grid-cols-3 gap-3 mb-3">
                    <KpiCard :label="$t('reports.totalRevenue')" :amounts="[{ currency: cur.currency, amount: cur.revenue }]" tone="green" />
                    <KpiCard :label="$t('reports.totalExpenses')" :amounts="[{ currency: cur.currency, amount: cur.expense }]" tone="red" />
                    <KpiCard :label="$t('reports.netIncome')" :amounts="[{ currency: cur.currency, amount: cur.net }]" :tone="cur.net >= 0 ? 'green' : 'red'" />
                </div>
                <ul class="card divide-y divide-gray-100">
                    <li v-for="(row, i) in cur.rows" :key="i" class="flex items-center justify-between gap-3 px-4 py-3">
                        <div class="min-w-0">
                            <p class="text-sm text-gray-900 truncate">{{ row.account_name }}</p>
                            <p class="text-xs" :class="row.category === 'revenue' ? 'text-emerald-700' : 'text-red-600'">{{ $t(`reports.categories.${row.category}`) }}</p>
                        </div>
                        <p class="text-sm font-semibold tabular-nums" :class="Number(row.amount) < 0 ? 'text-red-600' : 'text-gray-900'">{{ money(row.amount, cur.currency) }}</p>
                    </li>
                </ul>
            </section>
            <p class="form-hint">{{ $t('reports.note') }}</p>
        </template>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { api, apiError } from '../api/client'
import { money, localDate } from '../utils/format'
import KpiCard from '../components/KpiCard.vue'
import Alert from '../components/ui/Alert.vue'
import EmptyState from '../components/ui/EmptyState.vue'

const presets = [
    { key: 'thisMonth', label: 'reports.thisMonth' },
    { key: 'lastMonth', label: 'reports.lastMonth' },
    { key: 'thisYear', label: 'reports.thisYear' },
]

function rangeFor(key) {
    const now = new Date()
    if (key === 'lastMonth') {
        return {
            start_date: localDate(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
            end_date: localDate(new Date(now.getFullYear(), now.getMonth(), 0)),
        }
    }
    if (key === 'thisYear') {
        return { start_date: localDate(new Date(now.getFullYear(), 0, 1)), end_date: localDate(now) }
    }
    return { start_date: localDate(new Date(now.getFullYear(), now.getMonth(), 1)), end_date: localDate(now) }
}

const activePreset = ref('thisMonth')
const filters = reactive(rangeFor('thisMonth'))
const rows = ref(null)
const loading = ref(false)
const error = ref('')

const byCurrency = computed(() => {
    const map = {}
    for (const row of rows.value || []) {
        const c = row.currency_code || '?'
        map[c] ??= { currency: c, revenue: 0, expense: 0, net: 0, rows: [] }
        if (row.category === 'revenue') map[c].revenue += Number(row.amount)
        if (row.category === 'expense') map[c].expense += Number(row.amount)
        map[c].rows.push(row)
    }
    return Object.values(map)
        .map((m) => ({ ...m, net: m.revenue - m.expense }))
        .sort((a, b) => a.currency.localeCompare(b.currency))
})

function applyPreset(key) {
    activePreset.value = key
    Object.assign(filters, rangeFor(key))
}

async function load() {
    if (! filters.start_date || ! filters.end_date) return
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

watch(filters, load)
onMounted(load)
</script>
