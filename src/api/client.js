import axios from 'axios'
import i18n from '../i18n'

const TOKEN_KEY = 'kozhan_token'

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8010/api',
    headers: { Accept: 'application/json' },
})

export function getToken() {
    return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token)
    } else {
        localStorage.removeItem(TOKEN_KEY)
    }
}

api.interceptors.request.use((config) => {
    const token = getToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status
        const url = error.config?.url || ''
        if (status === 401 && !url.includes('/login') && !window.location.pathname.startsWith('/login')) {
            setToken(null)
            window.location.assign('/login')
        }
        return Promise.reject(error)
    },
)

export function apiError(error) {
    const data = error.response?.data
    return {
        message: data?.message || error.message || i18n.global.t('errors.unexpected'),
        errors: data?.data?.errors || {},
        status: error.response?.status,
    }
}
