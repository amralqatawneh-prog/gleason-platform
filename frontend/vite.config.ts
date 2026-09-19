import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { pwaPrecache } from './pwaPrecache';
import { readFileSync } from 'node:fs';

export default defineConfig({
  plugins: [react(), pwaPrecache()],
  define: { __APP_VERSION__: JSON.stringify(JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version) },
  server: { port: 5173 },
  preview: { port: 4173 },
  build: { sourcemap: true },
});
