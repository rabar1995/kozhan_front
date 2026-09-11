<template>
    <div class="w-full max-w-md">
        <div class="text-center mb-8 relative">
            <div class="flex justify-end mb-3">
                <LanguageSwitcher dark />
            </div>
            <img src="/kozhanfx.png" alt="Kozhan FX" class="w-20 h-20 mx-auto mb-3 rounded-2xl shadow-lg" />
            <h1 class="text-3xl font-bold text-white">Kozhan FX</h1>
            <p class="text-slate-400 mt-1 text-sm">{{ $t('auth.tagline') }}</p>
        </div>

        <div class="bg-white rounded-2xl shadow-2xl p-8">
            <h2 class="text-lg font-semibold text-gray-900 mb-6">{{ $t('auth.signInTitle') }}</h2>

            <div v-if="error" class="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {{ error }}
            </div>

            <form class="space-y-4" @submit.prevent="submit">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('auth.emailOrUsername') }}</label>
                    <input
                        v-model="form.email"
                        type="text"
                        required
                        autocomplete="username"
                        class="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="owner@exchange.com"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('auth.password') }}</label>
                    <input
                        v-model="form.password"
                        type="password"
                        required
                        autocomplete="current-password"
                        class="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="••••••••"
                    />
                </div>
                <button
                    type="submit"
                    :disabled="loading"
                    class="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                    {{ loading ? $t('auth.signingIn') : $t('auth.signIn') }}
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { apiError } from '../api/client'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function submit() {
    loading.value = true
    error.value = ''
    try {
        await auth.login(form)
        router.push(route.query.redirect || '/dashboard')
    } catch (e) {
        error.value = apiError(e).message
    } finally {
        loading.value = false
    }
}
</script>
