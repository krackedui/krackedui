// Write a system's docs page titles and descriptions to plain JSON, so the docs app can render
// <title>/<meta> on the server without loading the (interactive) docs registry there.
// Usage: node tooling/pipeline/page-meta.mjs [system=motion]  → systems/<system>/docs/generated/pages.json
import fs from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const system = process.argv[2] ?? 'motion';
const root = path.resolve('.');
const srcDir = path.join(root, 'systems', system, 'registry', 'src');
const pkgName = JSON.parse(await fs.readFile(path.join(root, 'systems', system, 'registry', 'package.json'), 'utf8')).name;
const tmp = path.join(root, '.scratch', 'page-meta', system);
await fs.mkdir(tmp, { recursive: true });

const stub = path.join(tmp, 'next-link.mjs');
await fs.writeFile(stub, 'export default function Link() { return null; }\n');
const outfile = path.join(tmp, 'registry.mjs');
await build({
  entryPoints: [path.join(root, 'systems', system, 'docs', 'registry.tsx')],
  bundle: true, platform: 'node', format: 'esm', outfile, jsx: 'automatic', packages: 'external',
  loader: { '.css': 'empty' }, logLevel: 'error',
  alias: { [pkgName]: path.join(srcDir, 'index.ts'), 'next/link': stub },
});
const { default: registry } = await import(`${outfile}?t=${Date.now()}`);

const pages = Object.fromEntries(
  Object.entries(registry.pages)
    .map(([slug, page]) => [slug, { title: page.title, ...(page.description ? { description: page.description } : {}) }])
    .sort(([a], [b]) => a.localeCompare(b)),
);
const out = { name: registry.name, tagline: registry.tagline, pages };
const file = path.join(root, 'systems', system, 'docs', 'generated', 'pages.json');
await fs.writeFile(file, JSON.stringify(out, null, 1) + '\n');
console.log(`${Object.keys(pages).length} page titles → ${path.relative(root, file)}`);
