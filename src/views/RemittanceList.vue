<template>
    <div>
        <SectionTabs :tabs="tabs" :label="$t('nav.remittances')" />

        <!-- Filters apply as soon as they change -->
        <div class="card card-pad mb-4">
            <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                    <label class="form-label" for="f-direction">{{ $t('filters.direction') }}</label>
                    <select id="f-direction" v-model="filters.direction" class="form-input">
                        <option value="">{{ $t('common.all') }}</option>
                        <option value="incoming">{{ $t('filters.incoming') }}</option>
                        <option value="outgoing">{{ $t('filters.outgoing') }}</option>
                    </select>
                </div>
                <div>
                    <label class="form-label" for="f-status">{{ $t('filters.status') }}</label>
                    <select id="f-status" v-model="filters.status" class="form-input">
                        <option value="">{{ $t('common.all') }}</option>
                        <option value="pending">{{ $t('filters.pending') }}</option>
                        <option value="completed">{{ $t('filters.completed') }}</option>
                        <option value="cancelled">{{ $t('filters.cancelled') }}</option>
                    </select>
                </div>
                <div class="col-span-2 lg:col-span-1">
                    <label class="form-label" for="f-agent">{{ $t('filters.agent') }}</label>
                    <select id="f-agent" v-model="filters.agent_id" class="form-input">
                        <option value="">{{ $t('filters.allAgents') }}</option>
                        <option v-for="agent in agentStore.agents" :key="agent.id" :value="agent.id">{{ agent.name }}</option>
                    </select>
                </div>
                <div>
                    <label class="form-label" for="f-from">{{ $t('filters.from') }}</label>
                    <input id="f-from" v-model="filters.date_from" type="date" class="form-input" />
                </div>
                <div>
                    <label class="form-label" for="f-to">{{ $t('filters.to') }}</label>
                    <input id="f-to" v-model="filters.date_to" type="date" class="form-input" />
                </div>
            </div>
            <div v-if="hasFilters" class="mt-3 flex justify-end">
                <button type="button" class="btn btn-ghost btn-sm" @click="resetFilters">{{ $t('filters.reset') }}</button>
            </div>
        </div>

        <RemittanceTable
            :rows="store.items"
            :loading="store.loading"
            :empty-text="hasFilters ? $t('remittances.noRowsFiltered') : ''"
            @refresh="load(page)"
        >
            <template #empty-actions>
                <button v-if="hasFilters" class="btn btn-secondary" @click="resetFilters">{{ $t('filters.reset') }}</button>
                <router-link v-else-if="can('create-remittance')" to="/remittances/incoming" class="btn btn-primary">{{ $t('tabs.newIncoming') }}</router-link>
            </template>
        </RemittanceTable>
        <Pagination :meta="store.meta" @page="load" />
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRemittanceStore } from '../stores/remittance'
import { useAgentStore } from '../stores/agent'
import { usePermissions } from '../composables/usePermissions'
import { useRemittanceTabs } from '../composables/useSectionTabs'
import RemittanceTable from '../components/RemittanceTable.vue'
import Pagination from '../components/Pagination.vue'
import SectionTabs from '../components/ui/SectionTabs.vue'

const store = useRemittanceStore()
const agentStore = useAgentStore()
const { can } = usePermissions()
const tabs = useRemittanceTabs()

const FILTER_KEYS = ['direction', 'status', 'agent_id', 'date_from', 'date_to']
const filters = reactive({ direction: '', status: '', agent_id: '', date_from: '', date_to: '' })
const page = ref(1)

const hasFilters = computed(() => FILTER_KEYS.some((k) => filters[k]))

async function load(p = 1) {
    page.value = p
    const params = { page: p }
    for (const key of FILTER_KEYS) {
        if (filters[key]) params[key] = filters[key]
    }
    await store.fetch(params).catch(() => {})
}

function resetFilters() {
    for (const key of FILTER_KEYS) filters[key] = ''
}

watch(filters, () => load(1))

onMounted(() => {
    load()
    agentStore.fetchAgents().catch(() => {})
})
</script>
