import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,        // Important for accessing from localhost
    open: true         // Auto open browser
  },
  build: {
    // Code-split vendor libraries from app code for faster cache reuse
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':    ['react', 'react-dom'],
          'vendor-charts':   ['recharts'],
          'vendor-socket':   ['socket.io-client'],
          'vendor-icons':    ['lucide-react'],
        },
      },
    },
    // Raise warning threshold slightly — 600 kB per chunk is fine for this app
    chunkSizeWarningLimit: 600,
  },
})