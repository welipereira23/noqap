import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'NoQap - Controle de Horas',
        short_name: 'NoQap',
        description: 'Sistema de controle de ponto e gestão de tempo',
        start_url: '/',
        display: 'standalone',
        background_color: '#4F46E5',
        theme_color: '#4F46E5',
        icons: [
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'maskable-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  build: {
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1000
  },
  resolve: {
    alias: {
      'jspdf': resolve(__dirname, 'node_modules/jspdf/dist/jspdf.es.min.js')
    }
  }
})