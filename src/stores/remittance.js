import { defineStore } from 'pinia'
import { api } from '../api/client'

export const useRemittanceStore = defineStore('remittance', {
    state: () => ({
        items: [],
        meta: null,
        loading: false,
    }),
    actions: {
        async fetch(params = {}) {
            this.loading = true
            try {
                const res = await api.get('/remittances', { params })
                this.items = res.data.data.data
                this.meta = res.data.data
                return res.data
            } finally {
                this.loading = false
            }
        },
        async fetchPending(params = {}) {
            this.loading = true
            try {
                const res = await api.get('/remittances/pending', { params })
                this.items = res.data.data.data
                this.meta = res.data.data
                return res.data
            } finally {
                this.loading = false
            }
        },
        async fetchOne(id) {
            const res = await api.get(`/remittances/${id}`)
            return res.data.data
        },
        async createIncoming(payload) {
            const res = await api.post('/remittances/incoming', payload)
            return res.data
        },
        async createOutgoing(payload) {
            const res = await api.post('/remittances/outgoing', payload)
            return res.data
        },
        async complete(id, payload) {
            const res = await api.patch(`/remittances/${id}/complete`, payload)
            await this.fetchPending()
            return res.data
        },
        async cancel(id, reason) {
            const res = await api.patch(`/remittances/${id}/cancel`, { reason })
            return res.data
        },
    },
})
