<template>
    <div>
        <PageHeader :text="$t('audit.intro')" />
        <Alert v-if="error" type="error" dismissible class="mb-4" @dismiss="error = ''">{{ error }}</Alert>

        <div v-if="loading && !logs.length" class="space-y-3">
            <div v-for="i in 4" :key="i" class="h-14 rounded-2xl animate-shimmer" />
        </div>
        <EmptyState v-else-if="!logs.length" :title="$t('audit.noEntries')" />
        <ul v-else class="card divide-y divide-gray-100">
            <li v-for="log in logs" :key="log.id" class="px-4 py-3">
                <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="text-sm text-gray-900">
                            <span class="font-semibold">{{ log.user?.name || '—' }}</span>
                            {{ describe(log) }}
                        </p>
                        <p class="text-xs text-gray-400">{{ dateTime(log.created_at) }}</p>
                    </div>
                    <button
                        v-if="log.new_values && Object.keys(log.new_values).length"
                        type="button"
                        class="btn btn-ghost btn-sm shrink-0"
                        :aria-expanded="openIds.has(log.id)"
                        @click="toggle(log.id)"
                    >{{ openIds.has(log.id) ? $t('common.hide') : $t('common.details') }}</button>
                </div>
                <div v-if="openIds.has(log.id)" class="mt-2 rounded-xl bg-gray-50 p-3 text-xs text-gray-600 space-y-1">
                    <p class="text-gray-400">{{ log.action }} · {{ log.ip_address }}</p>
                    <pre class="overflow-x-auto whitespace-pre-wrap break-all" dir="ltr">{{ JSON.stringify(log.new_values, null, 2) }}</pre>
                </div>
            </li>
        </ul>
        <Pagination :meta="meta" @page="load" />
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api, apiError } from '../api/client'
import { dateTime } from '../utils/format'
import Pagination from '../components/Pagination.vue'
import Alert from '../components/ui/Alert.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import PageHeader from '../components/ui/PageHeader.vue'

const { t, te } = useI18n()

const logs = ref([])
const meta = ref(null)
const loading = ref(false)
const error = ref('')
const openIds = ref(new Set())

function toggle(id) {
    const next = new Set(openIds.value)
    next.has(id) ? next.delete(id) : next.add(id)
    openIds.value = next
}

/**
 * "POST api/remittances/incoming" -> "created an incoming remittance".
 * Falls back to a generic verb + area when no exact phrase exists.
 */
function describe(log) {
    const [method = '', path = ''] = String(log.action || '').split(' ')
    const parts = path.replace(/^api\//, '').split('/').filter((p) => p && ! /^[0-9a-f-]{20,}$/i.test(p))
    const key = `audit.actions.${method.toLowerCase()}_${parts.join('_')}`
    if (te(key)) return t(key)
    const verb = te(`audit.verbs.${method.toLowerCase()}`) ? t(`audit.verbs.${method.toLowerCase()}`) : method
    const area = parts[0] && te(`audit.areas.${parts[0]}`) ? t(`audit.areas.${parts[0]}`) : (parts[0] || log.entity_type || '')
    return `${verb} ${area}`.trim()
}

async function load(page = 1) {
    loading.value = true
    try {
        const res = await api.get('/audit-logs', { params: { page } })
        logs.value = res.data.data.data
        meta.value = res.data.data
    } catch (e) {
        error.value = apiError(e).message
    } finally {
        loading.value = false
    }
}

onMounted(() => load())
</script>
