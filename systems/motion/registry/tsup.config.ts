import { defineConfig } from 'tsup';

// JS + types build of @krackedui/motion (see build/build.mjs for the full pipeline):
//   client.js       every component/hook; build.mjs prepends "use client"
//   server-safe.js  pure helpers/data (no React), callable from server components
//   index.js        written by build.mjs: re-exports client.js + server-safe names
// Shared code is split into chunks; React, Radix and the class helpers stay external.
export default defineConfig({
  entry: { client: 'src/index.ts', 'server-safe': 'src/server-safe.ts' },
  format: ['esm'],
  splitting: true,
  dts: true,
  sourcemap: true,
  clean: false,
  target: 'es2022',
  treeshake: false,
  external: ['react', 'react-dom', 'react/jsx-runtime', 'radix-ui', 'tailwind-merge', 'tailwind-variants'],
});
