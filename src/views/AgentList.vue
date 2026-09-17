<template>
    <div class="space-y-4">
        <!-- Error Alert -->
        <div v-if="error" class="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
            <span>{{ error }}</span>
            <button class="text-red-500 hover:text-red-700 font-bold ml-2" @click="error = ''">✕</button>
        </div>

        <!-- ═══════ TOP BAR CONTROLS ═══════ -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-100 shadow-xs">
            <!-- Left: Title & Count -->
            <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-2.956 9 9 0 10-17.482 0A9.094 9.094 0 008 18.72m0 0a9.066 9.066 0 005.999 2.28m-5.999-2.28a8.99 8.99 0 015.999-2.28m0 4.56a9.066 9.066 0 005.999-2.28M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <h2 class="font-bold text-gray-900 text-sm sm:text-base">{{ $t('nav.agents') }}</h2>
                        <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {{ agentStore.agents.length }}
                        </span>
                    </div>
                    <p class="text-xs text-gray-400 mt-0.5 hidden sm:block">{{ $t('agents.intro') }}</p>
                </div>
            </div>

            <!-- Right: Search, View Toggle, Create Button -->
            <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <!-- Search -->
                <div class="relative flex-1 sm:w-60">
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

                <!-- Create Button -->
                <button
                    class="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-xs transition-colors shrink-0"
                    @click="showCreate = true"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span>{{ $t('agents.newAgent') }}</span>
                </button>
            </div>
        </div>

        <!-- ═══════ LOADING STATE ═══════ -->
        <div v-if="agentStore.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div v-for="n in 6" :key="n" class="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs animate-pulse space-y-3">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-gray-200"></div>
                    <div class="space-y-1.5 flex-1">
                        <div class="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div class="h-3 bg-gray-100 rounded w-1/3"></div>
                    </div>
                </div>
                <div class="h-16 bg-gray-50 rounded-xl"></div>
                <div class="h-8 bg-gray-100 rounded-lg"></div>
            </div>
        </div>

        <!-- ═══════ EMPTY STATE ═══════ -->
        <div
            v-else-if="!filteredAgents.length"
            class="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center shadow-xs"
        >
            <div class="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-400 mx-auto flex items-center justify-center mb-3">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-2.956 9 9 0 10-17.482 0A9.094 9.094 0 008 18.72m0 0a9.066 9.066 0 005.999 2.28m-5.999-2.28a8.99 8.99 0 015.999-2.28m0 4.56a9.066 9.066 0 005.999-2.28M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </div>
            <h3 class="text-sm font-semibold text-gray-800">
                {{ searchQuery ? $t('common.noResults') : $t('agents.noAgents') }}
            </h3>
            <p class="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                {{ searchQuery ? '' : $t('agents.intro') }}
            </p>
            <button
                v-if="!searchQuery"
                class="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
                @click="showCreate = true"
            >
                {{ $t('agents.newAgent') }}
            </button>
        </div>

        <!-- ═══════ CARD GRID VIEW (Default) ═══════ -->
        <div
            v-else-if="viewMode === 'cards'"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
            <div
                v-for="agent in filteredAgents"
                :key="agent.id"
                class="bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all duration-200 p-4 flex flex-col justify-between group relative overflow-hidden"
            >
                <!-- Top Header: Avatar, Name, Location, Status Badge -->
                <div>
                    <div class="flex items-start justify-between gap-2">
                        <div class="flex items-center gap-2.5 min-w-0">
                            <LogoAvatar :name="agent.name" :url="agent.logo_url" />
                            <div class="min-w-0 flex-1">
                                <h3 class="font-bold text-gray-900 text-sm leading-snug truncate group-hover:text-indigo-600 transition-colors" :title="agent.name">
                                    {{ agent.name }}
                                </h3>
                                <p v-if="agent.city || agent.country" class="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                                    <svg class="w-3 h-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                    </svg>
                                    <span class="truncate">{{ [agent.city, agent.country].filter(Boolean).join(', ') }}</span>
                                </p>
                            </div>
                        </div>

                        <!-- Status Badge -->
                        <StatusBadge :value="agent.classification" />
                    </div>

                    <!-- Meta Tags Row (Phone + Commission) -->
                    <div class="mt-3 flex items-center gap-2 flex-wrap text-xs">
                        <a
                            v-if="agent.phone"
                            :href="`tel:${agent.phone}`"
                            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 text-[11px] font-medium transition-colors border border-gray-100"
                        >
                            <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                            </svg>
                            <span>{{ agent.phone }}</span>
                        </a>

                        <span
                            v-if="Number(agent.commission_rate) > 0"
                            class="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60 text-[10px] font-semibold"
                        >
                            {{ agent.commission_rate }}% {{ $t('forms.commission') }}
                        </span>
                    </div>

                    <!-- Currency badges (multi-currency agents) -->
                    <div v-if="agentCurrencyCodes(agent).length > 1" class="mt-2 flex items-center gap-1 flex-wrap">
                        <span
                            v-for="code in agentCurrencyCodes(agent)"
                            :key="code"
                            class="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200"
                        >{{ code }}</span>
                    </div>

                    <!-- Net Balance Box -->
                    <div
                        class="mt-3 p-3 rounded-xl border transition-colors"
                        :class="Number(agent.net_balance) > 0
                            ? 'bg-emerald-50/70 border-emerald-200/70 text-emerald-950'
                            : Number(agent.net_balance) < 0
                            ? 'bg-rose-50/70 border-rose-200/70 text-rose-950'
                            : 'bg-slate-50 border-slate-200/70 text-slate-800'"
                    >
                        <div class="flex items-center justify-between text-[11px] font-medium text-gray-500 mb-0.5">
                            <span>{{ $t('agents.netBalance') }}</span>
                            <span class="px-1.5 py-0.2 rounded bg-white font-bold text-[10px] text-gray-700 shadow-2xs">
                                {{ agent.balance_currency?.code || '-' }}
                            </span>
                        </div>
                        <div
                            class="text-base sm:text-lg font-black tracking-tight"
                            :class="Number(agent.net_balance) > 0
                                ? 'text-emerald-700'
                                : Number(agent.net_balance) < 0
                                ? 'text-rose-600'
                                : 'text-gray-700'"
                        >
                            {{ money(agent.net_balance) }}
                        </div>
                    </div>
                </div>

                <!-- Card Actions Footer -->
                <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-1.5">
                    <div class="flex items-center gap-1.5 flex-1">
                        <!-- Ledger Button -->
                        <button
                            class="flex-1 px-2 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                            :title="$t('agents.ledgerBtn')"
                            @click="openLedger(agent)"
                        >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                            </svg>
                            <span>{{ $t('agents.ledgerBtn') }}</span>
                        </button>

                        <!-- Balance Summary Button -->
                        <button
                            class="px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                            :title="$t('agents.balanceBtn')"
                            @click="openBalance(agent)"
                        >
                            <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-16.5-.52c-1.01.143-2.01.317-3 .52m16.5 0a48.667 48.667 0 01-16.5 0" />
                            </svg>
                            <span>{{ $t('agents.balanceBtn') }}</span>
                        </button>
                    </div>

                    <!-- Edit Button -->
                    <button
                        class="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        :title="$t('common.edit')"
                        @click="openEdit(agent)"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
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
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-start text-xs uppercase tracking-wide text-gray-500 border-b border-gray-100">
                    <tr>
                        <th class="px-4 py-3">{{ $t('common.name') }}</th>
                        <th class="px-4 py-3">{{ $t('agents.contact') }}</th>
                        <th class="px-4 py-3">{{ $t('common.currency') }}</th>
                        <th class="px-4 py-3 text-end">{{ $t('agents.netBalance') }}</th>
                        <th class="px-4 py-3">{{ $t('common.status') }}</th>
                        <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="agent in filteredAgents" :key="agent.id" class="hover:bg-gray-50/80 transition-colors">
                        <td class="px-4 py-3 font-medium text-gray-900">
                            <div class="flex items-center gap-2.5">
                                <LogoAvatar :name="agent.name" :url="agent.logo_url" size="lg" />
                                <div>
                                    <span class="font-bold text-gray-900">{{ agent.name }}</span>
                                    <p v-if="agent.commission_rate" class="text-[10px] text-gray-400">
                                        {{ agent.commission_rate }}% {{ $t('forms.commission') }}
                                    </p>
                                </div>
                            </div>
                        </td>
                        <td class="px-4 py-3 text-gray-600">
                            {{ agent.phone || '-' }}
                            <span v-if="agent.city" class="text-gray-400">· {{ agent.city }}{{ agent.country ? `, ${agent.country}` : '' }}</span>
                        </td>
                        <td class="px-4 py-3 font-semibold">
                            {{ agent.balance_currency?.code || '-' }}
                            <div v-if="agentCurrencyCodes(agent).length > 1" class="text-[10px] text-gray-400 font-medium">
                                +{{ agentCurrencyCodes(agent).length - 1 }} {{ $t('agents.moreCurrencies') }}
                            </div>
                        </td>
                        <td
                            class="px-4 py-3 text-end font-bold"
                            :class="Number(agent.net_balance) > 0 ? 'text-emerald-600' : Number(agent.net_balance) < 0 ? 'text-rose-600' : 'text-gray-700'"
                        >
                            {{ money(agent.net_balance) }}
                        </td>
                        <td class="px-4 py-3"><StatusBadge :value="agent.classification" /></td>
                        <td class="px-4 py-3 text-end whitespace-nowrap">
                            <button class="text-indigo-600 hover:text-indigo-800 text-xs font-semibold me-3" @click="openEdit(agent)">
                                {{ $t('common.edit') }}
                            </button>
                            <button class="text-indigo-600 hover:text-indigo-800 text-xs font-semibold me-3" @click="openLedger(agent)">
                                {{ $t('agents.ledgerBtn') }}
                            </button>
                            <button class="text-gray-600 hover:text-gray-800 text-xs font-semibold" @click="openBalance(agent)">
                                {{ $t('agents.balanceBtn') }}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- ═══════ MODALS ═══════ -->


        <Modal :open="showCreate" :title="$t('agents.newAgentTitle')" @close="showCreate = false">
            <form class="space-y-4" @submit.prevent="create">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('agents.nameRequired') }}</label>
                    <input v-model="form.name" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                    <p v-if="errors.name" class="text-xs text-red-600 mt-1">{{ errors.name[0] }}</p>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('agents.phone') }}</label>
                        <input v-model="form.phone" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('agents.commissionRate') }}</label>
                        <input v-model.number="form.commission_rate" type="number" step="0.01" min="0" max="100"
                            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('agents.country') }}</label>
                        <input v-model="form.country" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('agents.city') }}</label>
                        <input v-model="form.city" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('agents.balanceCurrency') }}</label>
                    <label class="flex items-center gap-2 mb-2 text-sm text-gray-700 cursor-pointer select-none">
                        <input v-model="form.allow_all_currencies" type="checkbox" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        {{ $t('agents.allCurrencies') }}
                    </label>
                    <div v-if="!form.allow_all_currencies" class="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 rounded-lg border border-gray-200 bg-gray-50/60">
                        <button
                            v-for="c in currencies" :key="c.id" type="button"
                            class="px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors"
                            :class="form.currency_ids.includes(c.id)
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'"
                            @click="toggleCurrency(form.currency_ids, c.id)"
                        >
                            {{ c.code }}
                        </button>
                    </div>
                    <p v-if="errors.balance_currency_id" class="text-xs text-red-600 mt-1">{{ errors.balance_currency_id[0] }}</p>
                    <p class="text-xs text-gray-400 mt-1">{{ $t('agents.receivableNote') }}</p>
                </div>
                <LogoPicker v-model="form.logo" :name="form.name" />
                <div class="flex justify-end gap-2 pt-2">
                    <button type="button" class="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50" @click="showCreate = false">{{ $t('common.cancel') }}</button>
                    <button type="submit" :disabled="busy" class="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 font-medium">
                        {{ busy ? $t('common.saving') : $t('agents.createAgentBtn') }}
                    </button>
                </div>
            </form>
        </Modal>

        <Modal :open="showEdit" :title="$t('agents.editTitle')" @close="showEdit = false">
            <form class="space-y-4" @submit.prevent="update">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('agents.nameRequired') }}</label>
                    <input v-model="editForm.name" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                    <p v-if="errors.name" class="text-xs text-red-600 mt-1">{{ errors.name[0] }}</p>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('agents.phone') }}</label>
                        <input v-model="editForm.phone" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('agents.commissionRate') }}</label>
                        <input v-model.number="editForm.commission_rate" type="number" step="0.01" min="0" max="100"
                            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('agents.country') }}</label>
                        <input v-model="editForm.country" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('agents.city') }}</label>
                        <input v-model="editForm.city" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('agents.balanceCurrency') }}</label>
                    <label class="flex items-center gap-2 mb-2 text-sm text-gray-700 cursor-pointer select-none">
                        <input v-model="editForm.allow_all_currencies" type="checkbox" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        {{ $t('agents.allCurrencies') }}
                    </label>
                    <div v-if="!editForm.allow_all_currencies" class="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 rounded-lg border border-gray-200 bg-gray-50/60">
                        <button
                            v-for="c in currencies" :key="c.id" type="button"
                            class="px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors"
                            :class="editForm.currency_ids.includes(c.id)
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'"
                            @click="toggleCurrency(editForm.currency_ids, c.id)"
                        >
                            {{ c.code }}
                        </button>
                    </div>
                    <p v-if="errors.balance_currency_id" class="text-xs text-red-600 mt-1">{{ errors.balance_currency_id[0] }}</p>
                </div>
                <LogoPicker v-model="editForm.logo" :name="editForm.name" :existing-url="logoUrl(editTarget)" />
                <div class="flex justify-end gap-2 pt-2">
                    <button type="button" class="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50" @click="showEdit = false">{{ $t('common.cancel') }}</button>
                    <button type="submit" :disabled="busy" class="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 font-medium">
                        {{ busy ? $t('common.saving') : $t('common.save') }}
                    </button>
                </div>
            </form>
        </Modal>

        <Modal :open="showBalance" :title="balanceData?.name || $t('agents.balanceBtn')" @close="showBalance = false">
            <div v-if="balanceData" class="space-y-3 text-sm">
                <div class="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between">
                    <div>
                        <p class="text-xs text-gray-500">{{ $t('agents.netBalance') }}</p>
                        <p class="text-lg font-bold text-gray-950">{{ money(balanceData.net_balance, balanceData.currency) }}</p>
                    </div>
                    <StatusBadge :value="balanceData.classification" />
                </div>

                <!-- Per-currency balances -->
                <div v-if="balanceData.balances?.length" class="space-y-2">
                    <div
                        v-for="row in balanceData.balances"
                        :key="row.currency_id"
                        class="p-3 rounded-xl border border-gray-100 bg-gray-50/70"
                    >
                        <div class="flex items-center justify-between mb-1.5">
                            <div class="flex items-center gap-2">
                                <span class="px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-black tracking-wider">
                                    {{ row.currency || '?' }}
                                </span>
                                <StatusBadge :value="row.classification" />
                            </div>
                        </div>
                        <div class="grid grid-cols-3 gap-2 text-xs">
                            <div>
                                <p class="text-gray-500">{{ $t('agents.receivable') }}</p>
                                <p class="font-semibold text-emerald-600">{{ money(row.receivable) }}</p>
                            </div>
                            <div>
                                <p class="text-gray-500">{{ $t('agents.payable') }}</p>
                                <p class="font-semibold text-rose-600">{{ money(row.payable) }}</p>
                            </div>
                            <div>
                                <p class="text-gray-500">{{ $t('agents.netBalance') }}</p>
                                <p class="font-bold" :class="row.net > 0 ? 'text-emerald-700' : row.net < 0 ? 'text-rose-600' : 'text-gray-700'">
                                    {{ money(row.net) }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else class="grid grid-cols-2 gap-3 pt-1">
                    <div class="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                        <p class="text-xs text-gray-500">{{ $t('agents.receivable') }}</p>
                        <p class="text-sm font-semibold text-emerald-600">{{ money(balanceData.receivable_balance) }}</p>
                    </div>
                    <div class="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                        <p class="text-xs text-gray-500">{{ $t('agents.payable') }}</p>
                        <p class="text-sm font-semibold text-rose-600">{{ money(balanceData.payable_balance) }}</p>
                    </div>
                </div>
            </div>
        </Modal>

        <Modal :open="showLedger" :title="`${$t('agents.ledgerBtn')} — ${ledgerAgent?.name || ''}`" max-width="sm:max-w-3xl" @close="showLedger = false">
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
                            <th class="px-3 py-2">{{ $t('common.type') }}</th>
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
                            <td class="px-3 py-2 text-gray-600">{{ entry.transaction?.tx_type }}</td>
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
import { useI18n } from 'vue-i18n'
import { api, apiError } from '../api/client'
import { useAgentStore } from '../stores/agent'
import { money, dateTime } from '../utils/format'
import Modal from '../components/Modal.vue'
import LogoPicker from '../components/LogoPicker.vue'
import LogoAvatar from '../components/LogoAvatar.vue'
import StatusBadge from '../components/StatusBadge.vue'
import Pagination from '../components/Pagination.vue'
import LogoSelect from '../components/LogoSelect.vue'
import { usePermissions } from '../composables/usePermissions'

const agentStore = useAgentStore()
const { can, isOwner } = usePermissions()
const { t } = useI18n()

const viewMode = ref('cards')
const searchQuery = ref('')

const currencies = ref([])
const error = ref('')
const busy = ref(false)
const errors = ref({})

const showCreate = ref(false)
const showEdit = ref(false)
const editTarget = ref(null)
const showBalance = ref(false)
const showLedger = ref(false)
const balanceData = ref(null)
const ledgerAgent = ref(null)
const ledgerEntries = ref([])
const ledgerMeta = ref(null)
const ledgerLoading = ref(false)
const ledgerFilters = reactive({ date_from: '', date_to: '' })

const form = reactive({
    name: '',
    phone: '',
    country: '',
    city: '',
    balance_currency_id: '',
    currency_ids: [],
    allow_all_currencies: false,
    commission_rate: 0,
    logo: '',
})

const editForm = reactive({
    name: '',
    phone: '',
    country: '',
    city: '',
    currency_ids: [],
    allow_all_currencies: false,
    commission_rate: 0,
    logo: '',
})

const filteredAgents = computed(() => {
    let list = agentStore.agents
    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase().trim()
        list = list.filter((a) =>
            (a.name && a.name.toLowerCase().includes(q)) ||
            (a.phone && a.phone.toLowerCase().includes(q)) ||
            (a.city && a.city.toLowerCase().includes(q)) ||
            (a.country && a.country.toLowerCase().includes(q)) ||
            (a.balance_currency?.code && a.balance_currency.code.toLowerCase().includes(q))
        )
    }
    return list
})

function toggleCurrency(list, currencyId) {
    const index = list.indexOf(currencyId)
    if (index === -1) list.push(currencyId)
    else list.splice(index, 1)
}

function agentCurrencyCodes(agent) {
    return (agent.currency_accounts || [])
        .map((p) => p.currency?.code)
        .filter(Boolean)
}

async function create() {
    if (! form.currency_ids.length) {
        error.value = t('agents.pickAtLeastOneCurrency')
        return
    }
    busy.value = true
    errors.value = {}
    error.value = ''
    try {
        await agentStore.createAgent({
            name: form.name,
            phone: form.phone,
            country: form.country,
            city: form.city,
            // Keep the legacy single-currency contract; backend accepts a set.
            balance_currency_id: form.currency_ids[0],
            currency_ids: [...form.currency_ids],
            allow_all_currencies: form.allow_all_currencies,
            commission_rate: form.commission_rate,
            logo_url: form.logo ? form.logo : undefined,
        })
        showCreate.value = false
        Object.assign(form, { name: '', phone: '', country: '', city: '', balance_currency_id: '', currency_ids: [], allow_all_currencies: false, commission_rate: 0, logo: '' })
    } catch (e) {
        const parsed = apiError(e)
        error.value = parsed.message
        errors.value = parsed.errors
    } finally {
        busy.value = false
    }
}

function openEdit(agent) {
    editTarget.value = agent
    editForm.name = agent.name
    editForm.phone = agent.phone || ''
    editForm.country = agent.country || ''
    editForm.city = agent.city || ''
    editForm.commission_rate = agent.commission_rate || 0
    editForm.currency_ids = (agent.currency_accounts || []).map((p) => p.currency_id)
    editForm.allow_all_currencies = !! agent.allow_all_currencies
    editForm.logo = ''
    showEdit.value = true
}

async function update() {
    if (! editTarget.value) return
    busy.value = true
    errors.value = {}
    error.value = ''
    try {
        await agentStore.updateAgent(editTarget.value.id, {
            name: editForm.name,
            phone: editForm.phone,
            country: editForm.country,
            city: editForm.city,
            currency_ids: editForm.allow_all_currencies ? null : [...editForm.currency_ids],
            allow_all_currencies: editForm.allow_all_currencies,
            commission_rate: editForm.commission_rate,
            logo_url: editForm.logo ? editForm.logo : undefined,
        })
        showEdit.value = false
        editTarget.value = null
    } catch (e) {
        const parsed = apiError(e)
        error.value = parsed.message
        errors.value = parsed.errors
    } finally {
        busy.value = false
    }
}

function logoUrl(agent) {
    return agent?.logo_url || ''
}

onMounted(async () => {
    agentStore.fetchAgents().catch((e) => { error.value = apiError(e).message })
    try {
        currencies.value = (await api.get('/currencies')).data.data
    } catch (e) {
        // ignore
    }
})

async function openBalance(agent) {
    try {
        balanceData.value = (await agentStore.balance(agent.id)).data.data
        showBalance.value = true
    } catch (e) {
        error.value = apiError(e).message
    }
}

function openLedger(agent) {
    ledgerAgent.value = agent
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
        const res = await agentStore.ledger(ledgerAgent.value.id, params)
        ledgerEntries.value = res.data.data.data
        ledgerMeta.value = res.data.data
    } catch (e) {
        error.value = apiError(e).message
    } finally {
        ledgerLoading.value = false
    }
}
</script>
