import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'react-i18next',
      'i18next-browser-languagedetector',
      'i18next-http-backend'
    ],
  },
  server: {
    host: 'localhost',  // 🔧 ИСПРАВЛЕНО: localhost вместо 0.0.0.0
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
});