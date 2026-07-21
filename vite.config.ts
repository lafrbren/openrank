import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'OpenRank — Ranking Shorts Studio',
        short_name: 'OpenRank',
        description: 'Create viral ranking shorts locally: import clips, title, trim, crop, export.',
        theme_color: '#ffffff',
        background_color: '#eceef2',
        display: 'standalone',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // never cache media or api — they're local and big
        navigateFallbackDenylist: [/^\/api/, /^\/media/],
        runtimeCaching: []
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5175',
      '/media': 'http://localhost:5175'
    }
  }
})
