<template>
    <div v-if="can('manage-accounts')">
        <!-- ═══════ EDIT ═══════ -->
        <Modal :open="!!editAccount" :title="$t('accounts.editTitle')" :z-index="60" @close="$emit('close-edit')">
            <form class="space-y-4" novalidate @submit.prevent="submitEdit">
                <div>
                    <label class="form-label" for="we-name">{{ $t('accounts.name') }} <span class="text-red-500">*</span></label>
                    <input id="we-name" v-model="editForm.name" required class="form-input" />
                    <p v-if="errors.name" class="form-error">{{ errors.name[0] }}</p>
                </div>

                <!-- Agent wallets keep their type and currency -->
                <div v-if="!isAgentWallet" class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="form-label" for="we-type">{{ $t('accounts.type') }}</label>
                        <select id="we-type" v-model="editForm.account_type_id" class="form-input">
                            <option v-for="tp in typeOptions" :key="tp.id" :value="tp.id">{{ typeLabel(tp) }}</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label" for="we-cur">{{ $t('accounts.currency') }}</label>
                        <select id="we-cur" v-model="editForm.currency_id" class="form-input" :disabled="editBalance !== 0">
                            <option v-for="c in currencies" :key="c.id" :value="c.id">{{ c.code }}</option>
                        </select>
                        <p v-if="editBalance !== 0" class="form-hint">{{ $t('accounts.currencyLocked') }}</p>
                        <p v-if="errors.currency_id" class="form-error">{{ errors.currency_id[0] }}</p>
                    </div>
                </div>

                <div v-if="!balanceLocked">
                    <label class="form-label" for="we-balance">{{ $t('accounts.newBalance') }}</label>
                    <MoneyInput id="we-balance" v-model="editForm.new_balance" :max-decimals="4" allow-negative blank-zero class="form-input" />
                    <p class="form-hint">{{ $t('accounts.currentBalance') }}: {{ money(editBalance, editAccount?.currency?.code || '') }}</p>
                    <p v-if="isAgentWallet" class="form-hint text-amber-700">{{ $t('accounts.agentBalanceWarning') }}</p>
                    <p v-if="errors.new_balance" class="form-error">{{ errors.new_balance[0] }}</p>
                </div>
                <p v-else class="form-hint">{{ $t('accounts.balanceLocked') }}</p>

                <LogoPicker v-model="editForm.logo" :name="editForm.name" />
                <Alert v-if="editError" type="error">{{ editError }}</Alert>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" @click="$emit('close-edit')">{{ $t('common.cancel') }}</button>
                    <button type="submit" :disabled="busy" class="btn btn-primary">{{ busy ? $t('common.saving') : $t('common.save') }}</button>
                </div>
            </form>
        </Modal>

        <!-- ═══════ BALANCE CHANGE CONFIRM ═══════ -->
        <Modal :open="showBalanceConfirm" :title="$t('accounts.balanceChangeTitle')" :z-index="70" @close="showBalanceConfirm = false">
            <div class="space-y-4">
                <p class="text-sm text-gray-600">
                    {{ $t('accounts.balanceChangeConfirm', {
                        name: editAccount?.name,
                        old: money(editForm.old_balance, editAccount?.currency?.code || ''),
                        new: money(Number(editForm.new_balance), editAccount?.currency?.code || ''),
                    }) }}
                </p>
                <div class="modal-actions">
                    <button class="btn btn-secondary" @click="showBalanceConfirm = false">{{ $t('common.cancel') }}</button>
                    <button :disabled="busy" class="btn btn-primary" @click="doUpdate">{{ busy ? $t('common.saving') : $t('accounts.confirmChange') }}</button>
                </div>
            </div>
        </Modal>

        <!-- ═══════ MORE: deactivate / delete ═══════ -->
        <Modal :open="!!deleteAccount" :title="deleteAccount?.name || ''" :z-index="60" @close="closeDelete">
            <div class="space-y-5">
                <p class="text-sm text-gray-600">
                    {{ $t('accounts.currentBalance') }}:
                    <span class="font-semibold text-gray-900">{{ money(deleteBalance, deleteAccount?.currency?.code || '') }}</span>
                </p>

                <!-- Deactivate / activate -->
                <div class="rounded-xl border border-gray-200 p-4">
                    <p class="text-sm font-semibold text-gray-900">{{ deleteAccount?.is_active ? $t('accounts.deactivate') : $t('accounts.activate') }}</p>
                    <p class="form-hint mb-3">{{ deleteAccount?.is_active ? $t('accounts.deactivateHint') : $t('accounts.activateHint') }}</p>
                    <button class="btn btn-secondary btn-sm" :disabled="busy || (deleteAccount?.is_active && deleteBalance !== 0)" @click="toggleActive">
                        {{ deleteAccount?.is_active ? $t('accounts.deactivate') : $t('accounts.activate') }}
                    </button>
                </div>

                <!-- Delete -->
                <div class="rounded-xl border border-red-200 p-4">
                    <p class="text-sm font-semibold text-red-700">{{ $t('accounts.delete') }}</p>
                    <p class="form-hint mb-3">{{ $t('accounts.deleteConfirm', { name: deleteAccount?.name }) }}</p>
                    <Alert v-if="isLastAgentWallet" type="warning" class="mb-3">
                        {{ $t('accounts.agentDeleteWarning', { name: deleteAccount?.agent?.name }) }}
                    </Alert>
                    <Alert v-if="deleteBalance !== 0" type="warning" class="mb-3">
                        {{ $t('accounts.deleteNeedsZero', { balance: money(deleteBalance, deleteAccount?.currency?.code || '') }) }}
                    </Alert>
                    <button class="btn btn-danger btn-sm" :disabled="busy || deleteBalance !== 0" @click="doDelete">{{ $t('accounts.delete') }}</button>
                </div>

                <Alert v-if="deleteError" type="error">{{ deleteError }}</Alert>
                <div class="modal-actions">
                    <button class="btn btn-secondary" @click="closeDelete">{{ $t('common.close') }}</button>
                </div>
            </div>
        </Modal>
    </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAccountStore } from '../stores/account'
import { useConfirm } from '../composables/useConfirm'
import { usePermissions } from '../composables/usePermissions'
import { useToast } from '../composables/useToast'
import { apiError } from '../api/client'
import { money } from '../utils/format'
import Modal from './Modal.vue'
import LogoPicker from './LogoPicker.vue'
import MoneyInput from './MoneyInput.vue'
import Alert from './ui/Alert.vue'

const props = defineProps({
    /** Account loaded into the edit modal (null = closed) */
    editAccount: { type: Object, default: null },
    /** Account loaded into the "more" modal (null = closed) */
    deleteAccount: { type: Object, default: null },
    /** Wallet type options for the edit select */
    accountTypes: { type: Array, default: () => [] },
    currencies: { type: Array, default: () => [] },
})

const emit = defineEmits(['close-edit', 'close-delete', 'saved'])

const { t, te } = useI18n()
const accountStore = useAccountStore()
const { can } = usePermissions()
const { confirm } = useConfirm()
const { showToast } = useToast()

const busy = ref(false)
const errors = ref({})
const editError = ref('')
const showBalanceConfirm = ref(false)
const deleteError = ref('')

const editForm = reactive({ name: '', account_type_id: '', currency_id: '', logo: '', new_balance: 0, old_balance: 0 })

const round4 = (n) => Math.round(Number(n) * 10000) / 10000

const editBalance = computed(() => round4(props.editAccount?.current_balance ?? 0))
const deleteBalance = computed(() => round4(props.deleteAccount?.current_balance ?? 0))
const isAgentWallet = computed(() => props.editAccount?.account_type?.code === 'agent_wallet')

/**
 * True when the wallet opened in the "more" modal is the agent's last
 * agent_wallet account, so deleting it will also delete the agent.
 */
const isLastAgentWallet = computed(() => {
    const agentId = props.deleteAccount?.agent?.id
    if (! agentId) return false
    return accountStore.accounts.filter((a) =>
        a.account_type?.code === 'agent_wallet' && a.agent?.id === agentId).length <= 1
})

// System ledger accounts cannot have their balance edited manually.
const balanceLocked = computed(() =>
    ['exchange_pending', 'owner_equity'].includes(props.editAccount?.account_type?.code || ''),
)

const typeLabel = (tp) => (tp?.code && te(`accounts.types.${tp.code}`) ? t(`accounts.types.${tp.code}`) : tp?.name || '')

// Always include the wallet's current type so the select shows it.
const typeOptions = computed(() => {
    const current = props.editAccount?.account_type
    const list = [...props.accountTypes]
    if (current && ! list.some((x) => x.id === current.id)) list.unshift(current)
    return list
})

watch(
    () => props.editAccount,
    (account) => {
        if (! account) return
        editForm.name = account.name
        editForm.account_type_id = account.account_type?.id || account.account_type_id || ''
        editForm.currency_id = account.currency?.id || account.currency_id || ''
        editForm.logo = account.logo_url || ''
        editForm.old_balance = round4(account.current_balance ?? 0)
        editForm.new_balance = editForm.old_balance
        errors.value = {}
        editError.value = ''
    },
)

const balanceChanged = () => round4(editForm.new_balance) !== round4(editForm.old_balance)

async function submitEdit() {
    errors.value = {}
    editError.value = ''
    if (! editForm.name.trim()) {
        errors.value = { name: [t('forms.required')] }
        return
    }
    if (balanceChanged()) {
        showBalanceConfirm.value = true
        return
    }
    await doUpdate()
}

async function doUpdate() {
    if (! props.editAccount) return
    busy.value = true
    try {
        const payload = {
            name: editForm.name,
            logo_url: editForm.logo || null,
            new_balance: balanceChanged() ? round4(editForm.new_balance) : undefined,
        }
        if (! isAgentWallet.value) {
            payload.account_type_id = editForm.account_type_id
            payload.currency_id = editForm.currency_id
        }
        await accountStore.updateAccount(props.editAccount.id, payload)
        showBalanceConfirm.value = false
        showToast({ message: t('accounts.savedToast', { name: editForm.name }) })
        emit('close-edit')
        emit('saved')
    } catch (e) {
        const parsed = apiError(e)
        errors.value = parsed.errors
        editError.value = parsed.message
        showBalanceConfirm.value = false
    } finally {
        busy.value = false
    }
}

function closeDelete() {
    deleteError.value = ''
    emit('close-delete')
}

async function doDelete() {
    if (! props.deleteAccount || deleteBalance.value !== 0) return
    const name = props.deleteAccount.name
    const agentWarning = isLastAgentWallet.value
        ? ' ' + t('accounts.agentDeleteWarning', { name: props.deleteAccount.agent?.name })
        : ''
    const ok = await confirm({
        title: t('accounts.deleteTitle'),
        message: t('accounts.deleteConfirm', { name }) + agentWarning,
        type: 'danger',
        confirmText: t('accounts.delete'),
        cancelText: t('common.cancel'),
    })
    if (! ok) return
    busy.value = true
    deleteError.value = ''
    try {
        await accountStore.deleteAccount(props.deleteAccount.id)
        showToast({ message: t('accounts.deletedToast', { name }) })
        closeDelete()
        emit('saved')
    } catch (e) {
        deleteError.value = apiError(e).message
    } finally {
        busy.value = false
    }
}

async function toggleActive() {
    if (! props.deleteAccount) return
    busy.value = true
    deleteError.value = ''
    try {
        if (props.deleteAccount.is_active) {
            await accountStore.deactivateAccount(props.deleteAccount.id)
        } else {
            await accountStore.activateAccount(props.deleteAccount.id)
        }
        closeDelete()
        emit('saved')
    } catch (e) {
        deleteError.value = apiError(e).message
    } finally {
        busy.value = false
    }
}
</script>
