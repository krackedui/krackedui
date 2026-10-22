// Sweep: install EVERY registry item on its own into a fresh project with the real shadcn CLI,
// then typecheck that project. Proves each copy-paste install is complete (files + deps).
// Requires the docs server (serves /r/<system>/*.json).
// Usage: node standard/gate/checks/sweep-copy-paste.mjs [system=motion] [concurrency=6]
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const run = promisify(execFile);
const system = process.argv[2] ?? 'motion';
const concurrency = Number(process.argv[3] ?? 6);
const base = process.env.REGISTRY_URL ?? `http://localhost:3002/r/${system}`;
// The shadcn CLI reads REGISTRY_URL as *its* registry (colors, styles): never pass ours down.
delete process.env.REGISTRY_URL;
const work = path.join(os.tmpdir(), `motion-sweep-cp-${system}`);
const index = await (await fetch(`${base}/registry.json`)).json();
const pkg = JSON.parse(await fs.readFile(path.join('systems', system, 'registry', 'package.json'), 'utf8'));
const pkgDeps = Object.entries(pkg.dependencies ?? {}).map(([n, v]) => `${n}@${v}`);
const items = index.items.map((i) => i.name);

// template project: React 19 + TS + the pinned deps, already installed
const tpl = path.join(work, '_template');
await fs.rm(work, { recursive: true, force: true });
await fs.mkdir(path.join(tpl, 'src'), { recursive: true });
await fs.writeFile(path.join(tpl, 'package.json'), JSON.stringify({ name: 'sweep', private: true, type: 'module' }));
await fs.writeFile(path.join(tpl, 'src/index.css'), '@import "tailwindcss";\n');
await fs.writeFile(path.join(tpl, 'components.json'), JSON.stringify({
  $schema: 'https://ui.shadcn.com/schema.json', style: 'new-york', rsc: false, tsx: true,
  tailwind: { config: '', css: 'src/index.css', baseColor: 'neutral', cssVariables: true },
  aliases: { components: '@/components', utils: '@/lib/utils', ui: '@/components/ui', lib: '@/lib', hooks: '@/hooks' },
}));
await fs.writeFile(path.join(tpl, 'tsconfig.json'), JSON.stringify({
  compilerOptions: { baseUrl: '.', paths: { '@/*': ['./src/*'] }, jsx: 'react-jsx', strict: true, module: 'ESNext', moduleResolution: 'Bundler', target: 'ES2022', skipLibCheck: true, noEmit: true, lib: ['ES2022', 'DOM', 'DOM.Iterable'] },
  include: ['src'],
}));
console.log('› template install');
await run('npm', ['i', '--silent', 'react@19.1.0', 'react-dom@19.1.0', 'tailwindcss@4.1.11', ...pkgDeps], { cwd: tpl });
await run('npm', ['i', '--silent', '-D', 'typescript@5.8.3', '@types/react@19.1.8', '@types/react-dom@19.1.6'], { cwd: tpl });
await run('npx', ['-y', 'shadcn@3.0.0', '--version'], { cwd: tpl }); // warm the CLI cache

const results = [];
async function check(name) {
  const dir = path.join(work, name);
  await run('cp', ['-c', '-R', tpl, dir]); // APFS clone: instant, no extra disk
  const t = Date.now();
  try {
    await run('npx', ['-y', 'shadcn@3.0.0', 'add', `${base}/${name}.json`, '--yes', '--overwrite', '--silent'], { cwd: dir, timeout: 180000 });
    const files = (await run('find', ['src/components', '-type', 'f'], { cwd: dir })).stdout.trim().split('\n').filter(Boolean).length;
    try {
      await run('npx', ['tsc', '-p', '.'], { cwd: dir, timeout: 180000 });
      results.push({ name, ok: true, files, s: ((Date.now() - t) / 1000).toFixed(0) });
    } catch (e) {
      results.push({ name, ok: false, stage: 'typecheck', files, error: (e.stdout || e.message).split('\n').slice(0, 6).join('\n') });
    }
  } catch (e) {
    results.push({ name, ok: false, stage: 'add', error: (e.stderr || e.stdout || e.message).split('\n').slice(-6).join('\n') });
  }
  const r = results[results.length - 1];
  console.log(`${r.ok ? '✓' : '✗'} ${name}${r.ok ? ` (${r.files} files, ${r.s}s)` : ` [${r.stage}]`}`);
  await fs.rm(dir, { recursive: true, force: true });
}

const queue = [...items];
await Promise.all(Array.from({ length: concurrency }, async () => { while (queue.length) await check(queue.shift()); }));
const bad = results.filter((r) => !r.ok);
await fs.writeFile(path.join(work, 'report.json'), JSON.stringify(results, null, 1));
if (process.env.REPORT_FILE) await fs.writeFile(process.env.REPORT_FILE, JSON.stringify({ items: items.length, results }, null, 1));
console.log(`\n${results.length - bad.length}/${results.length} items install and typecheck on their own.`);
for (const b of bad) console.log(`\n✗ ${b.name} [${b.stage}]\n${b.error}`);
console.log(`report: ${path.join(work, 'report.json')}`);
process.exitCode = bad.length ? 1 : 0;
