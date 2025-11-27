import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0', // Allow external connections (for Docker)
    watch: {
      usePolling: true, // Enable polling for Docker hot reload
      interval: 2000, // Poll every 1 second
    },
    hmr: {
      // Hot Module Replacement config for Docker
      clientPort: 5173,
    },
  },
  preview: {
    port: 5173,
  },
});
