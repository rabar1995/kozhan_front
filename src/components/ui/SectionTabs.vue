<template>
    <nav class="mb-4 -mx-3 sm:mx-0 px-3 sm:px-0 overflow-x-auto" :aria-label="label">
        <div class="inline-flex min-w-full sm:min-w-0 gap-1 rounded-2xl bg-gray-100 p-1 border border-gray-200/70">
            <router-link
                v-for="tab in visibleTabs"
                :key="tab.to"
                :to="tab.to"
                class="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 min-h-10 px-4 rounded-xl text-sm font-medium whitespace-nowrap transition-colors"
                :class="isActive(tab) ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'"
                :aria-current="isActive(tab) ? 'page' : undefined"
            >
                {{ $t(tab.label) }}
                <span
                    v-if="tab.badge"
                    class="min-w-5 h-5 px-1.5 rounded-full bg-amber-500 text-white text-xs font-bold inline-flex items-center justify-center"
                >{{ tab.badge }}</span>
            </router-link>
        </div>
    </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
    /** [{ to, label, show?: boolean, badge?: number }] */
    tabs: { type: Array, required: true },
    label: { type: String, default: '' },
})

const route = useRoute()

const visibleTabs = computed(() => props.tabs.filter((t) => t.show !== false))

const isActive = (tab) => route.path === tab.to
</script>
