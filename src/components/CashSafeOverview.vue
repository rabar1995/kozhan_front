<template>
    <div class="card card-pad">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-gray-700">{{ $t('dashboard.cashSafes') }}</h3>
            <router-link to="/accounts" class="text-xs font-medium text-indigo-600 hover:text-indigo-800">
                {{ $t('dashboard.viewAll') }}
            </router-link>
        </div>

        <div v-if="loading && !groupedAccounts.length" class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div v-for="i in 4" :key="i" class="h-16 rounded-xl bg-gray-100 animate-pulse" />
        </div>

        <div v-else-if="groupedAccounts.length" class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div v-for="group in groupedAccounts" :key="group.currency" class="rounded-xl bg-gray-50 px-3 py-3">
                <p class="text-xs text-gray-500">{{ $t('dashboard.walletCount', { currency: group.currency, n: group.count }, group.count) }}</p>
                <p class="text-base sm:text-lg font-bold tabular-nums mt-0.5" :class="group.total >= 0 ? 'text-gray-900' : 'text-red-600'">
                    {{ money(group.total, group.currency) }}
                </p>
            </div>
        </div>

        <p v-else class="text-sm text-gray-400 text-center py-4">{{ $t('dashboard.noCashSafes') }}</p>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAccountStore } from '../stores/account'
import { money } from '../utils/format'

const accountStore = useAccountStore()
const loading = ref(false)

const cashTypes = ['cash_safe', 'e_wallet', 'bank_account']

/** Total cash per currency across active office + private cash wallets. */
const groupedAccounts = computed(() => {
    const groups = {}
    for (const acc of accountStore.accounts) {
        if (! cashTypes.includes(acc.account_type?.code) || ! acc.is_active) continue
        const code = acc.currency?.code || '?'
        groups[code] ??= { currency: code, total: 0, count: 0 }
        groups[code].total += Number(acc.current_balance || 0)
        groups[code].count++
    }
    return Object.values(groups).sort((a, b) => a.currency.localeCompare(b.currency))
})

async function load() {
    loading.value = true
    try {
        await accountStore.fetchAccounts()
    } catch { /* the dashboard shows its own error */ } finally {
        loading.value = false
    }
}

defineExpose({ load })

onMounted(() => {
    // The private-wallets card on the same page may already be loading them.
    if (! accountStore.accounts.length && ! accountStore.loading) load()
})
</script>
