import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAgentStore } from '../stores/agent'

/** Agent picker options with a friendly "which currencies" hint. */
export function useAgentOptions() {
    const { t } = useI18n()
    const agentStore = useAgentStore()

    function currencyHint(a) {
        if (a.allow_all_currencies) return t('agents.anyCurrency')
        const codes = (a.currency_accounts || []).map((p) => p.currency?.code).filter(Boolean)
        return codes.length ? codes.join(', ') : (a.balance_currency?.code ?? '')
    }

    return computed(() => agentStore.agents.map((a) => ({ ...a, sublabel: currencyHint(a) })))
}
