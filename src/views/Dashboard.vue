<template>
    <div>
        <!-- Error Banner -->
        <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
            {{ error }}
        </div>

        <!-- Dashboard Header: Date Controls + Quick Actions -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <!-- Date Picker Controls -->
            <div class="flex flex-wrap items-center gap-2">
                <button
                    v-for="preset in datePresets" :key="preset.key"
                    class="px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200"
                    :class="activePreset === preset.key
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'"
                    @click="setPreset(preset.key)"
                >
                    {{ $t(`dashboard.${preset.key}`) }}
                </button>
                <input
                    v-model="customDate"
                    type="date"
                    class="px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-colors"
                    @change="onCustomDate"
                />
                <button
                    class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    :class="refreshing ? 'opacity-50 pointer-events-none' : ''"
                    @click="refreshAll"
                >
                    <svg class="w-3.5 h-3.5 transition-transform" :class="refreshing ? 'animate-spin' : ''" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {{ $t('dashboard.refresh') }}
                </button>
            </div>

            <!-- Quick Actions + PWA Download Button -->
            <div class="flex flex-wrap items-center gap-2">
                <!-- PWA Install / Download Icon Button -->
                <button
                    v-if="!isInstalled"
                    class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-500 hover:to-indigo-600 transition-all shadow-sm hover:shadow-indigo-500/25 active:scale-95 group"
                    :title="$t('pwa.installApp')"
                    @click="handlePwaInstall"
                >
                    <svg class="w-4 h-4 text-emerald-300 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    <span>{{ $t('pwa.installBtn') }}</span>
                </button>

                <router-link
                    v-if="can('create-remittance')"
                    to="/remittances/incoming"
                    class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    {{ $t('nav.bookIncoming') }}
                </router-link>
                <router-link
                    v-if="can('create-remittance')"
                    to="/remittances/outgoing"
                    class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-sm"
                >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    {{ $t('nav.bookOutgoing') }}
                </router-link>
                <router-link
                    v-if="can('record-expense')"
                    to="/expenses/new"
                    class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                    </svg>
                    {{ $t('nav.registerExpense') }}
                </router-link>
            </div>
        </div>

        <!-- Loading Skeleton -->
        <div v-if="loading && !kpis" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
            <KpiCard v-for="i in 6" :key="i" label="" skeleton tone="gray" />
        </div>

        <template v-if="kpis">
            <!-- Today KPIs Row -->
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {{ $t('dashboard.today') }}
                <span v-if="selectedDate !== todayStr" class="text-xs font-normal normal-case text-gray-400 ms-1">({{ selectedDate }})</span>
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                <KpiCard :label="$t('dashboard.incoming')" :value="kpis.today?.incoming_count" tone="blue" icon="incoming" />
                <KpiCard :label="$t('dashboard.outgoing')" :value="kpis.today?.outgoing_count" tone="purple" icon="outgoing" />
                <KpiCard :label="$t('dashboard.pending')" :value="kpis.today?.pending_count" tone="yellow" icon="pending" />
                <KpiCard :label="$t('dashboard.completedToday')" :value="kpis.today?.completed_today" tone="green" icon="check" />
                <KpiCard :label="$t('dashboard.commissionEarned')" :value="kpis.today?.commission_earned_today" tone="green" icon="money" money />
                <KpiCard :label="$t('dashboard.commissionPaid')" :value="kpis.today?.commission_paid_today" tone="red" icon="money" money />
            </div>

            <!-- Middle Section: Cash Safes + Urgent Payouts (2 columns) -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                <CashSafeOverview ref="cashRef" />
                <UrgentPayoutsFeed ref="urgentRef" @complete="openCompletePayout" />
            </div>

            <!-- Agents Section -->
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{{ $t('dashboard.agentsSection') }}</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                <KpiCard :label="$t('dashboard.debtors')" :value="kpis.agents?.total_debtors" tone="green" icon="users" />
                <KpiCard :label="$t('dashboard.creditors')" :value="kpis.agents?.total_creditors" tone="red" icon="users" />
                <KpiCard :label="$t('dashboard.totalReceivable')" :value="kpis.agents?.total_receivable" tone="green" icon="money" money />
                <KpiCard :label="$t('dashboard.totalPayable')" :value="kpis.agents?.total_payable" tone="red" icon="money" money />
            </div>

            <!-- Bottom Section: Financial Overview + Exchange Rates -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                <!-- Financial Overview -->
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h3 class="text-sm font-semibold text-gray-700 mb-4">{{ $t('dashboard.financialOverview') }} — {{ $t('dashboard.thisMonth') }}</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div class="text-center py-3 px-2 rounded-xl bg-emerald-50/70">
                            <p class="text-xs text-emerald-600 font-medium mb-1">{{ $t('dashboard.totalRevenue') }}</p>
                            <p class="text-lg font-bold text-emerald-700 tabular-nums">{{ moneyFmt(kpis.monthly?.total_revenue) }}</p>
                        </div>
                        <div class="text-center py-3 px-2 rounded-xl bg-red-50/70">
                            <p class="text-xs text-red-600 font-medium mb-1">{{ $t('dashboard.totalExpenses') }}</p>
                            <p class="text-lg font-bold text-red-700 tabular-nums">{{ moneyFmt(kpis.monthly?.total_expenses) }}</p>
                        </div>
                        <div class="text-center py-3 px-2 rounded-xl" :class="netIncome >= 0 ? 'bg-emerald-50/70' : 'bg-red-50/70'">
                            <p class="text-xs font-medium mb-1" :class="netIncome >= 0 ? 'text-emerald-600' : 'text-red-600'">
                                {{ $t('reports.netIncome') }}
                            </p>
                            <p class="text-lg font-bold tabular-nums" :class="netIncome >= 0 ? 'text-emerald-700' : 'text-red-700'">
                                {{ moneyFmt(netIncome) }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Live Exchange Rates -->
                <LiveRatesWidget ref="ratesRef" />
            </div>
        </template>

        <!-- Complete Payout Modal (reused from RemittanceTable logic) -->
        <Modal :open="showCompletePayout" :title="$t('remittances.completePayoutTitle')" @close="showCompletePayout = false">
            <p class="text-sm text-gray-600 mb-4">
                {{ $t('remittances.confirmPayout', { number: activeRow?.remittance_number, receiver: activeRow?.receiver_name }) }}
            </p>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('remittances.paymentAccount') }}</label>
            <select v-model="paymentAccountId" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="" disabled>{{ $t('remittances.selectAccount') }}</option>
                <option v-for="account in payAccounts" :key="account.id" :value="account.id">
                    {{ account.name }} — {{ moneyFmt(account.current_balance, account.currency?.code) }}
                </option>
            </select>
            <p v-if="completeError" class="mt-2 text-sm text-red-600">{{ completeError }}</p>
            <div class="mt-5 flex justify-end gap-2">
                <button class="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50" @click="showCompletePayout = false">
                    {{ $t('common.cancel') }}
                </button>
                <button
                    class="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                    :disabled="!paymentAccountId || completeBusy"
                    @click="confirmComplete"
                >
                    {{ completeBusy ? $t('common.processing') : $t('remittances.confirmPayoutBtn') }}
                </button>
            </div>
        </Modal>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api, apiError } from '../api/client'
import { usePermissions } from '../composables/usePermissions'
import { usePwa } from '../composables/usePwa'
import { useAccountStore } from '../stores/account'
import { useRemittanceStore } from '../stores/remittance'
import { money as moneyFmt } from '../utils/format'
import KpiCard from '../components/KpiCard.vue'
import CashSafeOverview from '../components/CashSafeOverview.vue'
import UrgentPayoutsFeed from '../components/UrgentPayoutsFeed.vue'
import LiveRatesWidget from '../components/LiveRatesWidget.vue'
import Modal from '../components/Modal.vue'

const { t } = useI18n()
const { can } = usePermissions()
const { isInstalled, promptInstall } = usePwa()
const accountStore = useAccountStore()
const remittanceStore = useRemittanceStore()

const kpis = ref(null)
const loading = ref(false)
const refreshing = ref(false)
const error = ref('')

const todayStr = new Date().toISOString().slice(0, 10)
const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

const selectedDate = ref(todayStr)
const customDate = ref(todayStr)
const activePreset = ref('today')

const datePresets = [
    { key: 'today' },
    { key: 'yesterday' },
]

// Payout modal state
const showCompletePayout = ref(false)
const activeRow = ref(null)
const paymentAccountId = ref('')
const completeError = ref('')
const completeBusy = ref(false)

const cashRef = ref(null)
const urgentRef = ref(null)
const ratesRef = ref(null)

const payAccounts = computed(() =>
    accountStore.accounts.filter((a) => ['cash_safe', 'e_wallet', 'bank_account'].includes(a.account_type?.code) && a.is_active),
)

const netIncome = computed(() => {
    const rev = Number(kpis.value?.monthly?.total_revenue || 0)
    const exp = Number(kpis.value?.monthly?.total_expenses || 0)
    return rev - exp
})

function handlePwaInstall() {
    promptInstall()
}

function setPreset(key) {
    activePreset.value = key
    if (key === 'today') {
        selectedDate.value = todayStr
        customDate.value = todayStr
    } else if (key === 'yesterday') {
        selectedDate.value = yesterdayStr
        customDate.value = yesterdayStr
    }
    loadKpis()
}

function onCustomDate() {
    if (!customDate.value) return
    activePreset.value = ''
    selectedDate.value = customDate.value
    loadKpis()
}

async function loadKpis() {
    loading.value = true
    try {
        const res = await api.get('/dashboard/kpis', { params: { date: selectedDate.value } })
        kpis.value = res.data.data
    } catch (e) {
        error.value = apiError(e).message
    } finally {
        loading.value = false
    }
}

async function refreshAll() {
    refreshing.value = true
    error.value = ''
    await Promise.all([
        loadKpis(),
        cashRef.value?.load?.() || accountStore.fetchAccounts({ active: 1 }).catch(() => {}),
        urgentRef.value?.load?.(),
        ratesRef.value?.load?.(),
    ])
    refreshing.value = false
}

function openCompletePayout(row) {
    activeRow.value = row
    paymentAccountId.value = ''
    completeError.value = ''
    showCompletePayout.value = true
    if (!accountStore.accounts.length) {
        accountStore.fetchAccounts({ active: 1 }).catch(() => {})
    }
}

async function confirmComplete() {
    completeBusy.value = true
    completeError.value = ''
    try {
        await remittanceStore.complete(activeRow.value.id, paymentAccountId.value)
        showCompletePayout.value = false
        // Refresh widgets after payout
        await refreshAll()
    } catch (e) {
        completeError.value = e.response?.data?.message || t('remittances.failedComplete')
    } finally {
        completeBusy.value = false
    }
}

onMounted(() => {
    loadKpis()
})
</script>
