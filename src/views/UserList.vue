<template>
    <div>
        <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
            {{ error }}
        </div>

        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <p class="text-sm text-gray-500">{{ $t('users.intro') }}</p>
            <button
                class="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                @click="openCreate"
            >
                {{ $t('users.newUser') }}
            </button>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-start text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                        <th class="px-4 py-3">{{ $t('common.name') }}</th>
                        <th class="px-4 py-3">{{ $t('users.username') }}</th>
                        <th class="px-4 py-3">{{ $t('users.email') }}</th>
                        <th class="px-4 py-3">{{ $t('users.role') }}</th>
                        <th class="px-4 py-3">{{ $t('common.status') }}</th>
                        <th class="px-4 py-3">{{ $t('users.lastLogin') }}</th>
                        <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-if="loading">
                        <td colspan="7" class="px-4 py-8 text-center text-gray-400">{{ $t('common.loading') }}</td>
                    </tr>
                    <tr v-else-if="!users.length">
                        <td colspan="7" class="px-4 py-8 text-center text-gray-400">{{ $t('users.noUsers') }}</td>
                    </tr>
                    <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
                        <td class="px-4 py-3 font-medium text-gray-900">{{ user.name }}</td>
                        <td class="px-4 py-3 text-gray-600">{{ user.username }}</td>
                        <td class="px-4 py-3 text-gray-600">{{ user.email }}</td>
                        <td class="px-4 py-3">
                            <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                                :class="user.role === 'owner' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'">
                                {{ $t(`users.roles.${user.role}`, user.role) }}
                            </span>
                        </td>
                        <td class="px-4 py-3">
                            <span class="text-xs font-medium" :class="user.is_active ? 'text-emerald-600' : 'text-red-600'">
                                {{ user.is_active ? $t('users.active') : $t('users.deactivated') }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-gray-500 text-xs">{{ dateTime(user.last_login_at) }}</td>
                        <td class="px-4 py-3 text-end whitespace-nowrap">
                            <button class="text-indigo-600 hover:text-indigo-800 text-xs font-medium me-3" @click="openEdit(user)">
                                {{ $t('common.edit') }}
                            </button>
                            <button
                                v-if="user.is_active"
                                class="text-red-600 hover:text-red-800 text-xs font-medium"
                                @click="deactivate(user)"
                            >
                                {{ $t('users.deactivateBtn') }}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <Modal :open="showForm" :title="editing ? $t('users.editUserTitle') : $t('users.newUserTitle')" @close="showForm = false">
            <form class="space-y-4" @submit.prevent="save">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('users.nameRequired') }}</label>
                    <input v-model="form.name" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                    <p v-if="errors.name" class="text-xs text-red-600 mt-1">{{ errors.name[0] }}</p>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('users.usernameRequired') }}</label>
                        <input v-model="form.username" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                        <p v-if="errors.username" class="text-xs text-red-600 mt-1">{{ errors.username[0] }}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('users.roleRequired') }}</label>
                        <select v-model="form.role" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                            <option value="office_manager">{{ $t('users.officeManagerOption') }}</option>
                            <option value="owner">{{ $t('users.ownerOption') }}</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('users.emailRequired') }}</label>
                    <input v-model="form.email" type="email" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                    <p v-if="errors.email" class="text-xs text-red-600 mt-1">{{ errors.email[0] }}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        {{ editing ? $t('users.passwordKeep') : $t('users.passwordRequired') }}
                    </label>
                    <input v-model="form.password" type="password" :required="!editing" autocomplete="new-password"
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                    <p v-if="errors.password" class="text-xs text-red-600 mt-1">{{ errors.password[0] }}</p>
                </div>
                <div class="flex justify-end gap-2 pt-2">
                    <button type="button" class="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50" @click="showForm = false">{{ $t('common.cancel') }}</button>
                    <button type="submit" :disabled="busy" class="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
                        {{ busy ? $t('common.saving') : $t('common.save') }}
                    </button>
                </div>
            </form>
        </Modal>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api, apiError } from '../api/client'
import { dateTime } from '../utils/format'
import Modal from '../components/Modal.vue'

const { t } = useI18n()

const users = ref([])
const loading = ref(false)
const error = ref('')
const busy = ref(false)
const errors = ref({})

const showForm = ref(false)
const editing = ref(null)
const form = ref({ name: '', username: '', email: '', password: '', role: 'office_manager' })

async function load() {
    loading.value = true
    try {
        users.value = (await api.get('/users')).data.data
    } catch (e) {
        error.value = apiError(e).message
    } finally {
        loading.value = false
    }
}

function openCreate() {
    editing.value = null
    form.value = { name: '', username: '', email: '', password: '', role: 'office_manager' }
    errors.value = {}
    showForm.value = true
}

function openEdit(user) {
    editing.value = user
    form.value = { name: user.name, username: user.username, email: user.email, password: '', role: user.role }
    errors.value = {}
    showForm.value = true
}

async function save() {
    busy.value = true
    errors.value = {}
    error.value = ''
    try {
        if (editing.value) {
            const payload = { ...form.value }
            if (! payload.password) delete payload.password
            await api.put(`/users/${editing.value.id}`, payload)
        } else {
            await api.post('/users', { ...form.value })
        }
        showForm.value = false
        await load()
    } catch (e) {
        const parsed = apiError(e)
        error.value = parsed.message
        errors.value = parsed.errors
    } finally {
        busy.value = false
    }
}

async function deactivate(user) {
    if (! confirm(t('users.deactivateConfirm', { name: user.name }))) return
    try {
        await api.patch(`/users/${user.id}/deactivate`)
        await load()
    } catch (e) {
        error.value = apiError(e).message
    }
}

onMounted(() => load())
</script>
