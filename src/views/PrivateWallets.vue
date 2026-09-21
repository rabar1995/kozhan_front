<template>
    <div class="space-y-4">
        <!-- Error Alert -->
        <div v-if="error" class="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
            <span>{{ error }}</span>
            <button class="text-red-500 hover:text-red-700 font-bold ml-2" @click="error = ''">✕</button>
        </div>

        <!-- ═══════ TOP BAR CONTROLS ═══════ -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-100 shadow-xs">
            <!-- Left: Title & Intro -->
            <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <h2 class="font-bold text-gray-900 text-sm sm:text-base">{{ $t('accounts.ownerPrivate') }}</h2>
                        <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {{ privateWallets.length }}
                        </span>
                    </div>
                    <p class="text-xs text-gray-400 mt-0.5 hidden sm:block">{{ $t('accounts.privateIntro') }}</p>
                </div>
            </div>

            <!-- Right: Search, View Toggle, Create Button -->
            <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <!-- Search -->
                <div class="relative flex-1 sm:w-56">
                    <svg class="w-4 h-4 text-gray-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input
                        v-model="searchQuery"
                        type="text"
                        :placeholder="$t('common.search')"
                        class="w-full ps-9 pe-3 py-1.5 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-gray-50/50 hover:bg-white"
                    />
                </div>

                <!-- View Mode Toggle -->
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

                <!-- Create Wallet Button -->
                <button
                    v-if="can('manage-accounts')"
                    class="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-xs transition-colors shrink-0"
                    @click="showCreate = true"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span>{{ $t('accounts.newWallet') }}</span>
                </button>
            </div>
        </div>

        <!-- ═══════ LOADING STATE ═══════ -->
        <div v-if="accountStore.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div v-for="n in 4" :key="n" class="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4">
                <div class="flex items-center justify-between">
                    <div class="w-10 h-10 rounded-xl animate-shimmer"></div>
                    <div class="w-12 h-5 animate-shimmer rounded-md"></div>
                </div>
                <div class="h-16 animate-shimmer rounded-xl"></div>
                <div class="h-8 animate-shimmer rounded-lg"></div>
            </div>
        </div>

        <!-- ═══════ EMPTY STATE ═══════ -->
        <div
            v-else-if="!filteredWallets.length"
            class="bg-white rounded-2xl border border-gray-100 p-8 sm:p-14 text-center shadow-xs"
        >
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-amber-50 text-indigo-400 mx-auto flex items-center justify-center mb-4 ring-1 ring-indigo-100">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
            </div>
            <h3 class="text-sm font-bold text-gray-800">
                {{ searchQuery ? $t('common.noResults') : $t('common.none') }}
            </h3>
            <p class="text-xs text-gray-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
                {{ searchQuery ? '' : $t('accounts.privateIntro') }}
            </p>
            <button
                v-if="!searchQuery && can('manage-accounts')"
                class="mt-5 px-5 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-colors"
                @click="showCreate = true"
            >
                {{ $t('accounts.newWallet') }}
            </button>
        </div>

        <!-- ═══════ CARD GRID VIEW (Default) ═══════ -->
        <div
            v-else-if="viewMode === 'cards'"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
            <div
                v-for="account in filteredWallets"
                :key="account.id"
                class="bg-gradient-to-br from-white via-white to-indigo-50/20 rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-lg hover:border-indigo-300 hover:-translate-y-0.5 transition-all duration-200 p-5 flex flex-col justify-between group relative overflow-hidden"
            >
                <!-- Subtle Watermark Safe Icon in Background -->
                <div class="absolute -end-3 -bottom-3 text-slate-100/60 pointer-events-none group-hover:text-indigo-50/70 transition-colors">
                    <svg class="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 110-6h.75A2.25 2.25 0 0018 1.5H6A2.25 2.25 0 003.75 3.75v16.5A2.25 2.25 0 006 22.5h12a2.25 2.25 0 002.25-2.25V12zM15 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                </div>

                <div>
                    <!-- Card Top Header -->
                    <div class="flex items-start justify-between gap-3">
                        <div class="flex items-center gap-3 min-w-0">
                            <LogoAvatar :name="account.name" :url="account.logo_url" />
                            <div class="min-w-0">
                                <h3 class="font-bold text-gray-900 text-base leading-tight truncate group-hover:text-indigo-600 transition-colors" :title="account.name">
                                    {{ account.name }}
                                </h3>
                                <p class="text-xs text-gray-400 mt-0.5 truncate">
                                    {{ account.account_type?.name || $t('accounts.type') }}
                                    <span v-if="!account.is_active" class="ms-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200 uppercase">{{ $t('accounts.inactive') }}</span>
                                </p>
                            </div>
                        </div>

                        <!-- Currency Pill Badge -->
                        <span class="px-2.5 py-1 rounded-lg text-xs font-black bg-slate-900 text-white shadow-xs tracking-wider shrink-0">
                            {{ account.currency?.code || '-' }}
                        </span>
                    </div>

                    <!-- Balance Hero Section -->
                    <div class="mt-4 p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 relative backdrop-blur-xs">
                        <div class="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                            <span>{{ $t('accounts.balance') }}</span>
                            <span class="inline-flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded font-medium border border-amber-200/50">
                                <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                                Private
                            </span>
                        </div>
                        <div
                            class="text-xl sm:text-2xl font-black tracking-tight"
                            :class="Number(account.current_balance) < 0 ? 'text-rose-600' : 'text-gray-900'"
                        >
                            {{ money(account.current_balance, account.currency?.code) }}
                        </div>
                    </div>
                </div>

                <!-- Bottom Actions -->
                <div class="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-2 relative z-10">
                    <button
                        class="flex-1 py-1.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                        @click="openLedger(account)"
                    >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                        <span>{{ $t('accounts.ledgerBtn') }}</span>
                    </button>

                    <button
                        v-if="can('manage-accounts')"
                        class="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        :title="$t('common.edit')"
                        @click="openEdit(account)"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                    </button>

                    <button
                        v-if="can('manage-accounts')"
                        class="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        :title="$t('accounts.delete')"
                        @click="confirmDelete(account)"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </button>
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
                        <th class="px-4 py-3">{{ $t('accounts.name') }}</th>
                        <th class="px-4 py-3">{{ $t('accounts.type') }}</th>
                        <th class="px-4 py-3">{{ $t('accounts.currency') }}</th>
                        <th class="px-4 py-3 text-end">{{ $t('accounts.balance') }}</th>
                        <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="account in filteredWallets" :key="account.id" class="hover:bg-gray-50/80 transition-colors">
                        <td class="px-4 py-3 font-medium text-gray-900">
                            <div class="flex items-center gap-2.5">
                                <LogoAvatar :name="account.name" :url="account.logo_url" size="lg" />
                                <span class="font-bold text-gray-900">{{ account.name }}</span>
                                <span v-if="!account.is_active" class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200 uppercase">{{ $t('accounts.inactive') }}</span>
                            </div>
                        </td>
                        <td class="px-4 py-3 text-gray-600">{{ account.account_type?.name }}</td>
                        <td class="px-4 py-3 font-bold">{{ account.currency?.code }}</td>
                        <td
                            class="px-4 py-3 text-end font-bold"
                            :class="Number(account.current_balance) < 0 ? 'text-rose-600' : 'text-gray-900'"
                        >
                            {{ money(account.current_balance, account.currency?.code) }}
                        </td>
                        <td class="px-4 py-3 text-end whitespace-nowrap">
                            <template v-if="can('manage-accounts')">
                                <button class="text-indigo-600 hover:text-indigo-800 text-xs font-semibold me-3" @click="openEdit(account)">
                                    {{ $t('common.edit') }}
                                </button>
                                <button
                                    class="text-amber-600 hover:text-amber-800 text-xs font-semibold me-3"
                                    @click="confirmDelete(account)"
                                >
                                    {{ account.is_active ? $t('accounts.deactivate') : $t('accounts.activate') }}
                                </button>
                                <button class="text-red-600 hover:text-red-800 text-xs font-semibold me-3" @click="confirmDelete(account)">
                                    {{ $t('accounts.delete') }}
                                </button>
                            </template>
                            <button class="text-indigo-600 hover:text-indigo-800 text-xs font-semibold" @click="openLedger(account)">
                                {{ $t('accounts.ledgerBtn') }}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- ═══════ MODALS ═══════ -->
        <Modal :open="showCreate" :title="$t('accounts.createTitle')" @close="showCreate = false">
            <form class="space-y-4" @submit.prevent="create">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('accounts.nameRequired') }}</label>
                    <input v-model="form.name" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                    <p v-if="errors.name" class="text-xs text-red-600 mt-1">{{ errors.name[0] }}</p>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('accounts.typeRequired') }}</label>
                        <select v-model="form.account_type_id" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                            <option value="" disabled>{{ $t('common.select') }}</option>
                            <option v-for="t in accountTypes" :key="t.id" :value="t.id">{{ t.name }} ({{ t.code }})</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('accounts.currencyRequired') }}</label>
                        <select v-model="form.currency_id" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                            <option value="" disabled>{{ $t('common.select') }}</option>
                            <option v-for="c in currencies" :key="c.id" :value="c.id">{{ c.code }}</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('accounts.openingBalance') }}</label>
                    <MoneyInput
                        v-model="form.opening_balance"
                        :max-decimals="4"
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    <p class="text-xs text-gray-400 mt-1">{{ $t('accounts.openingBalanceHint') }}</p>
                    <p v-if="errors.opening_balance" class="text-xs text-red-600 mt-1">{{ errors.opening_balance[0] }}</p>
                </div>
                <LogoPicker v-model="form.logo" :name="form.name" />
                <div class="flex justify-end gap-2 pt-2">
                    <button type="button" class="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50" @click="showCreate = false">{{ $t('common.cancel') }}</button>
                    <button type="submit" :disabled="busy" class="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 font-medium">
                        {{ busy ? $t('common.saving') : $t('common.create') }}
                    </button>
                </div>
            </form>
        </Modal>

        <!-- Edit / balance-change confirm / delete modals come from the shared component -->
        <WalletManageModals
            :edit-account="editTarget"
            :delete-account="showDelete ? deleteTarget : null"
            :account-types="accountTypes"
            :currencies="currencies"
            @close-edit="showEdit = false; editTarget = null"
            @close-delete="showDelete = false; deleteTarget = null"
            @saved="accountStore.fetchAccounts().catch(() => {})"
        />

        <Modal :open="showLedger" :title="`${$t('accounts.ledgerBtn')} — ${ledgerAccount?.name || ''}`" max-width="sm:max-w-3xl" @close="showLedger = false">
            <div class="flex gap-3 mb-4">
                <input v-model="ledgerFilters.date_from" type="date" class="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                <input v-model="ledgerFilters.date_to" type="date" class="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                <button class="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700" @click="loadLedger(1)">
                    {{ $t('common.apply') }}
                </button>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full text-xs">
                    <thead class="bg-gray-50 text-start text-gray-500">
                        <tr>
                            <th class="px-3 py-2">{{ $t('common.date') }}</th>
                            <th class="px-3 py-2">{{ $t('common.transaction') }}</th>
                            <th class="px-3 py-2">{{ $t('common.description') }}</th>
                            <th class="px-3 py-2">{{ $t('common.entry') }}</th>
                            <th class="px-3 py-2 text-end">{{ $t('common.amount') }}</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr v-if="ledgerLoading">
                            <td colspan="5" class="px-3 py-6 text-center text-gray-400">{{ $t('common.loading') }}</td>
                        </tr>
                        <tr v-else-if="!ledgerEntries.length">
                            <td colspan="5" class="px-3 py-6 text-center text-gray-400">{{ $t('common.none') }}</td>
                        </tr>
                        <tr v-for="entry in ledgerEntries" :key="entry.id">
                            <td class="px-3 py-2 text-gray-500 whitespace-nowrap">{{ dateTime(entry.created_at) }}</td>
                            <td class="px-3 py-2">{{ entry.transaction?.tx_number }}<span v-if="entry.transaction?.is_void" class="text-red-500"> (void)</span></td>
                            <td class="px-3 py-2 text-gray-600 max-w-[240px] truncate">{{ entry.description || entry.transaction?.description }}</td>
                            <td class="px-3 py-2 uppercase font-medium" :class="entry.entry_type === 'debit' ? 'text-blue-600' : 'text-red-600'">
                                {{ $t(`remittances.entryTypes.${entry.entry_type}`, entry.entry_type) }}
                            </td>
                            <td class="px-3 py-2 text-end">{{ money(entry.amount, entry.currency?.code) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <Pagination :meta="ledgerMeta" @page="loadLedger" />
        </Modal>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { api, apiError } from '../api/client'
import { useAccountStore } from '../stores/account'
import { usePermissions } from '../composables/usePermissions'
import { money, dateTime } from '../utils/format'
import Modal from '../components/Modal.vue'
import Pagination from '../components/Pagination.vue'
import LogoAvatar from '../components/LogoAvatar.vue'
import LogoPicker from '../components/LogoPicker.vue'
import MoneyInput from '../components/MoneyInput.vue'
import WalletManageModals from '../components/WalletManageModals.vue'

const accountStore = useAccountStore()
const { can } = usePermissions()

const viewMode = ref('cards')
const searchQuery = ref('')

const currencies = ref([])
const accountTypes = ref([])
const error = ref('')
const busy = ref(false)
const errors = ref({})

const showCreate = ref(false)
const showEdit = ref(false)
const editTarget = ref(null)
const showDelete = ref(false)
const deleteTarget = ref(null)
const showLedger = ref(false)
const ledgerAccount = ref(null)
const ledgerEntries = ref([])
const ledgerMeta = ref(null)
const ledgerLoading = ref(false)
const ledgerFilters = reactive({ date_from: '', date_to: '' })

const form = reactive({ name: '', account_type_id: '', currency_id: '', logo: '', opening_balance: 0 })

const SYSTEM_TYPE_CODES = ['owner_equity', 'exchange_pending']

const privateWallets = computed(() => accountStore.accounts.filter((a) =>
    a.visibility === 'owner_private' && !SYSTEM_TYPE_CODES.includes(a.account_type?.code)
))

const filteredWallets = computed(() => {
    let list = privateWallets.value
    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase().trim()
        list = list.filter((a) =>
            (a.name && a.name.toLowerCase().includes(q)) ||
            (a.currency?.code && a.currency.code.toLowerCase().includes(q)) ||
            (a.account_type?.name && a.account_type.name.toLowerCase().includes(q))
        )
    }
    return list
})

onMounted(async () => {
    accountStore.fetchAccounts().catch((e) => { error.value = apiError(e).message })
    try {
        currencies.value = (await api.get('/currencies')).data.data
        const types = await api.get('/account-types').catch(() => null)
        accountTypes.value = types?.data?.data || []
    } catch (e) {
        // ignore
    }
})

async function create() {
    busy.value = true
    errors.value = {}
    error.value = ''
    try {
        await accountStore.createAccount({
            name: form.name,
            account_type_id: form.account_type_id,
            currency_id: form.currency_id,
            visibility: 'owner_private',
            logo_url: form.logo ? form.logo : undefined,
            opening_balance: Number(form.opening_balance) > 0 ? Number(form.opening_balance) : undefined,
        })
        showCreate.value = false
        Object.assign(form, { name: '', account_type_id: '', currency_id: '', logo: '', opening_balance: 0 })
        await accountStore.fetchAccounts()
    } catch (e) {
        const parsed = apiError(e)
        error.value = parsed.message
        errors.value = parsed.errors
    } finally {
        busy.value = false
    }
}

function openEdit(account) {
    editTarget.value = account
    showEdit.value = true
}

function confirmDelete(account) {
    deleteTarget.value = account
    showDelete.value = true
}

function openLedger(account) {
    ledgerAccount.value = account
    ledgerFilters.date_from = ''
    ledgerFilters.date_to = ''
    showLedger.value = true
    loadLedger(1)
}

async function loadLedger(page = 1) {
    ledgerLoading.value = true
    try {
        const params = { page }
        if (ledgerFilters.date_from) params.date_from = ledgerFilters.date_from
        if (ledgerFilters.date_to) params.date_to = ledgerFilters.date_to
        const res = await accountStore.ledger(ledgerAccount.value.id, params)
        ledgerEntries.value = res.data.data.data
        ledgerMeta.value = res.data.data
    } catch (e) {
        error.value = apiError(e).message
    } finally {
        ledgerLoading.value = false
    }
}
</script>
