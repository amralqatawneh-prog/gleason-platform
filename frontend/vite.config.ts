import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { pwaPrecache } from './pwaPrecache';

export default defineConfig({
  plugins: [react(), pwaPrecache()],
  server: { port: 5173 },
  preview: { port: 4173 },
  build: { sourcemap: true },
});
