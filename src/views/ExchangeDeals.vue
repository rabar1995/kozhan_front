<template>
    <div>
        <PageHeader :text="$t('deals.intro')">
            <button class="btn btn-primary" @click="openFormVisible = !openFormVisible">
                {{ openFormVisible ? $t('common.close') : $t('deals.openDeal') }}
            </button>
        </PageHeader>

        <Alert v-if="error" type="error" dismissible class="mb-4" @dismiss="error = ''">{{ error }}</Alert>

        <!-- Open a deal -->
        <form v-if="openFormVisible" class="card card-pad mb-6" novalidate @submit.prevent="submitOpen">
            <h3 class="text-sm font-semibold text-gray-800 mb-4">{{ $t('deals.openTitle') }}</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="form-label">{{ $t('deals.sendWallet') }} <span class="text-red-500">*</span></label>
                    <LogoSelect v-model="openForm.send_account_id" :options="walletOptions" :placeholder="$t('common.select')" sublabel-key="group_label" />
                </div>
                <div>
                    <label class="form-label" for="deal-send">{{ $t('forms.sendAmount') }} <span class="text-red-500">*</span></label>
                    <MoneyInput id="deal-send" v-model="openForm.send_amount" class="form-input" />
                </div>
                <div>
                    <label class="form-label">{{ $t('deals.settleWallet') }} <span v-if="openForm.status === 'completed'" class="text-red-500">*</span></label>
                    <LogoSelect v-model="openForm.receive_account_id" :options="walletOptions" :placeholder="$t('common.select')" sublabel-key="group_label" />
                </div>
                <div>
                    <label class="form-label" for="deal-recv">{{ $t('deals.receiveAmount') }} <span v-if="openForm.status === 'completed'" class="text-red-500">*</span></label>
                    <MoneyInput id="deal-recv" v-model="openForm.receive_amount" class="form-input" />
                </div>
                <div>
                    <label class="form-label" for="deal-status">{{ $t('deals.status') }}</label>
                    <select id="deal-status" v-model="openForm.status" class="form-input">
                        <option value="completed">{{ $t('deals.statusDone') }}</option>
                        <option value="pending">{{ $t('deals.statusPending') }}</option>
                    </select>
                    <p class="form-hint">{{ openForm.status === 'pending' ? $t('deals.pendingHint') : $t('deals.doneHint') }}</p>
                </div>
                <div>
                    <label class="form-label" for="deal-notes">{{ $t('deals.notes') }}</label>
                    <input id="deal-notes" v-model="openForm.notes" type="text" class="form-input" />
                </div>
            </div>
            <Alert v-if="openError" type="error" class="mt-4">{{ openError }}</Alert>
            <div class="modal-actions mt-4">
                <button type="button" class="btn btn-secondary" @click="openFormVisible = false">{{ $t('common.cancel') }}</button>
                <button type="submit" :disabled="busy" class="btn btn-primary">{{ busy ? $t('common.processing') : $t('deals.openDeal') }}</button>
            </div>
        </form>

        <!-- Waiting to be settled -->
        <div v-if="summary.pending_deals.length" class="mb-6">
            <h3 class="section-title">{{ $t('deals.pendingDeals') }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                <div v-for="d in summary.pending_deals" :key="d.id" class="card card-pad border-amber-200">
                    <div class="flex items-center gap-2 min-w-0">
                        <LogoAvatar :name="dealLabel(d)" :url="walletLogoFor(d)" />
                        <div class="min-w-0 flex-1">
                            <p class="text-sm font-semibold text-gray-900 truncate">{{ dealLabel(d) }}</p>
                            <p class="text-xs text-gray-500">{{ $t(directionLabel(d.direction)) }} · {{ dateTime(d.created_at) }}</p>
                        </div>
                    </div>
                    <div class="flex items-center justify-between gap-2 mt-3">
                        <p class="text-base font-bold text-gray-900 tabular-nums">{{ money(d.amount, d.code) }}</p>
                        <button class="btn btn-success btn-sm" @click="openSettle(d)">{{ $t('deals.settle') }}</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- History -->
        <h3 class="section-title">{{ $t('deals.history') }}</h3>
        <div class="card card-pad mb-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
                <label class="form-label" for="df-type">{{ $t('common.type') }}</label>
                <select id="df-type" v-model="filters.direction" class="form-input">
                    <option value="">{{ $t('common.all') }}</option>
                    <option value="deal_send">{{ $t('deals.dealSend') }}</option>
                    <option value="deal_receive">{{ $t('deals.dealReceive') }}</option>
                </select>
            </div>
            <div>
                <label class="form-label" for="df-status">{{ $t('common.status') }}</label>
                <select id="df-status" v-model="filters.status" class="form-input">
                    <option value="">{{ $t('common.all') }}</option>
                    <option value="completed">{{ $t('status.completed') }}</option>
                    <option value="cancelled">{{ $t('status.cancelled') }}</option>
                </select>
            </div>
            <div>
                <label class="form-label" for="df-from">{{ $t('filters.from') }}</label>
                <input id="df-from" v-model="filters.date_from" type="date" class="form-input" />
            </div>
            <div>
                <label class="form-label" for="df-to">{{ $t('filters.to') }}</label>
                <input id="df-to" v-model="filters.date_to" type="date" class="form-input" />
            </div>
        </div>

        <div v-if="loading && !historyRows.length" class="space-y-3">
            <div v-for="i in 3" :key="i" class="h-20 rounded-2xl animate-shimmer" />
        </div>
        <EmptyState v-else-if="!historyRows.length" :title="$t('deals.noDeals')" :text="$t('deals.noDealsHint')" />
        <div v-else class="space-y-3">
            <div v-for="tx in historyRows" :key="tx.id" class="card card-pad">
                <div class="flex flex-wrap items-start justify-between gap-3">
                    <div class="min-w-0">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="directionClassLocal(tx.direction)">{{ $t(directionLabel(tx.direction)) }}</span>
                            <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="dealStatusClass(tx)">{{ $t(dealStatusLabel(tx)) }}</span>
                        </div>
                        <p class="mt-2 text-sm font-semibold text-gray-900">{{ dealLabel(tx) }}</p>
                        <p class="text-xs text-gray-500">{{ tx.tx_number }} · {{ dateTime(tx.created_at) }}</p>
                    </div>
                    <p class="text-lg font-bold text-gray-900 tabular-nums">{{ money(tx.amount, tx.currency?.code) }}</p>
                </div>

                <!-- Settlement(s) -->
                <ul v-if="tx.deal_settlements?.length" class="mt-3 rounded-xl bg-gray-50 divide-y divide-gray-100">
                    <li v-for="leg in tx.deal_settlements" :key="leg.id" class="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                        <span class="text-gray-600">{{ $t('deals.settledInto', { wallet: leg.settle_account?.name || '—' }) }}</span>
                        <span class="font-semibold text-gray-900 tabular-nums">{{ money(leg.settle_amount, leg.settle_currency?.code) }}</span>
                    </li>
                </ul>

                <div v-if="canSettle(tx) || tx.status === 'completed'" class="mt-3 flex flex-wrap gap-2 justify-end">
                    <button v-if="canSettle(tx)" class="btn btn-success btn-sm" @click="openSettle(tx)">{{ $t('deals.settle') }}</button>
                    <button v-if="tx.status === 'completed'" class="btn btn-soft-danger btn-sm" @click="openCancel(tx)">{{ $t('deals.cancelDeal') }}</button>
                </div>
            </div>
        </div>
        <Pagination :meta="meta" @page="p => { page = p; loadDeals() }" />

        <!-- Settle -->
        <Modal :open="settleTarget !== null" :title="$t('deals.settleTitle')" @close="settleTarget = null">
            <form v-if="settleTarget" class="space-y-4" @submit.prevent="confirmSettle">
                <div class="rounded-xl bg-gray-50 p-3 text-sm">
                    <p class="font-semibold text-gray-900">{{ dealLabel(settleTarget) }}</p>
                    <p class="text-gray-600">{{ $t(directionLabel(settleTarget.direction)) }} · {{ money(settleTarget.amount, settleTarget.code || settleTarget.currency?.code) }}</p>
                </div>
                <div>
                    <label class="form-label">{{ $t('deals.settleWallet') }} <span class="text-red-500">*</span></label>
                    <LogoSelect v-model="settleForm.settle_account_id" :options="walletOptions" :placeholder="$t('common.select')" sublabel-key="group_label" />
                </div>
                <div>
                    <label class="form-label" for="settle-amount">{{ $t('deals.settleAmount') }} <span class="text-red-500">*</span></label>
                    <MoneyInput id="settle-amount" v-model="settleForm.settle_amount" class="form-input" />
                </div>
                <div>
                    <label class="form-label" for="settle-notes">{{ $t('deals.notes') }}</label>
                    <input id="settle-notes" v-model="settleForm.notes" type="text" class="form-input" />
                </div>
                <p class="form-hint">{{ $t('deals.settleNote') }}</p>
                <Alert v-if="modalError" type="error">{{ modalError }}</Alert>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" @click="settleTarget = null">{{ $t('common.cancel') }}</button>
                    <button type="submit" :disabled="busy || !settleForm.settle_account_id || !settleForm.settle_amount" class="btn btn-success">
                        {{ busy ? $t('common.processing') : $t('deals.settle') }}
                    </button>
                </div>
            </form>
        </Modal>

        <!-- Cancel -->
        <Modal :open="cancelTarget !== null" :title="$t('deals.cancelTitle')" @close="cancelTarget = null">
            <form class="space-y-4" @submit.prevent="confirmCancel">
                <p class="text-sm text-gray-600">{{ $t('deals.cancelText', { number: cancelTarget?.tx_number }) }}</p>
                <div>
                    <label class="form-label" for="deal-cancel-reason">{{ $t('remittances.reason') }} <span class="text-red-500">*</span></label>
                    <textarea id="deal-cancel-reason" v-model="cancelReason" rows="2" class="form-input" :placeholder="$t('remittances.reasonPlaceholder')" />
                </div>
                <Alert v-if="modalError" type="error">{{ modalError }}</Alert>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" @click="cancelTarget = null">{{ $t('common.back') }}</button>
                    <button type="submit" :disabled="busy || !cancelReason.trim()" class="btn btn-danger">
                        {{ busy ? $t('common.processing') : $t('deals.cancelDeal') }}
                    </button>
                </div>
            </form>
        </Modal>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { api, apiError } from '../api/client'
import { useToast } from '../composables/useToast'
import { dateTime, money } from '../utils/format'
import Modal from '../components/Modal.vue'
import MoneyInput from '../components/MoneyInput.vue'
import Pagination from '../components/Pagination.vue'
import LogoSelect from '../components/LogoSelect.vue'
import LogoAvatar from '../components/LogoAvatar.vue'
import Alert from '../components/ui/Alert.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import PageHeader from '../components/ui/PageHeader.vue'

const { t } = useI18n()
const { showToast } = useToast()

const wallets = ref([])
const summary = ref({ pending_accounts: [], pending_deals: [] })

const WALLET_GROUP_ORDER = ['office', 'personal', 'private', 'agents']

const resolveWalletGroup = (w) => {
    if (w.wallet_group) return w.wallet_group
    if (w.account_type_code === 'agent_wallet') return 'agents'
    if (w.visibility === 'owner_private') return 'private'
    return 'office'
}

const walletGroupLabel = (w) => {
    const g = resolveWalletGroup(w)
    if (g === 'agents') return t('accounts.agentsGroup')
    if (g === 'personal') return t('accounts.personalGroup')
    if (g === 'private') return t('accounts.privateGroup')
    return t('accounts.officeGroup')
}

const walletOptions = computed(() => {
    const list = wallets.value.map((w) => ({ ...w, group_label: `${w.currency_code} · ${walletGroupLabel(w)}` }))
    list.sort((a, b) => WALLET_GROUP_ORDER.indexOf(resolveWalletGroup(a)) - WALLET_GROUP_ORDER.indexOf(resolveWalletGroup(b)))
    return list
})
const deals = ref([])
const meta = ref(null)
const page = ref(1)
const loading = ref(false)
const busy = ref(false)
const error = ref('')
const openError = ref('')
const modalError = ref('')
const openFormVisible = ref(false)

// One card per deal: settlement legs are shown inside their parent.
const historyRows = computed(() => deals.value.filter((tx) => tx.direction !== 'deal_settle'))

const filters = reactive({ direction: '', status: '', date_from: '', date_to: '' })

const blankOpen = () => ({ status: 'completed', send_account_id: '', send_amount: null, receive_account_id: '', receive_amount: null, notes: '' })
const openForm = reactive(blankOpen())
const settleTarget = ref(null)
const settleForm = reactive({ settle_account_id: '', settle_amount: null, notes: '' })
const cancelTarget = ref(null)
const cancelReason = ref('')

const isSettled = (tx) => (tx.deal_settlements || []).length > 0
const canSettle = (tx) => tx.status === 'completed' && ! isSettled(tx)

function dealStatusClass(tx) {
    if (tx.status !== 'completed') return 'bg-red-100 text-red-800'
    return isSettled(tx) ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
}

function dealStatusLabel(tx) {
    if (tx.status !== 'completed') return 'status.cancelled'
    return isSettled(tx) ? 'deals.settledBadge' : 'deals.unsettled'
}

function directionLabel(direction) {
    return { deal_send: 'deals.dealSend', deal_receive: 'deals.dealReceive', deal_settle: 'deals.dealSettle' }[direction] || 'common.type'
}

function directionClassLocal(direction) {
    if (direction === 'deal_send') return 'bg-blue-100 text-blue-800'
    if (direction === 'deal_receive') return 'bg-purple-100 text-purple-800'
    return 'bg-emerald-100 text-emerald-800'
}

function walletNameFor(deal) {
    if (! deal) return ''
    if (typeof deal.wallet === 'string') return deal.wallet
    return deal.account?.name || ''
}

function dealLabel(deal) {
    return deal?.counterparty_name && deal.counterparty_name !== '—'
        ? deal.counterparty_name
        : (walletNameFor(deal) || '—')
}

function walletLogoFor(deal) {
    const w = wallets.value.find((x) => x.name === walletNameFor(deal))
    return w?.logo_url || ''
}

function openSettle(deal) {
    modalError.value = ''
    settleTarget.value = deal
    settleForm.settle_account_id = deal?.settle_account_id || ''
    settleForm.settle_amount = deal?.settle_amount || deal?.amount || null
    settleForm.notes = ''
}

function openCancel(tx) {
    modalError.value = ''
    cancelTarget.value = tx
    cancelReason.value = ''
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
    loading.value = true
    try {
        const params = { page: page.value }
        for (const [k, v] of Object.entries(filters)) if (v) params[k] = v
        const res = await api.get('/exchange-deals', { params })
        deals.value = res.data.data.data
        meta.value = {
            current_page: res.data.data.current_page,
            last_page: res.data.data.last_page,
            total: res.data.data.total,
        }
    } catch (e) {
        error.value = apiError(e).message
    } finally {
        loading.value = false
    }
}

watch(filters, () => {
    page.value = 1
    loadDeals()
})

async function refresh() {
    await Promise.all([loadBase(), loadDeals()])
}

async function submitOpen() {
    openError.value = ''
    if (! openForm.send_account_id || ! Number(openForm.send_amount)) {
        openError.value = t('deals.fillSend')
        return
    }
    if (openForm.status === 'completed' && (! openForm.receive_account_id || ! Number(openForm.receive_amount))) {
        openError.value = t('deals.fillReceive')
        return
    }
    busy.value = true
    try {
        await api.post('/exchange-deals', {
            ...openForm,
            receive_account_id: openForm.receive_account_id || null,
            receive_amount: openForm.receive_amount ? Number(openForm.receive_amount) : null,
        })
        showToast({ message: t('deals.openedToast') })
        Object.assign(openForm, blankOpen())
        openFormVisible.value = false
        await refresh()
    } catch (e) {
        openError.value = apiError(e).message
    } finally {
        busy.value = false
    }
}

async function confirmSettle() {
    if (! settleTarget.value) return
    busy.value = true
    modalError.value = ''
    try {
        await api.post(`/exchange-deals/${settleTarget.value.id}/settle`, { ...settleForm })
        showToast({ message: t('deals.settledToast') })
        settleTarget.value = null
        await refresh()
    } catch (e) {
        modalError.value = apiError(e).message
    } finally {
        busy.value = false
    }
}

async function confirmCancel() {
    if (! cancelTarget.value) return
    busy.value = true
    modalError.value = ''
    try {
        await api.patch(`/exchange-deals/${cancelTarget.value.id}/cancel`, { reason: cancelReason.value })
        showToast({ message: t('deals.cancelledToast') })
        cancelTarget.value = null
        await refresh()
    } catch (e) {
        modalError.value = apiError(e).message
    } finally {
        busy.value = false
    }
}

onMounted(refresh)
</script>
