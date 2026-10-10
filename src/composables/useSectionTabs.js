import { computed } from 'vue'
import { usePermissions } from './usePermissions'

/** Tabs shown at the top of every Remittances page. */
export function useRemittanceTabs() {
    const { can } = usePermissions()
    return computed(() => [
        { to: '/remittances', label: 'tabs.allRemittances' },
        { to: '/remittances/pending', label: 'tabs.toPay' },
        { to: '/remittances/incoming', label: 'tabs.newIncoming', show: can('create-remittance') },
        { to: '/remittances/outgoing', label: 'tabs.newOutgoing', show: can('create-remittance') },
    ])
}


