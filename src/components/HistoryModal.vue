<template>
    <Modal :open="open" :title="title" max-width="sm:max-w-3xl" @close="$emit('close')">
        <!-- Date range: applies on change -->
        <div class="grid grid-cols-2 gap-3 mb-4">
            <div>
                <label class="form-label" for="hist-from">{{ $t('filters.from') }}</label>
                <input id="hist-from" v-model="filters.date_from" type="date" class="form-input" />
            </div>
            <div>
                <label class="form-label" for="hist-to">{{ $t('filters.to') }}</label>
                <input id="hist-to" v-model="filters.date_to" type="date" class="form-input" />
            </div>
        </div>

        <Alert v-if="error" type="error" class="mb-3">{{ error }}</Alert>

        <div v-if="loading" class="space-y-2">
            <div v-for="i in 4" :key="i" class="h-14 rounded-xl animate-shimmer" />
        </div>
        <p v-else-if="!entries.length" class="py-10 text-center text-sm text-gray-400">{{ $t('history.empty') }}</p>

        <ul v-else class="divide-y divide-gray-100">
            <li v-for="entry in entries" :key="entry.id" class="flex items-center gap-3 py-3">
                <span
                    class="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-base font-bold"
                    :class="isUp(entry) ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'"
                    aria-hidden="true"
                >{{ isUp(entry) ? '+' : '−' }}</span>
                <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-gray-900 truncate">
                        {{ txLabel(entry.transaction?.tx_type) }}
                        <span v-if="entry.transaction?.is_void" class="ms-1 text-xs font-semibold text-red-600">{{ $t('history.cancelled') }}</span>
                    </p>
                    <p class="text-xs text-gray-500 truncate">{{ entry.transaction?.description || entry.description || entry.transaction?.tx_number }}</p>
                    <p class="text-xs text-gray-400">{{ dateTime(entry.created_at) }}</p>
                </div>
                <div class="text-end shrink-0">
                    <p class="text-sm font-bold tabular-nums" :class="isUp(entry) ? 'text-emerald-700' : 'text-red-600'">
                        {{ isUp(entry) ? '+' : '−' }}{{ money(entry.amount, entry.currency?.code) }}
                    </p>
                    <p class="text-xs text-gray-400">{{ isUp(entry) ? $t(upLabel) : $t(downLabel) }}</p>
                </div>
            </li>
        </ul>

        <Pagination :meta="meta" @page="load" />
    </Modal>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiError } from '../api/client'
import { dateTime, money } from '../utils/format'
import Modal from './Modal.vue'
import Pagination from './Pagination.vue'
import Alert from './ui/Alert.vue'

/**
 * Plain-language transaction history for a wallet or an agent.
 * All wallets shown here (cash, bank, e-wallet, agent wallet) are
 * debit-normal, so a debit raises the balance and a credit lowers it.
 */
const props = defineProps({
    open: { type: Boolean, default: false },
    title: { type: String, default: '' },
    /** (params) => Promise<axiosResponse> returning a paginated list */
    fetcher: { type: Function, required: true },
    upLabel: { type: String, default: 'history.moneyIn' },
    downLabel: { type: String, default: 'history.moneyOut' },
})

defineEmits(['close'])

const { t, te } = useI18n()

const entries = ref([])
const meta = ref(null)
const loading = ref(false)
const error = ref('')
const filters = reactive({ date_from: '', date_to: '' })

const isUp = (entry) => entry.entry_type === 'debit'

const txLabel = (type) => (type && te(`history.types.${type}`) ? t(`history.types.${type}`) : t('history.types.other'))

async function load(page = 1) {
    loading.value = true
    error.value = ''
    try {
        const params = { page }
        if (filters.date_from) params.date_from = filters.date_from
        if (filters.date_to) params.date_to = filters.date_to
        const res = await props.fetcher(params)
        entries.value = res.data.data.data
        meta.value = res.data.data
    } catch (e) {
        error.value = apiError(e).message
    } finally {
        loading.value = false
    }
}

watch(() => props.open, (isOpen) => {
    if (! isOpen) return
    filters.date_from = ''
    filters.date_to = ''
    entries.value = []
    load(1)
})

watch(filters, () => { if (props.open) load(1) })
</script>
