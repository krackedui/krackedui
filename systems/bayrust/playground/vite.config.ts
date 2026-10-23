import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// No Tailwind: Bayrust's stylesheet is plain CSS, so the lab imports it the way a consumer does.
// Inside the monorepo the package resolves to source, so a change to a component reloads here.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: /^@krackedui\/bayrust$/, replacement: fileURLToPath(new URL('../registry/src/index.ts', import.meta.url)) }],
  },
  server: { port: 3002, strictPort: true },
});
