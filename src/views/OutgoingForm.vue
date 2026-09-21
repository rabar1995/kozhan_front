<template>
    <div class="max-w-4xl space-y-5">
        <!-- Error & Success Alerts -->
        <div v-if="success" class="rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-3.5 text-sm text-emerald-800 flex items-center justify-between shadow-xs">
            <span class="flex items-center gap-2 font-semibold">
                <svg class="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ success }}
            </span>
            <router-link to="/remittances" class="font-bold underline text-emerald-700 hover:text-emerald-900 ms-2 text-xs">
                {{ $t('common.goToList') }} →
            </router-link>
        </div>

        <div v-if="error" class="rounded-2xl bg-rose-50 border border-rose-200 px-5 py-3.5 text-sm text-rose-700 flex items-center justify-between shadow-xs">
            <span class="flex items-center gap-2 font-medium">
                <svg class="w-5 h-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {{ error }}
            </span>
            <button class="text-rose-500 hover:text-rose-700 font-bold ml-2" @click="error = ''">✕</button>
        </div>

        <!-- ═══════ HERO BANNER ═══════ -->
        <div class="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-5 text-white shadow-sm flex items-center justify-between gap-4">
            <div class="flex items-center gap-3.5">
                <div class="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 ring-1 ring-white/25">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                    </svg>
                </div>
                <div>
                    <h2 class="text-lg font-bold tracking-tight">{{ $t('forms.bookOutgoing') }}</h2>
                    <p class="text-xs text-indigo-100 mt-0.5">{{ $t('outgoing.legendAgentCash') }} · {{ $t('forms.parties') }}</p>
                </div>
            </div>
            <router-link
                to="/remittances"
                class="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors border border-white/20 shrink-0"
            >
                {{ $t('common.back') }}
            </router-link>
        </div>

        <!-- ═══════ BOOKING FORM ═══════ -->
        <form class="space-y-4" @submit.prevent="submit">
            <!-- Card 1: Agent & Cash Account -->
            <div class="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-3">
                <div class="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <h3 class="text-xs font-bold text-gray-700 uppercase tracking-wider">{{ $t('outgoing.legendAgentCash') }}</h3>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold text-gray-600 mb-1">{{ $t('outgoing.agentPays') }}</label>
                        <LogoSelect
                            v-model="form.agent_id"
                            :options="agentOptions"
                            :placeholder="$t('forms.selectAgent')"
                            :empty-text="$t('agents.noAgents')"
                            sublabel-key="sublabel"
                        />
                        <p v-if="errors.agent_id" class="text-xs text-rose-600 mt-1">{{ errors.agent_id[0] }}</p>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-gray-600 mb-1">{{ $t('outgoing.paymentCollect') }}</label>
                        <select
                            v-model="form.payment_account_id"
                            required
                            class="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                        >
                            <option value="" disabled>{{ $t('remittances.selectAccount') }}</option>
                            <option v-for="a in cashAccounts" :key="a.id" :value="a.id">
                                {{ a.name }} ({{ a.currency?.code }})
                            </option>
                        </select>
                        <p v-if="errors.payment_account_id" class="text-xs text-rose-600 mt-1">{{ errors.payment_account_id[0] }}</p>
                    </div>
                </div>
            </div>

            <!-- Card 2: Parties Information -->
            <div class="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-3">
                <div class="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <h3 class="text-xs font-bold text-gray-700 uppercase tracking-wider">{{ $t('forms.parties') }}</h3>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold text-gray-600 mb-1">{{ $t('outgoing.walkIn') }}</label>
                        <input
                            v-model="form.sender_name"
                            required
                            class="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                        />
                        <p v-if="errors.sender_name" class="text-xs text-rose-600 mt-1">{{ errors.sender_name[0] }}</p>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-gray-600 mb-1">{{ $t('forms.senderPhone') }}</label>
                        <input
                            v-model="form.sender_phone"
                            class="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-gray-600 mb-1">{{ $t('forms.receiverName') }}</label>
                        <input
                            v-model="form.receiver_name"
                            required
                            class="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                        />
                        <p v-if="errors.receiver_name" class="text-xs text-rose-600 mt-1">{{ errors.receiver_name[0] }}</p>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-gray-600 mb-1">{{ $t('forms.receiverPhone') }}</label>
                        <input
                            v-model="form.receiver_phone"
                            class="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                        />
                    </div>
                </div>
            </div>

            <!-- Card 3: Amounts & Currencies -->
            <div class="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-3">
                <div class="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <h3 class="text-xs font-bold text-gray-700 uppercase tracking-wider">{{ $t('forms.amounts') }}</h3>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <!-- Send Amount -->
                    <div>
                        <label class="block text-xs font-semibold text-gray-600 mb-1">{{ $t('outgoing.amountSent') }}</label>
                        <MoneyInput
                            v-model="form.send_amount"
                            required
                            class="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                        />
                        <p v-if="errors.send_amount" class="text-xs text-rose-600 mt-1">{{ errors.send_amount[0] }}</p>
                    </div>

                    <!-- Send Currency -->
                    <div>
                        <label class="block text-xs font-semibold text-gray-600 mb-1">{{ $t('forms.sendCurrency') }}</label>
                        <select
                            v-model="form.send_currency_id"
                            required
                            class="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                        >
                            <option value="" disabled>{{ $t('common.select') }}</option>
                            <option v-for="c in currencies" :key="c.id" :value="c.id">{{ c.code }} — {{ c.name }}</option>
                        </select>
                        <p v-if="errors.send_currency_id" class="text-xs text-rose-600 mt-1">{{ errors.send_currency_id[0] }}</p>
                    </div>

                    <!-- Receive / Collect Amount -->
                    <div>
                        <label class="block text-xs font-semibold text-gray-600 mb-1">{{ $t('outgoing.amountCollected') }}</label>
                        <MoneyInput
                            v-model="form.receive_amount"
                            required
                            class="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                        />
                        <p v-if="errors.receive_amount" class="text-xs text-rose-600 mt-1">{{ errors.receive_amount[0] }}</p>
                    </div>

                    <!-- Receive / Collect Currency -->
                    <div>
                        <label class="block text-xs font-semibold text-gray-600 mb-1">{{ $t('outgoing.collectCurrency') }}</label>
                        <select
                            v-model="form.receive_currency_id"
                            required
                            class="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                        >
                            <option value="" disabled>{{ $t('common.select') }}</option>
                            <option v-for="c in currencies" :key="c.id" :value="c.id">{{ c.code }} — {{ c.name }}</option>
                        </select>
                        <p v-if="errors.receive_currency_id" class="text-xs text-rose-600 mt-1">{{ errors.receive_currency_id[0] }}</p>
                    </div>

                    <!-- Commission Type -->
                    <div>
                        <label class="block text-xs font-semibold text-gray-600 mb-1">{{ $t('outgoing.commissionType') }}</label>
                        <select
                            v-model="form.commission_type"
                            required
                            class="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                        >
                            <option value="earned">{{ $t('forms.earned') }}</option>
                            <option value="paid">{{ $t('forms.paid') }}</option>
                        </select>
                    </div>
                </div>

                <p class="text-xs text-gray-400 mt-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    {{ $t('outgoing.spreadNote') }}
                </p>
            </div>

            <!-- Card 4: Notes -->
            <div class="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-3">
                <div class="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <h3 class="text-xs font-bold text-gray-700 uppercase tracking-wider">{{ $t('forms.notes') }}</h3>
                </div>
                <textarea
                    v-model="form.notes"
                    rows="2"
                    class="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                    :placeholder="$t('forms.notes')"
                />
            </div>

            <!-- Form Actions -->
            <div class="flex items-center justify-end gap-3 pt-2">
                <router-link
                    to="/remittances"
                    class="px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                >
                    {{ $t('common.cancel') }}
                </router-link>
                <button
                    type="submit"
                    :disabled="busy"
                    class="flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-xs transition-colors"
                >
                    <svg v-if="!busy" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                    </svg>
                    <span>{{ busy ? $t('forms.booking') : $t('forms.bookOutgoing') }}</span>
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { api, apiError } from '../api/client'
import { useAgentStore } from '../stores/agent'
import { useAccountStore } from '../stores/account'
import { useRemittanceStore } from '../stores/remittance'
import LogoSelect from '../components/LogoSelect.vue'
import MoneyInput from '../components/MoneyInput.vue'

const router = useRouter()
const { t } = useI18n()
const agentStore = useAgentStore()

const agentOptions = computed(() =>
    agentStore.agents.map(a => ({
        ...a,
        // Show every handled currency for multi-currency agents (or allow_all)
        sublabel: `${agentCurrencyCodes(a)} — ${a.classification}`.trim(),
    })))

function agentCurrencyCodes(a) {
    if (a.allow_all_currencies) return 'Any currency'
    const codes = (a.currency_accounts || []).map(p => p.currency?.code).filter(Boolean)
    return codes.length ? codes.join(', ') : (a.balance_currency?.code ?? '')
}
const accountStore = useAccountStore()
const remittanceStore = useRemittanceStore()

const currencies = ref([])
const busy = ref(false)
const error = ref('')
const success = ref('')
const errors = ref({})

const form = reactive({
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

const cashAccounts = computed(() =>
    accountStore.accounts.filter((a) => ['cash_safe', 'e_wallet', 'bank_account'].includes(a.account_type?.code) && a.is_active),
)

onMounted(async () => {
    agentStore.fetchAgents({ active: 1 }).catch(() => {})
    accountStore.fetchAccounts({ active: 1 }).catch(() => {})
    try {
        currencies.value = (await api.get('/currencies')).data.data
    } catch (e) {
        // handled on submit
    }
})

async function submit() {
    busy.value = true
    error.value = ''
    success.value = ''
    errors.value = {}
    try {
        const res = await remittanceStore.createOutgoing({ ...form })
        success.value = t('remittances.booked', { number: res.data.remittance_number })
        setTimeout(() => router.push('/remittances'), 1200)
    } catch (e) {
        const parsed = apiError(e)
        error.value = parsed.message
        errors.value = parsed.errors
    } finally {
        busy.value = false
    }
}
</script>
