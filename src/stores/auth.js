import { defineStore } from 'pinia'
import { api, setToken, getToken } from '../api/client'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: getToken(),
        user: null,
    }),
    getters: {
        isAuthenticated: (state) => !! state.token,
        isOwner: (state) => state.user?.role === 'owner',
        isManager: (state) => state.user?.role === 'office_manager',
        userName: (state) => state.user?.name || '',
        officeName: (state) => state.user?.office?.name || '',
    },
    actions: {
        async login(credentials) {
            const res = await api.post('/login', credentials)
            this.token = res.data.data.token
            this.user = res.data.data.user
            setToken(this.token)
            return res.data
        },
        async fetchUser() {
            if (! this.token) return
            try {
                const res = await api.get('/me')
                this.user = res.data.data
            } catch (error) {
                if (error.response?.status === 401) {
                    this.forceLogout()
                }
            }
        },
        async logout() {
            try {
                await api.post('/logout')
            } catch (error) {
                // token may already be revoked
            }
            this.forceLogout()
        },
        forceLogout() {
            setToken(null)
            this.token = null
            this.user = null
        },
    },
})
