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
    open: true,
    proxy: {
      '/api/excalidraw': {
        target: 'https://libraries.excalidraw.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/excalidraw/, ''),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      },
    },
  },
  optimizeDeps: {
    include: ['fabric', 'zustand', 'lucide-react']
  }
})