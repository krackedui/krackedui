import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base './' lets the built app run from any sub-path (e.g. /fintech/).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
});
