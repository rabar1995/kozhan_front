<template>
    <div class="space-y-4">
        <Alert v-if="error" type="error" dismissible @dismiss="error = ''">{{ error }}</Alert>

        <!-- Count + view switch -->
        <div class="flex items-center justify-between gap-3">
            <p class="text-sm text-gray-500">
                {{ $t('remittances.countLabel', { n: rows.length }, rows.length) }}
            </p>
            <ViewToggle v-model="viewMode" />
        </div>

        <!-- Loading -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div v-for="n in 6" :key="n" class="card card-pad space-y-3">
                <div class="h-5 animate-shimmer rounded w-1/3" />
                <div class="h-16 animate-shimmer rounded-xl" />
                <div class="h-10 animate-shimmer rounded-xl" />
            </div>
        </div>

        <!-- Empty -->
        <EmptyState
            v-else-if="!rows.length"
            :title="$t('remittances.noRows')"
            :text="emptyText || $t('remittances.noRowsHint')"
            icon="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
        >
            <slot name="empty-actions" />
        </EmptyState>

        <!-- Cards -->
        <div v-else-if="viewMode === 'cards'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div v-for="row in rows" :key="row.id" class="card card-pad flex flex-col">
                <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2 min-w-0">
                        <span class="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg shrink-0">{{ row.remittance_number }}</span>
                        <StatusBadge :value="row.direction" />
                    </div>
                    <StatusBadge :value="row.status" />
                </div>

                <div class="mt-3 space-y-1 text-sm">
                    <p class="flex justify-between gap-2"><span class="text-gray-500">{{ $t('forms.senderName') }}</span><span class="font-medium text-gray-900 truncate">{{ row.sender_name }}</span></p>
                    <p class="flex justify-between gap-2"><span class="text-gray-500">{{ $t('forms.receiverName') }}</span><span class="font-medium text-gray-900 truncate">{{ row.receiver_name }}</span></p>
                    <p class="flex justify-between gap-2"><span class="text-gray-500">{{ $t('remittances.agent') }}</span><span class="text-gray-700 truncate">{{ row.agent?.name || '-' }}</span></p>
                </div>

                <div class="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-gray-50 p-3 text-center">
                    <div>
                        <p class="text-xs text-gray-500">{{ $t('remittances.send') }}</p>
                        <p class="text-sm font-bold text-gray-900 tabular-nums">{{ money(row.send_amount, row.send_currency?.code) }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-indigo-600">{{ $t('remittances.receive') }}</p>
                        <p class="text-sm font-bold text-indigo-700 tabular-nums">{{ money(row.receive_amount, row.receive_currency?.code) }}</p>
                    </div>
                </div>

                <p class="mt-2 text-xs text-gray-400">{{ dateTime(row.created_at) }}</p>

                <div class="mt-auto pt-3 flex flex-wrap items-center gap-2">
                    <button v-if="canPay(row)" class="btn btn-success btn-sm flex-1" @click="payRow = row">
                        {{ $t('remittances.complete') }}
                    </button>
                    <button class="btn btn-secondary btn-sm flex-1" @click="openDetails(row)">{{ $t('common.details') }}</button>
                    <button v-if="canCancel(row)" class="btn btn-soft-danger btn-sm" @click="openCancel(row)">
                        {{ $t('remittances.cancelAction') }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Table -->
        <div v-else class="card overflow-x-auto">
            <table class="min-w-full text-sm table-enhanced">
                <thead class="bg-gray-50 text-start text-xs text-gray-500 border-b border-gray-100">
                    <tr>
                        <th class="px-4 py-3 text-start">{{ $t('remittances.number') }}</th>
                        <th class="px-4 py-3 text-start">{{ $t('remittances.senderReceiver') }}</th>
                        <th class="px-4 py-3 text-start">{{ $t('remittances.agent') }}</th>
                        <th class="px-4 py-3 text-end">{{ $t('remittances.receive') }}</th>
                        <th class="px-4 py-3 text-start">{{ $t('common.status') }}</th>
                        <th class="px-4 py-3 text-start">{{ $t('remittances.created') }}</th>
                        <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="row in rows" :key="row.id">
                        <td class="px-4 py-3">
                            <span class="font-mono font-bold text-gray-900 block">{{ row.remittance_number }}</span>
                            <StatusBadge :value="row.direction" class="mt-1" />
                        </td>
                        <td class="px-4 py-3 text-gray-700">
                            <span class="block font-medium text-gray-900">{{ row.receiver_name }}</span>
                            <span class="block text-xs text-gray-500">{{ $t('dashboard.fromSender', { name: row.sender_name }) }}</span>
                        </td>
                        <td class="px-4 py-3 text-gray-700">{{ row.agent?.name || '-' }}</td>
                        <td class="px-4 py-3 text-end whitespace-nowrap">
                            <span class="block font-bold text-indigo-700">{{ money(row.receive_amount, row.receive_currency?.code) }}</span>
                            <span class="block text-xs text-gray-500">{{ $t('remittances.sentAmount', { amount: money(row.send_amount, row.send_currency?.code) }) }}</span>
                        </td>
                        <td class="px-4 py-3"><StatusBadge :value="row.status" /></td>
                        <td class="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{{ dateTime(row.created_at) }}</td>
                        <td class="px-4 py-3">
                            <div class="flex justify-end gap-1.5">
                                <button v-if="canPay(row)" class="btn btn-success btn-sm" @click="payRow = row">{{ $t('remittances.complete') }}</button>
                                <button class="btn btn-secondary btn-sm" @click="openDetails(row)">{{ $t('common.details') }}</button>
                                <button v-if="canCancel(row)" class="btn btn-soft-danger btn-sm" @click="openCancel(row)">{{ $t('remittances.cancelAction') }}</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <PayoutModal :remittance="payRow" @close="payRow = null" @paid="emit('refresh')" />

        <!-- Cancel -->
        <Modal :open="showCancel" :title="$t('remittances.cancelRemittanceTitle')" @close="showCancel = false">
            <div class="space-y-4">
                <p class="text-sm text-gray-600">{{ $t('remittances.cancelText', { number: activeRow?.remittance_number }) }}</p>
                <div>
                    <label class="form-label" for="cancel-reason">{{ $t('remittances.reason') }}</label>
                    <textarea id="cancel-reason" v-model="cancelReason" rows="3" class="form-input" :placeholder="$t('remittances.reasonPlaceholder')" />
                </div>
                <Alert v-if="cancelError" type="error">{{ cancelError }}</Alert>
                <div class="modal-actions">
                    <button class="btn btn-secondary" @click="showCancel = false">{{ $t('common.back') }}</button>
                    <button class="btn btn-danger" :disabled="!cancelReason.trim() || busy" @click="confirmCancel">
                        {{ busy ? $t('common.processing') : $t('remittances.confirmCancelBtn') }}
                    </button>
                </div>
            </div>
        </Modal>

        <!-- Details: plain summary first, accounting entries behind a toggle -->
        <Modal :open="showDetails" :title="detail?.remittance_number || $t('remittances.detailsFallback')" max-width="sm:max-w-2xl" @close="showDetails = false">
            <div v-if="detailLoading" class="text-gray-400 text-sm py-8 text-center">{{ $t('common.loading') }}</div>
            <template v-else-if="detail">
                <div class="flex flex-wrap gap-2 mb-4">
                    <StatusBadge :value="detail.direction" />
                    <StatusBadge :value="detail.status" />
                </div>

                <div class="grid grid-cols-2 gap-3 mb-4">
                    <div class="rounded-xl bg-gray-50 p-3">
                        <p class="text-xs text-gray-500">{{ $t('remittances.dSend') }}</p>
                        <p class="text-lg font-bold text-gray-900 tabular-nums">{{ money(detail.send_amount, detail.send_currency?.code) }}</p>
                    </div>
                    <div class="rounded-xl bg-indigo-50 p-3">
                        <p class="text-xs text-indigo-600">{{ $t('remittances.dReceive') }}</p>
                        <p class="text-lg font-bold text-indigo-700 tabular-nums">{{ money(detail.receive_amount, detail.receive_currency?.code) }}</p>
                    </div>
                </div>

                <dl class="divide-y divide-gray-100 text-sm mb-4">
                    <div v-for="item in detailRows" :key="item.label" class="flex justify-between gap-4 py-2">
                        <dt class="text-gray-500 shrink-0">{{ item.label }}</dt>
                        <dd class="font-medium text-gray-900 text-end">{{ item.value }}</dd>
                    </div>
                </dl>

                <Alert v-if="detail.cancel_reason" type="error" class="mb-3">
                    <span class="font-semibold">{{ $t('remittances.dCancelReason') }}:</span> {{ detail.cancel_reason }}
                </Alert>
                <Alert v-if="detail.notes" type="info" class="mb-3">
                    <span class="font-semibold">{{ $t('remittances.dNotes') }}:</span> {{ detail.notes }}
                </Alert>

                <button type="button" class="btn btn-ghost btn-sm" @click="showAccounting = !showAccounting">
                    {{ showAccounting ? $t('remittances.hideAccounting') : $t('remittances.showAccounting') }}
                </button>

                <div v-if="showAccounting" class="mt-3 space-y-4">
                    <div v-for="tx in txGroups" :key="tx.key">
                        <h4 class="text-xs font-semibold text-gray-500 mb-2">{{ $t(tx.label) }}</h4>
                        <template v-if="tx.tx">
                            <p class="text-xs text-gray-500 mb-1">
                                <span class="font-mono font-bold text-gray-700">{{ tx.tx.tx_number }}</span>
                                <span v-if="tx.tx.is_void" class="text-red-500 font-medium ms-1">{{ $t('remittances.void') }}</span>
                            </p>
                            <table class="w-full text-xs border border-gray-100 rounded-xl overflow-hidden">
                                <thead class="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th class="px-3 py-2 text-start">{{ $t('remittances.txAccount') }}</th>
                                        <th class="px-3 py-2 text-end">{{ $t('remittances.entryTypes.debit') }}</th>
                                        <th class="px-3 py-2 text-end">{{ $t('remittances.entryTypes.credit') }}</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100">
                                    <tr v-for="entry in tx.tx.journal_entries" :key="entry.id">
                                        <td class="px-3 py-2 text-gray-900">{{ entry.account?.name || $t('remittances.removedWallet') }}</td>
                                        <td class="px-3 py-2 text-end tabular-nums">{{ entry.entry_type === 'debit' ? money(entry.amount) : '' }}</td>
                                        <td class="px-3 py-2 text-end tabular-nums">{{ entry.entry_type === 'credit' ? money(entry.amount) : '' }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </template>
                        <p v-else class="text-xs text-gray-400">{{ $t('common.none') }}</p>
                    </div>
                </div>
            </template>
            <Alert v-else type="error">{{ $t('remittances.detailsFailed') }}</Alert>
        </Modal>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRemittanceStore } from '../stores/remittance'
import { usePermissions } from '../composables/usePermissions'
import { useToast } from '../composables/useToast'
import { useViewMode } from '../composables/useViewMode'
import { apiError } from '../api/client'
import { money, dateTime } from '../utils/format'
import Modal from './Modal.vue'
import StatusBadge from './StatusBadge.vue'
import PayoutModal from './PayoutModal.vue'
import Alert from './ui/Alert.vue'
import EmptyState from './ui/EmptyState.vue'
import ViewToggle from './ui/ViewToggle.vue'

const { t, te } = useI18n()

defineProps({
    rows: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    emptyText: { type: String, default: '' },
})

const emit = defineEmits(['refresh'])

const viewMode = useViewMode('remittances')
const store = useRemittanceStore()
const { can } = usePermissions()
const { showToast } = useToast()

const error = ref('')
const busy = ref(false)
const payRow = ref(null)

const showCancel = ref(false)
const showDetails = ref(false)
const showAccounting = ref(false)
const activeRow = ref(null)
const cancelReason = ref('')
const cancelError = ref('')
const detail = ref(null)
const detailLoading = ref(false)

const canPay = (row) => row.status === 'pending' && can('complete-remittance')
const canCancel = (row) => row.status === 'pending' && can('cancel-remittance')

const commissionLabel = (type) => (type && te(`remittances.commissionTypes.${type}`) ? t(`remittances.commissionTypes.${type}`) : '')

const detailRows = computed(() => {
    const d = detail.value
    if (! d) return []
    const withPhone = (name, phone) => (phone ? `${name} · ${phone}` : name)
    const rows = [
        { label: t('remittances.dSender'), value: withPhone(d.sender_name, d.sender_phone) },
        { label: t('remittances.dReceiver'), value: withPhone(d.receiver_name, d.receiver_phone) },
        { label: t('remittances.dAgent'), value: d.agent?.name || '-' },
    ]
    if (Number(d.commission_amount)) {
        rows.push({
            label: t('remittances.dCommission'),
            value: `${money(d.commission_amount, d.commission_currency?.code)} ${commissionLabel(d.commission_type)}`.trim(),
        })
    }
    rows.push({ label: t('remittances.dCreatedBy'), value: `${d.created_by?.name || '-'} · ${dateTime(d.created_at)}` })
    if (d.completed_at) {
        rows.push({ label: t('remittances.dCompleted'), value: `${d.completed_by?.name || '-'} · ${dateTime(d.completed_at)}` })
    }
    return rows
})

const txGroups = computed(() => detail.value
    ? [
        { key: 'booking', label: 'remittances.bookingTx', tx: detail.value.booking_transaction },
        { key: 'commission', label: 'remittances.commissionTx', tx: detail.value.commission_transaction },
        { key: 'settlement', label: 'remittances.settlementTx', tx: detail.value.settlement_transaction },
    ]
    : [])

function openCancel(row) {
    activeRow.value = row
    cancelReason.value = ''
    cancelError.value = ''
    showCancel.value = true
}

async function confirmCancel() {
    busy.value = true
    cancelError.value = ''
    try {
        await store.cancel(activeRow.value.id, cancelReason.value)
        showToast({ message: t('remittances.cancelledMsg', { number: activeRow.value.remittance_number }) })
        showCancel.value = false
        emit('refresh')
    } catch (e) {
        cancelError.value = apiError(e).message || t('remittances.failedCancel')
    } finally {
        busy.value = false
    }
}

async function openDetails(row) {
    showDetails.value = true
    showAccounting.value = false
    detail.value = null
    detailLoading.value = true
    try {
        detail.value = await store.fetchOne(row.id)
    } catch {
        detail.value = null
    } finally {
        detailLoading.value = false
    }
}
</script>
