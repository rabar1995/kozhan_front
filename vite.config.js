import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        vue(),
        tailwindcss(),
        VitePWA({
            // 'prompt': the app shows "New version available — Reload" (PwaPrompt.vue)
            registerType: 'prompt',
            injectRegister: 'auto',
            includeAssets: [
                'favicon.png',
                'apple-touch-icon.png',
                'pwa-192x192.png',
                'pwa-512x512.png',
                'pwa-maskable-512x512.png',
                'kozhanfx.png',
            ],
            manifest: {
                name: 'Kozhan Co - Money Exchange & Remittance',
                short_name: 'Kozhan Co',
                description: 'Professional Currency Exchange & Hawala Remittance Management System',
                theme_color: '#4f46e5',
                background_color: '#0f172a',
                display: 'standalone',
                orientation: 'any',
                dir: 'auto',
                start_url: '/',
                scope: '/',
                icons: [
                    {
                        src: '/pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: '/pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: '/pwa-maskable-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable any',
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern: /\/api\/currencies/i,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'api-currencies-cache',
                            expiration: {
                                maxEntries: 20,
                                maxAgeSeconds: 60 * 60 * 24, // 1 day
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        // Network first; cached data is only used when the network is down/very slow,
                        // so balances are not shown stale on a normal connection.
                        urlPattern: /\/api\/(dashboard|accounts|agents)/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-dynamic-cache',
                            networkTimeoutSeconds: 10,
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 12, // 12 hours
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                ],
            },
            devOptions: {
                enabled: true,
                type: 'module',
            },
        }),
    ],
    server: {
        port: 5173,
    },
})
