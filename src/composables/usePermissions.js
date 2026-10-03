import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

// Mirrors the backend: only routes outside `role:owner` are open to managers.
const MANAGER_ACTIONS = [
    'view-dashboard',
    'view-remittances',
    'create-remittance',
    'complete-remittance',
    'view-agents',
    'create-agent',
    'edit-agent',
    'view-shared-accounts',
    'view-expenses',
    'record-expense',
]

// Owner-only actions are implicit (auth.isOwner returns true for everything),
// but listing them makes the intent explicit in components.
export const OWNER_ACTIONS = [
    'manage-accounts',
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
        // Reactive: updates once /me has loaded.
        isOwner: computed(() => auth.isOwner),
        isManager: computed(() => auth.isManager),
    }
}
