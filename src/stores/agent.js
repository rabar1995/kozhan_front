import { defineStore } from 'pinia'
import { api } from '../api/client'

export const useAgentStore = defineStore('agent', {
    state: () => ({
        agents: [],
        loading: false,
    }),
    actions: {
        async fetchAgents(params = {}) {
            this.loading = true
            try {
                const res = await api.get('/agents', { params })
                this.agents = res.data.data
                return res.data
            } finally {
                this.loading = false
            }
        },
        async createAgent(payload) {
            const res = await api.post('/agents', payload)
            await this.fetchAgents()
            return res.data
        },
        async updateAgent(id, payload) {
            const res = await api.patch(`/agents/${id}`, payload)
            await this.fetchAgents()
            return res.data
        },
        balance(id) {
            return api.get(`/agents/${id}/balance`)
        },
        ledger(id, params = {}) {
            return api.get(`/agents/${id}/ledger`, { params })
        },
    },
})
