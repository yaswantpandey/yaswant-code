import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          // Local PHP server for /api (e.g. `php -S 127.0.0.1:8000 -t public`)
          target: env.API_PROXY_TARGET || 'http://127.0.0.1',
          changeOrigin: true,
        },
      },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      target: 'es2022',
      cssCodeSplit: true,
      minify: 'esbuild',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (
                id.includes('firebase') ||
                id.includes('@firebase') ||
                id.includes('re2js')
              ) {
                return 'vendor-firebase';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('@google/genai')) {
                return 'vendor-ai';
              }
              if (
                id.includes('react') ||
                id.includes('react-dom') ||
                id.includes('scheduler')
              ) {
                return 'vendor-framework';
              }
            }
          },
        },
      },
    },
  };
});
