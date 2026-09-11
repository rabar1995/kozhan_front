<template>
    <div class="flex h-screen bg-gray-50">
        <!-- ═══════ SIDEBAR — Desktop (always visible) ═══════ -->
        <aside
            class="hidden lg:flex w-[270px] shrink-0 flex-col
                   bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950
                   border-e border-white/[0.06] relative overflow-hidden"
        >
            <SidebarContent @navigate="() => {}" @logout="doLogout" />
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
                    <SidebarContent @navigate="sidebarOpen = false" @logout="doLogout" />
                </aside>
            </Transition>
        </Teleport>

        <!-- ═══════ MAIN CONTENT ═══════ -->
        <div class="flex-1 flex flex-col min-w-0">
            <!-- Header -->
            <header class="h-14 bg-white/80 backdrop-blur-md border-b border-gray-200/60 flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-30">
                <div class="flex items-center gap-3">
                    <button class="lg:hidden p-1.5 -ms-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors" @click="sidebarOpen = true">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                    <h2 class="text-sm sm:text-base font-semibold text-gray-900 truncate">{{ route.meta.title ? $t(route.meta.title) : '' }}</h2>
                </div>
                <div class="flex items-center gap-2 sm:gap-3">
                    <button
                        v-if="!isInstalled"
                        class="flex items-center gap-1.5 text-xs px-2 sm:px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold transition-colors border border-indigo-200/60 shadow-xs"
                        :title="$t('pwa.installApp')"
                        @click="promptInstall"
                    >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        <span class="hidden sm:inline">{{ $t('pwa.installBtn') }}</span>
                    </button>
                    <span class="text-sm text-gray-500 hidden md:block truncate max-w-[120px]">{{ auth.userName }}</span>
                    <LanguageSwitcher />
                    <button
                        class="text-sm px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors hidden sm:flex items-center gap-1.5"
                        @click="doLogout"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                        </svg>
                        {{ $t('nav.logout') }}
                    </button>
                </div>
            </header>

            <main class="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
                <router-view />
            </main>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { usePwa } from '../composables/usePwa'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'
import SidebarContent from '../components/SidebarContent.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const { isInstalled, promptInstall } = usePwa()

const sidebarOpen = ref(false)

async function doLogout() {
    await auth.logout()
    router.push({ name: 'login' })
}
</script>
