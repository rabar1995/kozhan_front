<template>
    <div class="relative overflow-hidden rounded-2xl shadow-sm border border-gray-100 bg-white">
        <!-- Indigo gradient accent stripe -->
        <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-purple-500" />

        <!-- Subtle watermark icon -->
        <div class="absolute -top-6 -end-6 text-indigo-50 pointer-events-none">
            <svg class="w-40 h-40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 110-6h.75A2.25 2.25 0 0018 1.5H6A2.25 2.25 0 003.75 3.75v16.5A2.25 2.25 0 006 22.5h12a2.25 2.25 0 002.25-2.25V12zM15 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
        </div>

        <div class="relative p-5 sm:p-6">
            <!-- Header -->
            <div class="flex items-center justify-between mb-5">
                <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-sm">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
                            {{ $t('dashboard.privateWallets') }}
                            <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {{ wallets.length }}
                            </span>
                        </h3>
                        <p class="text-xs text-gray-400 mt-0.5">{{ $t('accounts.privateIntro') }}</p>
                    </div>
                </div>
                <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-1 rounded-lg shrink-0">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    Private
                </span>
            </div>

            <!-- Loading skeleton -->
            <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                <div v-for="i in 3" :key="i" class="rounded-xl border border-gray-100 p-4 space-y-3">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full bg-gray-100 animate-pulse" />
                        <div class="space-y-1.5">
                            <div class="h-3.5 w-24 bg-gray-100 rounded animate-pulse" />
                            <div class="h-2.5 w-16 bg-gray-100 rounded animate-pulse" />
                        </div>
                    </div>
                    <div class="h-7 w-28 bg-gray-100 rounded animate-pulse" />
                </div>
            </div>

            <!-- Wallet tiles -->
            <div v-else-if="wallets.length" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                <router-link
                    v-for="wallet in wallets"
                    :key="wallet.id"
                    to="/private-wallets"
                    class="relative overflow-hidden rounded-xl bg-gradient-to-br from-white via-white to-indigo-50/40 border border-gray-200/80 p-4 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                >
                    <div class="flex items-start justify-between gap-2">
                        <div class="flex items-center gap-2.5 min-w-0">
                            <LogoAvatar :name="wallet.name" :url="wallet.logo_url" />
                            <div class="min-w-0">
                                <p class="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors" :title="wallet.name">
                                    {{ wallet.name }}
                                </p>
                                <p class="text-[11px] text-gray-400 truncate">
                                    {{ wallet.account_type?.name || '' }}
                                </p>
                            </div>
                        </div>
                        <span class="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-900 text-white tracking-wider shrink-0">
                            {{ wallet.currency?.code || '-' }}
                        </span>
                    </div>

                    <div class="mt-3 flex items-end justify-between">
                        <span class="text-lg sm:text-xl font-black tabular-nums tracking-tight" :class="Number(wallet.current_balance) < 0 ? 'text-red-600' : 'text-gray-900'">
                            {{ money(wallet.current_balance, wallet.currency?.code) }}
                        </span>
                        <svg class="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors rtl:rotate-180" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </div>
                </router-link>
            </div>

            <p v-else class="text-sm text-gray-400 text-center py-6">{{ $t('common.none') }}</p>

            <router-link
                v-if="wallets.length"
                to="/private-wallets"
                class="mt-4 flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-semibold rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
                {{ $t('dashboard.viewAllPrivate') }}
                <svg class="w-3.5 h-3.5 rtl:rotate-180" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
            </router-link>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAccountStore } from '../stores/account'
import { money } from '../utils/format'
import LogoAvatar from './LogoAvatar.vue'

const accountStore = useAccountStore()
const loading = ref(false)

const SYSTEM_TYPE_CODES = ['owner_equity', 'exchange_pending']

const wallets = computed(() =>
    accountStore.accounts
        .filter((a) => a.visibility === 'owner_private')
        .filter((a) => ! SYSTEM_TYPE_CODES.includes(a.account_type?.code || ''))
        .sort((a, b) => Number(b.current_balance || 0) - Number(a.current_balance || 0)),
)

async function load() {
    loading.value = true
    try {
        await accountStore.fetchAccounts()
    } catch { /* handled */ } finally {
        loading.value = false
    }
}

onMounted(() => {
    if (! accountStore.accounts.length) load()
})

defineExpose({ load })
</script>
