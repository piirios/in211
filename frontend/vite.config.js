import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Port du serveur backend (modifié de 8080 à 3001)
        changeOrigin: true,
        // Supprimer /api du chemin lors de la redirection vers le backend
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: { outDir: 'build' },
});
