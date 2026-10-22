// Compile every code snippet shown in a system's docs (hero, examples, file blocks) as a standalone
// .tsx module against the real package. Catches missing imports, wrong props, typos.
// Usage: node standard/gate/checks/check-snippets.mjs <system>   (writes .scratch/snippets/<system>/*)
import { build } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const system = process.argv[2] ?? 'motion';
const root = path.resolve('.');
const out = path.join(root, '.scratch', 'snippets', system);
const pkgName = JSON.parse(await fs.readFile(path.join(root, 'systems', system, 'registry', 'package.json'), 'utf8')).name;
await fs.rm(out, { recursive: true, force: true });
await fs.mkdir(out, { recursive: true });

// Load the registry in Node (bundle it, externalize packages).
const bundle = path.join(out, '_registry.mjs');
const stub = path.join(out, '_next-link-stub.mjs');
await fs.writeFile(stub, 'export default function Link(p) { return null; }\n');
await build({
  entryPoints: [path.join(root, 'systems', system, 'docs', 'registry.tsx')],
  bundle: true, platform: 'node', format: 'esm', outfile: bundle, jsx: 'automatic',
  packages: 'external', external: [], loader: { '.css': 'empty' }, logLevel: 'error',
  alias: { [pkgName]: path.join(root, 'systems', system, 'registry', 'src', 'index.ts'), 'next/link': stub },
});
const { default: registry } = await import(bundle);
const snipBundle = path.join(out, '_snippet.mjs');
await build({ entryPoints: [path.join(root, 'apps', 'docs', 'lib', 'snippet.ts')], bundle: true, platform: 'node', format: 'esm', outfile: snipBundle, logLevel: 'error' });
const { completeSnippet } = await import(snipBundle);

const snippets = [];
for (const [slug, page] of Object.entries(registry.pages)) {
  const add = (code, label) => code && snippets.push({ slug, label, code });
  add(page.hero?.code, 'hero');
  (page.examples ?? []).forEach((e, i) => add(e.code, `ex${i}-${e.title}`));
  for (const s of page.sections ?? []) for (const b of s.blocks ?? []) {
    if (b && typeof b === 'object' && 'example' in b) add(b.example?.code, `sec-${b.example?.title}`);
  }
}
const files = [];
for (const [i, s] of snippets.entries()) {
  const name = `${String(i).padStart(4, '0')}_${s.slug.replace(/\W+/g, '-')}.tsx`;
  // Exactly what the docs display and copy.
  const body = completeSnippet(s.code, { packageName: registry.packageName, exports: registry.exports, name: `${s.label.replace(/^ex\d+-|^sec-/, '')} example` });
  await fs.writeFile(path.join(out, name), body);
  files.push({ name, ...s });
}
await fs.writeFile(path.join(out, 'tsconfig.json'), JSON.stringify({
  compilerOptions: {
    target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler', jsx: 'react-jsx', strict: true, noEmit: true,
    skipLibCheck: true, isolatedModules: true, lib: ['ES2022', 'DOM', 'DOM.Iterable'], noUnusedLocals: false,
    typeRoots: [path.join(root, 'node_modules/@types')],
    paths: { [pkgName]: [path.join(root, 'systems', system, 'registry', 'src', 'index.ts')], 'react': [path.join(root, 'node_modules/@types/react')] },
  },
  include: ['*.tsx'],
}, null, 1));
let report = '';
try { execFileSync('npx', ['tsc', '-p', out], { encoding: 'utf8' }); } catch (e) { report = e.stdout; }
const byFile = {};
for (const line of report.split('\n')) {
  const m = line.match(/(\d{4}_[^/(]+)\.tsx\(\d+,\d+\): error (TS\d+): (.*)$/);
  if (m) (byFile[m[1]] ??= []).push(`${m[2]} ${m[3]}`);
}
const bad = Object.keys(byFile);
console.log(`${files.length} snippets checked, ${bad.length} with errors`);
await fs.writeFile(path.join(out, '_report.json'), JSON.stringify(byFile, null, 1));
const kinds = {};
for (const errs of Object.values(byFile)) for (const e of errs) { const k = e.replace(/'[^']*'/g, "'…'").slice(0, 80); kinds[k] = (kinds[k] ?? 0) + 1; }
console.log(Object.entries(kinds).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k, n]) => `${n}× ${k}`).join('\n'));
process.exitCode = bad.length ? 1 : 0;
