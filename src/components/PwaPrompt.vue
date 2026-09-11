<template>
    <div>
        <!-- Offline Warning Bar -->
        <Transition name="slide-down">
            <div v-if="isOffline" class="fixed top-0 inset-x-0 z-50 bg-amber-500 text-slate-900 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md">
                <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <span>{{ $t('pwa.offline') }}</span>
                </div>
            </div>
        </Transition>

        <!-- Install PWA Floating Banner (if installable and not in standalone) -->
        <Transition name="slide-up">
            <div v-if="isInstallable && !isInstalled && showFloatingBanner" class="fixed bottom-4 end-4 z-50 max-w-sm bg-slate-900/95 text-white rounded-2xl shadow-2xl p-4 border border-slate-700 flex items-start gap-3.5 backdrop-blur-lg">
                <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shrink-0 text-white shadow-md">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                    </svg>
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-bold text-white">{{ $t('pwa.installApp') }}</h4>
                    <p class="text-xs text-slate-300 mt-0.5 leading-relaxed">{{ $t('pwa.installDesc') }}</p>
                    <div class="flex items-center gap-2 mt-3">
                        <button
                            class="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors shadow-sm"
                            @click="promptInstall"
                        >
                            {{ $t('pwa.installBtn') }}
                        </button>
                        <button
                            class="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs transition-colors"
                            @click="showFloatingBanner = false"
                        >
                            {{ $t('pwa.dismiss') }}
                        </button>
                    </div>
                </div>
                <button class="text-slate-400 hover:text-white -me-1 -mt-1 p-1" @click="showFloatingBanner = false">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </Transition>

        <!-- Global PWA Install Guide Modal -->
        <Modal :open="showGuideModal" :title="$t('pwa.installApp')" @close="showGuideModal = false">
            <div class="space-y-4 text-sm text-gray-600">
                <div class="flex items-center gap-3 p-3.5 bg-indigo-50/80 rounded-xl border border-indigo-100">
                    <img src="/pwa-192x192.png" alt="App Icon" class="w-12 h-12 rounded-xl shadow-sm" />
                    <div>
                        <h4 class="font-bold text-gray-900 text-base">Kozhan FX</h4>
                        <p class="text-xs text-indigo-700 font-medium">{{ $t('pwa.installDesc') }}</p>
                    </div>
                </div>

                <div class="space-y-3 text-xs text-gray-700 bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p class="font-bold text-gray-900 text-sm">{{ $t('pwa.guideTitle') }}</p>
                    
                    <!-- Chrome / Edge Step -->
                    <div class="p-3 bg-white rounded-lg border border-gray-100 shadow-2xs space-y-1.5">
                        <p class="font-semibold text-indigo-600 flex items-center gap-1.5">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                            </svg>
                            <span>Google Chrome / Microsoft Edge:</span>
                        </p>
                        <p class="text-gray-600 leading-relaxed">{{ $t('pwa.guideStep1') }}</p>
                    </div>

                    <!-- Safari / iOS Step -->
                    <div class="p-3 bg-white rounded-lg border border-gray-100 shadow-2xs space-y-1.5">
                        <p class="font-semibold text-indigo-600 flex items-center gap-1.5">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                            </svg>
                            <span>iPhone / iPad (Safari):</span>
                        </p>
                        <p class="text-gray-600 leading-relaxed">{{ $t('pwa.guideStep2') }}</p>
                    </div>
                </div>

                <div class="flex justify-end pt-1">
                    <button
                        class="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
                        @click="showGuideModal = false"
                    >
                        {{ $t('common.cancel') }}
                    </button>
                </div>
            </div>
        </Modal>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePwa } from '../composables/usePwa'
import Modal from './Modal.vue'

const { isOffline, isInstallable, isInstalled, showGuideModal, promptInstall } = usePwa()
const showFloatingBanner = ref(true)
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
    transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
    transform: translateY(-100%);
    opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
    transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(100%);
    opacity: 0;
}
</style>
