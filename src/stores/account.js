import { defineStore } from 'pinia'
import { api } from '../api/client'

export const useAccountStore = defineStore('account', {
    state: () => ({
        accounts: [],
        balances: [],
        loading: false,
    }),
    actions: {
        async fetchAccounts(params = {}) {
            this.loading = true
            try {
                const res = await api.get('/accounts', { params })
                this.accounts = res.data.data
                return res.data
            } finally {
                this.loading = false
            }
        },
        async fetchBalances() {
            const res = await api.get('/accounts/balances')
            this.balances = res.data.data
            return res.data
        },
        async createAccount(payload) {
            const res = await api.post('/accounts', payload)
            return res.data
        },
        async updateAccount(id, payload) {
            const res = await api.put(`/accounts/${id}`, payload)
            return res.data
        },
        ledger(id, params = {}) {
            return api.get(`/accounts/${id}/ledger`, { params })
        },
    },
})
