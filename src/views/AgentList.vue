<template>
    <div>
        <PageHeader :text="$t('agents.intro')">
            <button v-if="can('create-agent')" class="btn btn-primary" @click="openCreate">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                {{ $t('agents.newAgent') }}
            </button>
        </PageHeader>

        <Alert v-if="error" type="error" dismissible class="mb-4" @dismiss="error = ''">{{ error }}</Alert>

        <!-- Search + view -->
        <div class="flex items-center gap-2 mb-4">
            <div class="relative flex-1">
                <svg class="w-4 h-4 text-gray-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                <input v-model="searchQuery" data-search type="search" :placeholder="$t('agents.searchPlaceholder')" class="form-input ps-9" />
            </div>
            <ViewToggle v-model="viewMode" />
        </div>

        <!-- Loading -->
        <div v-if="agentStore.loading && !agentStore.agents.length" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <div v-for="n in 6" :key="n" class="h-44 rounded-2xl animate-shimmer" />
        </div>

        <!-- Empty -->
        <EmptyState
            v-else-if="!filteredAgents.length"
            :title="searchQuery ? $t('common.noResults') : $t('agents.noAgents')"
            :text="searchQuery ? $t('common.tryOtherSearch') : $t('agents.noAgentsHint')"
            icon="M18 18.72a9.094 9.094 0 003.741-2.956 9 9 0 10-17.482 0A9.094 9.094 0 008 18.72m0 0a9.066 9.066 0 005.999 2.28m-5.999-2.28a8.99 8.99 0 015.999-2.28m0 4.56a9.066 9.066 0 005.999-2.28M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
        >
            <button v-if="searchQuery" class="btn btn-secondary" @click="searchQuery = ''">{{ $t('common.clearSearch') }}</button>
            <button v-else-if="can('create-agent')" class="btn btn-primary" @click="openCreate">{{ $t('agents.newAgent') }}</button>
        </EmptyState>

        <!-- Cards -->
        <div v-else-if="viewMode === 'cards'" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <div v-for="agent in filteredAgents" :key="agent.id" class="card card-pad flex flex-col">
                <div class="flex items-center gap-3 min-w-0">
                    <LogoAvatar :name="agent.name" :url="agent.logo_url" size="lg" />
                    <div class="min-w-0 flex-1">
                        <h3 class="font-semibold text-gray-900 truncate">{{ agent.name }}</h3>
                        <p class="text-xs text-gray-500 truncate">{{ [agent.city, agent.country].filter(Boolean).join(', ') || '—' }}</p>
                    </div>
                    <a v-if="agent.phone" :href="`tel:${agent.phone}`" class="btn-icon" :title="agent.phone" :aria-label="$t('agents.call', { phone: agent.phone })">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                    </a>
                </div>

                <!-- Balance per currency, in plain words -->
                <div class="mt-4 space-y-2">
                    <div v-for="b in balancesOf(agent)" :key="b.currency" class="flex items-center justify-between gap-2 rounded-xl px-3 py-2" :class="balanceBox(b.net)">
                        <span class="text-xs font-medium">{{ balanceWords(b.net) }}</span>
                        <span class="text-sm font-bold tabular-nums">{{ money(Math.abs(b.net), b.currency) }}</span>
                    </div>
                    <p v-if="!balancesOf(agent).length" class="text-xs text-gray-400">{{ agent.allow_all_currencies ? $t('agents.anyCurrency') : '—' }}</p>
                </div>

                <div class="mt-auto pt-4 flex gap-2">
                    <button class="btn btn-secondary btn-sm flex-1" @click="historyAgent = agent">{{ $t('history.button') }}</button>
                    <button v-if="can('edit-agent')" class="btn btn-ghost btn-sm" @click="openEdit(agent)">{{ $t('common.edit') }}</button>
                </div>
            </div>
        </div>

        <!-- Table -->
        <div v-else class="card overflow-x-auto">
            <table class="min-w-full text-sm table-enhanced">
                <thead class="bg-gray-50 text-xs text-gray-500 border-b border-gray-100">
                    <tr>
                        <th class="px-4 py-3 text-start">{{ $t('common.name') }}</th>
                        <th class="px-4 py-3 text-start">{{ $t('agents.contact') }}</th>
                        <th class="px-4 py-3 text-start">{{ $t('agents.balance') }}</th>
                        <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="agent in filteredAgents" :key="agent.id">
                        <td class="px-4 py-3">
                            <div class="flex items-center gap-2.5">
                                <LogoAvatar :name="agent.name" :url="agent.logo_url" />
                                <span class="font-semibold text-gray-900">{{ agent.name }}</span>
                            </div>
                        </td>
                        <td class="px-4 py-3 text-gray-600">
                            <span class="block">{{ agent.phone || '—' }}</span>
                            <span class="block text-xs text-gray-400">{{ [agent.city, agent.country].filter(Boolean).join(', ') }}</span>
                        </td>
                        <td class="px-4 py-3">
                            <p v-for="b in balancesOf(agent)" :key="b.currency" class="text-sm whitespace-nowrap">
                                <span :class="b.net > 0 ? 'text-emerald-700' : b.net < 0 ? 'text-red-600' : 'text-gray-500'" class="font-semibold tabular-nums">{{ money(Math.abs(b.net), b.currency) }}</span>
                                <span class="text-xs text-gray-500 ms-1">{{ balanceWords(b.net) }}</span>
                            </p>
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex justify-end gap-1.5">
                                <button class="btn btn-secondary btn-sm" @click="historyAgent = agent">{{ $t('history.button') }}</button>
                                <button v-if="can('edit-agent')" class="btn btn-ghost btn-sm" @click="openEdit(agent)">{{ $t('common.edit') }}</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Create / edit (one form) -->
        <Modal :open="showForm" :title="editTarget ? $t('agents.editTitle') : $t('agents.newAgentTitle')" @close="showForm = false">
            <form class="space-y-4" novalidate @submit.prevent="save">
                <div>
                    <label class="form-label" for="ag-name">{{ $t('common.name') }} <span class="text-red-500">*</span></label>
                    <input id="ag-name" v-model="form.name" required class="form-input" />
                    <p v-if="errors.name" class="form-error">{{ errors.name[0] }}</p>
                </div>
                <div>
                    <label class="form-label" for="ag-phone">{{ $t('agents.phone') }}</label>
                    <input id="ag-phone" v-model="form.phone" type="tel" inputmode="tel" class="form-input" />
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="form-label" for="ag-city">{{ $t('agents.city') }}</label>
                        <input id="ag-city" v-model="form.city" class="form-input" />
                    </div>
                    <div>
                        <label class="form-label" for="ag-country">{{ $t('agents.country') }}</label>
                        <input id="ag-country" v-model="form.country" class="form-input" />
                    </div>
                </div>
                <fieldset>
                    <legend class="form-label">{{ $t('agents.currencies') }}</legend>
                    <label class="flex items-center gap-2 min-h-11 text-sm text-gray-700 cursor-pointer">
                        <input v-model="form.allow_all_currencies" type="checkbox" class="w-5 h-5 rounded border-gray-300 text-indigo-600" />
                        {{ $t('agents.allCurrencies') }}
                    </label>
                    <div v-if="!form.allow_all_currencies" class="flex flex-wrap gap-2 mt-1">
                        <button
                            v-for="c in currencies"
                            :key="c.id"
                            type="button"
                            class="min-h-10 px-3 rounded-lg text-sm font-semibold border transition-colors"
                            :class="form.currency_ids.includes(c.id) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'"
                            :aria-pressed="form.currency_ids.includes(c.id)"
                            @click="toggleCurrency(c.id)"
                        >{{ c.code }}</button>
                    </div>
                    <p v-if="currencyError" class="form-error">{{ currencyError }}</p>
                    <p class="form-hint">{{ $t('agents.walletNote') }}</p>
                </fieldset>
                <LogoPicker v-model="form.logo" :name="form.name" />
                <Alert v-if="formError" type="error">{{ formError }}</Alert>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" @click="showForm = false">{{ $t('common.cancel') }}</button>
                    <button type="submit" :disabled="busy" class="btn btn-primary">
                        {{ busy ? $t('common.saving') : editTarget ? $t('common.save') : $t('agents.createAgentBtn') }}
                    </button>
                </div>
            </form>
        </Modal>

        <HistoryModal
            :open="!!historyAgent"
            :title="$t('history.titleFor', { name: historyAgent?.name || '' })"
            :fetcher="(params) => agentStore.ledger(historyAgent.id, params)"
            up-label="agents.historyUp"
            down-label="agents.historyDown"
            @close="historyAgent = null"
        />
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api, apiError } from '../api/client'
import { useAgentStore } from '../stores/agent'
import { usePermissions } from '../composables/usePermissions'
import { useToast } from '../composables/useToast'
import { useViewMode } from '../composables/useViewMode'
import { money } from '../utils/format'
import Modal from '../components/Modal.vue'
import HistoryModal from '../components/HistoryModal.vue'
import LogoPicker from '../components/LogoPicker.vue'
import LogoAvatar from '../components/LogoAvatar.vue'
import Alert from '../components/ui/Alert.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import PageHeader from '../components/ui/PageHeader.vue'
import ViewToggle from '../components/ui/ViewToggle.vue'

const agentStore = useAgentStore()
const { can } = usePermissions()
const { t } = useI18n()
const { showToast } = useToast()

const viewMode = useViewMode('agents')
const searchQuery = ref('')
const currencies = ref([])
const error = ref('')
const busy = ref(false)
const errors = ref({})
const formError = ref('')
const currencyError = ref('')

const showForm = ref(false)
const editTarget = ref(null)
const historyAgent = ref(null)

const blank = () => ({ name: '', phone: '', country: '', city: '', currency_ids: [], allow_all_currencies: false, logo: '' })
const form = reactive(blank())

const filteredAgents = computed(() => {
    const q = searchQuery.value.toLowerCase().trim()
    if (! q) return agentStore.agents
    return agentStore.agents.filter((a) =>
        [a.name, a.phone, a.city, a.country].some((v) => v && v.toLowerCase().includes(q)))
})

const balancesOf = (agent) => (agent.balances || []).filter((b) => b.currency)

const balanceWords = (net) => (net > 0 ? t('agents.owesUs') : net < 0 ? t('agents.weOwe') : t('agents.settledShort'))

const balanceBox = (net) => (net > 0
    ? 'bg-emerald-50 text-emerald-800'
    : net < 0 ? 'bg-red-50 text-red-800' : 'bg-gray-50 text-gray-600')

function toggleCurrency(id) {
    const i = form.currency_ids.indexOf(id)
    if (i === -1) form.currency_ids.push(id)
    else form.currency_ids.splice(i, 1)
    currencyError.value = ''
}

function resetMessages() {
    errors.value = {}
    formError.value = ''
    currencyError.value = ''
}

function openCreate() {
    editTarget.value = null
    Object.assign(form, blank())
    resetMessages()
    showForm.value = true
}

function openEdit(agent) {
    editTarget.value = agent
    Object.assign(form, {
        name: agent.name,
        phone: agent.phone || '',
        country: agent.country || '',
        city: agent.city || '',
        currency_ids: (agent.currency_accounts || []).map((p) => p.currency_id),
        allow_all_currencies: !! agent.allow_all_currencies,
        // Start from the current logo so it shows in the picker.
        logo: agent.logo_url || '',
    })
    resetMessages()
    showForm.value = true
}

/** Fallback balance currency for "all currencies" agents: IQD if present. */
function defaultCurrencyId() {
    return (currencies.value.find((c) => c.code === 'IQD') || currencies.value[0])?.id
}

async function save() {
    resetMessages()
    if (! form.name.trim()) {
        errors.value = { name: [t('forms.required')] }
        return
    }
    if (! form.allow_all_currencies && ! form.currency_ids.length) {
        currencyError.value = t('agents.pickAtLeastOneCurrency')
        return
    }
    busy.value = true
    const base = {
        name: form.name,
        phone: form.phone,
        country: form.country,
        city: form.city,
        allow_all_currencies: form.allow_all_currencies,
        logo_url: form.logo || null,
    }
    try {
        if (editTarget.value) {
            await agentStore.updateAgent(editTarget.value.id, {
                ...base,
                currency_ids: form.allow_all_currencies ? null : [...form.currency_ids],
            })
            showToast({ message: t('agents.savedToast', { name: form.name }) })
        } else {
            await agentStore.createAgent({
                ...base,
                balance_currency_id: form.currency_ids[0] || defaultCurrencyId(),
                currency_ids: [...form.currency_ids],
            })
            showToast({ message: t('agents.createdToast', { name: form.name }) })
        }
        showForm.value = false
    } catch (e) {
        const parsed = apiError(e)
        formError.value = parsed.message
        errors.value = parsed.errors
    } finally {
        busy.value = false
    }
}

onMounted(async () => {
    agentStore.fetchAgents().catch((e) => { error.value = apiError(e).message })
    try {
        currencies.value = (await api.get('/currencies')).data.data
    } catch (e) {
        error.value = apiError(e).message
    }
})
</script>
