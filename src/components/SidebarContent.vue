<template>
    <div class="flex flex-col h-full select-none">
        <!-- Brand -->
        <div class="px-5 py-4 border-b border-white/[0.08] shrink-0 flex items-center gap-3">
            <img src="/kozhanfx.png" alt="" class="w-10 h-10 rounded-xl ring-1 ring-white/10 shrink-0 object-cover" />
            <div class="min-w-0">
                <h1 class="text-base font-bold tracking-tight text-white">Kozhan Co</h1>
                <p class="text-xs text-slate-400 truncate">{{ auth.officeName || $t('nav.brandTag') }}</p>
            </div>
        </div>

        <nav class="flex-1 overflow-y-auto sidebar-scroll px-3 py-4 space-y-1" :aria-label="$t('nav.menu')">
            <RouterLink
                v-for="item in mainItems"
                :key="item.to"
                :to="item.to"
                class="flex items-center gap-3 min-h-11 px-3 rounded-xl text-sm font-medium transition-colors"
                :class="isActive(item) ? 'bg-indigo-500/20 text-white' : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'"
                :aria-current="isActive(item) ? 'page' : undefined"
                @click="emit('navigate')"
            >
                <svg class="w-5 h-5 shrink-0" :class="isActive(item) ? 'text-indigo-300' : 'text-slate-400'" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" :d="navIcons[item.icon]" />
                </svg>
                <span class="truncate">{{ $t(item.label) }}</span>
            </RouterLink>

            <template v-if="moreItems.length">
                <p class="px-3 pt-5 pb-1 text-xs font-semibold text-slate-500">{{ $t('nav.more') }}</p>
                <RouterLink
                    v-for="item in moreItems"
                    :key="item.to"
                    :to="item.to"
                    class="flex items-center gap-3 min-h-11 px-3 rounded-xl text-sm font-medium transition-colors"
                    :class="isActive(item) ? 'bg-indigo-500/20 text-white' : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'"
                    :aria-current="isActive(item) ? 'page' : undefined"
                    @click="emit('navigate')"
                >
                    <svg class="w-5 h-5 shrink-0" :class="isActive(item) ? 'text-indigo-300' : 'text-slate-500'" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" :d="navIcons[item.icon]" />
                    </svg>
                    <span class="truncate">{{ $t(item.label) }}</span>
                </RouterLink>
            </template>
        </nav>

        <!-- Account: the only place for settings + sign out -->
        <div class="px-3 py-3 border-t border-white/[0.08] shrink-0 space-y-1">
            <div class="flex items-center gap-3 px-3 py-2">
                <div class="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold shrink-0">
                    {{ (auth.userName || '?').charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0">
                    <p class="text-sm font-semibold text-slate-200 truncate">{{ auth.userName }}</p>
                    <p class="text-xs text-slate-400 truncate">{{ auth.isOwner ? $t('nav.owner') : $t('nav.manager') }}</p>
                </div>
            </div>
            <button
                type="button"
                class="w-full flex items-center gap-3 min-h-11 px-3 rounded-xl text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                @click="emit('open-settings')"
            >
                <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" :d="navIcons.settings" /></svg>
                {{ $t('settings.title') }}
            </button>
            <button
                type="button"
                class="w-full flex items-center gap-3 min-h-11 px-3 rounded-xl text-sm text-slate-300 hover:bg-rose-500/10 hover:text-rose-200 transition-colors"
                @click="emit('logout')"
            >
                <svg class="w-5 h-5 text-slate-400 rtl:-scale-x-100" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" :d="navIcons.logout" /></svg>
                {{ $t('nav.logout') }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { navIcons, useNavigation } from '../composables/useNavigation'

const emit = defineEmits(['navigate', 'logout', 'open-settings'])

const auth = useAuthStore()
const { mainItems, moreItems, isActive } = useNavigation()
</script>
