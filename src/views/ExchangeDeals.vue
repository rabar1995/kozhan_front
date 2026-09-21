<template>
    <div>
        <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
            {{ error }}
        </div>
        <div v-if="message" class="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 mb-4">
            {{ message }}
        </div>

        <!-- Open deal form -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">{{ $t('deals.openTitle') }}</h3>
            <form class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" @submit.prevent="submitOpen">
                <!-- Send side -->
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">{{ $t('deals.sendWallet') }} *</label>
                    <LogoSelect v-model="openForm.send_account_id" :options="wallets" :placeholder="$t('common.select')"
                        sublabel-key="currency_code" />
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">{{ $t('forms.sendAmount') }} *</label>
                    <MoneyInput v-model="openForm.send_amount" required
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>

                <!-- Receive side -->
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">{{ $t('deals.settleWallet') }} <span v-if="openForm.status === 'completed'">*</span></label>
                    <LogoSelect v-model="openForm.receive_account_id" :options="wallets" :placeholder="$t('common.select')"
                        sublabel-key="currency_code" />
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">{{ $t('deals.receiveAmount') }} <span v-if="openForm.status === 'completed'">*</span></label>
                    <MoneyInput v-model="openForm.receive_amount"
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>

                <!-- Status + Note -->
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">{{ $t('deals.status') }} *</label>
                    <select v-model="openForm.status" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                        <option value="completed">{{ $t('deals.statusDone') }}</option>
                        <option value="pending">{{ $t('deals.statusPending') }}</option>
                    </select>
                </div>
                <div class="sm:col-span-2">
                    <label class="block text-xs font-medium text-gray-500 mb-1">{{ $t('deals.notes') }}</label>
                    <input v-model="openForm.notes" type="text"
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div class="sm:col-span-2 md:col-span-4 flex justify-end">
                    <button type="submit" :disabled="busy"
                        class="px-5 py-2 text-sm rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50">
                        {{ busy ? $t('common.processing') : $t('deals.openDeal') }}
                    </button>
                </div>
            </form>
        </div>

        <!-- Pending deals -->
        <div v-if="summary.pending_deals.length" class="bg-amber-50 rounded-xl shadow-sm border border-amber-100 p-4 mb-8">
            <h3 class="text-sm font-semibold text-amber-800 mb-3">{{ $t('deals.pendingDeals') }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                <div
                    v-for="d in summary.pending_deals"
                    :key="d.id"
                    class="bg-white rounded-lg border border-amber-100 p-3"
                >
                    <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-2 min-w-0">
                            <LogoAvatar :name="dealLabel(d)" :url="walletLogoFor(d)" />
                            <div class="min-w-0">
                                <p class="text-sm font-semibold text-gray-900 truncate">{{ dealLabel(d) }}</p>
                                <p class="text-xs text-gray-400">{{ d.tx_number }} · {{ dateTime(d.created_at) }}</p>
                            </div>
                        </div>
                        <span class="px-2 py-0.5 rounded text-[11px] font-semibold shrink-0"
                            :class="d.direction === 'deal_send' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'">
                            {{ $t(directionLabel(d.direction)) }}
                        </span>
                    </div>
                    <div class="flex items-center justify-between mt-2">
                        <p class="text-sm text-gray-700">{{ money(d.amount, d.code) }}</p>
                        <button
                            class="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700"
                            @click="openSettle(d)"
                        >{{ $t('deals.settle') }}</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <select v-model="filters.direction" @change="page = 1; loadDeals()"
                class="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="">{{ $t('common.all') }} — {{ $t('common.type') }}</option>
                <option v-for="d in directionOptions" :key="d.value" :value="d.value">{{ $t(d.label) }}</option>
            </select>
            <select v-model="filters.status" @change="page = 1; loadDeals()"
                class="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="">{{ $t('common.all') }} — {{ $t('common.status') }}</option>
                <option value="completed">{{ $t('status.completed') }}</option>
                <option value="cancelled">{{ $t('status.cancelled') }}</option>
            </select>

            <input v-model="filters.date_from" type="date" @change="page = 1; loadDeals()"
                class="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <input v-model="filters.date_to" type="date" @change="page = 1; loadDeals()"
                class="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>

        <!-- History (one row per deal, newest first from the API) -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table class="min-w-full text-sm table-enhanced">
                <thead class="bg-gray-50 text-start text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                        <th class="px-3 py-3 w-8"></th>
                        <th class="px-4 py-3">{{ $t('remittances.number') }}</th>
                        <th class="px-4 py-3">{{ $t('common.type') }}</th>
                        <th class="px-4 py-3">{{ $t('deals.person') }}</th>
                        <th class="px-4 py-3 text-end">{{ $t('deals.amount') }}</th>
                        <th class="px-4 py-3">{{ $t('common.status') }}</th>
                        <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-if="!historyRows.length">
                        <td colspan="7" class="px-4 py-8 text-center text-gray-400">{{ $t('deals.noDeals') }}</td>
                    </tr>
                    <template v-for="tx in historyRows" :key="tx.id">
                        <tr class="hover:bg-gray-50/80 transition-colors cursor-pointer" @click="toggleExpand(tx.id)">
                            <td class="px-3 py-3 ps-4">
                                <svg
                                    class="w-4 h-4 transition-transform text-gray-300"
                                    :class="{ 'rotate-90 text-indigo-500': expandedIds.has(tx.id) }"
                                    fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
                                >
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </td>
                            <td class="px-4 py-3">
                                <p class="font-medium text-gray-900">{{ tx.tx_number }}</p>
                                <p class="text-[11px] text-gray-400">{{ dateTime(tx.created_at) }}</p>
                            </td>
                            <td class="px-4 py-3">
                                <span class="px-2 py-1 rounded text-xs font-semibold" :class="directionClassLocal(tx.direction)">
                                    {{ $t(directionLabel(tx.direction)) }}
                                </span>
                            </td>
                            <td class="px-4 py-3 text-gray-700">
                                {{ dealLabel(tx) }}
                                <span v-if="tx.settle_account" class="block text-[11px] text-gray-400">{{ tx.settleAccount?.name }}</span>
                            </td>
                            <td class="px-4 py-3 text-end font-bold text-gray-900">
                                {{ money(tx.amount, tx.currency?.code) }}
                            </td>
                            <td class="px-4 py-3">
                                <span class="px-2 py-1 rounded text-xs font-semibold" :class="dealStatusClass(tx)">
                                    {{ $t(dealStatusLabel(tx), { count: tx.deal_settlements?.length }) }}
                                </span>
                            </td>
                            <td class="px-4 py-3 text-end whitespace-nowrap">
                                <button
                                    v-if="canSettle(tx)"
                                    class="text-xs px-2 py-1 rounded border border-emerald-200 text-emerald-700 hover:bg-emerald-50 me-2"
                                    @click.stop="openSettle(tx)"
                                >{{ $t('deals.settle') }}</button>
                                <button
                                    v-if="tx.status === 'completed'"
                                    class="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
                                    @click.stop="openCancel(tx)"
                                >{{ $t('expenses.voidBtn') }}</button>
                            </td>
                        </tr>
                        <tr v-if="expandedIds.has(tx.id)" class="bg-gray-50/60">
                            <td class="py-1" colspan="7">
                                <div class="px-4 sm:px-10 py-2 border-t border-dashed border-gray-200">
                                    <div v-if="!tx.deal_settlements?.length" class="text-xs text-gray-400 py-1">
                                        {{ $t('deals.unsettledNote') }}
                                    </div>
                                    <ul v-else class="divide-y divide-gray-100">
                                        <li v-for="leg in tx.deal_settlements" :key="leg.id" class="flex flex-wrap items-center gap-x-4 gap-y-1 py-2 text-xs">
                                            <span class="font-medium text-gray-900">{{ leg.tx_number }}</span>
                                            <span class="text-gray-500">{{ dateTime(leg.created_at) }}</span>
                                            <span class="font-bold text-gray-900">{{ money(leg.settle_amount, leg.settle_currency?.code) }}</span>
                                            <span class="text-gray-600">{{ leg.settleAccount?.name || '—' }}</span>
                                            <span class="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold border border-emerald-100">
                                                {{ $t('status.completed') }}
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
            <div class="px-4 pb-3">
                <Pagination :meta="meta" @page="p => { page = p; loadDeals() }" />
            </div>
        </div>

        <!-- Settle deal modal -->
        <Modal :open="settleTarget !== null" :title="$t('deals.settleTitle')">
            <form v-if="settleTarget" class="space-y-4" @submit.prevent="confirmSettle">
                <div class="bg-gray-50 rounded-lg p-3 text-sm">
                    <p class="font-semibold text-gray-900">{{ settleTarget.counterparty_name === '—' ? (walletNameFor(settleTarget) || '—') : settleTarget.counterparty_name }}</p>
                    <p class="text-gray-600">
                        {{ $t(directionLabel(settleTarget.direction)) }} ·
                        {{ money(settleTarget.amount, settleTarget.code) }}
                    </p>
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">{{ $t('deals.settleWallet') }} *</label>
                    <LogoSelect v-model="settleForm.settle_account_id" :options="wallets" :placeholder="$t('common.select')"
                        sublabel-key="currency_code" />
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">{{ $t('deals.settleAmount') }} *</label>
                    <MoneyInput v-model="settleForm.settle_amount" required
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">{{ $t('deals.notes') }}</label>
                    <input v-model="settleForm.notes" type="text"
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <p class="text-xs text-gray-500">{{ $t('deals.settleNote') }}</p>
                <button type="submit" :disabled="busy"
                    class="w-full px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
                    {{ busy ? $t('common.processing') : $t('deals.settle') }}
                </button>
            </form>
        </Modal>

        <!-- Cancel modal -->
        <Modal :open="cancelTarget !== null" :title="$t('deals.cancelTitle')">
            <form class="space-y-4" @submit.prevent="confirmCancel">
                <p class="text-sm text-gray-600">
                    {{ $t('remittances.cancelText', { number: cancelTarget?.tx_number }) }}
                </p>
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">{{ $t('remittances.reason') }} *</label>
                    <textarea v-model="cancelReason" rows="2" required
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        :placeholder="$t('remittances.reasonPlaceholder')" />
                </div>
                <button type="submit" :disabled="busy"
                    class="w-full px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                    {{ busy ? $t('common.processing') : $t('remittances.confirmCancelBtn') }}
                </button>
            </form>
        </Modal>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api, apiError } from '../api/client'
import { dateTime, money } from '../utils/format'
import Modal from '../components/Modal.vue'
import MoneyInput from '../components/MoneyInput.vue'
import Pagination from '../components/Pagination.vue'
import LogoSelect from '../components/LogoSelect.vue'
import LogoAvatar from '../components/LogoAvatar.vue'

const { t } = useI18n()

const wallets = ref([])
const summary = ref({ pending_accounts: [], pending_deals: [] })
const deals = ref([])
const meta = ref(null)
const page = ref(1)
const expandedIds = ref(new Set())

// One row per deal: main legs only (settle legs live in the expandable sub-row)
const historyRows = computed(() => deals.value.filter((tx) => tx.direction !== 'deal_settle'))

function toggleExpand(id) {
    const next = new Set(expandedIds.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    expandedIds.value = next
}

function dealStatusClass(tx) {
    if (tx.status !== 'completed') return 'bg-red-100 text-red-800'
    return tx.deal_settlements?.length
        ? 'bg-green-100 text-green-800'
        : 'bg-amber-100 text-amber-800'
}

function dealStatusLabel(tx) {
    if (tx.status !== 'completed') return 'status.cancelled'
    return tx.deal_settlements?.length ? 'deals.settledBadge' : 'deals.unsettled'
}

function canSettle(tx) {
    return tx.status === 'completed' && !tx.deal_settlements?.length
}

const busy = ref(false)
const error = ref('')
const message = ref('')

const filters = reactive({ direction: '', status: '', date_from: '', date_to: '' })

const directionOptions = [
    { value: 'deal_send', label: 'deals.dealSend' },
    { value: 'deal_receive', label: 'deals.dealReceive' },
    { value: 'deal_settle', label: 'deals.dealSettle' },
]

const openForm = reactive({ status: 'completed', send_account_id: '', send_amount: null, receive_account_id: '', receive_amount: null, notes: '' })
const settleTarget = ref(null)
const settleForm = reactive({ settle_account_id: '', settle_amount: null, notes: '' })
const cancelTarget = ref(null)
const cancelReason = ref('')
function resetOpenForm() {
    Object.assign(openForm, { status: 'completed', send_account_id: '', send_amount: null, receive_account_id: '', receive_amount: null, notes: '' })
}

function directionLabel(direction) {
    const map = {
        deal_send: 'deals.dealSend',
        deal_receive: 'deals.dealReceive',
        deal_settle: 'deals.dealSettle',
    }
    return map[direction] || direction
}

function directionClassLocal(direction) {
    if (direction === 'deal_send') return 'bg-blue-100 text-blue-800'
    if (direction === 'deal_receive') return 'bg-purple-100 text-purple-800'
    return 'bg-emerald-100 text-emerald-800'
}

function walletNameFor(deal) {
    if (! deal) return ''
    // Summary rows carry the wallet name in `wallet`; history rows carry `account`
    if (typeof deal.wallet === 'string') return deal.wallet
    if (deal.account?.name) return deal.account.name
    return ''
}

function dealLabel(deal) {
    return deal?.counterparty_name && deal.counterparty_name !== '—'
        ? deal.counterparty_name
        : (walletNameFor(deal) || '—')
}

function walletLogoFor(deal) {
    // Summary rows: `wallet` is a name; fall back to id match for other shapes
    const w = typeof deal?.wallet === 'string' && deal.wallet !== '—'
        ? wallets.value.find((x) => x.name === deal.wallet)
        : wallets.value.find((x) => x.id === deal?.wallet)
    return w?.logo_url || ''
}

function openSettle(deal) {
    settleTarget.value = deal
    // Prefill from the planned receive side saved when the deal was opened
    settleForm.settle_account_id = deal?.settle_account_id || ''
    settleForm.settle_amount = deal?.settle_amount || deal?.amount || null
    settleForm.notes = ''
}

async function loadBase() {
    try {
        const [opts, sum] = await Promise.all([
            api.get('/exchange-deals/form-options'),
            api.get('/exchange-deals/summary'),
        ])
        wallets.value = opts.data.data.wallets
        summary.value = sum.data.data
    } catch (e) {
        error.value = apiError(e).message
    }
}

async function loadDeals() {
    try {
        const params = { page: page.value, ...filters }
        const res = await api.get('/exchange-deals', { params })
        deals.value = res.data.data.data
        meta.value = {
            current_page: res.data.data.current_page,
            last_page: res.data.data.last_page,
            total: res.data.data.total,
        }
    } catch (e) {
        error.value = apiError(e).message
    }
}

async function submitOpen() {
    busy.value = true
    error.value = ''
    message.value = ''
    try {
        const res = await api.post('/exchange-deals', {
            ...openForm,
            receive_account_id: openForm.receive_account_id || null,
            receive_amount: openForm.receive_amount ? Number(openForm.receive_amount) : null,
        })
        message.value = res.data.message
        resetOpenForm()
        await Promise.all([loadBase(), loadDeals()])
    } catch (e) {
        error.value = apiError(e).message
    } finally {
        busy.value = false
    }
}

async function confirmSettle() {
    if (! settleTarget.value) return
    busy.value = true
    error.value = ''
    message.value = ''
    try {
        const res = await api.post(`/exchange-deals/${settleTarget.value.id}/settle`, { ...settleForm })
        message.value = res.data.message
        settleTarget.value = null
        await Promise.all([loadBase(), loadDeals()])
    } catch (e) {
        error.value = apiError(e).message
    } finally {
        busy.value = false
    }
}

function openCancel(tx) {
    cancelTarget.value = tx
    cancelReason.value = ''
}

async function confirmCancel() {
    if (! cancelTarget.value) return
    busy.value = true
    error.value = ''
    message.value = ''
    try {
        const res = await api.patch(`/exchange-deals/${cancelTarget.value.id}/cancel`, { reason: cancelReason.value })
        message.value = res.data.message
        cancelTarget.value = null
        await Promise.all([loadBase(), loadDeals()])
    } catch (e) {
        error.value = apiError(e).message
    } finally {
        busy.value = false
    }
}

onMounted(() => {
    loadBase()
    loadDeals()
})
</script>
