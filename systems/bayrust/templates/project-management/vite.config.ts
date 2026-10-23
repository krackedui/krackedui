import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base: './'` so the build works wherever it is served from: the gate previews it under a path,
// and it ships at bayrust.krackedui.com/fintech.
export default defineConfig({ plugins: [react()], base: './', server: { port: 3102, strictPort: true } });
