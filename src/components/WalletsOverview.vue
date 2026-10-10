<template>
    <div class="card card-pad">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-gray-700">{{ $t('dashboard.wallets') }}</h3>
            <router-link to="/accounts" class="text-xs font-medium text-indigo-600 hover:text-indigo-800">
                {{ $t('dashboard.viewAll') }}
            </router-link>
        </div>

        <div v-if="loading && !groups.length" class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div v-for="i in 4" :key="i" class="h-16 rounded-xl bg-gray-100 animate-pulse" />
        </div>

        <template v-else-if="groups.length">
            <div v-for="group in groups" :key="group.visibility" class="mb-4 last:mb-0">
                <h4 class="text-xs font-semibold text-gray-500 mb-2">
                    {{ groupLabel(group.visibility) }} ({{ group.count }})
                </h4>
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div v-for="tot in group.totals" :key="tot.currency" class="rounded-xl bg-gray-50 px-3 py-3">
                        <p class="text-xs text-gray-500">{{ $t('accounts.totalIn', { currency: tot.currency }) }}</p>
                        <p class="text-base sm:text-lg font-bold tabular-nums mt-0.5" :class="tot.total >= 0 ? 'text-gray-900' : 'text-red-600'">
                            {{ money(tot.total, tot.currency) }}
                        </p>
                    </div>
                </div>
            </div>
        </template>

        <p v-else class="text-sm text-gray-400 text-center py-4">{{ $t('dashboard.noCashSafes') }}</p>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAccountStore } from '../stores/account'
import { money } from '../utils/format'

const { t } = useI18n()
const accountStore = useAccountStore()
const loading = ref(false)

const walletTypes = ['cash_safe', 'e_wallet', 'bank_account', 'crypto_wallet', 'crypto_platform']

const groupLabel = (visibility) => {
    if (visibility === 'office_shared') return t('accounts.officeGroup')
    if (visibility === 'owner_private') return t('accounts.privateGroup')
    return visibility
}

const groups = computed(() => {
    const byVisibility = {}
    for (const acc of accountStore.accounts) {
        if (! walletTypes.includes(acc.account_type?.code) || ! acc.is_active) continue
        const vis = acc.visibility || 'unknown'
        byVisibility[vis] ??= { visibility: vis, count: 0, totals: {} }
        byVisibility[vis].count++
        const code = acc.currency?.code || '?'
        byVisibility[vis].totals[code] ??= { currency: code, total: 0 }
        byVisibility[vis].totals[code].total += Number(acc.current_balance || 0)
    }
    return Object.entries(byVisibility)
        .map(([visibility, g]) => ({
            visibility,
            count: g.count,
            totals: Object.values(g.totals).sort((a, b) => a.currency.localeCompare(b.currency)),
        }))
        .sort((a, b) => (a.visibility === 'office_shared' ? -1 : 1))
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
    if (! accountStore.accounts.length && ! accountStore.loading) load()
})
</script>
