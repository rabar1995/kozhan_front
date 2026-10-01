<template>
    <div class="w-full max-w-md">
        <div class="text-center mb-8 relative">
            <div class="flex justify-end mb-3">
                <LanguageSwitcher dark />
            </div>
            <img src="/kozhanfx.png" alt="Kozhan Co" class="w-20 h-20 mx-auto mb-3 rounded-2xl shadow-lg" />
            <h1 class="text-3xl font-bold text-white">Kozhan Co</h1>
            <p class="text-slate-400 mt-1 text-sm">{{ $t('auth.tagline') }}</p>
        </div>

        <div class="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
            <h2 class="text-lg font-semibold text-gray-900 mb-6">{{ $t('auth.signInTitle') }}</h2>

            <Alert v-if="error" type="error" class="mb-4">{{ error }}</Alert>

            <form class="space-y-4" @submit.prevent="submit">
                <div>
                    <label class="form-label" for="login-id">{{ $t('auth.phoneOrUsername') }}</label>
                    <!-- Text (not tel) so usernames can be typed too -->
                    <input
                        id="login-id"
                        v-model="form.phone"
                        type="text"
                        required
                        autocomplete="username"
                        autocapitalize="off"
                        spellcheck="false"
                        dir="ltr"
                        class="form-input"
                        placeholder="07701234567"
                    />
                </div>
                <div>
                    <label class="form-label" for="login-pass">{{ $t('auth.password') }}</label>
                    <div class="relative">
                        <input
                            id="login-pass"
                            v-model="form.password"
                            :type="showPassword ? 'text' : 'password'"
                            required
                            autocomplete="current-password"
                            class="form-input pe-12"
                        />
                        <button
                            type="button"
                            class="absolute inset-y-0 end-0 px-3 text-xs font-medium text-gray-500 hover:text-gray-800"
                            :aria-label="showPassword ? $t('auth.hidePassword') : $t('auth.showPassword')"
                            @click="showPassword = !showPassword"
                        >{{ showPassword ? $t('common.hide') : $t('common.view') }}</button>
                    </div>
                </div>
                <button type="submit" :disabled="loading" class="btn btn-primary btn-block">
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
import Alert from '../components/ui/Alert.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({ phone: '', password: '' })
const showPassword = ref(false)
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
