import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
    {
        path: '/login',
        component: () => import('../layouts/AuthLayout.vue'),
        children: [
            { path: '', name: 'login', component: () => import('../views/Login.vue'), meta: { guest: true, title: 'nav.login' } },
        ],
    },
    {
        path: '/',
        component: () => import('../layouts/AppLayout.vue'),
        children: [
            { path: '', redirect: '/dashboard' },
            { path: 'dashboard', name: 'dashboard', component: () => import('../views/Dashboard.vue'), meta: { title: 'nav.dashboard' } },
            { path: 'remittances', name: 'remittances', component: () => import('../views/RemittanceList.vue'), meta: { title: 'nav.remittances' } },
            { path: 'remittances/pending', name: 'remittances-pending', component: () => import('../views/PendingList.vue'), meta: { title: 'nav.pendingPayouts' } },
            { path: 'remittances/incoming', name: 'remittances-incoming', component: () => import('../views/IncomingForm.vue'), meta: { title: 'nav.bookIncoming' } },
            { path: 'remittances/outgoing', name: 'remittances-outgoing', component: () => import('../views/OutgoingForm.vue'), meta: { title: 'nav.bookOutgoing' } },
            { path: 'agents', name: 'agents', component: () => import('../views/AgentList.vue'), meta: { title: 'nav.agents' } },
            { path: 'accounts', name: 'accounts', component: () => import('../views/AccountList.vue'), meta: { title: 'nav.wallets', role: 'owner' } },
            { path: 'private-wallets', name: 'private-wallets', component: () => import('../views/PrivateWallets.vue'), meta: { title: 'nav.privateWallets', role: 'owner' } },
            { path: 'expenses', name: 'expenses', component: () => import('../views/ExpenseList.vue'), meta: { title: 'nav.expenses' } },
            { path: 'expenses/new', name: 'expenses-new', component: () => import('../views/ExpenseForm.vue'), meta: { title: 'nav.registerExpense' } },
            { path: 'reports/profit-loss', name: 'profit-loss', component: () => import('../views/ProfitLoss.vue'), meta: { title: 'nav.profitLoss', role: 'owner' } },
            { path: 'transfers', name: 'transfers', component: () => import('../views/TransferList.vue'), meta: { title: 'nav.transfers', role: 'owner' } },
            { path: 'users', name: 'users', component: () => import('../views/UserList.vue'), meta: { title: 'nav.userManagement', role: 'owner' } },
            { path: 'exchange-deals', name: 'exchange-deals', component: () => import('../views/ExchangeDeals.vue'), meta: { title: 'nav.exchangeDeals', role: 'owner' } },
            { path: 'audit-logs', name: 'audit-logs', component: () => import('../views/AuditLogs.vue'), meta: { title: 'nav.auditLogs', role: 'owner' } },
        ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach(async (to) => {
    const auth = useAuthStore()

    if (to.meta.guest) {
        return auth.isAuthenticated ? '/dashboard' : true
    }

    if (! auth.isAuthenticated) {
        return { name: 'login', query: { redirect: to.fullPath } }
    }

    if (! auth.user) {
        await auth.fetchUser()
    }

    if (to.meta.role && auth.user?.role !== to.meta.role) {
        return '/dashboard'
    }

    return true
})

export default router
