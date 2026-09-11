<template>
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-gray-700">{{ $t('dashboard.cashSafes') }}</h3>
            <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50">
                <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            </div>
        </div>

        <div v-if="loading" class="space-y-3">
            <div v-for="i in 3" :key="i" class="flex justify-between items-center">
                <div class="h-4 w-28 bg-gray-100 rounded animate-pulse" />
                <div class="h-5 w-20 bg-gray-100 rounded animate-pulse" />
            </div>
        </div>

        <div v-else-if="groupedAccounts.length" class="space-y-2.5">
            <div v-for="group in groupedAccounts" :key="group.currency"
                class="flex items-center justify-between py-2 px-3 rounded-xl bg-gray-50/70 hover:bg-gray-50 transition-colors">
                <div class="flex items-center gap-2">
                    <span class="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">
                        {{ group.currency }}
                    </span>
                    <span class="text-xs text-gray-500">{{ group.count }} {{ group.count > 1 ? 'accounts' : 'account' }}</span>
                </div>
                <span class="text-sm font-bold tabular-nums" :class="Number(group.total) >= 0 ? 'text-gray-900' : 'text-red-600'">
                    {{ money(group.total, group.currency) }}
                </span>
            </div>
        </div>

        <p v-else class="text-sm text-gray-400 text-center py-4">{{ $t('common.none') }}</p>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAccountStore } from '../stores/account'
import { money } from '../utils/format'

const accountStore = useAccountStore()
const loading = ref(false)

const cashTypes = ['cash_safe', 'e_wallet', 'bank_account']

const groupedAccounts = computed(() => {
    const cashAccounts = accountStore.accounts.filter(
        (a) => cashTypes.includes(a.account_type?.code) && a.is_active
    )
    const groups = {}
    for (const acc of cashAccounts) {
        const code = acc.currency?.code || '?'
        if (!groups[code]) groups[code] = { currency: code, total: 0, count: 0 }
        groups[code].total += Number(acc.current_balance || 0)
        groups[code].count++
    }
    return Object.values(groups).sort((a, b) => b.total - a.total)
})

onMounted(async () => {
    if (!accountStore.accounts.length) {
        loading.value = true
        try {
            await accountStore.fetchAccounts({ active: 1 })
        } catch { /* handled */ } finally {
            loading.value = false
        }
    }
})
</script>
