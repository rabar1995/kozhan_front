<template>
    <div>
        <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
            {{ error }}
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">{{ $t('transfers.newTransfer') }}</h3>
            <form class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end" @submit.prevent="submit">
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">{{ $t('transfers.fromRequired') }}</label>
                    <select v-model="form.from_account_id" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                        <option value="" disabled>{{ $t('common.select') }}</option>
                        <option v-for="a in accounts" :key="a.id" :value="a.id">{{ a.name }} ({{ a.currency?.code }})</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">{{ $t('transfers.toRequired') }}</label>
                    <select v-model="form.to_account_id" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                        <option value="" disabled>{{ $t('common.select') }}</option>
                        <option v-for="a in accounts" :key="a.id" :value="a.id">{{ a.name }} ({{ a.currency?.code }})</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">{{ $t('transfers.amountRequired') }}</label>
                    <MoneyInput v-model="form.amount" required
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">{{ $t('transfers.description') }}</label>
                    <input v-model="form.description" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <button
                    type="submit"
                    :disabled="busy"
                    class="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                    {{ busy ? $t('transfers.moving') : $t('transfers.transferBtn') }}
                </button>
            </form>
            <p class="text-xs text-gray-400 mt-2">
                {{ $t('transfers.sameCurrencyNote') }}
            </p>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-start text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                        <th class="px-4 py-3">{{ $t('transfers.date') }}</th>
                        <th class="px-4 py-3">{{ $t('transfers.from') }}</th>
                        <th class="px-4 py-3">{{ $t('transfers.to') }}</th>
                        <th class="px-4 py-3 text-end">{{ $t('transfers.amount') }}</th>
                        <th class="px-4 py-3">{{ $t('transfers.description') }}</th>
                        <th class="px-4 py-3">{{ $t('transfers.by') }}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-if="loading">
                        <td colspan="6" class="px-4 py-8 text-center text-gray-400">{{ $t('common.loading') }}</td>
                    </tr>
                    <tr v-else-if="!transfers.length">
                        <td colspan="6" class="px-4 py-8 text-center text-gray-400">{{ $t('transfers.noTransfers') }}</td>
                    </tr>
                    <tr v-for="transfer in transfers" :key="transfer.id" class="hover:bg-gray-50">
                        <td class="px-4 py-3 text-gray-500 whitespace-nowrap">{{ dateTime(transfer.created_at) }}</td>
                        <td class="px-4 py-3">{{ transfer.from_account?.name }}</td>
                        <td class="px-4 py-3">{{ transfer.to_account?.name }}</td>
                        <td class="px-4 py-3 text-end font-medium">{{ money(transfer.amount, transfer.currency?.code) }}</td>
                        <td class="px-4 py-3 text-gray-600">{{ transfer.description || '-' }}</td>
                        <td class="px-4 py-3 text-gray-600">{{ transfer.creator?.name || '-' }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <Pagination :meta="meta" @page="load" />
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { api, apiError } from '../api/client'
import { useAccountStore } from '../stores/account'
import { money, dateTime } from '../utils/format'
import Pagination from '../components/Pagination.vue'
import MoneyInput from '../components/MoneyInput.vue'

const accountStore = useAccountStore()

const accounts = computed(() => accountStore.accounts.filter((a) => a.is_active))

const transfers = ref([])
const meta = ref(null)
const loading = ref(false)
const error = ref('')
const busy = ref(false)
const form = reactive({ from_account_id: '', to_account_id: '', amount: null, description: '' })

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
    busy.value = true
    error.value = ''
    try {
        const from = accounts.value.find((a) => a.id === form.from_account_id)
        await api.post('/transfers', {
            ...form,
            currency_id: from?.currency_id,
        })
        Object.assign(form, { from_account_id: '', to_account_id: '', amount: null, description: '' })
        await load(1)
        await accountStore.fetchAccounts()
    } catch (e) {
        error.value = apiError(e).message
    } finally {
        busy.value = false
    }
}

onMounted(() => {
    load()
    accountStore.fetchAccounts().catch(() => {})
})
</script>
