<template>
    <div>
        <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
            {{ error }}
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-start text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                        <th class="px-4 py-3">{{ $t('audit.date') }}</th>
                        <th class="px-4 py-3">{{ $t('audit.action') }}</th>
                        <th class="px-4 py-3">{{ $t('audit.entity') }}</th>
                        <th class="px-4 py-3">{{ $t('audit.user') }}</th>
                        <th class="px-4 py-3">{{ $t('audit.ip') }}</th>
                        <th class="px-4 py-3">{{ $t('audit.payload') }}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-if="loading">
                        <td colspan="6" class="px-4 py-8 text-center text-gray-400">{{ $t('common.loading') }}</td>
                    </tr>
                    <tr v-else-if="!logs.length">
                        <td colspan="6" class="px-4 py-8 text-center text-gray-400">{{ $t('audit.noEntries') }}</td>
                    </tr>
                    <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50 align-top">
                        <td class="px-4 py-3 text-gray-500 whitespace-nowrap">{{ dateTime(log.created_at) }}</td>
                        <td class="px-4 py-3 font-medium text-gray-800">{{ log.action }}</td>
                        <td class="px-4 py-3 text-gray-600">
                            {{ log.entity_type }}<span v-if="log.entity_id" class="text-gray-400 text-xs"> · {{ log.entity_id.slice(0, 8) }}</span>
                        </td>
                        <td class="px-4 py-3">{{ log.user?.name || '-' }}</td>
                        <td class="px-4 py-3 text-gray-500 text-xs">{{ log.ip_address }}</td>
                        <td class="px-4 py-3">
                            <details v-if="log.new_values && Object.keys(log.new_values).length">
                                <summary class="text-xs text-indigo-600 cursor-pointer">{{ $t('common.view') }}</summary>
                                <pre class="text-[10px] bg-gray-50 rounded p-2 mt-1 overflow-x-auto max-w-xs">{{ JSON.stringify(log.new_values, null, 2) }}</pre>
                            </details>
                            <span v-else class="text-gray-300 text-xs">—</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <Pagination :meta="meta" @page="load" />
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { api, apiError } from '../api/client'
import { dateTime } from '../utils/format'
import Pagination from '../components/Pagination.vue'

const logs = ref([])
const meta = ref(null)
const loading = ref(false)
const error = ref('')

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
