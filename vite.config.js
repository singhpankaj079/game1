import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: '/games/game1/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '/src'),
    },
  },
  server: {
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
})
