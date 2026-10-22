// Behaviour tests. Contract tests in standard/gate/tests run against every system (imported as
// '@system'); a system's own tests (modules, extras) live in systems/<name>/registry/test.
// Run: SYSTEM=motion npx vitest run -c standard/gate/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const system = process.env.SYSTEM ?? 'motion';

export default defineConfig({
  plugins: [react()],
  root,
  resolve: { alias: { '@system': path.join(root, 'systems', system, 'registry/src/index.ts') } },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: [path.join(root, 'standard/gate/tests/setup.ts')],
    include: ['standard/gate/tests/**/*.test.tsx', `systems/${system}/registry/test/**/*.test.tsx`],
    css: false,
    testTimeout: 10000,
    // Same cap as the gate's browser pools (GATE_CONCURRENCY, default a quarter of the cores).
    maxWorkers: Math.max(1, Number(process.env.GATE_CONCURRENCY) || Math.max(2, Math.floor(os.cpus().length / 4))),
    minWorkers: 1,
    reporters: ['default', ['json', { outputFile: `.scratch/gate/${system}/vitest.json` }]],
  },
});
