import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const stubs = path.resolve(__dirname, './src/_stubs')

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Backend SDKs redirected to local no-op stubs at build time.
      // Source code keeps the original imports untouched, which means re-enabling
      // a real backend later is a one-line change in this file.
      'firebase/app': path.resolve(stubs, 'firebase-app.js'),
      'firebase/auth': path.resolve(stubs, 'firebase-auth.js'),
      'firebase/database': path.resolve(stubs, 'firebase-database.js'),
      'firebase/firestore': path.resolve(stubs, 'firebase-firestore.js'),
      'firebase/storage': path.resolve(stubs, 'firebase-storage.js'),
      '@supabase/supabase-js': path.resolve(stubs, 'supabase.js'),
      'shopify-buy': path.resolve(stubs, 'shopify-buy.js'),
    },
  },
  server: { port: 3000, open: false },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})
