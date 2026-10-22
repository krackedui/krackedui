// Gate context: paths, loaders (contract, docs registry, examples) and shared resources
// (one packed tarball, one consumer app, one browser, one docs server) reused by every check of a run.
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

/** Run a command; never throws. Resolves { code, stdout, stderr, ms }. */
export function run(cmd, args, { cwd = ROOT, env, timeout = 0, input } = {}) {
  return new Promise((resolve) => {
    const t = Date.now();
    const child = spawn(cmd, args, { cwd, env: { ...process.env, ...env }, stdio: [input ? 'pipe' : 'ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    if (input) child.stdin.end(input);
    let timer;
    if (timeout) timer = setTimeout(() => { stderr += `\n[gate] timed out after ${timeout} ms`; child.kill('SIGKILL'); }, timeout);
    child.on('error', (e) => { stderr += String(e); });
    child.on('close', (code) => { clearTimeout(timer); resolve({ code: code ?? 1, stdout, stderr, ms: Date.now() - t }); });
  });
}

/**
 * Parallelism cap for every pool (browser pages, builds, typechecks). Defaults to a quarter of the
 * CPU cores (min 2) so the gate doesn't freeze a laptop; CI can raise it with GATE_CONCURRENCY=8.
 */
export const concurrency = Math.max(1, Number(process.env.GATE_CONCURRENCY) || Math.max(2, Math.floor(os.cpus().length / 4)));

/** Run async `fn` over `items` with at most `n` (capped by GATE_CONCURRENCY) in flight. Results keep input order. */
export async function pool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, concurrency, items.length) }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); }
  }));
  return out;
}

export async function walk(dir, { skip = /(^|\/)(node_modules|dist|\.next|\.turbo)$/, filter = () => true } = {}) {
  const out = [];
  async function go(d) {
    let entries;
    try { entries = await fs.readdir(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { if (!skip.test(p) && e.name !== '.DS_Store') await go(p); }
      else if (e.isFile() && e.name !== '.DS_Store' && filter(p)) out.push(p);
    }
  }
  await go(dir);
  return out.sort();
}

export const rel = (p) => path.relative(ROOT, p);
const memo = (fn) => { let p; return () => (p ??= fn()); };

export async function createContext(system, flags = {}) {
  const sysDir = path.join(ROOT, 'systems', system);
  if (!existsSync(path.join(sysDir, 'registry', 'package.json'))) throw new Error(`no such system: systems/${system}/registry/package.json`);
  const registryDir = path.join(sysDir, 'registry');
  const pkg = JSON.parse(await fs.readFile(path.join(registryDir, 'package.json'), 'utf8'));
  const scratch = path.join(ROOT, '.scratch', 'gate', system);
  await fs.mkdir(scratch, { recursive: true });
  const cleanups = [];
  const ctx = {
    system, flags, root: ROOT, sysDir, registryDir, scratch, pkg,
    srcDir: path.join(registryDir, 'src'),
    distDir: path.join(registryDir, 'dist'),
    docsDir: path.join(sysDir, 'docs'),
    templatesDir: path.join(sysDir, 'templates'),
    baselinesDir: path.join(sysDir, 'gate', 'baselines'),
    log: (...a) => console.log('   ', ...a),
    onCleanup: (fn) => cleanups.push(fn),
    async cleanup() { for (const fn of cleanups.reverse()) { try { await fn(); } catch { /* best effort */ } } },
    /** Set by the build check, so the tarball can be packed without rebuilding. */
    built: false,
  };

  // The contract (inventory, tokens, vocab), bundled from TypeScript.
  ctx.contract = memo(async () => {
    const outfile = path.join(scratch, '_contract.mjs');
    await build({ entryPoints: [path.join(ROOT, 'standard/contract/src/index.ts')], bundle: true, format: 'esm', platform: 'node', outfile, logLevel: 'error' });
    return import(`${outfile}?t=${Date.now()}`);
  });

  // The docs registry + snippet completer, exactly as the docs site uses them.
  ctx.docs = memo(async () => {
    const tmp = path.join(scratch, '_docs');
    await fs.mkdir(tmp, { recursive: true });
    const stub = path.join(tmp, 'next-link.mjs');
    await fs.writeFile(stub, 'export default function Link() { return null; }\n');
    const load = async (entry, name, alias = {}) => {
      const outfile = path.join(tmp, name);
      await build({ entryPoints: [entry], bundle: true, platform: 'node', format: 'esm', outfile, jsx: 'automatic', packages: 'external', loader: { '.css': 'empty' }, logLevel: 'error', alias });
      return import(`${outfile}?t=${Date.now()}`);
    };
    const { default: registry } = await load(path.join(ctx.docsDir, 'registry.tsx'), 'registry.mjs', { [pkg.name]: path.join(ctx.srcDir, 'index.ts'), 'next/link': stub });
    const { completeSnippet } = await load(path.join(ROOT, 'apps/docs/lib/snippet.ts'), 'snippet.mjs');
    return { registry, completeSnippet };
  });

  // Every docs example (hero, examples, examples inside sections), completed as the docs show it.
  ctx.examples = memo(async () => {
    const { registry, completeSnippet } = await ctx.docs();
    const out = [];
    const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'example';
    for (const [slug, page] of Object.entries(registry.pages)) {
      const list = [];
      if (page.hero?.code) list.push(['hero', page.hero]);
      for (const e of page.examples ?? []) if (e?.code) list.push([e.id ?? slugify(e.title), e]);
      for (const s of page.sections ?? []) for (const b of s.blocks ?? []) {
        if (b && typeof b === 'object' && 'example' in b && b.example?.code) list.push([b.example.id ?? slugify(b.example.title), b.example]);
      }
      const seen = new Map();
      for (const [key0, e] of list) {
        const n = seen.get(key0) ?? 0; seen.set(key0, n + 1);
        const key = n ? `${key0}-${n + 1}` : key0;
        out.push({
          id: out.length, slug, key, page: page.title, title: e.title ?? key,
          name: `${slug}#${key}`,
          file: `${slug.replace(/\//g, '__')}--${key}`,
          // A whole-document example (a Next.js root layout rendering <html>) cannot render inside a page;
          // it is still compiled (docs check) and built (install check), but skipped in the browser checks.
          document: /<html[\s>]/.test(e.code),
          code: completeSnippet(e.code, { packageName: registry.packageName, exports: registry.exports, name: `${e.title} example` }),
        });
      }
    }
    return out;
  });

  ctx.templates = memo(async () => {
    let dirs = [];
    try { dirs = (await fs.readdir(ctx.templatesDir, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => path.join(ctx.templatesDir, d.name)); } catch { /* none */ }
    return dirs.filter((d) => existsSync(path.join(d, 'package.json')));
  });

  // Build the package once per run (tokens, contract, build, install and clean all read dist/).
  ctx.build = memo(async () => {
    const r = await run('npm', ['run', 'build', '-w', pkg.name], { timeout: 600000 });
    if (r.code === 0) ctx.built = true;
    return { ok: r.code === 0, output: (r.stdout + r.stderr).trim(), ms: r.ms };
  });

  // The precompiled stylesheet. If the package build fails (e.g. a type error in the d.ts step), compile
  // the stylesheet entry on its own so style checks can still run; the build check reports the failure.
  ctx.stylesCss = memo(async () => {
    const b = await ctx.build();
    const dist = path.join(ctx.distDir, 'styles.css');
    if (b.ok && existsSync(dist)) return { file: dist, note: '' };
    const entry = path.join(registryDir, 'build', 'styles.css');
    const out = path.join(scratch, 'styles.fallback.css');
    const bin = [path.join(registryDir, 'node_modules/.bin/tailwindcss'), path.join(ROOT, 'node_modules/.bin/tailwindcss')].find((p) => existsSync(p));
    if (!existsSync(entry) || !bin) return null;
    const r = await run(bin, ['-i', entry, '-o', out, '--minify'], { cwd: registryDir });
    return r.code === 0 ? { file: out, note: 'package build failed; styles compiled from build/styles.css directly' } : null;
  });

  ctx.tarball = memo(async () => (await import('./consumer.mjs')).packTarball(ctx));
  ctx.examplesApp = memo(async () => (await import('./consumer.mjs')).examplesApp(ctx));
  ctx.docsServer = memo(async () => {
    const m = await import('./docs-server.mjs');
    const base = await m.docsServer(ctx);
    const assets = await m.docsAssets(ctx, base);
    return { base, ...assets };
  });
  ctx.exports = memo(async () => (await import('./exports.mjs')).analyzeExports(ctx));

  ctx.browser = memo(async () => {
    const { chromium } = await import('playwright');
    // Playwright's bundled Chromium (CI installs it); fall back to an installed Chrome locally.
    const browser = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }));
    ctx.onCleanup(() => browser.close());
    return browser;
  });

  return ctx;
}
