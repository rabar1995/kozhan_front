<template>
    <Modal
        :open="modelValue"
        :title="$t('settings.title')"
        max-width="sm:max-w-2xl"
        @close="$emit('update:modelValue', false)"
    >
        <div class="space-y-6 pb-2">
            <!-- Header Description -->
            <p class="text-xs sm:text-sm text-gray-500 dark:text-slate-400 leading-relaxed -mt-1">
                {{ $t('settings.description') }}
            </p>

            <!-- ═══════ SECTION 1: APPEARANCE & THEME ═══════ -->
            <div>
                <div class="flex items-center gap-2 mb-1.5">
                    <div class="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l9.402 9.402" />
                        </svg>
                    </div>
                    <div>
                        <h4 class="text-sm font-bold text-gray-900 dark:text-white">{{ $t('settings.appearance') }}</h4>
                        <p class="text-[11px] text-gray-500 dark:text-slate-400">{{ $t('settings.appearanceDesc') }}</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                    <!-- Light Mode Option -->
                    <button
                        type="button"
                        class="relative p-3.5 rounded-xl border text-start transition-all duration-200 group flex flex-col justify-between"
                        :class="themeMode === 'light'
                            ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                            : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50/50 dark:hover:bg-slate-700/40'"
                        @click="setTheme('light')"
                    >
                        <div class="flex items-center justify-between w-full mb-2">
                            <div class="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                                </svg>
                            </div>
                            <span
                                v-if="themeMode === 'light'"
                                class="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]"
                            >✓</span>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-gray-900 dark:text-white">{{ $t('settings.light') }}</p>
                            <p class="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">{{ $t('settings.lightDesc') }}</p>
                        </div>
                    </button>

                    <!-- Night / Dark Mode Option -->
                    <button
                        type="button"
                        class="relative p-3.5 rounded-xl border text-start transition-all duration-200 group flex flex-col justify-between"
                        :class="themeMode === 'dark'
                            ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                            : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50/50 dark:hover:bg-slate-700/40'"
                        @click="setTheme('dark')"
                    >
                        <div class="flex items-center justify-between w-full mb-2">
                            <div class="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                                </svg>
                            </div>
                            <span
                                v-if="themeMode === 'dark'"
                                class="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]"
                            >✓</span>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-gray-900 dark:text-white">{{ $t('settings.dark') }}</p>
                            <p class="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">{{ $t('settings.darkDesc') }}</p>
                        </div>
                    </button>

                    <!-- System Mode Option -->
                    <button
                        type="button"
                        class="relative p-3.5 rounded-xl border text-start transition-all duration-200 group flex flex-col justify-between"
                        :class="themeMode === 'system'
                            ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                            : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50/50 dark:hover:bg-slate-700/40'"
                        @click="setTheme('system')"
                    >
                        <div class="flex items-center justify-between w-full mb-2">
                            <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
                                </svg>
                            </div>
                            <span
                                v-if="themeMode === 'system'"
                                class="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]"
                            >✓</span>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-gray-900 dark:text-white">{{ $t('settings.system') }}</p>
                            <p class="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">{{ $t('settings.systemDesc') }}</p>
                        </div>
                    </button>
                </div>
            </div>

            <div class="border-t border-gray-100 dark:border-slate-800" />

            <!-- ═══════ SECTION 2: LANGUAGE & REGION ═══════ -->
            <div>
                <div class="flex items-center gap-2 mb-1.5">
                    <div class="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18Zm0 0c2.5-2.5 3.5-5.5 3.5-9S14.5 5.5 12 3m0 18c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3M3.5 9h17m-17 6h17" />
                        </svg>
                    </div>
                    <div>
                        <h4 class="text-sm font-bold text-gray-900 dark:text-white">{{ $t('settings.language') }}</h4>
                        <p class="text-[11px] text-gray-500 dark:text-slate-400">{{ $t('settings.languageDesc') }}</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <button
                        v-for="l in locales"
                        :key="l.code"
                        type="button"
                        class="p-3.5 rounded-xl border text-start transition-all duration-200 flex items-center justify-between group"
                        :class="currentLocale === l.code
                            ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                            : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50/50 dark:hover:bg-slate-700/40'"
                        @click="changeLocale(l.code)"
                    >
                        <div class="flex items-center gap-3">
                            <span class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-700 font-bold text-xs flex items-center justify-center text-gray-700 dark:text-slate-300">
                                {{ l.code.toUpperCase() }}
                            </span>
                            <div>
                                <p class="text-xs font-bold text-gray-900 dark:text-white">{{ l.label }}</p>
                                <p class="text-[11px] text-gray-500 dark:text-slate-400">
                                    {{ l.dir === 'rtl' ? 'Right-to-Left (RTL)' : 'Left-to-Right (LTR)' }}
                                </p>
                            </div>
                        </div>

                        <span
                            v-if="currentLocale === l.code"
                            class="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]"
                        >✓</span>
                    </button>
                </div>
            </div>

            <div class="border-t border-gray-100 dark:border-slate-800" />

            <!-- ═══════ SECTION 3: DESKTOP & MOBILE APPLICATION ═══════ -->
            <div>
                <div class="flex items-center gap-2 mb-1.5">
                    <div class="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                        </svg>
                    </div>
                    <div>
                        <h4 class="text-sm font-bold text-gray-900 dark:text-white">{{ $t('settings.application') }}</h4>
                        <p class="text-[11px] text-gray-500 dark:text-slate-400">{{ $t('settings.applicationDesc') }}</p>
                    </div>
                </div>

                <div class="p-4 rounded-xl border border-gray-200 dark:border-slate-700/80 bg-gray-50/70 dark:bg-slate-900/60 mt-3 space-y-3">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div class="flex items-center gap-3">
                            <img
                                src="/kozhanfx.png"
                                alt="Kozhan Co"
                                class="w-11 h-11 rounded-xl shadow-xs object-cover ring-1 ring-black/10 dark:ring-white/10"
                            />
                            <div>
                                <div class="flex items-center gap-2">
                                    <h5 class="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">Kozhan Co PRO</h5>
                                    <span
                                        v-if="isInstalled"
                                        class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                    >
                                        ✓ {{ $t('settings.installedBadge') }}
                                    </span>
                                </div>
                                <p class="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                                    {{ isInstalled ? $t('settings.installedDesc') : $t('settings.notInstalledDesc') }}
                                </p>
                            </div>
                        </div>

                        <!-- Install Action Button -->
                        <button
                            v-if="!isInstalled"
                            type="button"
                            class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0 active:scale-95"
                            @click="handleInstall"
                        >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            {{ $t('settings.installNow') }}
                        </button>
                    </div>

                    <!-- Offline Support & Connection Status Pill -->
                    <div class="pt-2 border-t border-gray-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-gray-500 dark:text-slate-400">
                        <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full" :class="isOffline ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'" />
                            <span>{{ isOffline ? $t('pwa.offline') : $t('settings.offlineReady') }}</span>
                        </div>
                        <span class="font-mono text-[10px] text-gray-400">PWA v1.3</span>
                    </div>
                </div>
            </div>

            <!-- ═══════ FOOTER ═══════ -->
            <div class="pt-2 flex items-center justify-between">
                <div class="flex items-center gap-2 text-xs text-gray-400 truncate">
                    <span class="truncate">{{ auth.userName }}</span>
                    <span>•</span>
                    <span class="font-medium text-gray-500 dark:text-slate-400">{{ auth.officeName || 'Kozhan Co' }}</span>
                </div>
                <button
                    type="button"
                    class="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                    @click="$emit('update:modelValue', false)"
                >
                    {{ $t('settings.done') }}
                </button>
            </div>
        </div>
    </Modal>
</template>

<script setup>
import { computed } from 'vue'
import Modal from './Modal.vue'
import { useTheme } from '../composables/useTheme'
import { usePwa } from '../composables/usePwa'
import { i18n, locales, setLocale } from '../i18n'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast'

defineProps({
    modelValue: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

const auth = useAuthStore()
const toast = useToast()
const { themeMode, setTheme } = useTheme()
const { isInstalled, isOffline, promptInstall } = usePwa()

const currentLocale = computed(() => i18n.global.locale.value)

function changeLocale(code) {
    setLocale(code)
}

async function handleInstall() {
    const outcome = await promptInstall()
    if (outcome === 'accepted') {
        toast.success('App installed successfully!')
    }
}
</script>
