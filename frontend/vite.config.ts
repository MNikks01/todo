import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config. Path alias `@` → src mirrors tsconfig paths.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  server: {
    port: 5173,
  },
});
