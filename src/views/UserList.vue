<template>
    <div>
        <PageHeader :text="$t('users.intro')">
            <button class="btn btn-primary" @click="openCreate">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                {{ $t('users.newUser') }}
            </button>
        </PageHeader>

        <Alert v-if="error" type="error" dismissible class="mb-4" @dismiss="error = ''">{{ error }}</Alert>

        <div v-if="loading && !users.length" class="space-y-3">
            <div v-for="i in 3" :key="i" class="h-16 rounded-2xl animate-shimmer" />
        </div>
        <EmptyState v-else-if="!users.length" :title="$t('users.noUsers')" />
        <ul v-else class="card divide-y divide-gray-100">
            <li v-for="user in users" :key="user.id" class="flex items-center gap-3 px-4 py-3" :class="!user.is_active ? 'opacity-60' : ''">
                <div class="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold shrink-0">
                    {{ (user.name || '?').charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0 flex-1">
                    <p class="text-sm font-semibold text-gray-900 truncate">
                        {{ user.name }}
                        <span class="ms-1 px-2 py-0.5 rounded-full text-xs font-medium" :class="user.role === 'owner' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'">
                            {{ $t(`users.roles.${user.role}`) }}
                        </span>
                        <span v-if="!user.is_active" class="ms-1 text-xs font-medium text-red-600">{{ $t('users.deactivated') }}</span>
                    </p>
                    <p class="text-xs text-gray-500 truncate">{{ user.phone || '—' }} · {{ user.username }}</p>
                    <p class="text-xs text-gray-400">{{ $t('users.lastLogin') }}: {{ user.last_login_at ? dateTime(user.last_login_at) : $t('users.never') }}</p>
                </div>
                <div class="flex gap-1 shrink-0">
                    <button class="btn btn-ghost btn-sm" @click="openEdit(user)">{{ $t('common.edit') }}</button>
                    <button v-if="user.is_active && user.id !== auth.user?.id" class="btn btn-ghost btn-sm !text-red-600" @click="deactivate(user)">{{ $t('users.deactivateBtn') }}</button>
                </div>
            </li>
        </ul>

        <Modal :open="showForm" :title="editing ? $t('users.editUserTitle') : $t('users.newUserTitle')" @close="showForm = false">
            <form class="space-y-4" novalidate @submit.prevent="save">
                <div>
                    <label class="form-label" for="u-name">{{ $t('common.name') }} <span class="text-red-500">*</span></label>
                    <input id="u-name" v-model="form.name" class="form-input" />
                    <p v-if="errors.name" class="form-error">{{ errors.name[0] }}</p>
                </div>
                <div>
                    <label class="form-label" for="u-phone">{{ $t('users.phone') }} <span class="text-red-500">*</span></label>
                    <input id="u-phone" v-model="form.phone" type="tel" inputmode="tel" class="form-input" :placeholder="$t('users.phonePlaceholder')" />
                    <p class="form-hint">{{ $t('users.phoneLoginNote') }}</p>
                    <p v-if="errors.phone" class="form-error">{{ errors.phone[0] }}</p>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="form-label" for="u-username">{{ $t('users.username') }} <span class="text-red-500">*</span></label>
                        <input id="u-username" v-model="form.username" autocapitalize="off" autocomplete="off" class="form-input" />
                        <p v-if="errors.username" class="form-error">{{ errors.username[0] }}</p>
                    </div>
                    <div>
                        <label class="form-label" for="u-role">{{ $t('users.role') }}</label>
                        <select id="u-role" v-model="form.role" class="form-input">
                            <option value="office_manager">{{ $t('users.officeManagerOption') }}</option>
                            <option value="owner">{{ $t('users.ownerOption') }}</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="form-label" for="u-pass">
                        {{ $t('auth.password') }} <span v-if="!editing" class="text-red-500">*</span>
                    </label>
                    <input id="u-pass" v-model="form.password" type="password" autocomplete="new-password" class="form-input" />
                    <p class="form-hint">{{ editing ? $t('users.passwordKeepHint') : $t('users.passwordHint') }}</p>
                    <p v-if="errors.password" class="form-error">{{ errors.password[0] }}</p>
                </div>
                <Alert v-if="formError" type="error">{{ formError }}</Alert>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" @click="showForm = false">{{ $t('common.cancel') }}</button>
                    <button type="submit" :disabled="busy" class="btn btn-primary">{{ busy ? $t('common.saving') : $t('common.save') }}</button>
                </div>
            </form>
        </Modal>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api, apiError } from '../api/client'
import { useAuthStore } from '../stores/auth'
import { dateTime } from '../utils/format'
import { useConfirm } from '../composables/useConfirm'
import { useToast } from '../composables/useToast'
import Modal from '../components/Modal.vue'
import Alert from '../components/ui/Alert.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import PageHeader from '../components/ui/PageHeader.vue'

const { t } = useI18n()
const auth = useAuthStore()
const { confirm } = useConfirm()
const { showToast } = useToast()

const users = ref([])
const loading = ref(false)
const error = ref('')
const formError = ref('')
const busy = ref(false)
const errors = ref({})

const showForm = ref(false)
const editing = ref(null)
const blank = () => ({ name: '', username: '', phone: '', password: '', role: 'office_manager' })
const form = ref(blank())

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
    form.value = blank()
    errors.value = {}
    formError.value = ''
    showForm.value = true
}

function openEdit(user) {
    editing.value = user
    form.value = { name: user.name, username: user.username, phone: user.phone || '', password: '', role: user.role }
    errors.value = {}
    formError.value = ''
    showForm.value = true
}

async function save() {
    const req = [t('forms.required')]
    const e = {}
    if (! form.value.name.trim()) e.name = req
    if (! form.value.phone.trim()) e.phone = req
    if (! form.value.username.trim()) e.username = req
    if (! editing.value && form.value.password.length < 6) e.password = [t('users.passwordHint')]
    errors.value = e
    formError.value = ''
    if (Object.keys(e).length) return

    busy.value = true
    try {
        if (editing.value) {
            const payload = { ...form.value }
            if (! payload.password) delete payload.password
            await api.put(`/users/${editing.value.id}`, payload)
        } else {
            await api.post('/users', { ...form.value })
        }
        showToast({ message: t('users.savedToast', { name: form.value.name }) })
        showForm.value = false
        await load()
    } catch (err) {
        const parsed = apiError(err)
        formError.value = parsed.message
        errors.value = parsed.errors
    } finally {
        busy.value = false
    }
}

async function deactivate(user) {
    const ok = await confirm({
        title: t('users.deactivateBtn'),
        message: t('users.deactivateConfirm', { name: user.name }),
        type: 'warning',
        confirmText: t('users.deactivateBtn'),
        cancelText: t('common.cancel'),
    })
    if (! ok) return
    try {
        await api.patch(`/users/${user.id}/deactivate`)
        showToast({ message: t('users.deactivatedToast', { name: user.name }) })
        await load()
    } catch (e) {
        error.value = apiError(e).message
    }
}

onMounted(load)
</script>
