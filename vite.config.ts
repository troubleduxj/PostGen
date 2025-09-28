import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          fabric: ['fabric'],
          utils: ['zustand', 'clsx', 'file-saver']
        }
      }
    }
  },
  server: {
    port: 3001,
    open: true
  },
  optimizeDeps: {
    include: ['fabric', 'zustand', 'lucide-react']
  }
})