<template>
    <input
        :value="display"
        type="text"
        inputmode="decimal"
        autocomplete="off"
        spellcheck="false"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
    />
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
    modelValue: { type: [Number, String], default: null },
    maxDecimals: { type: Number, default: 2 },
    // Allow a leading minus (e.g. wallet balances can be owed either way).
    allowNegative: { type: Boolean, default: false },
    // Render nothing (instead of "0") when the resting value is zero.
    blankZero: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const raw = ref('')
const focused = ref(false)

function groupThousands(digits) {
    return String(digits).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function parse(str) {
    let s = String(str).replace(/,/g, '')
    const negative = props.allowNegative && /^\s*-/.test(s)
    s = s.replace(/[^0-9.]/g, '')
    const firstDot = s.indexOf('.')
    if (firstDot !== -1) {
        const intPart = s.slice(0, firstDot) || '0'
        const decPart = s.slice(firstDot + 1).replace(/\./g, '').slice(0, props.maxDecimals)
        s = `${intPart}.${decPart}`
    }
    return (negative ? '-' : '') + s
}

function group(text) {
    const parsed = parse(text)
    const negative = parsed.startsWith('-')
    const unsigned = parsed.replace('-', '')
    if (unsigned === '' || unsigned === '.') return negative ? '-' : ''
    const [intPart, decPart] = unsigned.split('.')
    const int = groupThousands(intPart || '0')
    return `${negative ? '-' : ''}${int}${decPart !== undefined ? `.${decPart}` : ''}`
}

function toNumber(str) {
    const s = parse(str)
    if (s === '' || s === '.' || s === '-') return 0
    const n = Number(s)
    return Number.isFinite(n) ? n : 0
}

// While editing we render the live grouped string from `raw`;
// while idle we show the external (numeric) model value, formatted.
const display = computed(() => {
    if (focused.value) return group(raw.value)
    if (props.modelValue === null || props.modelValue === undefined || props.modelValue === '') return ''
    const n = Number(props.modelValue)
    if (! Number.isFinite(n)) return ''
    if (props.blankZero && n === 0) return ''
    const negative = n < 0
    const [ip, dp] = String(Math.abs(n)).split('.')
    const int = groupThousands(ip)
    return `${negative ? '-' : ''}${dp !== undefined ? `${int}.${dp}` : int}`
})

function digitsBefore(text, index) {
    return text.slice(0, index).replace(/,/g, '').length
}

function caretForDigits(text, count) {
    let seen = 0
    for (let i = 0; i <= text.length; i++) {
        if (seen >= count) return i
        if (text[i] !== ',') seen++
    }
    return text.length
}

function onInput(event) {
    const el = event.target
    const realBefore = digitsBefore(el.value, el.selectionStart ?? el.value.length)
    raw.value = parse(el.value)
    const formatted = group(raw.value)
    el.value = formatted
    const caret = caretForDigits(formatted, realBefore)
    el.setSelectionRange(caret, caret)
    emit('update:modelValue', toNumber(raw.value))
}

function onFocus(event) {
    focused.value = true
    raw.value = props.modelValue === null || props.modelValue === undefined || props.modelValue === ''
        ? ''
        : String(props.modelValue)
    // format the incoming numeric value (e.g. 1250 -> 1,250) before the caret call
    requestAnimationFrame(() => event.target.setSelectionRange(event.target.value.length, event.target.value.length))
}

function onBlur() {
    focused.value = false
    emit('update:modelValue', toNumber(raw.value))
}
</script>
