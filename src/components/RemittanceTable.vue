<template>
    <div class="space-y-4">
        <!-- Error & Success Alerts -->
        <div v-if="error" class="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
            <span>{{ error }}</span>
            <button class="text-red-500 hover:text-red-700 font-bold ml-2" @click="error = ''">✕</button>
        </div>
        <div v-if="success" class="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 flex items-center justify-between">
            <span class="flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {{ success }}
            </span>
            <button class="text-emerald-500 hover:text-emerald-700 font-bold ml-2" @click="success = ''">✕</button>
        </div>

        <!-- ═══════ VIEW CONTROLS & COUNTER ═══════ -->
        <div class="flex items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-xs">
            <div class="flex items-center gap-2">
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {{ $t('remittances.detailsFallback') }}
                </span>
                <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {{ rows.length }}
                </span>
            </div>

            <!-- View Mode Switcher -->
            <div class="flex items-center rounded-xl bg-gray-100 p-0.5 border border-gray-200/80 shrink-0">
                <button
                    type="button"
                    class="p-1.5 rounded-lg text-xs font-medium transition-all"
                    :class="viewMode === 'cards' ? 'bg-white text-indigo-600 shadow-xs' : 'text-gray-500 hover:text-gray-800'"
                    :title="$t('common.cards')"
                    @click="viewMode = 'cards'"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                    </svg>
                </button>
                <button
                    type="button"
                    class="p-1.5 rounded-lg text-xs font-medium transition-all"
                    :class="viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-gray-500 hover:text-gray-800'"
                    :title="$t('common.table')"
                    @click="viewMode = 'table'"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 011.875 1.875v13.5a1.875 1.875 0 01-1.875 1.875H5.625A1.875 1.875 0 013.75 19.875V6.375A1.875 1.875 0 015.625 4.5z" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- ═══════ SKELETON LOADING ═══════ -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div v-for="n in 6" :key="n" class="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-3">
                <div class="flex items-center justify-between">
                    <div class="h-5 animate-shimmer rounded w-1/3"></div>
                    <div class="h-5 animate-shimmer rounded w-1/4"></div>
                </div>
                <div class="h-16 animate-shimmer rounded-xl"></div>
                <div class="h-14 animate-shimmer rounded-xl"></div>
            </div>
        </div>

        <!-- ═══════ EMPTY STATE ═══════ -->
        <div
            v-else-if="!rows.length"
            class="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center shadow-xs"
        >
            <div class="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-400 mx-auto flex items-center justify-center mb-3">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
            </div>
            <h3 class="text-sm font-semibold text-gray-800">{{ $t('remittances.noRows') }}</h3>
            <p class="text-xs text-gray-400 mt-1 max-w-xs mx-auto">{{ $t('filters.all') }}</p>
        </div>

        <!-- ═══════ CARD GRID VIEW (Default) ═══════ -->
        <div
            v-else-if="viewMode === 'cards'"
            class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
            <div
                v-for="row in rows"
                :key="row.id"
                class="bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all duration-200 p-5 flex flex-col justify-between group relative overflow-hidden"
            >
                <!-- Top Header: Remittance #, Direction Pill, Status Badge -->
                <div>
                    <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-2 min-w-0">
                            <!-- Remittance Number Pill -->
                            <span class="font-mono text-xs font-bold text-gray-900 bg-gray-100/80 px-2.5 py-1 rounded-lg border border-gray-200 tracking-tight shrink-0">
                                {{ row.remittance_number }}
                            </span>

                            <!-- Direction Indicator -->
                            <span
                                class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md"
                                :class="row.direction === 'incoming'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                    : 'bg-purple-50 text-purple-700 border border-purple-200/60'"
                            >
                                <svg v-if="row.direction === 'incoming'" class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                                </svg>
                                <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                                </svg>
                                {{ $t(`status.${row.direction}`, row.direction) }}
                            </span>
                        </div>

                        <!-- Status Badge -->
                        <StatusBadge :value="row.status" />

                    </div>

                    <!-- Agent & Created Date -->
                    <div class="mt-2.5 flex items-center justify-between text-xs text-gray-500">
                        <div class="flex items-center gap-1.5 truncate">
                            <span class="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
                            <span class="font-medium text-gray-700 truncate">{{ row.agent?.name || '-' }}</span>
                        </div>
                        <span class="text-[11px] text-gray-400 shrink-0">{{ dateTime(row.created_at) }}</span>
                    </div>

                    <!-- Parties Route Box (Sender -> Receiver) -->
                    <div class="mt-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs space-y-1.5">
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-gray-400 font-medium shrink-0">{{ $t('forms.senderName') }}:</span>
                            <span class="font-semibold text-gray-900 truncate">{{ row.sender_name }}</span>
                        </div>
                        <div class="flex items-center justify-center text-gray-300">
                            <svg class="w-3.5 h-3.5 text-indigo-400 rotate-90 sm:rotate-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </div>
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-gray-400 font-medium shrink-0">{{ $t('forms.receiverName') }}:</span>
                            <span class="font-semibold text-gray-900 truncate">{{ row.receiver_name }}</span>
                        </div>
                    </div>

                    <!-- Amounts Hero Box -->
                    <div class="mt-3 p-3 rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-gray-100">
                        <div class="grid grid-cols-2 gap-2 text-center">
                            <!-- Send Amount -->
                            <div class="border-e border-gray-200/60 pe-2">
                                <p class="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">
                                    {{ $t('remittances.send') }}
                                </p>
                                <p class="text-xs sm:text-sm font-black text-gray-800 truncate">
                                    {{ money(row.send_amount, row.send_currency?.code) }}
                                </p>
                            </div>
                            <!-- Receive Amount -->
                            <div class="ps-2">
                                <p class="text-[10px] uppercase font-bold text-indigo-500 tracking-wider mb-0.5">
                                    {{ $t('remittances.receive') }}
                                </p>
                                <p class="text-xs sm:text-sm font-black text-indigo-700 truncate">
                                    {{ money(row.receive_amount, row.receive_currency?.code) }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Actions Bottom Bar -->
                <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                        class="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                        @click="openDetails(row)"
                    >
                        <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{{ $t('common.details') }}</span>
                    </button>

                    <div class="flex items-center gap-1.5">
                        <button
                            v-if="row.status === 'pending' && can('complete-remittance')"
                            class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                            @click="openComplete(row)"
                        >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            <span>{{ $t('remittances.complete') }}</span>
                        </button>
                        <button
                            v-if="row.status === 'pending' && can('cancel-remittance')"
                            class="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors"
                            @click="openCancel(row)"
                        >
                            {{ $t('remittances.cancelAction') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ═══════ TABLE VIEW (Alternative) ═══════ -->
        <div
            v-else
            class="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-x-auto"
        >
            <table class="min-w-full text-sm table-enhanced">
                <thead class="bg-gray-50 text-start text-xs uppercase tracking-wide text-gray-500 border-b border-gray-100">
                    <tr>
                        <th class="px-4 py-3">{{ $t('remittances.number') }}</th>
                        <th class="px-4 py-3">{{ $t('remittances.direction') }}</th>
                        <th class="px-4 py-3">{{ $t('remittances.agent') }}</th>
                        <th class="px-4 py-3">{{ $t('remittances.senderReceiver') }}</th>
                        <th class="px-4 py-3 text-end">{{ $t('remittances.send') }}</th>
                        <th class="px-4 py-3 text-end">{{ $t('remittances.receive') }}</th>
                        <th class="px-4 py-3">{{ $t('common.status') }}</th>
                        <th class="px-4 py-3">{{ $t('remittances.created') }}</th>
                        <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="row in rows" :key="row.id" class="hover:bg-gray-50/80 transition-colors">
                        <td class="px-4 py-3 font-mono font-bold text-gray-900">{{ row.remittance_number }}</td>
                        <td class="px-4 py-3">
                            <StatusBadge :value="row.direction" />
                        </td>
                        <td class="px-4 py-3 text-gray-700 font-medium">{{ row.agent?.name || '-' }}</td>
                        <td class="px-4 py-3 text-gray-600">
                            {{ row.sender_name }} → {{ row.receiver_name }}
                        </td>
                        <td class="px-4 py-3 text-end text-gray-800 font-semibold">{{ money(row.send_amount, row.send_currency?.code) }}</td>
                        <td class="px-4 py-3 text-end text-indigo-700 font-bold">{{ money(row.receive_amount, row.receive_currency?.code) }}</td>
                        <td class="px-4 py-3"><StatusBadge :value="row.status" /></td>
                        <td class="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{{ dateTime(row.created_at) }}</td>
                        <td class="px-4 py-3 text-end whitespace-nowrap">
                            <button class="text-indigo-600 hover:text-indigo-800 text-xs font-semibold me-3" @click="openDetails(row)">
                                {{ $t('common.details') }}
                            </button>
                            <button
                                v-if="row.status === 'pending' && can('complete-remittance')"
                                class="text-emerald-600 hover:text-emerald-800 text-xs font-bold me-3"
                                @click="openComplete(row)"
                            >
                                {{ $t('remittances.complete') }}
                            </button>
                            <button
                                v-if="row.status === 'pending' && can('cancel-remittance')"
                                class="text-red-600 hover:text-red-800 text-xs font-semibold"
                                @click="openCancel(row)"
                            >
                                {{ $t('remittances.cancelAction') }}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- ═══════ COMPLETE PAYOUT MODAL ═══════ -->
        <Modal :open="showComplete" :title="$t('remittances.completePayoutTitle')" @close="showComplete = false">
            <p class="text-sm text-gray-600 mb-4">
                {{ $t('remittances.confirmPayout', { number: activeRow?.remittance_number, receiver: activeRow?.receiver_name }) }}
            </p>

            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('remittances.paymentAccount') }}</label>
            <select v-model="paymentAccountId" class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                <option value="" disabled>{{ $t('remittances.selectAccount') }}</option>
                <option v-for="account in payAccounts" :key="account.id" :value="account.id">
                    {{ account.name }} — {{ money(account.current_balance, account.currency) }}
                </option>
            </select>

            <p v-if="completeError" class="mt-2 text-sm text-red-600">{{ completeError }}</p>
            <div class="mt-5 flex justify-end gap-2">
                <button class="px-4 py-2 text-sm rounded-xl border hover:bg-gray-50" @click="showComplete = false">{{ $t('common.cancel') }}</button>
                <button
                    class="px-4 py-2 text-sm rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 font-bold shadow-xs transition-colors"
                                    :disabled="!paymentAccountId || busy"
                    @click="confirmComplete"
                >
                    {{ busy ? $t('common.processing') : $t('remittances.confirmPayoutBtn') }}
                </button>
            </div>
        </Modal>

        <!-- ═══════ CANCEL MODAL ═══════ -->
        <Modal :open="showCancel" :title="$t('remittances.cancelRemittanceTitle')" @close="showCancel = false">
            <p class="text-sm text-gray-600 mb-4">
                {{ $t('remittances.cancelText', { number: activeRow?.remittance_number }) }}
            </p>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('remittances.reason') }}</label>
            <textarea
                v-model="cancelReason"
                rows="3"
                class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                :placeholder="$t('remittances.reasonPlaceholder')"
            />
            <p v-if="cancelError" class="mt-2 text-sm text-red-600">{{ cancelError }}</p>
            <div class="mt-5 flex justify-end gap-2">
                <button class="px-4 py-2 text-sm rounded-xl border hover:bg-gray-50" @click="showCancel = false">{{ $t('common.back') }}</button>
                <button
                    class="px-4 py-2 text-sm rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 font-bold shadow-xs transition-colors"
                    :disabled="!cancelReason.trim() || busy"
                    @click="confirmCancel"
                >
                    {{ busy ? $t('common.processing') : $t('remittances.confirmCancelBtn') }}
                </button>
            </div>
        </Modal>

        <!-- ═══════ DETAILS MODAL ═══════ -->
        <Modal :open="showDetails" :title="detail?.remittance_number || $t('remittances.detailsFallback')" max-width="sm:max-w-3xl" @close="showDetails = false">
            <div v-if="detailLoading" class="text-gray-400 text-sm py-8 text-center">{{ $t('common.loading') }}</div>
            <template v-else-if="detail">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p class="flex items-center justify-between"><span class="text-gray-500">{{ $t('remittances.dDirection') }}</span> <StatusBadge :value="detail.direction" /></p>
                    <p class="flex items-center justify-between"><span class="text-gray-500">{{ $t('remittances.dStatus') }}</span> <StatusBadge :value="detail.status" /></p>
                    <p class="flex items-center justify-between"><span class="text-gray-500">{{ $t('remittances.dAgent') }}</span> <span class="font-semibold text-gray-900">{{ detail.agent?.name }}</span></p>
                    <p class="flex items-center justify-between"><span class="text-gray-500">{{ $t('remittances.dSender') }}</span> <span class="font-semibold text-gray-900">{{ detail.sender_name }} {{ detail.sender_phone ? `(${detail.sender_phone})` : '' }}</span></p>
                    <p class="flex items-center justify-between"><span class="text-gray-500">{{ $t('remittances.dReceiver') }}</span> <span class="font-semibold text-gray-900">{{ detail.receiver_name }} {{ detail.receiver_phone ? `(${detail.receiver_phone})` : '' }}</span></p>
                    <p class="flex items-center justify-between"><span class="text-gray-500">{{ $t('remittances.dSend') }}</span> <span class="font-bold text-gray-900">{{ money(detail.send_amount, detail.send_currency?.code) }}</span></p>
                    <p class="flex items-center justify-between"><span class="text-gray-500">{{ $t('remittances.dReceive') }}</span> <span class="font-bold text-indigo-700">{{ money(detail.receive_amount, detail.receive_currency?.code) }}</span></p>
                    <p class="flex items-center justify-between"><span class="text-gray-500">{{ $t('remittances.dCommission') }}</span> <span class="font-semibold text-emerald-700">{{ money(detail.commission_amount, detail.commission_currency?.code) }} ({{ detail.commission_type || '-' }})</span></p>
                    <p class="flex items-center justify-between"><span class="text-gray-500">{{ $t('remittances.dCreatedBy') }}</span> <span class="text-gray-700">{{ detail.created_by?.name || '-' }} — {{ dateTime(detail.created_at) }}</span></p>
                    <p v-if="detail.completed_at" class="flex items-center justify-between"><span class="text-gray-500">{{ $t('remittances.dCompleted') }}</span> <span class="text-gray-700">{{ dateTime(detail.completed_at) }} ({{ detail.completed_by?.name || '-' }})</span></p>
                    <p v-if="detail.cancel_reason" class="col-span-1 sm:col-span-2 text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-100"><span class="font-semibold">{{ $t('remittances.dCancelReason') }}:</span> {{ detail.cancel_reason }}</p>
                    <p v-if="detail.notes" class="col-span-1 sm:col-span-2 text-gray-600 bg-white p-2 rounded-lg border border-gray-200"><span class="font-semibold text-gray-700">{{ $t('remittances.dNotes') }}:</span> {{ detail.notes }}</p>
                </div>

                <div
                    v-for="tx in txGroups"
                    :key="tx.key"
                    class="mb-4"
                >
                    <h4 class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">{{ $t(tx.label) }}</h4>
                    <template v-if="tx.tx">
                        <p class="text-xs text-gray-500 mb-1">
                            <span class="font-mono font-bold text-gray-700">{{ tx.tx.tx_number }}</span> — {{ tx.tx.description }} <span v-if="tx.tx.is_void" class="text-red-500 font-medium">{{ $t('remittances.void') }}</span>
                        </p>
                        <table class="w-full text-xs border rounded-xl overflow-hidden">
                            <thead class="bg-gray-50 text-start text-gray-500 border-b border-gray-100">
                                <tr>
                                    <th class="px-3 py-2">{{ $t('remittances.txAccount') }}</th>
                                    <th class="px-3 py-2">{{ $t('remittances.txType') }}</th>
                                    <th class="px-3 py-2 text-end">{{ $t('remittances.txAmount') }}</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                <tr v-for="entry in tx.tx.journal_entries" :key="entry.id">
                                    <td class="px-3 py-2 font-medium text-gray-900">{{ entry.account?.name || entry.account_id }}</td>
                                    <td class="px-3 py-2 uppercase font-semibold" :class="entry.entry_type === 'debit' ? 'text-blue-600' : 'text-red-600'">
                                        {{ $t(`remittances.entryTypes.${entry.entry_type}`, entry.entry_type) }}
                                    </td>
                                    <td class="px-3 py-2 text-end font-bold">{{ money(entry.amount) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </template>
                    <p v-else class="text-xs text-gray-400 italic">{{ $t('common.none') }}</p>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRemittanceStore } from '../stores/remittance'
import { useAccountStore } from '../stores/account'
import { usePermissions } from '../composables/usePermissions'
import { money, dateTime } from '../utils/format'
import Modal from './Modal.vue'
import StatusBadge from './StatusBadge.vue'

const { t } = useI18n()

const props = defineProps({
    rows: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
})

const emit = defineEmits(['refresh'])

const viewMode = ref('cards')

const store = useRemittanceStore()
const accountStore = useAccountStore()
const { can } = usePermissions()

const error = ref('')
const success = ref('')
const busy = ref(false)

const showComplete = ref(false)
const showCancel = ref(false)
const showDetails = ref(false)
const activeRow = ref(null)
const paymentAccountId = ref('')
const completeError = ref('')
const cancelReason = ref('')
const cancelError = ref('')
const detail = ref(null)
const detailLoading = ref(false)

const payAccounts = computed(() =>
    accountStore.balances.filter((a) => ['cash_safe', 'e_wallet', 'bank_account'].includes(a.type) && a.current_balance !== null),
)

const txGroups = computed(() => detail.value
    ? [
        { key: 'booking', label: 'remittances.bookingTx', tx: detail.value.booking_transaction },
        { key: 'commission', label: 'remittances.commissionTx', tx: detail.value.commission_transaction },
        { key: 'settlement', label: 'remittances.settlementTx', tx: detail.value.settlement_transaction },
    ]
    : [])

function openComplete(row) {
    activeRow.value = row
    paymentAccountId.value = ''
    completeError.value = ''
    showComplete.value = true
    accountStore.fetchBalances().catch(() => {})
}

async function confirmComplete() {
    busy.value = true
    completeError.value = ''
    try {
        await store.complete(activeRow.value.id, { payment_account_id: paymentAccountId.value })
        success.value = t('remittances.completedMsg', { number: activeRow.value.remittance_number })
        showComplete.value = false
        emit('refresh')
    } catch (e) {
        completeError.value = e.response?.data?.message || t('remittances.failedComplete')
    } finally {
        busy.value = false
    }
}

function openCancel(row) {
    activeRow.value = row
    cancelReason.value = ''
    cancelError.value = ''
    showCancel.value = true
}

async function confirmCancel() {
    busy.value = true
    cancelError.value = ''
    try {
        await store.cancel(activeRow.value.id, cancelReason.value)
        success.value = t('remittances.cancelledMsg', { number: activeRow.value.remittance_number })
        showCancel.value = false
        emit('refresh')
    } catch (e) {
        cancelError.value = e.response?.data?.message || t('remittances.failedCancel')
    } finally {
        busy.value = false
    }
}

async function openDetails(row) {
    showDetails.value = true
    detail.value = null
    detailLoading.value = true
    try {
        detail.value = await store.fetchOne(row.id)
    } catch (e) {
        detail.value = null
    } finally {
        detailLoading.value = false
    }
}
</script>
