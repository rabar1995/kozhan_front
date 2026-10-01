<template>
    <div>
        <SectionTabs :tabs="tabs" :label="$t('nav.remittances')" />

        <PageHeader :text="$t('remittances.urgentQueue')">
            <button class="btn btn-secondary btn-sm" :disabled="store.loading" @click="load(1)">
                <svg class="w-4 h-4" :class="store.loading ? 'animate-spin' : ''" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                {{ $t('dashboard.refresh') }}
            </button>
        </PageHeader>

        <RemittanceTable :rows="store.items" :loading="store.loading" :empty-text="$t('dashboard.noPending')" @refresh="load(1)" />
        <Pagination :meta="store.meta" @page="load" />
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRemittanceStore } from '../stores/remittance'
import { useRemittanceTabs } from '../composables/useSectionTabs'
import RemittanceTable from '../components/RemittanceTable.vue'
import Pagination from '../components/Pagination.vue'
import SectionTabs from '../components/ui/SectionTabs.vue'
import PageHeader from '../components/ui/PageHeader.vue'

const store = useRemittanceStore()
const tabs = useRemittanceTabs()

async function load(page = 1) {
    await store.fetchPending({ page }).catch(() => {})
}

onMounted(() => load())
</script>
