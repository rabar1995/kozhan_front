<template>
    <router-view />
    <PwaPrompt />
    <ToastNotification />
    <ConfirmDialog />
</template>

<script setup>
import { onMounted } from 'vue'
import PwaPrompt from './components/PwaPrompt.vue'
import ToastNotification from './components/ToastNotification.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import { useTheme } from './composables/useTheme'

const { initTheme } = useTheme()
initTheme()
onMounted(() => {
    initTheme()
})
</script>
