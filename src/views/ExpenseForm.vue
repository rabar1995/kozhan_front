<template>
    <div class="max-w-2xl">
        <div v-if="saved" class="card card-pad text-center py-10">
            <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
            </div>
            <h2 class="text-lg font-semibold text-gray-900">{{ $t('expenses.recorded') }}</h2>
            <div class="mt-6 flex flex-col sm:flex-row justify-center gap-2">
                <button class="btn btn-primary" @click="saved = false">{{ $t('expenses.recordAnother') }}</button>
                <router-link to="/expenses" class="btn btn-secondary">{{ $t('common.goToList') }}</router-link>
            </div>
        </div>

        <form v-else class="card card-pad space-y-4" novalidate @submit.prevent="submit">
            <Alert v-if="error" type="error" dismissible @dismiss="error = ''">{{ error }}</Alert>
            <Alert v-if="loaded && !categories.length" type="info">{{ $t('expenses.noCategories') }}</Alert>

            <div>
                <label class="form-label" for="ex-desc">{{ $t('expenses.description') }} <span class="text-red-500">*</span></label>
                <input id="ex-desc" v-model="form.description" class="form-input" :placeholder="$t('expenses.descriptionPlaceholder')" />
                <p v-if="errors.description" class="form-error">{{ errors.description[0] }}</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="form-label" for="ex-amount">{{ $t('expenses.amount') }} <span class="text-red-500">*</span></label>
                    <MoneyInput id="ex-amount" v-model="form.amount" class="form-input font-semibold" />
                    <p v-if="errors.amount" class="form-error">{{ errors.amount[0] }}</p>
                </div>
                <div>
                    <label class="form-label" for="ex-account">{{ $t('expenses.paidFrom') }} <span class="text-red-500">*</span></label>
                    <select id="ex-account" v-model="form.paid_from_account_id" class="form-input">
                        <option value="" disabled>{{ $t('common.select') }}</option>
                        <option v-for="a in cashAccounts" :key="a.id" :value="a.id">{{ a.name }} — {{ money(a.current_balance, a.currency?.code) }}</option>
                    </select>
                    <p class="form-hint" v-if="selectedAccount">{{ $t('expenses.paidInCurrency', { currency: selectedAccount.currency?.code }) }}</p>
                    <p v-if="errors.paid_from_account_id" class="form-error">{{ errors.paid_from_account_id[0] }}</p>
                </div>
                <div>
                    <label class="form-label" for="ex-cat">{{ $t('expenses.category') }} <span class="text-red-500">*</span></label>
                    <select id="ex-cat" v-model="form.expense_category_id" class="form-input">
                        <option value="" disabled>{{ $t('common.select') }}</option>
                        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                    </select>
                    <p v-if="errors.expense_category_id" class="form-error">{{ errors.expense_category_id[0] }}</p>
                </div>
                <div>
                    <label class="form-label" for="ex-date">{{ $t('expenses.date') }}</label>
                    <input id="ex-date" v-model="form.expense_date" type="date" :max="today" class="form-input" />
                    <p v-if="errors.expense_date" class="form-error">{{ errors.expense_date[0] }}</p>
                </div>
            </div>

            <div class="modal-actions">
                <router-link to="/expenses" class="btn btn-secondary">{{ $t('common.cancel') }}</router-link>
                <button type="submit" :disabled="busy" class="btn btn-primary">{{ busy ? $t('common.saving') : $t('expenses.recordBtn') }}</button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api, apiError } from '../api/client'
import { useAccountStore } from '../stores/account'
import { useToast } from '../composables/useToast'
import { localDate, money } from '../utils/format'
import MoneyInput from '../components/MoneyInput.vue'
import Alert from '../components/ui/Alert.vue'

const accountStore = useAccountStore()
const { t } = useI18n()
const { showToast } = useToast()

const today = localDate()
const categories = ref([])
const loaded = ref(false)
const busy = ref(false)
const error = ref('')
const errors = ref({})
const saved = ref(false)

const form = reactive({
    expense_category_id: '',
    paid_from_account_id: '',
    amount: null,
    description: '',
    expense_date: today,
})

const CASH_TYPES = ['cash_safe', 'e_wallet', 'bank_account']
const cashAccounts = computed(() => accountStore.accounts.filter((a) => CASH_TYPES.includes(a.account_type?.code) && a.is_active))
const selectedAccount = computed(() => cashAccounts.value.find((a) => a.id === form.paid_from_account_id))

onMounted(async () => {
    accountStore.fetchAccounts().catch((e) => { error.value = apiError(e).message })
    try {
        categories.value = (await api.get('/expenses/categories')).data.data
        if (categories.value.length === 1) form.expense_category_id = categories.value[0].id
    } catch (e) {
        error.value = apiError(e).message
    } finally {
        loaded.value = true
    }
})

function validate() {
    const req = [t('forms.required')]
    const e = {}
    if (! form.description.trim()) e.description = req
    if (! Number(form.amount)) e.amount = req
    if (! form.paid_from_account_id) e.paid_from_account_id = req
    if (! form.expense_category_id) e.expense_category_id = req
    errors.value = e
    return ! Object.keys(e).length
}

async function submit() {
    error.value = ''
    if (! validate()) return
    busy.value = true
    try {
        // The expense is in the paying wallet's currency.
        await api.post('/expenses', { ...form, currency_id: selectedAccount.value?.currency_id })
        showToast({ message: t('expenses.recorded') })
        Object.assign(form, { amount: null, description: '' })
        saved.value = true
        accountStore.fetchAccounts().catch(() => {})
    } catch (e) {
        const parsed = apiError(e)
        error.value = parsed.message
        errors.value = parsed.errors
    } finally {
        busy.value = false
    }
}
</script>
