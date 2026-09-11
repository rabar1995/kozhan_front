<template>
    <div class="flex flex-col h-full select-none">
        <!-- ═══════ LOGO HEADER ═══════ -->
        <div class="px-5 py-4 border-b border-white/[0.08] shrink-0">
            <div class="flex items-center gap-3">
                <div class="relative">
                    <div class="absolute inset-0 rounded-xl bg-indigo-500/25 blur-md"></div>
                    <img
                        src="/kozhanfx.png"
                        alt="Kozhan FX"
                        class="relative w-10 h-10 rounded-xl ring-1 ring-white/10 shrink-0 object-cover"
                    />
                </div>
                <div class="min-w-0">
                    <h1 class="text-base font-bold tracking-tight text-white flex items-center gap-2">
                        Kozhan FX
                        <span class="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            PRO
                        </span>
                    </h1>
                    <p class="text-[11px] text-slate-400 mt-0.5 truncate">
                        {{ auth.officeName || $t('nav.brandTag') }}
                    </p>
                </div>
            </div>
        </div>

        <!-- ═══════ NAVIGATION WITH SUB-TABS ═══════ -->
        <nav class="flex-1 overflow-y-auto sidebar-scroll px-3 py-3 space-y-1.5">
            <!-- ── Top-level Dashboard Link ── -->
            <RouterLink
                to="/dashboard"
                class="nav-item flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all group relative"
                :class="isItemActive('/dashboard')
                    ? 'nav-active bg-indigo-500/20 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'"
                @click="emit('navigate')"
            >
                <div class="flex items-center gap-3 min-w-0">
                    <!-- Active Indicator Strip -->
                    <span
                        v-if="isItemActive('/dashboard')"
                        class="absolute start-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-e-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]"
                    />
                    <!-- Icon -->
                    <span
                        class="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-all duration-200"
                        :class="isItemActive('/dashboard')
                            ? 'bg-indigo-500/30 text-indigo-300 ring-1 ring-indigo-400/30'
                            : 'bg-white/[0.04] text-slate-400 group-hover:bg-white/[0.08] group-hover:text-slate-200'"
                    >
                        <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" :d="icons.dashboard" />
                        </svg>
                    </span>
                    <span class="truncate">{{ $t('nav.dashboard') }}</span>
                </div>
            </RouterLink>

            <!-- ── Categorized Sections with Expandable Sub-Tabs ── -->
            <div
                v-for="category in categories"
                :key="category.id"
                class="pt-1"
            >
                <!-- Category Accordion Toggle Button -->
                <button
                    type="button"
                    class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[12px] font-semibold transition-all group cursor-pointer"
                    :class="isCategoryActive(category)
                        ? 'text-indigo-300 bg-indigo-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'"
                    @click="toggleCategory(category.id)"
                >
                    <div class="flex items-center gap-2.5 min-w-0">
                        <!-- Category Icon -->
                        <span
                            class="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 transition-colors"
                            :class="isCategoryActive(category)
                                ? 'bg-indigo-500/25 text-indigo-300'
                                : 'bg-white/[0.03] text-slate-500 group-hover:text-slate-300 group-hover:bg-white/[0.06]'"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" :d="icons[category.icon]" />
                            </svg>
                        </span>
                        <span class="truncate uppercase tracking-wider text-[11px] font-bold">
                            {{ $t(category.label) }}
                        </span>
                    </div>

                    <div class="flex items-center gap-1.5 shrink-0">
                        <!-- Sub-items count badge -->
                        <span
                            class="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                            :class="isCategoryActive(category)
                                ? 'bg-indigo-500/20 text-indigo-300'
                                : 'bg-white/[0.05] text-slate-500 group-hover:text-slate-400'"
                        >
                            {{ category.items.length }}
                        </span>

                        <!-- Animated Chevron Toggle -->
                        <svg
                            class="w-4 h-4 text-slate-500 transition-transform duration-200 group-hover:text-slate-300"
                            :class="{ 'rotate-180 text-indigo-400': expanded[category.id] }"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            viewBox="0 0 24 24"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </div>
                </button>

                <!-- Sub-Tabs Container (Smooth Grid Height Transition) -->
                <div
                    class="grid transition-all duration-200 ease-in-out"
                    :class="expanded[category.id] ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'"
                >
                    <div class="overflow-hidden">
                        <!-- Sub-Tabs Tree / Indented List -->
                        <div class="ms-5 ps-3 border-s border-white/[0.08] space-y-0.5 py-0.5">
                            <RouterLink
                                v-for="item in category.items"
                                :key="item.to"
                                :to="item.to"
                                class="sub-nav-item flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] font-medium transition-all group relative"
                                :class="isItemActive(item.to)
                                    ? 'bg-indigo-500/20 text-white font-semibold ring-1 ring-indigo-400/25 shadow-xs'
                                    : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'"
                                @click="emit('navigate')"
                            >
                                <!-- Sub-item Indicator Dot / Mini-Icon -->
                                <span
                                    class="flex items-center justify-center w-5 h-5 rounded-md shrink-0 transition-colors"
                                    :class="isItemActive(item.to)
                                        ? 'bg-indigo-500/30 text-indigo-300'
                                        : 'text-slate-500 group-hover:text-slate-300'"
                                >
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" :d="icons[item.icon]" />
                                    </svg>
                                </span>

                                <span class="truncate flex-1">{{ $t(item.label) }}</span>

                                <!-- Active Sub-tab Dot -->
                                <span
                                    v-if="isItemActive(item.to)"
                                    class="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 shadow-[0_0_6px_rgba(129,140,248,0.8)]"
                                />
                            </RouterLink>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <!-- ═══════ USER PROFILE FOOTER ═══════ -->
        <div class="px-4 py-3.5 border-t border-white/[0.08] bg-slate-950/40 shrink-0">
            <div class="flex items-center gap-3">
                <!-- Avatar -->
                <div class="relative shrink-0">
                    <div
                        class="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold ring-2 ring-indigo-400/20 shadow-xs"
                    >
                        {{ (auth.userName || 'U').charAt(0).toUpperCase() }}
                    </div>
                    <span
                        class="absolute -bottom-0.5 -end-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-slate-950"
                        :class="auth.isOwner ? 'bg-amber-400' : 'bg-emerald-400'"
                    />
                </div>

                <!-- User Info -->
                <div class="min-w-0 flex-1">
                    <p class="text-[13px] font-semibold text-slate-200 truncate leading-tight">
                        {{ auth.userName || 'User' }}
                    </p>
                    <p class="text-[11px] text-slate-400 truncate mt-0.5">
                        {{ auth.isOwner ? $t('nav.owner') : $t('nav.manager') }}
                    </p>
                </div>

                <!-- Logout Button (Mobile or quick action) -->
                <button
                    class="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                    :title="$t('nav.logout')"
                    @click="emit('logout')"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" :d="icons.logout" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { usePermissions } from '../composables/usePermissions'

const emit = defineEmits(['navigate', 'logout'])

const auth = useAuthStore()
const route = useRoute()
const { can } = usePermissions()

/* ───── SVG ICON PATHS ───── */
const icons = {
    dashboard: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z',
    remittances: 'M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
    allRemittances: 'M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
    pendingPayouts: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
    bookIncoming: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3',
    bookOutgoing: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5',
    operations: 'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z',
    agents: 'M18 18.72a9.094 9.094 0 003.741-2.956 9 9 0 10-17.482 0A9.094 9.094 0 008 18.72m0 0a9.066 9.066 0 005.999 2.28m-5.999-2.28a8.99 8.99 0 015.999-2.28m0 4.56a9.066 9.066 0 005.999-2.28M15 9.75a3 3 0 11-6 0 3 3 0 016 0z',
    wallets: 'M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 110-6h.75A2.25 2.25 0 0018 1.5H6A2.25 2.25 0 003.75 3.75v16.5A2.25 2.25 0 006 22.5h12a2.25 2.25 0 002.25-2.25V12zM15 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
    privateWallets: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z',
    expenses: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
    owner: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
    profitLoss: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
    transfers: 'M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
    exchangeRates: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    exchangeDeals: 'M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3',
    userManagement: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
    auditLogs: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z',
    logout: 'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9',
}

/* ───── CATEGORIES & SUB-TABS DEFINITION ───── */
const categories = computed(() => {
    const list = [
        {
            id: 'remittances',
            label: 'nav.remittances',
            icon: 'remittances',
            items: [
                { to: '/remittances', label: 'nav.allRemittances', icon: 'allRemittances' },
                { to: '/remittances/pending', label: 'nav.pendingPayouts', icon: 'pendingPayouts' },
                { to: '/remittances/incoming', label: 'nav.bookIncoming', icon: 'bookIncoming' },
                { to: '/remittances/outgoing', label: 'nav.bookOutgoing', icon: 'bookOutgoing' },
            ],
        },
        {
            id: 'operations',
            label: 'nav.operations',
            icon: 'operations',
            items: [
                { to: '/agents', label: 'nav.agents', icon: 'agents' },
                { to: '/accounts', label: 'nav.wallets', icon: 'wallets' },
                ...(auth.isOwner ? [{ to: '/private-wallets', label: 'nav.privateWallets', icon: 'privateWallets' }] : []),
                { to: '/expenses', label: 'nav.expenses', icon: 'expenses' },
            ],
        },
    ]

    if (can('view-reports')) {
        list.push({
            id: 'owner',
            label: 'nav.owner',
            icon: 'owner',
            items: [
                { to: '/reports/profit-loss', label: 'nav.profitLoss', icon: 'profitLoss' },
                { to: '/transfers', label: 'nav.transfers', icon: 'transfers' },
                { to: '/exchange-rates', label: 'nav.exchangeRates', icon: 'exchangeRates' },
                { to: '/exchange-deals', label: 'nav.exchangeDeals', icon: 'exchangeDeals' },
                { to: '/users', label: 'nav.userManagement', icon: 'userManagement' },
                { to: '/audit-logs', label: 'nav.auditLogs', icon: 'auditLogs' },
            ],
        })
    }

    return list
})

/* ───── ACCORDION EXPANSION STATE ───── */
const expanded = ref({
    remittances: true,
    operations: true,
    owner: false,
})

function toggleCategory(categoryId) {
    expanded.value[categoryId] = !expanded.value[categoryId]
}

/* Auto-expand the category containing the active route */
function ensureActiveCategoryExpanded() {
    const currentPath = route.path
    for (const cat of categories.value) {
        if (cat.items.some((item) => isItemActive(item.to))) {
            expanded.value[cat.id] = true
        }
    }
}

watch(() => route.path, () => {
    ensureActiveCategoryExpanded()
}, { immediate: true })

/* ───── ACTIVE ROUTE MATCHERS ───── */
function isItemActive(path) {
    if (path === '/dashboard') return route.path === '/dashboard'
    if (path === '/remittances') return route.path === '/remittances'
    return route.path.startsWith(path)
}

function isCategoryActive(category) {
    return category.items.some((item) => isItemActive(item.to))
}
</script>

<style scoped>
.sub-nav-item {
    transition: background-color 0.15s ease, color 0.15s ease, padding-inline-start 0.15s ease;
}
.sub-nav-item:hover {
    padding-inline-start: 0.85rem;
}
</style>
