// Shared consumer side of the gate: one packed tarball, one Vite app that renders every docs example
// from that tarball (one example per URL), served once per run.
//   http://127.0.0.1:<port>/?ex=<id>[&theme=dark]
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { run } from './context.mjs';

export const PINS = {
  react: 'react@19.1.0', reactDom: 'react-dom@19.1.0', vite: 'vite@6.3.5', pluginReact: '@vitejs/plugin-react@4.5.2',
  typescript: 'typescript@5.8.3', typesReact: '@types/react@19.1.8', typesReactDom: '@types/react-dom@19.1.6', typesNode: '@types/node@22.15.30', next: 'next@15.3.4',
};

export const workDir = (ctx, name) => path.join(os.tmpdir(), `krackedui-gate-${ctx.system}`, name);

export function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.unref();
    s.on('error', reject);
    s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)); });
  });
}

/** Start a long-running server and wait until `url` answers. Registers cleanup on ctx. */
export async function startServer(ctx, cmd, args, { cwd, url, env, timeout = 120000 }) {
  const child = spawn(cmd, args, { cwd, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
  let log = '';
  child.stdout.on('data', (d) => { log += d; });
  child.stderr.on('data', (d) => { log += d; });
  const kill = () => { try { process.kill(-child.pid, 'SIGTERM'); } catch { /* gone */ } };
  ctx.onCleanup(kill);
  const t = Date.now();
  while (Date.now() - t < timeout) {
    if (child.exitCode !== null) throw new Error(`${cmd} ${args.join(' ')} exited ${child.exitCode}: ${log.slice(-800)}`);
    try { const r = await fetch(url); if (r.status < 500) return { child, kill, log: () => log }; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 300));
  }
  kill();
  throw new Error(`${cmd} did not answer at ${url} within ${timeout / 1000}s: ${log.slice(-800)}`);
}

/** Pack the package exactly as npm publishes it (builds first, once per run). */
export async function packTarball(ctx) {
  const b = await ctx.build();
  if (!b.ok) throw new Error('package build failed (see the build check)');
  const dest = workDir(ctx, 'pack');
  await fs.rm(dest, { recursive: true, force: true });
  await fs.mkdir(dest, { recursive: true });
  // The build just ran in this process, so skip the prepack rebuild.
  const r = await run('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', dest], { cwd: ctx.registryDir, timeout: 300000 });
  if (r.code !== 0) throw new Error(`npm pack failed: ${(r.stderr || r.stdout).slice(-800)}`);
  const info = JSON.parse(r.stdout.slice(r.stdout.indexOf('[')))[0];
  return { tgz: path.join(dest, info.filename), files: info.files.map((f) => f.path), size: info.size, unpackedSize: info.unpackedSize };
}

/** npm install in a scratch app; keeps node_modules between runs so repeat runs are fast. */
export async function installApp(dir, deps, devDeps) {
  const a = await run('npm', ['i', '--no-audit', '--no-fund', '--loglevel=error', ...deps], { cwd: dir, timeout: 600000 });
  if (a.code !== 0) throw new Error(`npm install failed in ${dir}: ${(a.stderr || a.stdout).slice(-1200)}`);
  if (devDeps.length) {
    const b = await run('npm', ['i', '-D', '--no-audit', '--no-fund', '--loglevel=error', ...devDeps], { cwd: dir, timeout: 600000 });
    if (b.code !== 0) throw new Error(`npm install failed in ${dir}: ${(b.stderr || b.stdout).slice(-1200)}`);
  }
}

const MAIN = (pkgName, rootClass, examples) => `import { Component, StrictMode, useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import '${pkgName}/styles.css';

const loaders: Record<string, () => Promise<Record<string, unknown>>> = {
${examples.map((e) => `  '${e.id}': () => import('./ex/e${e.id}'),`).join('\n')}
};
declare global { interface Window { __gate: { ready: boolean; error?: string; empty?: boolean } } }
window.__gate = { ready: false };

class Boundary extends Component<{ children: ReactNode }, { error?: string }> {
  state: { error?: string } = {};
  static getDerivedStateFromError(e: unknown) { return { error: e instanceof Error ? e.message : String(e) }; }
  componentDidCatch() { window.__gate.error = this.state.error; window.__gate.ready = true; }
  render() { return this.state.error ? <pre data-gate-error="">{this.state.error}</pre> : this.props.children; }
}

const params = new URLSearchParams(location.search);
const id = params.get('ex') ?? '';
const dark = params.get('theme') === 'dark';
document.documentElement.lang = 'en';
document.title = 'Example ' + id;
document.body.style.margin = '0';

function Example() {
  const [C, setC] = useState<ComponentType | null>(null);
  useEffect(() => {
    const load = loaders[id];
    if (!load) { window.__gate.error = 'unknown example ' + id; window.__gate.ready = true; return; }
    load().then((m) => {
      const pick = Object.entries(m).find(([k, v]) => (/^[A-Z]/.test(k) || k === 'default') && typeof v === 'function');
      if (!pick) { window.__gate.error = 'example has no component export'; window.__gate.ready = true; return; }
      setC(() => pick[1] as ComponentType);
    }, (e: unknown) => { window.__gate.error = String(e); window.__gate.ready = true; });
  }, []);
  useEffect(() => {
    if (!C) return;
    // let effects, portals and fonts settle
    const t = setTimeout(() => { void document.fonts.ready.then(() => { window.__gate.ready = true; }); }, 250);
    return () => clearTimeout(t);
  }, [C]);
  return C ? <C /> : null;
}

function Root() {
  useEffect(() => {
    const root = document.getElementById('gate-root');
    if (root) document.body.style.background = getComputedStyle(root).backgroundColor;
  }, []);
  return (
    <div id="gate-root" className={'${rootClass}' + (dark ? ' dark' : '')} style={{ minHeight: '100vh', boxSizing: 'border-box', padding: 16, background: 'var(--ds-bg-app)', color: 'var(--ds-text-primary)' }}>
      <div id="gate-example">
        <Boundary><Example /></Boundary>
      </div>
    </div>
  );
}
createRoot(document.getElementById('app')!).render(<StrictMode><Root /></StrictMode>);
`;

/** Build (once per run) and serve the examples app. Resolves { url, examples, buildErrors }. */
export async function examplesApp(ctx) {
  const { tgz } = await ctx.tarball();
  const examples = await ctx.examples();
  const { registry } = await ctx.docs();
  const rootClass = registry.previewRootClassName ?? `${ctx.system}-root`;
  const dir = workDir(ctx, 'examples');
  await fs.mkdir(dir, { recursive: true });
  await fs.rm(path.join(dir, 'src'), { recursive: true, force: true });
  await fs.rm(path.join(dir, 'dist'), { recursive: true, force: true });
  await fs.mkdir(path.join(dir, 'src', 'ex'), { recursive: true });
  if (!existsSync(path.join(dir, 'package.json'))) await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify({ name: 'gate-examples', private: true, type: 'module' }));
  await fs.writeFile(path.join(dir, 'index.html'), '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="data:,"><title>Example</title></head><body><div id="app"></div><script type="module" src="/src/main.tsx"></script></body></html>');
  await fs.writeFile(path.join(dir, 'vite.config.ts'), "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({ plugins: [react()], logLevel: 'error', build: { chunkSizeWarningLimit: 100000, reportCompressedSize: false } });\n");
  ctx.log('install the packed package into the examples app');
  await installApp(dir, [PINS.react, PINS.reactDom, tgz], [PINS.vite, PINS.pluginReact]);
  for (const e of examples) await fs.writeFile(path.join(dir, 'src', 'ex', `e${e.id}.tsx`), e.code);
  await fs.writeFile(path.join(dir, 'src', 'main.tsx'), MAIN(ctx.pkg.name, rootClass, examples));

  // A broken example (e.g. importing a name the package doesn't export) must not hide the others:
  // replace it with a stub that throws the build error, and rebuild.
  const buildErrors = {};
  ctx.log(`vite build (${examples.length} examples)`);
  for (let attempt = 0; attempt < 60; attempt++) {
    const r = await run(path.join(dir, 'node_modules/.bin/vite'), ['build'], { cwd: dir, timeout: 600000 });
    if (r.code === 0) break;
    const out = r.stdout + r.stderr;
    const m = out.match(/src\/ex\/e(\d+)\.tsx/);
    if (!m || buildErrors[m[1]]) throw new Error(`examples app build failed: ${out.slice(-1500)}`);
    const msg = (out.split('\n').find((l) => /error|not exported|Could not resolve|Expected|Unexpected/i.test(l)) ?? out.split('\n')[0]).replace(/\x1b\[[0-9;]*m/g, '').trim().slice(0, 300);
    buildErrors[m[1]] = msg;
    await fs.writeFile(path.join(dir, 'src', 'ex', `e${m[1]}.tsx`), `export function BuildError(): never { throw new Error(${JSON.stringify(`build error: ${msg}`)}); }\n`);
  }
  const port = await freePort();
  const url = `http://127.0.0.1:${port}/`;
  await startServer(ctx, path.join(dir, 'node_modules/.bin/vite'), ['preview', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: dir, url });
  // Browser checks see renderable examples only; whole-document ones are listed separately.
  return { url, examples: examples.filter((e) => !e.document), documents: examples.filter((e) => e.document), buildErrors, dir };
}

/** Open one example in `context` and wait until it has rendered. Collects console errors and page errors. */
export async function openExample(context, app, ex, { theme = 'light', timeout = 20000 } = {}) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`uncaught: ${e.message.split('\n')[0].slice(0, 300)}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon\.ico/.test(m.location()?.url ?? '')) errors.push(`console.error: ${m.text().split('\n')[0].slice(0, 300)}${/Failed to load resource/.test(m.text()) ? ` (${m.location()?.url})` : ''}`); });
  const loaded = await page.goto(`${app.url}?ex=${ex.id}${theme === 'dark' ? '&theme=dark' : ''}`, { waitUntil: 'load', timeout }).then(() => true, (e) => { errors.push(`load: ${e.message.split('\n')[0]}`); return false; });
  if (!loaded) return { page, errors, ready: false, error: undefined };
  const ready = await page.waitForFunction(() => window.__gate?.ready, null, { timeout }).then(() => true, () => false);
  const state = await page.evaluate(() => ({ error: window.__gate?.error }));
  return { page, errors, ready, error: state.error };
}
