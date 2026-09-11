<template>
    <div>
        <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
            {{ error }}
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">{{ $t('rates.publish') }}</h3>
            <form class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end" @submit.prevent="submit">
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">{{ $t('rates.fromRequired') }}</label>
                    <select v-model="form.from_currency_id" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                        <option value="" disabled>{{ $t('common.select') }}</option>
                        <option v-for="c in currencies" :key="c.id" :value="c.id">{{ c.code }}</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">{{ $t('rates.toRequired') }}</label>
                    <select v-model="form.to_currency_id" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                        <option value="" disabled>{{ $t('common.select') }}</option>
                        <option v-for="c in currencies" :key="c.id" :value="c.id">{{ c.code }}</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">{{ $t('rates.buyRate') }}</label>
                    <input v-model.number="form.buy_rate" type="number" step="0.000001" min="0.000001" required
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">{{ $t('rates.sellRate') }}</label>
                    <input v-model.number="form.sell_rate" type="number" step="0.000001" min="0.000001" required
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <button
                    type="submit"
                    :disabled="busy"
                    class="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                    {{ busy ? $t('common.saving') : $t('rates.saveRate') }}
                </button>
            </form>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-start text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                        <th class="px-4 py-3">{{ $t('rates.pair') }}</th>
                        <th class="px-4 py-3 text-end">{{ $t('rates.buy') }}</th>
                        <th class="px-4 py-3 text-end">{{ $t('rates.sell') }}</th>
                        <th class="px-4 py-3">{{ $t('rates.updated') }}</th>
                        <th class="px-4 py-3">{{ $t('rates.by') }}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-if="!rates.length">
                        <td colspan="5" class="px-4 py-8 text-center text-gray-400">{{ $t('rates.noRates') }}</td>
                    </tr>
                    <tr v-for="rate in rates" :key="rate.id" class="hover:bg-gray-50">
                        <td class="px-4 py-3 font-medium text-gray-900">
                            {{ rate.from_currency?.code }} → {{ rate.to_currency?.code }}
                        </td>
                        <td class="px-4 py-3 text-end text-emerald-600 font-semibold">{{ rate.buy_rate }}</td>
                        <td class="px-4 py-3 text-end text-red-600 font-semibold">{{ rate.sell_rate }}</td>
                        <td class="px-4 py-3 text-gray-500 text-xs">{{ dateTime(rate.created_at) }}</td>
                        <td class="px-4 py-3 text-gray-600">{{ rate.creator?.name || '-' }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { api, apiError } from '../api/client'
import { dateTime } from '../utils/format'

const currencies = ref([])
const rates = ref([])
const loading = ref(false)
const error = ref('')
const busy = ref(false)
const form = reactive({ from_currency_id: '', to_currency_id: null, buy_rate: null, sell_rate: null })

async function load() {
    loading.value = true
    try {
        rates.value = (await api.get('/exchange-rates')).data.data
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
        await api.post('/exchange-rates', { ...form })
        Object.assign(form, { from_currency_id: '', to_currency_id: null, buy_rate: null, sell_rate: null })
        await load()
    } catch (e) {
        error.value = apiError(e).message
    } finally {
        busy.value = false
    }
}

onMounted(async () => {
    load()
    try {
        currencies.value = (await api.get('/currencies')).data.data
    } catch (e) {
        // handled by load error
    }
})
</script>
