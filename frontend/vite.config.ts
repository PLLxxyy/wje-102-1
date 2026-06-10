import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 28602,
    proxy: {
      '/api': {
        target: 'http://localhost:29602',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:29602',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
