// Build @krackedui/motion into dist/:
//   index.js + index.d.ts   components (tsup, "use client", deps external)
//   styles.css              zero-config stylesheet: tokens + every utility the components use + scoped reset
//   tailwind.css (+ parts)  for Tailwind v4 apps that want the tokens as utilities in their own code
//   tokens.json             DTCG tokens (light + dark)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(pkg, 'dist');
const run = (cmd, args) => execFileSync(cmd, args, { cwd: pkg, stdio: 'inherit' });
const bin = (name) => {
  for (const dir of [path.join(pkg, 'node_modules/.bin'), path.join(pkg, '../../../node_modules/.bin')]) {
    const p = path.join(dir, name);
    try { execFileSync('test', ['-x', p]); return p; } catch {}
  }
  throw new Error(`missing ${name}; run npm install`);
};

await fs.rm(dist, { recursive: true, force: true });
await fs.mkdir(dist, { recursive: true });

console.log('› JS + types');
run(bin('tsup'), []);
// client boundary for React Server Components (Next.js App Router)
const client = path.join(dist, 'client.js');
await fs.writeFile(client, '"use client";\n' + (await fs.readFile(client, 'utf8')));
// entry: everything from the client bundle, with pure helpers overridden by their server-safe versions
// (explicit named exports take precedence over `export *`)
const serverSafe = Object.keys(await import(path.join(dist, 'server-safe.js'))).sort();
// Compound components (Menu.Root, Sidebar.Item…) can't be dotted into from React Server Components, so
// also export flat aliases (MenuRoot, SidebarItem…), like shadcn/AlignUI do.
const clientMod = await import(client + '?flat');
const flat = [];
for (const [name, value] of Object.entries(clientMod)) {
  if (!/^[A-Z]/.test(name) || !value || typeof value !== 'object' || Array.isArray(value)) continue;
  for (const [part, v] of Object.entries(value)) {
    if (/^[A-Z]/.test(part) && (typeof v === 'function' || (v && typeof v === 'object' && '$$typeof' in v)) && !(name + part in clientMod)) flat.push([name, part]);
  }
}
await fs.appendFile(client, '\n// flat aliases of compound parts (server-component friendly)\n' + flat.map(([n, p]) => `export const ${n}${p} = ${n}.${p};`).join('\n') + '\n');
await fs.appendFile(path.join(dist, 'client.d.ts'), '\n' + flat.map(([n, p]) => `export declare const ${n}${p}: (typeof ${n})['${p}'];`).join('\n') + '\n');
console.log(`  flat compound aliases: ${flat.length}`);

// Next.js can't follow `export *` across a "use client" boundary, so name every export explicitly.
const clientSrc = await fs.readFile(client, 'utf8');
const exportList = [
  ...[...clientSrc.matchAll(/^export\s*\{([^}]*)\};?\s*$/gm)].flatMap((m) => m[1].split(',')).map((e) => e.trim().split(/\s+as\s+/).pop()),
  ...[...clientSrc.matchAll(/^export const (\w+) =/gm)].map((m) => m[1]),
].filter(Boolean);
const clientNames = exportList.filter((n) => !serverSafe.includes(n)).sort();
if (!clientNames.length) throw new Error('could not read client.js exports');
await fs.writeFile(path.join(dist, 'index.js'),
  `export { ${clientNames.join(', ')} } from './client.js';\nexport { ${serverSafe.join(', ')} } from './server-safe.js';\n`);
await fs.writeFile(path.join(dist, 'index.d.ts'), `export * from './client';\n`);
console.log(`  exports: ${clientNames.length} client, ${serverSafe.length} server-safe`);

console.log('› styles.css (precompiled)');
run(bin('tailwindcss'), ['-i', 'build/styles.css', '-o', 'dist/styles.css', '--minify']);

console.log('› tailwind.css (for Tailwind apps)');
for (const f of ['tokens.css', 'theme.css', 'standard.css', 'motion.css']) await fs.copyFile(path.join(pkg, 'src/styles', f), path.join(dist, f));
// base rules from index.css without its imports
const index = await fs.readFile(path.join(pkg, 'src/styles/index.css'), 'utf8');
await fs.writeFile(path.join(dist, 'base.css'), index.replace(/^@import[^\n]*\n/gm, ''));
await fs.copyFile(path.join(pkg, 'build/reset.css'), path.join(dist, 'reset.css'));
await fs.copyFile(path.join(pkg, 'build/tailwind.css'), path.join(dist, 'tailwind.css'));

// shipped tokens: keep values, modes and evidence level; drop source names from the captured product
const tokens = JSON.parse(await fs.readFile(path.join(pkg, 'tokens/motion.tokens.json'), 'utf8'));
const scrub = (o) => {
  if (!o || typeof o !== 'object') return;
  if (o.$extensions?.evidence) delete o.$extensions.evidence.source;
  for (const v of Object.values(o)) scrub(v);
};
scrub(tokens);
await fs.writeFile(path.join(dist, 'tokens.json'), JSON.stringify(tokens));
// AI rules shipped with the package (brand-neutral, maintained in ds/SYSTEM.md)

const size = async (f) => ((await fs.stat(path.join(dist, f))).size / 1024).toFixed(0) + ' KB';
console.log(`✓ dist: client.js ${await size('client.js')}, styles.css ${await size('styles.css')}, tokens.json ${await size('tokens.json')}`);
