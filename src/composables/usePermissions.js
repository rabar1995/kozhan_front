import { useAuthStore } from '../stores/auth'

const MANAGER_ACTIONS = [
    'view-dashboard',
    'view-remittances',
    'create-remittance',
    'complete-remittance',
    'view-agents',
    'create-agent',
    'view-shared-accounts',
    'view-expenses',
    'record-expense',
]

export function usePermissions() {
    const auth = useAuthStore()

    const can = (action) => {
        if (! auth.user) return false
        if (auth.isOwner) return true
        return MANAGER_ACTIONS.includes(action)
    }

    return {
        can,
        isOwner: auth.isOwner,
        isManager: auth.isManager,
    }
}
