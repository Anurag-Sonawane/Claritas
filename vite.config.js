import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react-router')) return 'react-router';
            if (id.includes('react-dom')) return 'react-dom';
            if (id.includes('react')) return 'react';
            if (id.includes('recharts')) return 'recharts';
            if (id.includes('framer-motion')) return 'framer';
            if (id.includes('@tiptap')) return 'tiptap';
            return 'vendor';
          }
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.js',
    pool: 'threads',
    fileParallelism: false
  }
})
