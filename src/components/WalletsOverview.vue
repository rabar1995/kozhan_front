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
            <div v-for="group in groups" :key="group.key" class="mb-4 last:mb-0">
                <h4 class="text-xs font-semibold text-gray-500 mb-2">
                    {{ groupLabel(group.key) }} ({{ group.count }})
                </h4>
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div v-for="tot in group.totals" :key="tot.currency" class="rounded-xl bg-gray-50 px-3 py-3">
                        <p class="text-xs text-gray-500">{{ $t('accounts.totalIn', { currency: tot.currency }) }}</p>
                        <p class="text-base sm:text-lg font-bold tabular-nums mt-0.5" :class="balanceClass(tot.total)">
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
import { money, balanceClass } from '../utils/format'

const { t } = useI18n()
const accountStore = useAccountStore()
const loading = ref(false)

const walletTypes = ['cash_safe', 'e_wallet', 'bank_account', 'crypto_wallet', 'crypto_platform', 'agent_wallet']

const GROUP_ORDER = ['office', 'personal', 'private', 'agents']

const resolveGroup = (account) => {
    if (account.wallet_group) return account.wallet_group
    if (account.account_type?.code === 'agent_wallet') return 'agents'
    if (account.visibility === 'owner_private') return 'private'
    return 'office'
}

const groupLabel = (group) => {
    if (group === 'agents') return t('accounts.agentsGroup')
    if (group === 'personal') return t('accounts.personalGroup')
    if (group === 'private') return t('accounts.privateGroup')
    return t('accounts.officeGroup')
}

const groups = computed(() => {
    const byGroup = {}
    for (const acc of accountStore.accounts) {
        if (! walletTypes.includes(acc.account_type?.code) || ! acc.is_active) continue
        const key = resolveGroup(acc)
        byGroup[key] ??= { key, count: 0, totals: {} }
        byGroup[key].count++
        const code = acc.currency?.code || '?'
        byGroup[key].totals[code] ??= { currency: code, total: 0 }
        byGroup[key].totals[code].total += Number(acc.current_balance || 0)
    }
    return Object.entries(byGroup)
        .map(([key, g]) => ({
            key,
            count: g.count,
            totals: Object.values(g.totals).sort((a, b) => a.currency.localeCompare(b.currency)),
        }))
        .sort((a, b) => GROUP_ORDER.indexOf(a.key) - GROUP_ORDER.indexOf(b.key))
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
