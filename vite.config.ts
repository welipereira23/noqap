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
        name: 'Bolt Time Tracking',
        short_name: 'Bolt',
        description: 'Sistema de controle de ponto e gestão de tempo',
        theme_color: '#000000',
        icons: [
          {
            src: 'favicon-32x32.png',
            sizes: '32x32',
            type: 'image/png'
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png'
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