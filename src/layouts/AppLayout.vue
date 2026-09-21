<template>
    <div class="flex h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100">
        <!-- ═══════ SIDEBAR — Desktop (always visible) ═══════ -->
        <aside
            class="hidden lg:flex w-[270px] shrink-0 flex-col
                   bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950
                   border-e border-white/[0.06] relative overflow-hidden"
        >
            <SidebarContent @navigate="() => {}" @logout="doLogout" @open-settings="settingsOpen = true" />
        </aside>

        <!-- ═══════ SIDEBAR — Mobile (slide-in drawer) ═══════ -->
        <Teleport to="body">
            <!-- Backdrop -->
            <Transition name="overlay">
                <div
                    v-if="sidebarOpen"
                    class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    @click="sidebarOpen = false"
                />
            </Transition>

            <!-- Drawer -->
            <Transition name="sidebar">
                <aside
                    v-if="sidebarOpen"
                    class="fixed inset-y-0 start-0 z-50 w-[270px] flex flex-col lg:hidden
                           bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950
                           shadow-2xl"
                >
                    <SidebarContent @navigate="sidebarOpen = false" @logout="doLogout" @open-settings="settingsOpen = true; sidebarOpen = false" />
                </aside>
            </Transition>
        </Teleport>

        <!-- ═══════ MAIN CONTENT ═══════ -->
        <div class="flex-1 flex flex-col min-w-0">
            <!-- Header -->
            <header class="h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200/60 dark:border-slate-800/80 flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-30 transition-colors">
                <div class="flex items-center gap-3">
                    <button
                        class="lg:hidden p-1.5 -ms-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                        aria-label="Open menu"
                        @click="sidebarOpen = true"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                    <div class="flex flex-col min-w-0">
                        <h2 class="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate leading-tight">{{ route.meta.title ? $t(route.meta.title) : '' }}</h2>
                        <!-- Breadcrumbs -->
                        <nav v-if="breadcrumbs.length > 1" class="flex items-center gap-0.5 text-[11px] text-gray-400 dark:text-slate-400 leading-tight mt-0.5" aria-label="Breadcrumb">
                            <template v-for="(crumb, idx) in breadcrumbs" :key="idx">
                                <span v-if="idx > 0" class="breadcrumb-separator">/</span>
                                <router-link
                                    v-if="crumb.to && idx < breadcrumbs.length - 1"
                                    :to="crumb.to"
                                    class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                >
                                    {{ crumb.label }}
                                </router-link>
                                <span v-else class="text-gray-500 dark:text-slate-300 font-medium">{{ crumb.label }}</span>
                            </template>
                        </nav>
                    </div>
                </div>
                <div class="flex items-center gap-2 sm:gap-3">
                    <!-- Keyboard shortcut hint -->
                    <div class="hidden lg:flex items-center gap-1 text-[10px] text-gray-400 dark:text-slate-400 bg-gray-100 dark:bg-slate-800/80 px-2 py-1 rounded-md border border-gray-200/80 dark:border-slate-700/80 select-none">
                        <kbd class="font-mono font-semibold text-gray-500 dark:text-slate-300">Ctrl</kbd>
                        <span>+</span>
                        <kbd class="font-mono font-semibold text-gray-500 dark:text-slate-300">K</kbd>
                        <span class="ms-1">{{ $t('common.search') }}</span>
                    </div>

                    <span class="text-sm text-gray-500 dark:text-slate-400 hidden md:block truncate max-w-[120px]">{{ auth.userName }}</span>

                    <!-- Unified Settings (Theme, Language, App Install) -->
                    <button
                        type="button"
                        class="flex items-center gap-1.5 text-xs px-2.5 sm:px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium group shadow-2xs"
                        :title="$t('settings.title')"
                        @click="settingsOpen = true"
                    >
                        <svg class="w-4 h-4 text-gray-500 dark:text-slate-400 group-hover:rotate-45 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-transform duration-300" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.216.456a1.125 1.125 0 01-1.37-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span class="hidden sm:inline font-medium">{{ $t('settings.title') }}</span>
                    </button>

                    <!-- Logout Button -->
                    <button
                        class="text-sm px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-slate-200 transition-colors hidden sm:flex items-center gap-1.5"
                        @click="doLogout"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                        </svg>
                        {{ $t('nav.logout') }}
                    </button>
                </div>
            </header>

            <main class="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 bg-gray-50 dark:bg-slate-950 transition-colors">
                <router-view />
            </main>
        </div>

        <!-- Unified Settings Modal -->
        <SettingsModal v-model="settingsOpen" />
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { useKeyboardShortcuts } from '../composables/useKeyboardShortcuts'
import SettingsModal from '../components/SettingsModal.vue'
import SidebarContent from '../components/SidebarContent.vue'

const { t } = useI18n()
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const sidebarOpen = ref(false)
const settingsOpen = ref(false)

// Register global keyboard shortcuts
useKeyboardShortcuts()

// ── Breadcrumbs ──
const breadcrumbMap = {
    '/dashboard': [],
    '/remittances': [{ label: 'nav.remittances' }],
    '/remittances/pending': [{ label: 'nav.remittances', to: '/remittances' }, { label: 'nav.pendingPayouts' }],
    '/remittances/incoming': [{ label: 'nav.remittances', to: '/remittances' }, { label: 'nav.bookIncoming' }],
    '/remittances/outgoing': [{ label: 'nav.remittances', to: '/remittances' }, { label: 'nav.bookOutgoing' }],
    '/agents': [{ label: 'nav.operations' }, { label: 'nav.agents' }],
    '/accounts': [{ label: 'nav.operations' }, { label: 'nav.wallets' }],
    '/private-wallets': [{ label: 'nav.kozhanWallets' }, { label: 'nav.privateWallets' }],
    '/exchange-deals': [{ label: 'nav.kozhanWallets' }, { label: 'nav.exchangeDeals' }],
    '/expenses': [{ label: 'nav.operations' }, { label: 'nav.expenses' }],
    '/expenses/new': [{ label: 'nav.operations' }, { label: 'nav.expenses', to: '/expenses' }, { label: 'nav.registerExpense' }],
    '/reports/profit-loss': [{ label: 'nav.owner' }, { label: 'nav.profitLoss' }],
    '/transfers': [{ label: 'nav.owner' }, { label: 'nav.transfers' }],
    '/users': [{ label: 'nav.owner' }, { label: 'nav.userManagement' }],
    '/audit-logs': [{ label: 'nav.owner' }, { label: 'nav.auditLogs' }],
}

const breadcrumbs = computed(() => {
    const raw = breadcrumbMap[route.path] || []
    return raw.map((crumb) => ({
        ...crumb,
        label: t(crumb.label),
    }))
})

async function doLogout() {
    await auth.logout()
    router.push({ name: 'login' })
}
</script>
