import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        // Le backend tourne sur le port 8001
        target: 'http://localhost:8001',
        changeOrigin: true,
      }
    }
  }
})



