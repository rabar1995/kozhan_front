<template>
    <div>
        <!-- ═══════ EDIT MODAL ═══════ -->
        <Modal :open="!!editAccount" :title="$t('accounts.editTitle')" :z-index="60" @close="$emit('close-edit')">
            <form class="space-y-4" @submit.prevent="submitEdit">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('accounts.nameRequired') }}</label>
                    <input v-model="editForm.name" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                    <p v-if="errors.name" class="text-xs text-red-600 mt-1">{{ errors.name[0] }}</p>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('accounts.typeRequired') }}</label>
                        <select v-model="editForm.account_type_id" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                            <option value="" disabled>{{ $t('common.select') }}</option>
                            <option v-for="t in accountTypes" :key="t.id" :value="t.id">{{ t.name }} ({{ t.code }})</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('accounts.currencyRequired') }}</label>
                        <select v-model="editForm.currency_id" required :disabled="editBalance !== 0"
                            :class="editBalance !== 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''"
                            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                            <option value="" disabled>{{ $t('common.select') }}</option>
                            <option v-for="c in currencies" :key="c.id" :value="c.id">{{ c.code }}</option>
                        </select>
                        <p v-if="editBalance !== 0" class="text-xs text-gray-500 mt-1">{{ $t('accounts.currencyLocked') }}</p>
                        <p v-if="errors.currency_id" class="text-xs text-red-600 mt-1">{{ errors.currency_id[0] }}</p>
                    </div>
                </div>
                <div v-if="!balanceLocked">
                    <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('accounts.newBalance') }}</label>
                    <MoneyInput
                        v-model="editForm.new_balance"
                        :max-decimals="4"
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    <p class="text-xs text-gray-500 mt-1">
                        {{ $t('accounts.currentBalance') }}: {{ money(editBalance, editAccount?.currency?.code || '') }}
                    </p>
                    <p v-if="errors.new_balance" class="text-xs text-red-600 mt-1">{{ errors.new_balance[0] }}</p>
                </div>
                <p v-else class="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                    {{ $t('accounts.balanceLocked') }}
                </p>
                <LogoPicker v-model="editForm.logo" :name="editForm.name" :existing-url="editAccount?.logo_url || ''" />
                <p v-if="editError" class="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ editError }}</p>
                <div class="flex justify-end gap-2 pt-2">
                    <button type="button" class="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50" @click="$emit('close-edit')">{{ $t('common.cancel') }}</button>
                    <button type="submit" :disabled="busy" class="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 font-medium">
                        {{ busy ? $t('common.saving') : $t('common.save') }}
                    </button>
                </div>
            </form>
        </Modal>

        <!-- ═══════ BALANCE CHANGE CONFIRM ═══════ -->
        <Modal :open="showBalanceConfirm" :title="$t('accounts.balanceChangeTitle')" :z-index="60" @close="showBalanceConfirm = false">
            <div class="space-y-4">
                <p class="text-sm text-gray-600">
                    {{ $t('accounts.balanceChangeConfirm', {
                        name: editAccount?.name,
                        old: money(editForm.old_balance, editAccount?.currency?.code || ''),
                        new: money(Number(editForm.new_balance), editAccount?.currency?.code || ''),
                    }) }}
                </p>
                <div class="flex justify-end gap-2 pt-2">
                    <button class="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50" @click="showBalanceConfirm = false">{{ $t('common.cancel') }}</button>
                    <button
                        :disabled="busy"
                        class="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 font-medium"
                        @click="doUpdate"
                    >
                        {{ busy ? $t('common.saving') : $t('common.save') }}
                    </button>
                </div>
            </div>
        </Modal>

        <!-- ═══════ DELETE CONFIRM (with force-delete flow) ═══════ -->
        <Modal :open="!!deleteAccount" :title="$t('accounts.deleteTitle')" :z-index="60" @close="closeDelete">
            <div class="space-y-4">
                <p class="text-sm text-gray-600">{{ $t('accounts.deleteConfirm', { name: deleteAccount?.name }) }}</p>
                <p v-if="deleteAccount?.is_active" class="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    {{ $t('accounts.deleteActive') }}
                </p>
                <p v-if="deleteError" class="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {{ deleteError }}
                </p>
                <template v-if="deleteFailed">
                    <p class="text-xs text-red-700 font-semibold">{{ $t('accounts.forceDeleteNote') }}</p>
                    <button
                        :disabled="busy"
                        class="w-full px-4 py-2 text-sm rounded-lg bg-red-700 text-white hover:bg-red-800 disabled:opacity-50 font-semibold"
                        @click="doDelete(true)"
                    >
                        {{ busy ? $t('common.saving') : $t('accounts.forceDelete') }}
                    </button>
                </template>
                <div class="flex items-center justify-between gap-2 pt-2">
                    <button
                        class="px-3 py-2 text-xs font-semibold rounded-lg text-amber-700 hover:bg-amber-50 border border-amber-200"
                        @click="toggleActive"
                    >
                        {{ deleteAccount?.is_active ? $t('accounts.deactivate') : $t('accounts.activate') }}
                    </button>
                    <div class="flex gap-2">
                        <button class="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50" @click="closeDelete">{{ $t('common.cancel') }}</button>
                        <button
                            v-if="!deleteFailed"
                            :disabled="busy"
                            class="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 font-medium"
                            @click="doDelete(false)"
                        >
                            {{ $t('accounts.delete') }}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useAccountStore } from '../stores/account'
import { apiError } from '../api/client'
import { money } from '../utils/format'
import Modal from './Modal.vue'
import LogoPicker from './LogoPicker.vue'
import MoneyInput from './MoneyInput.vue'

const props = defineProps({
    /** Account loaded into the edit modal (null = closed) */
    editAccount: { type: Object, default: null },
    /** Account loaded into the delete confirm modal (null = closed) */
    deleteAccount: { type: Object, default: null },
    /** Wallet type options for the edit select */
    accountTypes: { type: Array, default: () => [] },
    currencies: { type: Array, default: () => [] },
})

const emit = defineEmits(['close-edit', 'close-delete', 'saved'])

const accountStore = useAccountStore()

const busy = ref(false)
const errors = ref({})
const editError = ref('')
const showBalanceConfirm = ref(false)
const deleteError = ref('')
const deleteFailed = ref(false)

const editForm = reactive({ name: '', account_type_id: '', currency_id: '', logo: '', new_balance: 0, old_balance: 0 })

const editBalance = computed(() => Number(props.editAccount?.current_balance ?? 0))

// Ledger-managed balances (agent wallets, system types) cannot be edited.
const balanceLocked = computed(() =>
    ['agent_wallet', 'exchange_pending', 'owner_equity'].includes(props.editAccount?.account_type?.code || ''),
)

watch(
    () => props.editAccount,
    (account) => {
        if (! account) return
        editForm.name = account.name
        editForm.account_type_id = account.account_type?.id || account.account_type_id || ''
        editForm.currency_id = account.currency?.id || account.currency_id || ''
        editForm.logo = ''
        editForm.old_balance = Number(account.current_balance ?? 0)
        editForm.new_balance = editForm.old_balance
        errors.value = {}
        editError.value = ''
    },
)

const round4 = (n) => Math.round(Number(n) * 10000) / 10000

async function submitEdit() {
    // Balance changes need explicit confirmation; everything else saves directly.
    errors.value = {}
    editError.value = ''
    const balanceChanged = round4(editForm.new_balance) !== round4(editForm.old_balance)
    if (balanceChanged) {
        showBalanceConfirm.value = true
        return
    }
    busy.value = true
    try {
        await applyUpdate()
        emit('close-edit')
        emit('saved')
    } catch (e) {
        const parsed = apiError(e)
        errors.value = parsed.errors
        editError.value = parsed.message
    } finally {
        busy.value = false
    }
}

async function applyUpdate() {
    if (! props.editAccount) return
    const balanceChanged = round4(editForm.new_balance) !== round4(editForm.old_balance)
    await accountStore.updateAccount(props.editAccount.id, {
        name: editForm.name,
        account_type_id: editForm.account_type_id,
        currency_id: editForm.currency_id,
        logo_url: editForm.logo ? editForm.logo : undefined,
        new_balance: balanceChanged ? round4(editForm.new_balance) : undefined,
    })
}

async function doUpdate() {
    busy.value = true
    errors.value = {}
    editError.value = ''
    try {
        await applyUpdate()
        showBalanceConfirm.value = false
        emit('close-edit')
        emit('saved')
    } catch (e) {
        const parsed = apiError(e)
        errors.value = parsed.errors
        showBalanceConfirm.value = false
        editError.value = parsed.message
    } finally {
        busy.value = false
    }
}

function closeDelete() {
    deleteError.value = ''
    deleteFailed.value = false
    emit('close-delete')
}

async function doDelete(force = false) {
    if (! props.deleteAccount) return
    busy.value = true
    deleteError.value = ''
    try {
        await accountStore.deleteAccount(props.deleteAccount.id, force)
        closeDelete()
        emit('saved')
    } catch (e) {
        deleteError.value = apiError(e).message
        deleteFailed.value = true
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
