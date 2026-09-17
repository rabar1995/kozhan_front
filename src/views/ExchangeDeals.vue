<template>
    <div>
        <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
            {{ error }}
        </div>
        <div v-if="message" class="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 mb-4">
            {{ message }}
        </div>

        <!-- Pending account balances -->
        <div v-if="summary.pending_accounts.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div
                v-for="a in summary.pending_accounts"
                :key="a.id"
                class="bg-amber-50 rounded-xl shadow-sm border border-amber-100 p-4"
            >
                <p class="text-xs text-amber-700 truncate">{{ a.name }}</p>
                <p class="text-lg font-bold text-amber-900 mt-1">{{ money(a.balance, a.code) }}</p>
            </div>
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

        <!-- History -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-start text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                        <th class="px-4 py-3">{{ $t('remittances.number') }}</th>
                        <th class="px-4 py-3">{{ $t('common.type') }}</th>
                        <th class="px-4 py-3">{{ $t('deals.person') }}</th>
                        <th class="px-4 py-3">{{ $t('deals.wallet') }}</th>
                        <th class="px-4 py-3 text-end">{{ $t('deals.amount') }}</th>
                        <th class="px-4 py-3 text-end">{{ $t('deals.settleAmount') }}</th>
                        <th class="px-4 py-3">{{ $t('common.status') }}</th>
                        <th class="px-4 py-3">{{ $t('remittances.created') }}</th>
                        <th class="px-4 py-3">{{ $t('common.actions') }}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-if="!deals.length">
                        <td colspan="9" class="px-4 py-8 text-center text-gray-400">{{ $t('deals.noDeals') }}</td>
                    </tr>
                    <tr v-for="tx in deals" :key="tx.id" class="hover:bg-gray-50">
                        <td class="px-4 py-3 font-medium text-gray-900">{{ tx.tx_number }}</td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-1 rounded text-xs font-semibold" :class="directionClassLocal(tx.direction)">
                                {{ $t(directionLabel(tx.direction)) }}
                            </span>
                            <p v-if="tx.deal_parent" class="text-[11px] text-gray-400 mt-0.5">
                                ← {{ tx.deal_parent.tx_number }}
                            </p>
                        </td>
                        <td class="px-4 py-3 text-gray-700">{{ tx.counterparty_name === '—' ? (walletNameFor(tx) || '—') : tx.counterparty_name }}</td>
                        <td class="px-4 py-3 text-gray-500">
                            {{ tx.settle_account ? tx.settleAccount?.name : tx.account?.name }}
                        </td>
                        <td class="px-4 py-3 text-end">
                            {{ tx.direction === 'deal_settle' ? '—' : money(tx.amount, tx.currency?.code) }}
                        </td>
                        <td class="px-4 py-3 text-end">
                            {{ tx.direction === 'deal_settle'
                                ? money(tx.settle_amount, tx.settle_currency?.code) : '—' }}
                        </td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-1 rounded text-xs font-semibold" :class="tx.status === 'completed'
                                ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                                {{ $t('status.' + tx.status) }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-gray-500 text-xs">{{ dateTime(tx.created_at) }}</td>
                        <td class="px-4 py-3">
                            <button
                                v-if="tx.status === 'completed'"
                                class="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
                                @click="openCancel(tx)"
                            >{{ $t('expenses.voidBtn') }}</button>
                        </td>
                    </tr>
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
