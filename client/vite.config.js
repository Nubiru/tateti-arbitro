import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '127.0.0.1', // Force IPv4
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4000', // Use IPv4 explicitly
        changeOrigin: true,
      },
      '/api/stream': {
        target: 'http://127.0.0.1:4000', // Use IPv4 explicitly
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    outDir: '../public',
    emptyOutDir: false,
  },
});
