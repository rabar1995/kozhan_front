<template>
    <!-- Phone / tablet tab bar. Hidden on desktop where the sidebar is visible. -->
    <nav
        class="lg:hidden fixed inset-x-0 bottom-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-gray-200 dark:border-slate-800"
        style="padding-bottom: env(safe-area-inset-bottom)"
        :aria-label="$t('nav.menu')"
    >
        <div class="grid grid-cols-5 h-16">
            <RouterLink
                v-for="item in leftItems"
                :key="item.to"
                :to="item.to"
                class="flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium"
                :class="isActive(item) ? 'text-indigo-600' : 'text-gray-500'"
                :aria-current="isActive(item) ? 'page' : undefined"
            >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" :d="navIcons[item.icon]" /></svg>
                <span class="truncate max-w-full px-1">{{ $t(item.label) }}</span>
            </RouterLink>

            <!-- Big "new" button -->
            <div class="flex items-center justify-center">
                <button
                    v-if="newActions.length"
                    type="button"
                    class="w-14 h-14 -mt-6 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center active:scale-95"
                    :aria-label="$t('nav.new')"
                    :aria-expanded="sheetOpen"
                    @click="sheetOpen = true"
                >
                    <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" :d="navIcons.plus" /></svg>
                </button>
            </div>

            <RouterLink
                v-if="rightItem"
                :to="rightItem.to"
                class="flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium"
                :class="isActive(rightItem) ? 'text-indigo-600' : 'text-gray-500'"
            >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" :d="navIcons[rightItem.icon]" /></svg>
                <span class="truncate max-w-full px-1">{{ $t(rightItem.label) }}</span>
            </RouterLink>
            <span v-else />

            <button
                type="button"
                class="flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-gray-500"
                @click="$emit('open-menu')"
            >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" :d="navIcons.menu" /></svg>
                <span>{{ $t('nav.menu') }}</span>
            </button>
        </div>
    </nav>

    <!-- "New" action sheet -->
    <Modal :open="sheetOpen" :title="$t('nav.new')" @close="sheetOpen = false">
        <div class="grid gap-2 pb-2">
            <RouterLink
                v-for="a in newActions"
                :key="a.to"
                :to="a.to"
                class="flex items-center gap-3 min-h-14 px-4 rounded-xl border border-gray-200 hover:bg-gray-50"
                @click="sheetOpen = false"
            >
                <span class="w-10 h-10 rounded-xl flex items-center justify-center" :class="a.tone">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" :d="navIcons[a.icon]" /></svg>
                </span>
                <span class="text-sm font-semibold text-gray-900">{{ $t(a.label) }}</span>
            </RouterLink>
        </div>
    </Modal>
</template>

<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { navIcons, useNavigation } from '../composables/useNavigation'
import { usePermissions } from '../composables/usePermissions'
import Modal from './Modal.vue'

defineEmits(['open-menu'])

const { mainItems, isActive } = useNavigation()
const { can } = usePermissions()

const sheetOpen = ref(false)

// Home, Remittances | (+) | Agents, Menu
const leftItems = computed(() => mainItems.value.slice(0, 2))
const rightItem = computed(() => mainItems.value.find((i) => i.to === '/agents'))

const newActions = computed(() => [
    ...(can('create-remittance')
        ? [
            { to: '/remittances/incoming', label: 'nav.bookIncoming', icon: 'incoming', tone: 'bg-emerald-50 text-emerald-600' },
            { to: '/remittances/outgoing', label: 'nav.bookOutgoing', icon: 'outgoing', tone: 'bg-indigo-50 text-indigo-600' },
        ]
        : []),
    ...(can('record-expense')
        ? [{ to: '/expenses/new', label: 'nav.registerExpense', icon: 'expenses', tone: 'bg-amber-50 text-amber-600' }]
        : []),
])
</script>
