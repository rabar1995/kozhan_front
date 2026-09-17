<template>
    <div class="max-w-3xl">
        <div v-if="success" class="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 mb-4">
            {{ success }}
            <router-link to="/expenses" class="font-medium underline ms-2">{{ $t('common.goToList') }}</router-link>
        </div>
        <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
            {{ error }}
        </div>

        <form class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5" @submit.prevent="submit">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('expenses.categoryRequired') }}</label>
                    <select v-model="form.expense_category_id" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                        <option value="" disabled>{{ $t('common.select') }}</option>
                        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                    </select>
                    <p v-if="errors.expense_category_id" class="text-xs text-red-600 mt-1">{{ errors.expense_category_id[0] }}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('expenses.dateRequired') }}</label>
                    <input v-model="form.expense_date" type="date" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                    <p v-if="errors.expense_date" class="text-xs text-red-600 mt-1">{{ errors.expense_date[0] }}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('expenses.paidFromRequired') }}</label>
                    <select v-model="form.paid_from_account_id" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                        <option value="" disabled>{{ $t('common.select') }}</option>
                        <option v-for="a in cashAccounts" :key="a.id" :value="a.id">
                            {{ a.name }} ({{ a.currency?.code }})
                        </option>
                    </select>
                    <p v-if="errors.paid_from_account_id" class="text-xs text-red-600 mt-1">{{ errors.paid_from_account_id[0] }}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('expenses.expenseAccount') }}</label>
                    <select v-model="form.expense_account_id" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                        <option value="" disabled>{{ $t('common.select') }}</option>
                        <option v-for="a in expenseAccounts" :key="a.id" :value="a.id">
                            {{ a.name }} ({{ a.currency?.code }})
                        </option>
                    </select>
                    <p v-if="errors.expense_account_id" class="text-xs text-red-600 mt-1">{{ errors.expense_account_id[0] }}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('expenses.amountRequired') }}</label>
                    <MoneyInput v-model="form.amount" required
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                    <p v-if="errors.amount" class="text-xs text-red-600 mt-1">{{ errors.amount[0] }}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('expenses.currencyRequired') }}</label>
                    <select v-model="form.currency_id" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                        <option value="" disabled>{{ $t('common.select') }}</option>
                        <option v-for="c in currencies" :key="c.id" :value="c.id">{{ c.code }} — {{ c.name }}</option>
                    </select>
                    <p v-if="errors.currency_id" class="text-xs text-red-600 mt-1">{{ errors.currency_id[0] }}</p>
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('expenses.descriptionRequired') }}</label>
                <textarea v-model="form.description" rows="2" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                <p v-if="errors.description" class="text-xs text-red-600 mt-1">{{ errors.description[0] }}</p>
            </div>

            <div class="flex justify-end gap-2">
                <router-link to="/expenses" class="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">{{ $t('common.cancel') }}</router-link>
                <button
                    type="submit"
                    :disabled="busy"
                    class="px-5 py-2 text-sm rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                    {{ busy ? $t('common.saving') : $t('expenses.recordBtn') }}
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api, apiError } from '../api/client'
import { useAccountStore } from '../stores/account'
import MoneyInput from '../components/MoneyInput.vue'

const accountStore = useAccountStore()
const { t } = useI18n()

const currencies = ref([])
const categories = ref([])
const busy = ref(false)
const error = ref('')
const success = ref('')
const errors = ref({})

const form = reactive({
    expense_category_id: '',
    paid_from_account_id: '',
    expense_account_id: '',
    amount: null,
    currency_id: '',
    description: '',
    expense_date: new Date().toISOString().slice(0, 10),
})

const cashAccounts = computed(() =>
    accountStore.accounts.filter((a) => ['cash_safe', 'e_wallet', 'bank_account'].includes(a.account_type?.code) && a.is_active),
)

const expenseAccounts = computed(() =>
    accountStore.accounts.filter((a) => ['operating_expense', 'commission_expense'].includes(a.account_type?.code) && a.is_active),
)

onMounted(async () => {
    accountStore.fetchAccounts().catch(() => {})
    try {
        currencies.value = (await api.get('/currencies')).data.data
        categories.value = (await api.get('/expenses/categories')).data.data
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
        await api.post('/expenses', { ...form })
        success.value = t('expenses.recorded')
        Object.assign(form, {
            expense_category_id: '',
            paid_from_account_id: '',
            expense_account_id: '',
            amount: null,
            description: '',
        })
    } catch (e) {
        const parsed = apiError(e)
        error.value = parsed.message
        errors.value = parsed.errors
    } finally {
        busy.value = false
    }
}
</script>
