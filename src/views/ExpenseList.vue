<template>
    <div>
        <PageHeader :text="$t('expenses.intro')">
            <router-link v-if="can('record-expense')" to="/expenses/new" class="btn btn-primary">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                {{ $t('expenses.register') }}
            </router-link>
        </PageHeader>

        <Alert v-if="error" type="error" dismissible class="mb-4" @dismiss="error = ''">{{ error }}</Alert>

        <div v-if="loading && !expenses.length" class="space-y-3">
            <div v-for="i in 4" :key="i" class="h-16 rounded-2xl animate-shimmer" />
        </div>

        <EmptyState v-else-if="!expenses.length" :title="$t('expenses.noExpenses')" :text="$t('expenses.noExpensesHint')">
            <router-link v-if="can('record-expense')" to="/expenses/new" class="btn btn-primary">{{ $t('expenses.register') }}</router-link>
        </EmptyState>

        <!-- One list that works on phone and desktop -->
        <ul v-else class="card divide-y divide-gray-100">
            <li v-for="expense in expenses" :key="expense.id" class="flex items-center gap-3 px-4 py-3" :class="expense.is_void ? 'opacity-60' : ''">
                <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-gray-900 truncate" :class="expense.is_void ? 'line-through' : ''">{{ expense.description }}</p>
                    <p class="text-xs text-gray-500 truncate">
                        {{ expense.category?.name || '—' }} · {{ expense.paid_from_account?.name || '—' }}
                    </p>
                    <p class="text-xs text-gray-400">{{ dateOnly(expense.expense_date) }} · {{ expense.creator?.name || '—' }}</p>
                </div>
                <div class="text-end shrink-0">
                    <p class="text-sm font-bold tabular-nums text-gray-900">{{ money(expense.amount, expense.currency?.code) }}</p>
                    <span v-if="expense.is_void" class="text-xs font-semibold text-red-600">{{ $t('expenses.voided') }}</span>
                    <button v-else-if="can('void-expense')" class="btn btn-ghost btn-sm !text-red-600 -me-2" @click="voidExpense(expense)">
                        {{ $t('expenses.voidBtn') }}
                    </button>
                </div>
            </li>
        </ul>
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
import Alert from '../components/ui/Alert.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import PageHeader from '../components/ui/PageHeader.vue'

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
        title: t('expenses.voidTitle'),
        message: t('expenses.voidConfirm', { description: expense.description }),
        type: 'danger',
        confirmText: t('expenses.voidBtn'),
        cancelText: t('common.cancel'),
    })
    if (! ok) return
    try {
        await api.patch(`/expenses/${expense.id}/void`)
        showToast({ message: t('expenses.voidedToast') })
        await load(meta.value?.current_page || 1)
    } catch (e) {
        error.value = apiError(e).message
    }
}

onMounted(() => load())
</script>
