import { createI18n } from 'vue-i18n'
import en from '../locales/en.json'
import ckb from '../locales/ckb.json'

const LOCALE_KEY = 'kozhan_locale'

export const locales = [
    { code: 'en', label: 'English', dir: 'ltr' },
    { code: 'ckb', label: 'کوردی', dir: 'rtl' },
]

function getStoredLocale() {
    const stored = localStorage.getItem(LOCALE_KEY)
    return locales.some((l) => l.code === stored) ? stored : 'en'
}

export function localeDir(locale) {
    return locales.find((l) => l.code === locale)?.dir || 'ltr'
}

export function applyDocumentLocale(locale) {
    document.documentElement.lang = locale
    document.documentElement.dir = localeDir(locale)
}

export function setLocale(locale) {
    if (! locales.some((l) => l.code === locale)) return
    i18n.global.locale.value = locale
    localStorage.setItem(LOCALE_KEY, locale)
    applyDocumentLocale(locale)
}

const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: getStoredLocale(),
    fallbackLocale: 'en',
    messages: { en, ckb },
})

applyDocumentLocale(i18n.global.locale.value)

export { i18n }

export default i18n
