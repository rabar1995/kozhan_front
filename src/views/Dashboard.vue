<template>
    <div>
        <Alert v-if="error" type="error" dismissible class="mb-4" @dismiss="error = ''">{{ error }}</Alert>

        <!-- Owner private wallets: always first for the owner -->
        <PrivateWalletsOverview v-if="isOwner" ref="privateRef" class="mb-6" />

        <!-- Quick actions: the most common jobs, one tap away -->
        <div v-if="can('create-remittance') || can('record-expense')" class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <router-link
                v-if="can('create-remittance')"
                to="/remittances/incoming"
                class="card card-pad flex items-center gap-3 hover:border-emerald-300 hover:shadow-md transition-all"
            >
                <span class="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                </span>
                <span>
                    <span class="block text-sm font-semibold text-gray-900">{{ $t('nav.bookIncoming') }}</span>
                    <span class="block text-xs text-gray-500">{{ $t('dashboard.incomingHint') }}</span>
                </span>
            </router-link>
            <router-link
                v-if="can('create-remittance')"
                to="/remittances/outgoing"
                class="card card-pad flex items-center gap-3 hover:border-indigo-300 hover:shadow-md transition-all"
            >
                <span class="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                </span>
                <span>
                    <span class="block text-sm font-semibold text-gray-900">{{ $t('nav.bookOutgoing') }}</span>
                    <span class="block text-xs text-gray-500">{{ $t('dashboard.outgoingHint') }}</span>
                </span>
            </router-link>
            <router-link
                v-if="can('record-expense')"
                to="/expenses/new"
                class="card card-pad flex items-center gap-3 hover:border-amber-300 hover:shadow-md transition-all"
            >
                <span class="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>
                </span>
                <span>
                    <span class="block text-sm font-semibold text-gray-900">{{ $t('nav.registerExpense') }}</span>
                    <span class="block text-xs text-gray-500">{{ $t('dashboard.expenseHint') }}</span>
                </span>
            </router-link>
        </div>

        <!-- Payouts waiting: first thing staff need to act on -->
        <UrgentPayoutsFeed ref="urgentRef" class="mb-6" @complete="payRow = $event" />

        <!-- Day picker -->
        <div class="flex flex-wrap items-center gap-2 mb-4">
            <h3 class="text-sm font-semibold text-gray-500 me-auto">
                {{ selectedDate === todayStr ? $t('dashboard.today') : selectedDate === yesterdayStr ? $t('dashboard.yesterday') : selectedDate }}
            </h3>
            <button
                v-for="preset in datePresets"
                :key="preset.key"
                class="btn btn-sm"
                :class="activePreset === preset.key ? 'btn-primary' : 'btn-secondary'"
                @click="setPreset(preset.key)"
            >
                {{ $t(`dashboard.${preset.key}`) }}
            </button>
            <input v-model="customDate" type="date" :max="todayStr" class="form-input !w-auto !min-h-9 !py-1 text-xs" :aria-label="$t('dashboard.pickDate')" @change="onCustomDate" />
            <button class="btn-icon" :title="$t('dashboard.refresh')" :aria-label="$t('dashboard.refresh')" :disabled="refreshing" @click="refreshAll">
                <svg class="w-5 h-5" :class="refreshing ? 'animate-spin' : ''" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            </button>
        </div>

        <div v-if="loading && !kpis" class="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
            <KpiCard v-for="i in 4" :key="i" label="" skeleton tone="gray" />
        </div>

        <template v-if="kpis">
            <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-3">
                <KpiCard :label="$t('dashboard.incoming')" :value="kpis.today?.incoming_count" tone="blue" icon="incoming" />
                <KpiCard :label="$t('dashboard.outgoing')" :value="kpis.today?.outgoing_count" tone="purple" icon="outgoing" />
                <KpiCard :label="$t('dashboard.pending')" :value="kpis.today?.pending_count" tone="yellow" icon="pending" />
                <KpiCard :label="$t('dashboard.completedToday')" :value="kpis.today?.completed_today" tone="green" icon="check" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                <KpiCard :label="$t('dashboard.commissionEarned')" :amounts="kpis.today?.commission_earned_by_currency || []" tone="green" icon="money" />
                <KpiCard :label="$t('dashboard.commissionPaid')" :amounts="kpis.today?.commission_paid_by_currency || []" tone="red" icon="money" />
            </div>

            <!-- Owner cash overview -->
            <CashSafeOverview v-if="isOwner" ref="cashRef" class="mb-8" />

            <!-- Agents -->
            <h3 class="section-title">{{ $t('dashboard.agentsSection') }}</h3>
            <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-8">
                <KpiCard :label="$t('dashboard.debtors')" :value="kpis.agents?.total_debtors" tone="green" icon="users" />
                <KpiCard :label="$t('dashboard.creditors')" :value="kpis.agents?.total_creditors" tone="red" icon="users" />
                <KpiCard class="col-span-2 xl:col-span-1" :label="$t('dashboard.totalReceivable')" :amounts="kpis.agents?.receivable_by_currency || []" tone="green" icon="money" />
                <KpiCard class="col-span-2 xl:col-span-1" :label="$t('dashboard.totalPayable')" :amounts="kpis.agents?.payable_by_currency || []" tone="red" icon="money" />
            </div>

            <!-- This month, per currency -->
            <div v-if="isOwner" class="card card-pad mb-8">
                <h3 class="text-sm font-semibold text-gray-700 mb-4">{{ $t('dashboard.financialOverview') }} — {{ $t('dashboard.thisMonth') }}</h3>
                <p v-if="!monthly.length" class="text-sm text-gray-400">{{ $t('dashboard.noMonthData') }}</p>
                <div v-for="m in monthly" :key="m.currency" class="grid grid-cols-3 gap-2 sm:gap-4 mb-3 last:mb-0">
                    <div class="text-center py-3 px-2 rounded-xl bg-emerald-50/70">
                        <p class="text-xs text-emerald-600 font-medium mb-1">{{ $t('dashboard.totalRevenue') }}</p>
                        <p class="text-sm sm:text-lg font-bold text-emerald-700 tabular-nums">{{ moneyFmt(m.revenue, m.currency) }}</p>
                    </div>
                    <div class="text-center py-3 px-2 rounded-xl bg-red-50/70">
                        <p class="text-xs text-red-600 font-medium mb-1">{{ $t('dashboard.totalExpenses') }}</p>
                        <p class="text-sm sm:text-lg font-bold text-red-700 tabular-nums">{{ moneyFmt(m.expenses, m.currency) }}</p>
                    </div>
                    <div class="text-center py-3 px-2 rounded-xl" :class="m.net >= 0 ? 'bg-emerald-50/70' : 'bg-red-50/70'">
                        <p class="text-xs font-medium mb-1" :class="m.net >= 0 ? 'text-emerald-600' : 'text-red-600'">{{ $t('reports.netIncome') }}</p>
                        <p class="text-sm sm:text-lg font-bold tabular-nums" :class="m.net >= 0 ? 'text-emerald-700' : 'text-red-700'">{{ moneyFmt(m.net, m.currency) }}</p>
                    </div>
                </div>
            </div>
        </template>

        <PayoutModal :remittance="payRow" @close="payRow = null" @paid="refreshAll" />
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { api, apiError } from '../api/client'
import { usePermissions } from '../composables/usePermissions'
import { money as moneyFmt, localDate, daysAgo } from '../utils/format'
import KpiCard from '../components/KpiCard.vue'
import CashSafeOverview from '../components/CashSafeOverview.vue'
import PrivateWalletsOverview from '../components/PrivateWalletsOverview.vue'
import UrgentPayoutsFeed from '../components/UrgentPayoutsFeed.vue'
import PayoutModal from '../components/PayoutModal.vue'
import Alert from '../components/ui/Alert.vue'

const { can, isOwner } = usePermissions()

const kpis = ref(null)
const loading = ref(false)
const refreshing = ref(false)
const error = ref('')
const payRow = ref(null)

const todayStr = localDate()
const yesterdayStr = daysAgo(1)

const selectedDate = ref(todayStr)
const customDate = ref(todayStr)
const activePreset = ref('today')

const datePresets = [{ key: 'today' }, { key: 'yesterday' }]

const cashRef = ref(null)
const privateRef = ref(null)
const urgentRef = ref(null)

const monthly = computed(() => kpis.value?.monthly?.by_currency || [])

function setPreset(key) {
    activePreset.value = key
    selectedDate.value = key === 'yesterday' ? yesterdayStr : todayStr
    customDate.value = selectedDate.value
    loadKpis()
}

function onCustomDate() {
    if (! customDate.value) return
    activePreset.value = customDate.value === todayStr ? 'today' : customDate.value === yesterdayStr ? 'yesterday' : ''
    selectedDate.value = customDate.value
    loadKpis()
}

async function loadKpis() {
    loading.value = true
    try {
        const res = await api.get('/dashboard/kpis', { params: { date: selectedDate.value } })
        kpis.value = res.data.data
        error.value = ''
    } catch (e) {
        error.value = apiError(e).message
    } finally {
        loading.value = false
    }
}

async function refreshAll() {
    refreshing.value = true
    await Promise.all([
        loadKpis(),
        cashRef.value?.load?.(),
        privateRef.value?.load?.(),
        urgentRef.value?.load?.(),
    ])
    refreshing.value = false
}

onMounted(loadKpis)
</script>
