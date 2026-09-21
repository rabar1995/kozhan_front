<template>
    <div>
        <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
            {{ error }}
        </div>

        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <p class="text-sm text-gray-500">{{ $t('expenses.intro') }}</p>
            <router-link
                to="/expenses/new"
                class="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
            >
                {{ $t('expenses.register') }}
            </router-link>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table class="min-w-full text-sm table-enhanced">
                <thead class="bg-gray-50 text-start text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                        <th class="px-4 py-3">{{ $t('expenses.date') }}</th>
                        <th class="px-4 py-3">{{ $t('expenses.category') }}</th>
                        <th class="px-4 py-3">{{ $t('expenses.description') }}</th>
                        <th class="px-4 py-3">{{ $t('expenses.paidFrom') }}</th>
                        <th class="px-4 py-3 text-end">{{ $t('expenses.amount') }}</th>
                        <th class="px-4 py-3">{{ $t('expenses.by') }}</th>
                        <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-if="loading">
                        <td colspan="7" class="px-4 py-8 text-center text-gray-400">{{ $t('common.loading') }}</td>
                    </tr>
                    <tr v-else-if="!expenses.length">
                        <td colspan="7" class="px-4 py-8 text-center text-gray-400">{{ $t('expenses.noExpenses') }}</td>
                    </tr>
                    <tr v-for="expense in expenses" :key="expense.id" class="hover:bg-gray-50">
                        <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ dateOnly(expense.expense_date) }}</td>
                        <td class="px-4 py-3">{{ expense.category?.name || '-' }}</td>
                        <td class="px-4 py-3 text-gray-700 max-w-[240px] truncate">{{ expense.description }}</td>
                        <td class="px-4 py-3 text-gray-600">{{ expense.paid_from_account?.name || '-' }}</td>
                        <td class="px-4 py-3 text-end font-medium">{{ money(expense.amount, expense.currency?.code) }}</td>
                        <td class="px-4 py-3 text-gray-600">{{ expense.creator?.name || '-' }}</td>
                        <td class="px-4 py-3 text-end">
                            <span v-if="expense.is_void" class="text-xs text-red-600 font-medium">{{ $t('expenses.voided') }}</span>
                            <button
                                v-else-if="can('void-expense')"
                                class="text-red-600 hover:text-red-800 text-xs font-medium"
                                @click="voidExpense(expense)"
                            >
                                {{ $t('expenses.voidBtn') }}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <Pagination :meta="meta" @page="load" />
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api, apiError } from '../api/client'
import { usePermissions } from '../composables/usePermissions'
import { useConfirm } from '../composables/useConfirm'
import { useToast } from '../composables/useToast'
import { money, dateOnly } from '../utils/format'
import Pagination from '../components/Pagination.vue'

const { t } = useI18n()
const { can } = usePermissions()
const { confirm } = useConfirm()
const { showToast } = useToast()

const expenses = ref([])
const meta = ref(null)
const loading = ref(false)
const error = ref('')

async function load(page = 1) {
    loading.value = true
    try {
        const res = await api.get('/expenses', { params: { page } })
        expenses.value = res.data.data.data
        meta.value = res.data.data
    } catch (e) {
        error.value = apiError(e).message
    } finally {
        loading.value = false
    }
}

async function voidExpense(expense) {
    const ok = await confirm({
        title: t('expenses.voidBtn'),
        message: t('expenses.voidConfirm', { description: expense.description }),
        type: 'danger',
        confirmText: t('expenses.voidBtn'),
        cancelText: t('common.cancel'),
    })
    if (!ok) return
    try {
        await api.patch(`/expenses/${expense.id}/void`)
        showToast({ message: t('expenses.voided'), type: 'success' })
        await load(meta.value?.current_page || 1)
    } catch (e) {
        error.value = apiError(e).message
    }
}

onMounted(() => load())
</script>
