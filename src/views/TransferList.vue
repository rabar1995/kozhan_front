<template>
    <div>
        <SectionTabs :tabs="tabs" :label="$t('nav.walletsGroup')" />

        <PageHeader :text="$t('transfers.intro')">
            <button class="btn btn-primary" @click="openForm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
                {{ $t('transfers.newTransfer') }}
            </button>
        </PageHeader>

        <Alert v-if="error" type="error" dismissible class="mb-4" @dismiss="error = ''">{{ error }}</Alert>

        <div v-if="loading && !transfers.length" class="space-y-3">
            <div v-for="i in 4" :key="i" class="h-16 rounded-2xl animate-shimmer" />
        </div>
        <EmptyState v-else-if="!transfers.length" :title="$t('transfers.noTransfers')" :text="$t('transfers.intro')">
            <button class="btn btn-primary" @click="openForm">{{ $t('transfers.newTransfer') }}</button>
        </EmptyState>
        <ul v-else class="card divide-y divide-gray-100">
            <li v-for="tr in transfers" :key="tr.id" class="flex items-center gap-3 px-4 py-3">
                <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-gray-900 truncate">
                        {{ $t('transfers.fromTo', { from: tr.from_account?.name || '—', to: tr.to_account?.name || '—' }) }}
                    </p>
                    <p v-if="tr.description" class="text-xs text-gray-500 truncate">{{ tr.description }}</p>
                    <p class="text-xs text-gray-400">{{ dateTime(tr.created_at) }} · {{ tr.creator?.name || '—' }}</p>
                </div>
                <p class="text-sm font-bold tabular-nums text-gray-900 shrink-0">{{ money(tr.amount, tr.currency?.code) }}</p>
            </li>
        </ul>
        <Pagination :meta="meta" @page="load" />

        <Modal :open="showForm" :title="$t('transfers.newTransfer')" @close="showForm = false">
            <form class="space-y-4" novalidate @submit.prevent="submit">
                <div>
                    <label class="form-label" for="tr-from">{{ $t('transfers.from') }} <span class="text-red-500">*</span></label>
                    <select id="tr-from" v-model="form.from_account_id" class="form-input">
                        <option value="" disabled>{{ $t('common.select') }}</option>
                        <option v-for="a in cashAccounts" :key="a.id" :value="a.id">{{ a.name }} — {{ money(a.current_balance, a.currency?.code) }}</option>
                    </select>
                </div>
                <div>
                    <label class="form-label" for="tr-to">{{ $t('transfers.to') }} <span class="text-red-500">*</span></label>
                    <select id="tr-to" v-model="form.to_account_id" class="form-input" :disabled="!fromAccount">
                        <option value="" disabled>{{ fromAccount ? $t('common.select') : $t('transfers.pickFromFirst') }}</option>
                        <option v-for="a in toAccounts" :key="a.id" :value="a.id">{{ a.name }} — {{ money(a.current_balance, a.currency?.code) }}</option>
                    </select>
                    <p class="form-hint">{{ $t('transfers.sameCurrencyNote') }}</p>
                </div>
                <div>
                    <label class="form-label" for="tr-amount">{{ $t('transfers.amount') }} <span class="text-red-500">*</span></label>
                    <MoneyInput id="tr-amount" v-model="form.amount" class="form-input font-semibold" />
                </div>
                <div>
                    <label class="form-label" for="tr-desc">{{ $t('transfers.description') }}</label>
                    <input id="tr-desc" v-model="form.description" class="form-input" />
                </div>
                <Alert v-if="formError" type="error">{{ formError }}</Alert>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" @click="showForm = false">{{ $t('common.cancel') }}</button>
                    <button type="submit" :disabled="busy || !canSubmit" class="btn btn-primary">{{ busy ? $t('transfers.moving') : $t('transfers.transferBtn') }}</button>
                </div>
            </form>
        </Modal>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { api, apiError } from '../api/client'
import { useAccountStore } from '../stores/account'
import { useConfirm } from '../composables/useConfirm'
import { useToast } from '../composables/useToast'
import { useWalletTabs } from '../composables/useSectionTabs'
import { money, dateTime } from '../utils/format'
import Modal from '../components/Modal.vue'
import Pagination from '../components/Pagination.vue'
import MoneyInput from '../components/MoneyInput.vue'
import Alert from '../components/ui/Alert.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import PageHeader from '../components/ui/PageHeader.vue'
import SectionTabs from '../components/ui/SectionTabs.vue'

const { t } = useI18n()
const accountStore = useAccountStore()
const { confirm } = useConfirm()
const { showToast } = useToast()
const tabs = useWalletTabs()

// Only real money wallets (no agent or system accounts).
const CASH_TYPES = ['cash_safe', 'e_wallet', 'bank_account', 'crypto_wallet', 'crypto_platform']
const cashAccounts = computed(() => accountStore.accounts.filter((a) => a.is_active && CASH_TYPES.includes(a.account_type?.code)))

const transfers = ref([])
const meta = ref(null)
const loading = ref(false)
const error = ref('')
const formError = ref('')
const busy = ref(false)
const showForm = ref(false)
const form = reactive({ from_account_id: '', to_account_id: '', amount: null, description: '' })

const fromAccount = computed(() => cashAccounts.value.find((a) => a.id === form.from_account_id))
const toAccounts = computed(() => cashAccounts.value.filter((a) =>
    a.id !== form.from_account_id && a.currency_id === fromAccount.value?.currency_id))
const canSubmit = computed(() => form.from_account_id && form.to_account_id && Number(form.amount) > 0)

watch(() => form.from_account_id, () => {
    if (! toAccounts.value.some((a) => a.id === form.to_account_id)) form.to_account_id = ''
})

function openForm() {
    Object.assign(form, { from_account_id: '', to_account_id: '', amount: null, description: '' })
    formError.value = ''
    showForm.value = true
}

async function load(page = 1) {
    loading.value = true
    try {
        const res = await api.get('/transfers', { params: { page } })
        transfers.value = res.data.data.data
        meta.value = res.data.data
    } catch (e) {
        error.value = apiError(e).message
    } finally {
        loading.value = false
    }
}

async function submit() {
    if (! canSubmit.value) return
    const to = toAccounts.value.find((a) => a.id === form.to_account_id)
    const amount = money(form.amount, fromAccount.value?.currency?.code)
    const ok = await confirm({
        title: t('transfers.confirmTitle'),
        message: t('transfers.confirmText', { amount, from: fromAccount.value?.name, to: to?.name }),
        type: 'info',
        confirmText: t('transfers.transferBtn'),
        cancelText: t('common.cancel'),
    })
    if (! ok) return
    busy.value = true
    formError.value = ''
    try {
        await api.post('/transfers', { ...form, currency_id: fromAccount.value?.currency_id })
        showToast({ message: t('transfers.doneToast', { amount }) })
        showForm.value = false
        await Promise.all([load(1), accountStore.fetchAccounts()])
    } catch (e) {
        formError.value = apiError(e).message
    } finally {
        busy.value = false
    }
}

onMounted(() => {
    load()
    accountStore.fetchAccounts().catch(() => {})
})
</script>
