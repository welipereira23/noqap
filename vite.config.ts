import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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