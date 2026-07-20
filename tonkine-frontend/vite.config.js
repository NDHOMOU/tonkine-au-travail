import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Proxy vers le backend Spring Boot (port 8080)
    proxy: {
      '/api': {
        target:       'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
});
