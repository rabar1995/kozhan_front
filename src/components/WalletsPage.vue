<template>
    <div>
        <SectionTabs :tabs="tabs" :label="$t('nav.walletsGroup')" />

        <PageHeader :text="intro">
            <button v-if="can('manage-accounts')" class="btn btn-primary" @click="openCreate">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                {{ $t('accounts.newWallet') }}
            </button>
        </PageHeader>

        <Alert v-if="error" type="error" dismissible class="mb-4" @dismiss="error = ''">{{ error }}</Alert>

        <!-- Totals per currency -->
        <div v-if="totals.length" class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div v-for="tot in totals" :key="tot.currency" class="card px-4 py-3">
                <p class="text-xs text-gray-500">{{ $t('accounts.totalIn', { currency: tot.currency }) }}</p>
                <p class="text-lg font-bold tabular-nums" :class="tot.total < 0 ? 'text-red-600' : 'text-gray-900'">{{ money(tot.total, tot.currency) }}</p>
            </div>
        </div>

        <div class="flex items-center gap-2 mb-4">
            <div class="relative flex-1">
                <svg class="w-4 h-4 text-gray-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                <input v-model="searchQuery" data-search type="search" :placeholder="$t('accounts.searchPlaceholder')" class="form-input ps-9" />
            </div>
            <ViewToggle v-model="viewMode" />
        </div>

        <div v-if="accountStore.loading && !wallets.length" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <div v-for="n in 3" :key="n" class="h-40 rounded-2xl animate-shimmer" />
        </div>

        <EmptyState
            v-else-if="!filtered.length"
            :title="searchQuery ? $t('common.noResults') : $t('accounts.noWallets')"
            :text="searchQuery ? $t('common.tryOtherSearch') : intro"
            icon="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 110-6h.75A2.25 2.25 0 0018 1.5H6A2.25 2.25 0 003.75 3.75v16.5A2.25 2.25 0 006 22.5h12a2.25 2.25 0 002.25-2.25V12zM15 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
        >
            <button v-if="searchQuery" class="btn btn-secondary" @click="searchQuery = ''">{{ $t('common.clearSearch') }}</button>
            <button v-else-if="can('manage-accounts')" class="btn btn-primary" @click="openCreate">{{ $t('accounts.newWallet') }}</button>
        </EmptyState>

        <template v-else>
            <section v-for="group in groups" :key="group.key" class="mb-6">
                <h3 v-if="groups.length > 1" class="section-title">{{ group.title }} ({{ group.items.length }})</h3>

                <div v-if="viewMode === 'cards'" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    <div v-for="account in group.items" :key="account.id" class="card card-pad flex flex-col" :class="!account.is_active ? 'opacity-70' : ''">
                        <div class="flex items-center gap-3 min-w-0">
                            <LogoAvatar :name="account.name" :url="account.logo_url" />
                            <div class="min-w-0 flex-1">
                                <h4 class="font-semibold text-gray-900 truncate">{{ account.name }}</h4>
                                <p class="text-xs text-gray-500 truncate">
                                    {{ typeName(account) }}
                                    <span v-if="!account.is_active" class="ms-1 font-semibold text-gray-500">· {{ $t('accounts.inactive') }}</span>
                                </p>
                            </div>
                            <span class="px-2 py-1 rounded-lg text-xs font-bold bg-slate-900 text-white shrink-0">{{ account.currency?.code }}</span>
                        </div>
                        <p class="mt-4 text-2xl font-bold tabular-nums" :class="Number(account.current_balance) < 0 ? 'text-red-600' : 'text-gray-900'">
                            {{ money(account.current_balance, account.currency?.code) }}
                        </p>
                        <div class="mt-auto pt-4 flex gap-2">
                            <button class="btn btn-secondary btn-sm flex-1" @click="historyAccount = account">{{ $t('history.button') }}</button>
                            <button v-if="can('manage-accounts')" class="btn btn-ghost btn-sm" @click="editAccount = account">{{ $t('common.edit') }}</button>
                            <button v-if="can('manage-accounts')" class="btn btn-ghost btn-sm" @click="manageAccount = account">{{ $t('accounts.more') }}</button>
                        </div>
                    </div>
                </div>

                <div v-else class="card overflow-x-auto">
                    <table class="min-w-full text-sm table-enhanced">
                        <thead class="bg-gray-50 text-xs text-gray-500 border-b border-gray-100">
                            <tr>
                                <th class="px-4 py-3 text-start">{{ $t('accounts.name') }}</th>
                                <th class="px-4 py-3 text-start">{{ $t('accounts.type') }}</th>
                                <th class="px-4 py-3 text-end">{{ $t('accounts.balance') }}</th>
                                <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            <tr v-for="account in group.items" :key="account.id" :class="!account.is_active ? 'opacity-70' : ''">
                                <td class="px-4 py-3">
                                    <div class="flex items-center gap-2.5">
                                        <LogoAvatar :name="account.name" :url="account.logo_url" />
                                        <span class="font-semibold text-gray-900">{{ account.name }}</span>
                                    </div>
                                </td>
                                <td class="px-4 py-3 text-gray-600">
                                    {{ typeName(account) }}
                                    <span v-if="!account.is_active" class="text-xs text-gray-500">· {{ $t('accounts.inactive') }}</span>
                                </td>
                                <td class="px-4 py-3 text-end font-bold tabular-nums whitespace-nowrap" :class="Number(account.current_balance) < 0 ? 'text-red-600' : 'text-gray-900'">
                                    {{ money(account.current_balance, account.currency?.code) }}
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex justify-end gap-1.5">
                                        <button class="btn btn-secondary btn-sm" @click="historyAccount = account">{{ $t('history.button') }}</button>
                                        <button v-if="can('manage-accounts')" class="btn btn-ghost btn-sm" @click="editAccount = account">{{ $t('common.edit') }}</button>
                                        <button v-if="can('manage-accounts')" class="btn btn-ghost btn-sm" @click="manageAccount = account">{{ $t('accounts.more') }}</button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </template>

        <!-- Create -->
        <Modal :open="showCreate" :title="$t('accounts.createTitle')" @close="showCreate = false">
            <form class="space-y-4" novalidate @submit.prevent="create">
                <div>
                    <label class="form-label" for="w-name">{{ $t('accounts.name') }} <span class="text-red-500">*</span></label>
                    <input id="w-name" v-model="form.name" required class="form-input" />
                    <p v-if="errors.name" class="form-error">{{ errors.name[0] }}</p>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="form-label" for="w-type">{{ $t('accounts.type') }} <span class="text-red-500">*</span></label>
                        <select id="w-type" v-model="form.account_type_id" class="form-input">
                            <option value="" disabled>{{ $t('common.select') }}</option>
                            <option v-for="t in creatableTypes" :key="t.id" :value="t.id">{{ typeLabel(t) }}</option>
                        </select>
                        <p v-if="errors.account_type_id" class="form-error">{{ errors.account_type_id[0] }}</p>
                    </div>
                    <div>
                        <label class="form-label" for="w-cur">{{ $t('accounts.currency') }} <span class="text-red-500">*</span></label>
                        <select id="w-cur" v-model="form.currency_id" class="form-input">
                            <option value="" disabled>{{ $t('common.select') }}</option>
                            <option v-for="c in currencies" :key="c.id" :value="c.id">{{ c.code }}</option>
                        </select>
                        <p v-if="errors.currency_id" class="form-error">{{ errors.currency_id[0] }}</p>
                    </div>
                </div>
                <div>
                    <label class="form-label" for="w-open">{{ $t('accounts.openingBalance') }}</label>
                    <MoneyInput id="w-open" v-model="form.opening_balance" :max-decimals="4" allow-negative blank-zero placeholder="0" class="form-input" />
                    <p class="form-hint">{{ $t('accounts.openingBalanceHint') }}</p>
                    <p v-if="errors.opening_balance" class="form-error">{{ errors.opening_balance[0] }}</p>
                </div>
                <LogoPicker v-model="form.logo" :name="form.name" />
                <Alert v-if="createError" type="error">{{ createError }}</Alert>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" @click="showCreate = false">{{ $t('common.cancel') }}</button>
                    <button type="submit" :disabled="busy" class="btn btn-primary">{{ busy ? $t('common.saving') : $t('common.create') }}</button>
                </div>
            </form>
        </Modal>

        <WalletManageModals
            :edit-account="editAccount"
            :delete-account="manageAccount"
            :account-types="creatableTypes"
            :currencies="currencies"
            @close-edit="editAccount = null"
            @close-delete="manageAccount = null"
            @saved="reload"
        />

        <HistoryModal
            :open="!!historyAccount"
            :title="$t('history.titleFor', { name: historyAccount?.name || '' })"
            :fetcher="(params) => accountStore.ledger(historyAccount.id, params)"
            :up-label="historyAccount?.account_type?.code === 'agent_wallet' ? 'agents.historyUp' : 'history.moneyIn'"
            :down-label="historyAccount?.account_type?.code === 'agent_wallet' ? 'agents.historyDown' : 'history.moneyOut'"
            @close="historyAccount = null"
        />
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api, apiError } from '../api/client'
import { useAccountStore } from '../stores/account'
import { usePermissions } from '../composables/usePermissions'
import { useToast } from '../composables/useToast'
import { useViewMode } from '../composables/useViewMode'
import { useWalletTabs } from '../composables/useSectionTabs'
import { money } from '../utils/format'
import Modal from './Modal.vue'
import HistoryModal from './HistoryModal.vue'
import LogoPicker from './LogoPicker.vue'
import LogoAvatar from './LogoAvatar.vue'
import MoneyInput from './MoneyInput.vue'
import WalletManageModals from './WalletManageModals.vue'
import Alert from './ui/Alert.vue'
import EmptyState from './ui/EmptyState.vue'
import PageHeader from './ui/PageHeader.vue'
import SectionTabs from './ui/SectionTabs.vue'
import ViewToggle from './ui/ViewToggle.vue'

/**
 * Wallet list shared by "Cash safes" (office_shared) and
 * "Private wallets" (owner_private).
 */
const props = defineProps({
    visibility: { type: String, required: true }, // office_shared | owner_private
})

const { t, te } = useI18n()
const accountStore = useAccountStore()
const { can } = usePermissions()
const { showToast } = useToast()
const tabs = useWalletTabs()
const viewMode = useViewMode(`wallets_${props.visibility}`)

const CREATABLE = props.visibility === 'office_shared'
    ? ['cash_safe', 'e_wallet', 'bank_account']
    : ['cash_safe', 'e_wallet', 'bank_account', 'crypto_wallet', 'crypto_platform']
// Real wallets only: internal ledger accounts (commission, expenses,
// equity…) are not shown here.
const LISTED = [...CREATABLE, 'agent_wallet']

const intro = computed(() => (props.visibility === 'office_shared' ? t('accounts.sharedIntro') : t('accounts.privateIntro')))

const searchQuery = ref('')
const error = ref('')
const createError = ref('')
const currencies = ref([])
const accountTypes = ref([])
const busy = ref(false)
const errors = ref({})
const showCreate = ref(false)
const editAccount = ref(null)
const manageAccount = ref(null)
const historyAccount = ref(null)

const blank = () => ({ name: '', account_type_id: '', currency_id: '', opening_balance: '', logo: '' })
const form = reactive(blank())

const creatableTypes = computed(() => accountTypes.value.filter((tp) => CREATABLE.includes(tp.code)))

const typeLabel = (type) => (type?.code && te(`accounts.types.${type.code}`) ? t(`accounts.types.${type.code}`) : type?.name || '')
const typeName = (account) => typeLabel(account.account_type)

const wallets = computed(() => accountStore.accounts.filter((a) =>
    a.visibility === props.visibility && LISTED.includes(a.account_type?.code)))

const filtered = computed(() => {
    const q = searchQuery.value.toLowerCase().trim()
    if (! q) return wallets.value
    return wallets.value.filter((a) => [a.name, a.currency?.code, typeName(a)].some((v) => v && v.toLowerCase().includes(q)))
})

// Cash wallets first; agent wallets in their own section.
const groups = computed(() => {
    const cash = filtered.value.filter((a) => a.account_type?.code !== 'agent_wallet')
    const agents = filtered.value.filter((a) => a.account_type?.code === 'agent_wallet')
    return [
        cash.length && { key: 'cash', title: t('accounts.cashWallets'), items: cash },
        agents.length && { key: 'agents', title: t('accounts.agentWallets'), items: agents },
    ].filter(Boolean)
})

const totals = computed(() => {
    const map = {}
    for (const a of wallets.value) {
        if (a.account_type?.code === 'agent_wallet' || ! a.is_active) continue
        const code = a.currency?.code || '?'
        map[code] = (map[code] || 0) + Number(a.current_balance || 0)
    }
    return Object.entries(map).map(([currency, total]) => ({ currency, total })).sort((a, b) => a.currency.localeCompare(b.currency))
})

function reload() {
    accountStore.fetchAccounts().catch((e) => { error.value = apiError(e).message })
}

function openCreate() {
    Object.assign(form, blank())
    if (creatableTypes.value.length === 1) form.account_type_id = creatableTypes.value[0].id
    errors.value = {}
    createError.value = ''
    showCreate.value = true
}

async function create() {
    errors.value = {}
    createError.value = ''
    const req = [t('forms.required')]
    const e = {}
    if (! form.name.trim()) e.name = req
    if (! form.account_type_id) e.account_type_id = req
    if (! form.currency_id) e.currency_id = req
    if (Object.keys(e).length) {
        errors.value = e
        return
    }
    busy.value = true
    try {
        const opening = Number(form.opening_balance)
        await accountStore.createAccount({
            name: form.name,
            account_type_id: form.account_type_id,
            currency_id: form.currency_id,
            visibility: props.visibility,
            logo_url: form.logo || undefined,
            opening_balance: opening !== 0 ? opening : undefined,
        })
        showToast({ message: t('accounts.createdToast', { name: form.name }) })
        showCreate.value = false
        reload()
    } catch (err) {
        const parsed = apiError(err)
        createError.value = parsed.message
        errors.value = parsed.errors
    } finally {
        busy.value = false
    }
}

onMounted(async () => {
    reload()
    try {
        const [cur, types] = await Promise.all([api.get('/currencies'), api.get('/account-types')])
        currencies.value = cur.data.data
        accountTypes.value = types.data.data
    } catch (e) {
        error.value = apiError(e).message
    }
})
</script>
