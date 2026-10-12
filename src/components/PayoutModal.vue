<template>
    <Modal :open="!!remittance" :title="$t('remittances.completePayoutTitle')" @close="close">
        <div class="space-y-4">
            <div class="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-center">
                <p class="text-xs text-emerald-700">{{ $t('remittances.payTo', { receiver: remittance?.receiver_name }) }}</p>
                <p class="text-2xl font-bold text-emerald-800 tabular-nums mt-1">
                    {{ money(remittance?.receive_amount, currencyCode) }}
                </p>
                <p class="text-xs text-emerald-700/80 mt-1 font-mono">{{ remittance?.remittance_number }}</p>
            </div>

            <div>
                <label class="form-label">{{ $t('remittances.paymentAccount') }}</label>
                <LogoSelect
                    v-model="accountId"
                    :options="accountOptions"
                    :placeholder="$t('remittances.selectAccount')"
                    :empty-text="$t('remittances.noPayAccount', { currency: currencyCode })"
                    sublabel-key="sublabel"
                />
                <p v-if="!loadingAccounts && !accountOptions.length" class="form-hint text-amber-700">
                    {{ $t('remittances.noPayAccount', { currency: currencyCode }) }}
                </p>
                <p v-else-if="lowBalance" class="form-hint text-amber-700">{{ $t('remittances.lowBalance') }}</p>
            </div>

            <Alert v-if="error" type="error">{{ error }}</Alert>

            <div class="modal-actions">
                <button type="button" class="btn btn-secondary" @click="close">{{ $t('common.cancel') }}</button>
                <button
                    type="button"
                    class="btn btn-success"
                    :disabled="!accountId || busy"
                    @click="confirm"
                >
                    {{ busy ? $t('common.processing') : $t('remittances.confirmPayoutBtn') }}
                </button>
            </div>
        </div>
    </Modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAccountStore } from '../stores/account'
import { useRemittanceStore } from '../stores/remittance'
import { useToast } from '../composables/useToast'
import { apiError } from '../api/client'
import { money } from '../utils/format'
import Modal from './Modal.vue'
import Alert from './ui/Alert.vue'
import LogoSelect from './LogoSelect.vue'

/**
 * Single payout dialog used everywhere a pending remittance is paid out
 * (dashboard feed, remittance list, pending list). Only cash wallets in
 * the remittance's receive currency are offered.
 */
const props = defineProps({
    remittance: { type: Object, default: null },
})

const emit = defineEmits(['close', 'paid'])

const { t } = useI18n()
const accountStore = useAccountStore()
const remittanceStore = useRemittanceStore()
const { showToast } = useToast()

const CASH_TYPES = ['cash_safe', 'e_wallet', 'bank_account']
const GROUP_ORDER = ['office', 'personal', 'private', 'agents']

const accountId = ref('')
const error = ref('')
const busy = ref(false)
const loadingAccounts = ref(false)

const currencyCode = computed(() => props.remittance?.receive_currency?.code || '')

const walletGroup = (a) => a.wallet_group || (a.visibility === 'owner_private' ? 'private' : 'office')

const accountOptions = computed(() => {
    const groupLabel = (g) => {
        if (g === 'agents') return t('accounts.agentsGroup')
        if (g === 'personal') return t('accounts.personalGroup')
        if (g === 'private') return t('accounts.privateGroup')
        return t('accounts.officeGroup')
    }
    const list = accountStore.balances
        .filter((a) =>
            CASH_TYPES.includes(a.type)
            && a.current_balance !== null
            && (! currencyCode.value || a.currency === currencyCode.value),
        )
        .map((a) => ({
            ...a,
            group: walletGroup(a),
            sublabel: `${money(a.current_balance, a.currency)} · ${groupLabel(walletGroup(a))}`,
        }))
    list.sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group))
    return list
})

const lowBalance = computed(() => {
    const a = accountOptions.value.find((o) => o.id === accountId.value)
    return a ? Number(a.current_balance) < Number(props.remittance?.receive_amount || 0) : false
})

watch(() => props.remittance, async (r) => {
    if (! r) return
    accountId.value = ''
    error.value = ''
    loadingAccounts.value = true
    try {
        await accountStore.fetchBalances()
        if (accountOptions.value.length === 1) accountId.value = accountOptions.value[0].id
    } catch (e) {
        error.value = apiError(e).message
    } finally {
        loadingAccounts.value = false
    }
})

function close() {
    if (! busy.value) emit('close')
}

async function confirm() {
    busy.value = true
    error.value = ''
    try {
        await remittanceStore.complete(props.remittance.id, { payment_account_id: accountId.value })
        showToast({ message: t('remittances.completedMsg', { number: props.remittance.remittance_number }) })
        emit('paid', props.remittance)
        emit('close')
    } catch (e) {
        error.value = apiError(e).message || t('remittances.failedComplete')
    } finally {
        busy.value = false
    }
}
</script>
