import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  root: resolve('src'),
  publicDir: resolve('public'),
  base: process.env.BASE_PATH || '/',
  server: { host: true, strictPort: true },
  build: {
    outDir: resolve('dist'),
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/three/')) return 'three';
        },
      },
    },
  },
});
