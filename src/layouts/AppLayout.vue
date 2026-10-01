<template>
    <div class="flex h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100">
        <!-- Desktop sidebar -->
        <aside class="hidden lg:flex w-64 shrink-0 flex-col bg-slate-900 border-e border-white/[0.06]">
            <SidebarContent @logout="doLogout" @open-settings="settingsOpen = true" />
        </aside>

        <!-- Phone / tablet drawer (opened from the bottom bar "Menu") -->
        <Teleport to="body">
            <Transition name="overlay">
                <div v-if="sidebarOpen" class="fixed inset-0 z-40 bg-black/50 lg:hidden" @click="sidebarOpen = false" />
            </Transition>
            <Transition name="sidebar">
                <aside
                    v-if="sidebarOpen"
                    class="fixed inset-y-0 start-0 z-50 w-72 max-w-[85vw] flex flex-col lg:hidden bg-slate-900 shadow-2xl"
                    @keydown.esc="sidebarOpen = false"
                >
                    <SidebarContent
                        @navigate="sidebarOpen = false"
                        @logout="doLogout"
                        @open-settings="settingsOpen = true; sidebarOpen = false"
                    />
                </aside>
            </Transition>
        </Teleport>

        <div class="flex-1 flex flex-col min-w-0">
            <header class="h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200/60 dark:border-slate-800/80 flex items-center gap-3 px-4 lg:px-6 shrink-0 sticky top-0 z-30">
                <img src="/kozhanfx.png" alt="" class="lg:hidden w-8 h-8 rounded-lg object-cover" />
                <h2 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate flex-1">
                    {{ route.meta.title ? $t(route.meta.title) : '' }}
                </h2>
                <button
                    type="button"
                    class="btn-icon"
                    :title="$t('settings.title')"
                    :aria-label="$t('settings.title')"
                    @click="settingsOpen = true"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" :d="navIcons.settings" /></svg>
                </button>
            </header>

            <!-- pb-24 keeps content clear of the phone bottom bar -->
            <main class="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 pb-24 lg:pb-6 bg-gray-50 dark:bg-slate-950">
                <router-view />
            </main>
        </div>

        <BottomNav @open-menu="sidebarOpen = true" />
        <SettingsModal v-model="settingsOpen" />
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useKeyboardShortcuts } from '../composables/useKeyboardShortcuts'
import { navIcons } from '../composables/useNavigation'
import SettingsModal from '../components/SettingsModal.vue'
import SidebarContent from '../components/SidebarContent.vue'
import BottomNav from '../components/BottomNav.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const sidebarOpen = ref(false)
const settingsOpen = ref(false)

useKeyboardShortcuts()

// Close the drawer whenever the page changes.
watch(() => route.fullPath, () => { sidebarOpen.value = false })

async function doLogout() {
    await auth.logout()
    router.push({ name: 'login' })
}
</script>
