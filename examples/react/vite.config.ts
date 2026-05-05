import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()],
  publicDir: '../assets',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/petx-[hash].js',
        chunkFileNames: 'assets/petx-[hash].js',
        assetFileNames: 'assets/petx-[hash][extname]',
      },
    },
  },
});
