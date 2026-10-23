/*
 * Build @krackedui/bayrust into dist/:
 *
 *   client.js      every component and hook, bundled, with "use client" on top
 *   server-safe.js the pure helpers and data, importable from a React Server Component
 *   index.js       the package entry: client names from client.js, the rest from server-safe.js
 *   index.d.ts (+) types, emitted by tsc from src/
 *   styles.css     build/styles.css with its @imports inlined — no Tailwind, no PostCSS
 *   tailwind.css   the same, plus a generated `@theme inline` block of the --ds-* tokens
 *   tokens.json    the measured tokens as DTCG, with the reference's own selectors stripped
 *
 * esbuild and tsc do the work. Bayrust has no runtime dependencies and its CSS is hand-written, so
 * a bundler plugin chain and a CSS compiler would both be dependencies that earn nothing.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const pkgDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(pkgDir, 'dist');
const src = path.join(pkgDir, 'src');
const EXTERNAL = ['react', 'react-dom', 'react/jsx-runtime'];

const bin = (name) => {
  for (const dir of ['node_modules/.bin', '../../../node_modules/.bin']) {
    const p = path.join(pkgDir, dir, name);
    try {
      execFileSync('test', ['-x', p]);
      return p;
    } catch {
      /* try the next one */
    }
  }
  throw new Error(`missing ${name}; run npm install`);
};

await fs.rm(dist, { recursive: true, force: true });
await fs.mkdir(dist, { recursive: true });

/* ---------- types ---------- */
// Emitted before the bundles, so a type error stops the build rather than shipping a broken d.ts.
console.log('› types');
execFileSync(bin('tsc'), ['-p', 'tsconfig.build.json'], { cwd: pkgDir, stdio: 'inherit' });

/* ---------- JS ---------- */
console.log('› client.js + server-safe.js');
for (const [entry, outfile] of [
  [path.join(src, 'index.ts'), path.join(dist, 'client.js')],
  [path.join(src, 'server-safe.ts'), path.join(dist, 'server-safe.js')],
]) {
  await build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    jsx: 'automatic',
    sourcemap: true,
    external: EXTERNAL,
    loader: { '.css': 'empty' },
    logLevel: 'error',
  });
}
// The client boundary for the Next.js App Router. esbuild drops a file-level directive when it
// bundles, so it goes back on afterwards — once, at the very top, or React ignores it.
const clientFile = path.join(dist, 'client.js');
await fs.writeFile(clientFile, `"use client";\n${await fs.readFile(clientFile, 'utf8')}`);

const clientMod = await import(`${clientFile}?t=${Date.now()}`);
const serverMod = await import(`${path.join(dist, 'server-safe.js')}?t=${Date.now()}`);
const serverNames = Object.keys(serverMod).sort();
const clientNames = Object.keys(clientMod).filter((n) => !serverNames.includes(n)).sort();
if (!clientNames.length) throw new Error('client.js exported nothing — the bundle is wrong');

// SPEC §2: a React Server Component cannot dot into a compound (Menu.Item), so every part needs a
// flat alias too. src/index.ts declares them by hand so the types come out right; this only checks
// that none was forgotten, because a missing alias is a build error in a consumer, not here.
const missing = [];
for (const [name, value] of Object.entries(clientMod)) {
  if (!/^[A-Z]/.test(name) || !value || typeof value !== 'object' || Array.isArray(value)) continue;
  for (const [part, v] of Object.entries(value)) {
    const isComponent = typeof v === 'function' || (v && typeof v === 'object' && '$$typeof' in v);
    if (/^[A-Z]/.test(part) && isComponent && !(name + part in clientMod)) missing.push(`${name}${part}`);
  }
}
if (missing.length) throw new Error(`compound parts with no flat alias: ${missing.join(', ')} — add them to src/index.ts`);

// client.js is bundled from src/index.ts, so its types are exactly the entry's types, which tsc has
// just emitted as dist/index.d.ts. The copy — rather than `export * from './index'` — keeps every
// name visible in the file itself: that is what makes the flat compound aliases readable to the
// gate's contract check, and to an editor resolving the "use client" bundle directly.
await fs.copyFile(path.join(dist, 'index.d.ts'), path.join(dist, 'client.d.ts'));

// Next.js will not follow `export *` across a "use client" boundary, so name every export.
await fs.writeFile(
  path.join(dist, 'index.js'),
  `export { ${clientNames.join(', ')} } from './client.js';\nexport { ${serverNames.join(', ')} } from './server-safe.js';\n`,
);
console.log(`  ${clientNames.length} client exports, ${serverNames.length} server-safe`);

/* ---------- CSS ---------- */
// One resolver for both entries: follow @import, in order, depth-first, each file once.
const seen = new Set();
async function inline(file) {
  const real = path.resolve(file);
  if (seen.has(real)) return '';
  seen.add(real);
  const text = await fs.readFile(real, 'utf8');
  const out = [];
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*@import\s+['"]([^'"]+)['"]\s*;/);
    if (m) out.push(await inline(path.resolve(path.dirname(real), m[1])));
    else out.push(line);
  }
  return out.join('\n');
}

console.log('› styles.css');
const styles = await inline(path.join(pkgDir, 'build/styles.css'));
await fs.writeFile(path.join(dist, 'styles.css'), styles);

console.log('› tailwind.css');
// Every --ds-* name the stylesheet defines, mapped onto the Tailwind v4 theme namespace that turns
// it into a utility. Each stays under a `ds-` prefix so Bayrust's scale never shadows the app's own
// (`bg-ds-bg-app`, `rounded-ds-md`, `font-ds-mono`). A colour keeps its group in the name, because
// `bg`, `text` and `border` are three different scales that Tailwind reads from one namespace.
// Anything Tailwind v4 has no namespace for — the motion durations — is left out rather than
// invented; `duration-[var(--ds-motion-duration-base)]` is the way to reach those.
const NAMESPACE = [
  [/^--ds-(?=(bg|text|border|accent|status|chart)-)/, '--color-ds-'],
  [/^--ds-radius-/, '--radius-ds-'],
  [/^--ds-font-/, '--font-ds-'],
  [/^--ds-shadow-/, '--shadow-ds-'],
  [/^--ds-(space|size)-/, '--spacing-ds-'],
  [/^--ds-motion-easing-/, '--ease-ds-'],
];
const dsNames = [...new Set([...styles.matchAll(/^\s*(--ds-[a-z0-9-]+)\s*:/gm)].map((m) => m[1]))].sort();
const theme = [];
const skipped = [];
for (const name of dsNames) {
  const ns = NAMESPACE.find(([re]) => re.test(name));
  if (!ns) { skipped.push(name); continue; }
  theme.push(`  ${name.replace(ns[0], ns[1])}: var(${name});`);
}
const tailwindHead = await fs.readFile(path.join(pkgDir, 'build/tailwind.css'), 'utf8');
await fs.writeFile(
  path.join(dist, 'tailwind.css'),
  `${tailwindHead}\n@theme inline {\n${theme.join('\n')}\n}\n`,
);
console.log(`  ${theme.length} of ${dsNames.length} --ds-* tokens exposed as utilities${skipped.length ? ` (no Tailwind namespace: ${skipped.join(', ')})` : ''}`);

/* ---------- tokens.json ---------- */
console.log('› tokens.json');
// The measured tokens, as DTCG. `declaredIn` and `source` record which of the reference's own rules
// a value came from; that is evidence for this repository, not something to publish (SPEC §11), so
// the shipped file keeps the value, the two appearances and our own CSS variable name, and nothing
// that names the reference.
const measured = JSON.parse(await fs.readFile(path.join(pkgDir, '../tooling/tokens.json'), 'utf8'));
const typeOf = (v) =>
  /^(#|rgba?\(|hsla?\(|color\(|oklch\()/.test(v) ? 'color'
  : /^-?[\d.]+(px|rem|em|%)$/.test(v) ? 'dimension'
  : /^[\d.]+m?s$/.test(v) ? 'duration'
  : /^(cubic-bezier|linear|ease)/.test(v) ? 'cubicBezier'
  : /^-?[\d.]+$/.test(v) ? 'number'
  : undefined;

let count = 0;
const shipped = (node) => {
  const out = {};
  for (const [key, value] of Object.entries(node)) {
    if (!value || typeof value !== 'object') continue;
    const ext = value.$extensions?.bayrust;
    if (ext) {
      count++;
      const $type = typeOf(String(value.$value));
      out[key] = {
        ...($type ? { $type } : {}),
        $value: value.$value,
        $extensions: { bayrust: { cssVar: ext.cssVar, modes: { light: ext.light, dark: ext.dark } } },
      };
    } else out[key] = shipped(value);
  }
  return out;
};
await fs.writeFile(path.join(dist, 'tokens.json'), JSON.stringify(shipped(measured)));
console.log(`  ${count} tokens`);

const kb = async (f) => `${((await fs.stat(path.join(dist, f))).size / 1024).toFixed(0)} KB`;
console.log(`✓ dist: client.js ${await kb('client.js')}, styles.css ${await kb('styles.css')}, tailwind.css ${await kb('tailwind.css')}, tokens.json ${await kb('tokens.json')}`);
