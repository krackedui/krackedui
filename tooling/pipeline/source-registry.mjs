// Build a copy-paste source registry for a system package, in the shadcn registry-item format,
// so any project can pull a component with all its files:
//   npx shadcn@latest add http://localhost:3002/r/<system>/<item>.json
// One item per source file (plus a "foundation" item: styles, lib, icons). Each item lists the
// npm packages it needs and the registry items it imports (resolved transitively by the CLI).
// Usage: node tooling/pipeline/source-registry.mjs <system>  → apps/docs/public/r/<system>/*.json
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const system = process.argv[2] ?? 'motion';
const src = path.join(ROOT, 'systems', system, 'registry', 'src');
const pkg = JSON.parse(await fs.readFile(path.join(ROOT, 'systems', system, 'registry', 'package.json'), 'utf8'));
const out = path.join(ROOT, 'apps', 'docs', 'public', 'r', system);
const baseUrl = process.env.REGISTRY_URL ?? `http://localhost:3002/r/${system}`;
const target = `components/motion-${system}`;

async function walk(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (/\.(tsx?|css)$/.test(e.name)) out.push(p);
  }
  return out;
}

const files = (await walk(src)).map((f) => path.relative(src, f)).sort();
const FOUNDATION = (f) => f.startsWith('styles/') || f.startsWith('lib/') || f.startsWith('icons/');
const BARREL = (f) => /(^|\/)index\.ts$/.test(f) && !FOUNDATION(f);
const itemName = (f) => f === 'index.ts' ? 'all' : BARREL(f) ? path.dirname(f) : f.replace(/\.(tsx?|css)$/, '').replace(/[/\\]/g, '-').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

const content = {};
for (const f of files) content[f] = await fs.readFile(path.join(src, f), 'utf8');

function resolveImport(from, spec) {
  const base = path.normalize(path.join(path.dirname(from), spec));
  for (const ext of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) if (content[base + ext] !== undefined) return base + ext;
  return null;
}
const npmDeps = Object.keys(pkg.dependencies ?? {});
const pinned = (names) => names.map((n) => `${n}@${pkg.dependencies[n]}`); // exact versions the system was verified with
function depsOf(f) {
  const local = new Set(), npm = new Set();
  for (const m of content[f].matchAll(/(?:import|export)[^'"]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]/g)) {
    const spec = m[1] ?? m[2];
    if (spec.startsWith('.')) { const r = resolveImport(f, spec); if (r) local.add(r); }
    else { const name = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]; if (npmDeps.includes(name)) npm.add(name); }
  }
  return { local: [...local], npm: [...npm] };
}

await fs.rm(out, { recursive: true, force: true });
await fs.mkdir(out, { recursive: true });

const file = (f) => ({ path: `${target}/${f}`, type: f.endsWith('.css') ? 'registry:file' : 'registry:ui', target: `${target}/${f}`, content: content[f] });
const index = [];

// foundation: styles + lib + icons + barrels (everything a component may import implicitly)
const foundationFiles = files.filter((f) => FOUNDATION(f));
const foundationNpm = new Set(foundationFiles.flatMap((f) => depsOf(f).npm));
const foundation = {
  $schema: 'https://ui.shadcn.com/schema/registry-item.json',
  name: 'foundation',
  type: 'registry:lib',
  title: `${pkg.name} foundation`,
  description: 'Design tokens (CSS variables + Tailwind theme), cn/tv helpers and the icon set. Import styles/index.css once.',
  dependencies: pinned([...foundationNpm]),
  files: foundationFiles.map(file),
};
await fs.writeFile(path.join(out, 'foundation.json'), JSON.stringify(foundation, null, 1));
index.push({ name: 'foundation', type: foundation.type, title: foundation.title, files: foundationFiles });

for (const f of files.filter((f) => !FOUNDATION(f))) { // components, blocks and barrels (a barrel depends on every file it re-exports)
  const { local, npm } = depsOf(f);
  const regDeps = new Set([`${baseUrl}/foundation.json`]);
  for (const l of local) if (!FOUNDATION(l)) regDeps.add(`${baseUrl}/${itemName(l)}.json`);
  const item = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: itemName(f),
    type: 'registry:ui',
    title: path.basename(f).replace(/\.(tsx?|css)$/, ''),
    dependencies: pinned(npm),
    registryDependencies: [...regDeps],
    files: [file(f)],
    meta: { source: f, package: pkg.name },
  };
  await fs.writeFile(path.join(out, `${item.name}.json`), JSON.stringify(item, null, 1));
  index.push({ name: item.name, type: item.type, title: item.title, files: [f], registryDependencies: item.registryDependencies.map((u) => u.split('/').pop().replace('.json', '')) });
}

await fs.writeFile(path.join(out, 'registry.json'), JSON.stringify({
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: `motion-${system}`,
  homepage: `${baseUrl.replace(/\/r\/.*/, '')}/${system}`,
  items: index,
}, null, 1));
console.log(`${index.length} registry items → ${path.relative(ROOT, out)}`);
