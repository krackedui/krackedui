import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // In the monorepo, use @krackedui/motion source (hot reload); published consumers get the built dist.
  resolve: { alias: [{ find: /^@krackedui\/motion$/, replacement: fileURLToPath(new URL('../registry/src/index.ts', import.meta.url)) }] },
  server: { port: 3001, strictPort: true },
});
