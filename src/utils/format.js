import i18n from '../i18n'

function dateLocale() {
    return i18n.global.locale.value === 'ckb' ? 'ckb' : 'en-GB'
}

export function money(value, currency = '') {
    const n = Number(value ?? 0)
    const formatted = n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 4 })
    return currency ? `${formatted} ${currency}` : formatted
}

export function dateTime(value) {
    if (! value) return '-'
    return new Date(value).toLocaleString(dateLocale(), {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
}

export function dateOnly(value) {
    if (! value) return '-'
    return new Date(value).toLocaleDateString(dateLocale(), { day: '2-digit', month: 'short', year: 'numeric' })
}

export const statusClass = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
}

export const classificationClass = {
    debtor: 'bg-green-100 text-green-800',
    creditor: 'bg-red-100 text-red-800',
    settled: 'bg-gray-100 text-gray-700',
}

export const directionClass = {
    incoming: 'bg-blue-100 text-blue-800',
    outgoing: 'bg-purple-100 text-purple-800',
}
