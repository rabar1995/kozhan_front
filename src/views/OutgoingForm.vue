<template>
    <div class="max-w-3xl">
        <SectionTabs :tabs="tabs" :label="$t('nav.remittances')" />

        <div v-if="saved" class="card card-pad text-center py-10">
            <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
            </div>
            <h2 class="text-lg font-semibold text-gray-900">{{ $t('remittances.booked', { number: saved.remittance_number }) }}</h2>
            <p class="text-sm text-gray-500 mt-1">{{ $t('outgoing.savedHint') }}</p>
            <div class="mt-6 flex flex-col sm:flex-row justify-center gap-2">
                <button class="btn btn-primary" @click="startAnother">{{ $t('forms.bookAnother') }}</button>
                <router-link to="/remittances" class="btn btn-secondary">{{ $t('common.goToList') }}</router-link>
            </div>
        </div>

        <form v-else class="space-y-4" novalidate @submit.prevent="submit">
            <Alert v-if="error" type="error" dismissible @dismiss="error = ''">{{ error }}</Alert>
            <Alert v-if="loadError" type="warning">{{ loadError }}</Alert>

            <FormSection :step="1" :title="$t('forms.parties')">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="form-label" for="out-sender">{{ $t('outgoing.walkIn') }} <span class="text-red-500">*</span></label>
                        <input id="out-sender" v-model="form.sender_name" required autocomplete="off" class="form-input" />
                        <p v-if="errors.sender_name" class="form-error">{{ errors.sender_name[0] }}</p>
                    </div>
                    <div>
                        <label class="form-label" for="out-sender-phone">{{ $t('forms.senderPhone') }}</label>
                        <input id="out-sender-phone" v-model="form.sender_phone" type="tel" inputmode="tel" autocomplete="off" class="form-input" />
                    </div>
                    <div>
                        <label class="form-label" for="out-receiver">{{ $t('forms.receiverName') }} <span class="text-red-500">*</span></label>
                        <input id="out-receiver" v-model="form.receiver_name" required autocomplete="off" class="form-input" />
                        <p v-if="errors.receiver_name" class="form-error">{{ errors.receiver_name[0] }}</p>
                    </div>
                    <div>
                        <label class="form-label" for="out-receiver-phone">{{ $t('forms.receiverPhone') }}</label>
                        <input id="out-receiver-phone" v-model="form.receiver_phone" type="tel" inputmode="tel" autocomplete="off" class="form-input" />
                    </div>
                </div>
            </FormSection>

            <FormSection :step="2" :title="$t('forms.amounts')">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="form-label" for="out-collect">{{ $t('outgoing.amountCollected') }} <span class="text-red-500">*</span></label>
                        <div class="flex gap-2">
                            <MoneyInput id="out-collect" v-model="form.receive_amount" required class="form-input font-semibold text-indigo-700" />
                            <select v-model="form.receive_currency_id" required class="form-input !w-28 shrink-0" :aria-label="$t('outgoing.collectCurrency')">
                                <option value="" disabled>{{ $t('forms.currencyShort') }}</option>
                                <option v-for="c in currencies" :key="c.id" :value="c.id">{{ c.code }}</option>
                            </select>
                        </div>
                        <p v-if="errors.receive_amount || errors.receive_currency_id" class="form-error">{{ (errors.receive_amount || errors.receive_currency_id)[0] }}</p>
                    </div>
                    <div>
                        <label class="form-label" for="out-send">{{ $t('outgoing.amountSent') }} <span class="text-red-500">*</span></label>
                        <div class="flex gap-2">
                            <MoneyInput id="out-send" v-model="form.send_amount" required class="form-input font-semibold" />
                            <select v-model="form.send_currency_id" required class="form-input !w-28 shrink-0" :aria-label="$t('forms.sendCurrency')">
                                <option value="" disabled>{{ $t('forms.currencyShort') }}</option>
                                <option v-for="c in currencies" :key="c.id" :value="c.id">{{ c.code }}</option>
                            </select>
                        </div>
                        <p v-if="errors.send_amount || errors.send_currency_id" class="form-error">{{ (errors.send_amount || errors.send_currency_id)[0] }}</p>
                    </div>
                </div>
                <p class="form-hint mt-3">{{ $t('outgoing.spreadNote') }}</p>
            </FormSection>

            <FormSection :step="3" :title="$t('outgoing.legendAgentCash')">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="form-label" for="out-agent">{{ $t('outgoing.agentPays') }} <span class="text-red-500">*</span></label>
                        <LogoSelect
                            id="out-agent"
                            v-model="form.agent_id"
                            :options="agentOptions"
                            :placeholder="$t('forms.selectAgent')"
                            :empty-text="$t('agents.noAgents')"
                            sublabel-key="sublabel"
                        />
                        <p v-if="errors.agent_id" class="form-error">{{ errors.agent_id[0] }}</p>
                    </div>
                    <div>
                        <label class="form-label" for="out-account">{{ $t('outgoing.paymentCollect') }} <span class="text-red-500">*</span></label>
                        <select id="out-account" v-model="form.payment_account_id" required class="form-input" :disabled="!form.receive_currency_id">
                            <option value="" disabled>{{ form.receive_currency_id ? $t('remittances.selectAccount') : $t('outgoing.pickCurrencyFirst') }}</option>
                            <option v-for="a in cashAccounts" :key="a.id" :value="a.id">{{ a.name }} — {{ money(a.current_balance, a.currency?.code) }}</option>
                        </select>
                        <p v-if="form.receive_currency_id && !cashAccounts.length" class="form-hint text-amber-700">{{ $t('outgoing.noAccountInCurrency') }}</p>
                        <p v-if="errors.payment_account_id" class="form-error">{{ errors.payment_account_id[0] }}</p>
                    </div>
                    <div>
                        <label class="form-label" for="out-comm-type">{{ $t('outgoing.commissionType') }}</label>
                        <select id="out-comm-type" v-model="form.commission_type" class="form-input">
                            <option value="earned">{{ $t('forms.earned') }}</option>
                            <option value="paid">{{ $t('forms.paid') }}</option>
                        </select>
                    </div>
                </div>
                <div class="mt-4">
                    <label class="form-label" for="out-notes">{{ $t('forms.notes') }}</label>
                    <textarea id="out-notes" v-model="form.notes" rows="2" class="form-input" />
                </div>
            </FormSection>

            <div class="modal-actions">
                <router-link to="/remittances" class="btn btn-secondary">{{ $t('common.cancel') }}</router-link>
                <button type="submit" :disabled="busy" class="btn btn-primary">
                    {{ busy ? $t('forms.booking') : $t('forms.bookOutgoing') }}
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { api, apiError } from '../api/client'
import { useAgentStore } from '../stores/agent'
import { useAccountStore } from '../stores/account'
import { useRemittanceStore } from '../stores/remittance'
import { useAgentOptions } from '../composables/useAgentOptions'
import { useRemittanceTabs } from '../composables/useSectionTabs'
import { money } from '../utils/format'
import LogoSelect from '../components/LogoSelect.vue'
import MoneyInput from '../components/MoneyInput.vue'
import Alert from '../components/ui/Alert.vue'
import FormSection from '../components/ui/FormSection.vue'
import SectionTabs from '../components/ui/SectionTabs.vue'

const { t } = useI18n()
const agentStore = useAgentStore()
const accountStore = useAccountStore()
const remittanceStore = useRemittanceStore()
const agentOptions = useAgentOptions()
const tabs = useRemittanceTabs()

const currencies = ref([])
const busy = ref(false)
const error = ref('')
const loadError = ref('')
const errors = ref({})
const saved = ref(null)

const blank = () => ({
    agent_id: '',
    payment_account_id: '',
    sender_name: '',
    sender_phone: '',
    receiver_name: '',
    receiver_phone: '',
    send_amount: null,
    send_currency_id: '',
    receive_amount: null,
    receive_currency_id: '',
    commission_amount: 0,
    commission_type: 'earned',
    notes: '',
})

const form = reactive(blank())

const CASH_TYPES = ['cash_safe', 'e_wallet', 'bank_account']

// The cash collected goes into a wallet of the same currency.
const cashAccounts = computed(() =>
    accountStore.accounts.filter((a) =>
        CASH_TYPES.includes(a.account_type?.code)
        && a.is_active
        && (a.wallet_group === 'office' || (!a.wallet_group && a.visibility === 'office_shared'))
        && a.currency_id === form.receive_currency_id,
    ),
)

watch(() => form.receive_currency_id, () => {
    if (! cashAccounts.value.some((a) => a.id === form.payment_account_id)) {
        form.payment_account_id = cashAccounts.value.length === 1 ? cashAccounts.value[0].id : ''
    }
})

function validate() {
    const e = {}
    const req = t('forms.required')
    if (! form.sender_name.trim()) e.sender_name = [req]
    if (! form.receiver_name.trim()) e.receiver_name = [req]
    if (! Number(form.receive_amount)) e.receive_amount = [req]
    else if (! form.receive_currency_id) e.receive_currency_id = [t('forms.pickCurrency')]
    if (! Number(form.send_amount)) e.send_amount = [req]
    else if (! form.send_currency_id) e.send_currency_id = [t('forms.pickCurrency')]
    if (! form.agent_id) e.agent_id = [req]
    if (! form.payment_account_id) e.payment_account_id = [req]
    errors.value = e
    return ! Object.keys(e).length
}

function startAnother() {
    const keep = {
        agent_id: form.agent_id,
        payment_account_id: form.payment_account_id,
        send_currency_id: form.send_currency_id,
        receive_currency_id: form.receive_currency_id,
    }
    Object.assign(form, blank(), keep)
    saved.value = null
    accountStore.fetchAccounts({ active: 1 }).catch(() => {})
}

onMounted(async () => {
    const onFail = (e) => { loadError.value = apiError(e).message }
    agentStore.fetchAgents({ active: 1 }).catch(onFail)
    accountStore.fetchAccounts({ active: 1 }).catch(onFail)
    try {
        currencies.value = (await api.get('/currencies')).data.data
    } catch (e) {
        onFail(e)
    }
})

async function submit() {
    error.value = ''
    if (! validate()) return
    busy.value = true
    try {
        const res = await remittanceStore.createOutgoing({ ...form })
        saved.value = res.data
        document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
        const parsed = apiError(e)
        error.value = parsed.message
        errors.value = parsed.errors
    } finally {
        busy.value = false
    }
}
</script>
