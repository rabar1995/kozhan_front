<template>
    <div class="kpi-card group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
        :class="cardClasses">
        <!-- Gradient accent bar -->
        <div class="absolute inset-x-0 top-0 h-1 rounded-t-2xl" :class="accentBar" />

        <!-- Icon + Label -->
        <div class="flex items-center gap-3 mb-3">
            <div class="flex items-center justify-center w-10 h-10 rounded-xl transition-transform duration-300 group-hover:scale-110"
                :class="iconBg">
                <slot name="icon">
                    <svg v-if="icon === 'incoming'" class="w-5 h-5" :class="iconColor" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <svg v-else-if="icon === 'outgoing'" class="w-5 h-5" :class="iconColor" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    <svg v-else-if="icon === 'pending'" class="w-5 h-5" :class="iconColor" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <svg v-else-if="icon === 'check'" class="w-5 h-5" :class="iconColor" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <svg v-else-if="icon === 'money'" class="w-5 h-5" :class="iconColor" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <svg v-else-if="icon === 'users'" class="w-5 h-5" :class="iconColor" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <svg v-else-if="icon === 'chart'" class="w-5 h-5" :class="iconColor" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <svg v-else class="w-5 h-5" :class="iconColor" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                </slot>
            </div>
            <p class="text-sm font-medium text-gray-500 leading-tight">{{ label }}</p>
        </div>

        <!-- Value -->
        <div v-if="skeleton" class="h-8 w-24 bg-gray-200 rounded-lg animate-pulse" />
        <p v-else class="text-2xl font-bold tracking-tight transition-colors duration-300" :class="valueColor">
            {{ display }}
        </p>

        <!-- Subtle background decoration -->
        <div class="absolute -bottom-4 -end-4 w-20 h-20 rounded-full opacity-[0.04] transition-transform duration-500 group-hover:scale-150"
            :class="decorBg" />
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { money as moneyFmt } from '../utils/format'

const props = defineProps({
    label: { type: String, required: true },
    value: { type: [Number, String], default: null },
    tone: { type: String, default: 'gray' },
    money: { type: Boolean, default: false },
    icon: { type: String, default: '' },
    skeleton: { type: Boolean, default: false },
})

const toneConfig = {
    gray:   { card: 'bg-white border-gray-100', accent: 'bg-gray-300', iconBg: 'bg-gray-100', iconColor: 'text-gray-500', value: 'text-gray-900', decor: 'bg-gray-400' },
    green:  { card: 'bg-white border-emerald-100', accent: 'bg-gradient-to-r from-emerald-400 to-emerald-600', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', value: 'text-emerald-600', decor: 'bg-emerald-500' },
    red:    { card: 'bg-white border-red-100', accent: 'bg-gradient-to-r from-red-400 to-red-600', iconBg: 'bg-red-50', iconColor: 'text-red-600', value: 'text-red-600', decor: 'bg-red-500' },
    blue:   { card: 'bg-white border-blue-100', accent: 'bg-gradient-to-r from-blue-400 to-blue-600', iconBg: 'bg-blue-50', iconColor: 'text-blue-600', value: 'text-blue-600', decor: 'bg-blue-500' },
    purple: { card: 'bg-white border-purple-100', accent: 'bg-gradient-to-r from-purple-400 to-purple-600', iconBg: 'bg-purple-50', iconColor: 'text-purple-600', value: 'text-purple-600', decor: 'bg-purple-500' },
    yellow: { card: 'bg-white border-amber-100', accent: 'bg-gradient-to-r from-amber-400 to-amber-600', iconBg: 'bg-amber-50', iconColor: 'text-amber-600', value: 'text-amber-600', decor: 'bg-amber-500' },
}

const cfg = computed(() => toneConfig[props.tone] || toneConfig.gray)
const cardClasses = computed(() => cfg.value.card)
const accentBar = computed(() => cfg.value.accent)
const iconBg = computed(() => cfg.value.iconBg)
const iconColor = computed(() => cfg.value.iconColor)
const valueColor = computed(() => cfg.value.value)
const decorBg = computed(() => cfg.value.decor)

const display = computed(() => {
    if (props.value === null || props.value === undefined) return '-'
    return props.money ? moneyFmt(props.value) : props.value
})
</script>
