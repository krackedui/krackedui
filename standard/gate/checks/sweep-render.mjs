// Sweep: render EVERY docs example (hero + examples, completed exactly as the docs show them) from the
// packed package in a fresh Vite app, in a real browser. Reports crashes (error boundaries), console
// errors, uncaught page errors and examples that render nothing, plus contact-sheet screenshots.
// Usage: node standard/gate/checks/sweep-render.mjs [system=motion]
import { build } from 'esbuild';
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';

const system = process.argv[2] ?? 'motion';
const root = path.resolve('.');
const pkgDir = path.join(root, 'systems', system, 'registry');
const pkg = JSON.parse(await fs.readFile(path.join(pkgDir, 'package.json'), 'utf8'));
const work = path.join(os.tmpdir(), `motion-sweep-render-${system}`);
const out = path.join(root, '.scratch', 'sweep-render');
const sh = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
await fs.rm(out, { recursive: true, force: true });
await fs.mkdir(out, { recursive: true });

// 1. load the docs registry + snippet completer (same code the docs use)
const tmp = path.join(out, '_load');
await fs.mkdir(tmp, { recursive: true });
const stub = path.join(tmp, 'next-link.mjs');
await fs.writeFile(stub, 'export default function Link() { return null; }\n');
const load = async (entry, name, alias = {}) => {
  const outfile = path.join(tmp, name);
  await build({ entryPoints: [entry], bundle: true, platform: 'node', format: 'esm', outfile, jsx: 'automatic', packages: 'external', loader: { '.css': 'empty' }, logLevel: 'error', alias });
  return import(outfile);
};
const { default: registry } = await load(path.join(root, 'systems', system, 'docs', 'registry.tsx'), 'registry.mjs', { [pkg.name]: path.join(pkgDir, 'src', 'index.ts'), 'next/link': stub });
const { completeSnippet } = await load(path.join(root, 'apps', 'docs', 'lib', 'snippet.ts'), 'snippet.mjs');

const examples = [];
for (const [slug, page] of Object.entries(registry.pages)) {
  for (const e of [page.hero, ...(page.examples ?? [])].filter((x) => x?.code)) {
    examples.push({ id: examples.length, slug, title: `${page.title} › ${e.title}`, code: completeSnippet(e.code, { packageName: pkg.name, exports: registry.exports, name: `${e.title} example` }) });
  }
}
console.log(`› ${examples.length} examples`);

// 2. fresh consumer app with the packed package
console.log('› pack + app install');
await fs.rm(work, { recursive: true, force: true });
await fs.mkdir(path.join(work, 'src', 'ex'), { recursive: true });
const tgz = path.join(work, sh('npm', ['pack', '--pack-destination', work, '--silent'], pkgDir).trim().split('\n').pop());
await fs.writeFile(path.join(work, 'package.json'), JSON.stringify({ name: 'sweep-render', private: true, type: 'module' }));
await fs.writeFile(path.join(work, 'index.html'), '<!doctype html><html><head><meta charset="utf-8"></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>');
await fs.writeFile(path.join(work, 'vite.config.ts'), "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({ plugins: [react()], build: { chunkSizeWarningLimit: 10000 } });\n");
sh('npm', ['i', '--silent', 'react@19.1.0', 'react-dom@19.1.0', tgz], work);
sh('npm', ['i', '--silent', '-D', 'vite@6.3.5', '@vitejs/plugin-react@4.5.2'], work);

for (const e of examples) await fs.writeFile(path.join(work, 'src', 'ex', `e${e.id}.tsx`), e.code);
const PER_PAGE = 40;
await fs.writeFile(path.join(work, 'src', 'main.tsx'), `import { Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import '${pkg.name}/styles.css';
${examples.map((e) => `import * as m${e.id} from './ex/e${e.id}';`).join('\n')}
const list = [${examples.map((e) => `[${e.id}, ${JSON.stringify(e.title)}, m${e.id}]`).join(',\n')}] as [number, string, Record<string, unknown>][];
const pick = (m: Record<string, unknown>) => Object.entries(m).find(([k, v]) => /^[A-Z]/.test(k) && typeof v === 'function')?.[1] as (() => ReactNode) | undefined;
class Boundary extends Component<{ id: number; children: ReactNode }, { error?: string }> {
  state: { error?: string } = {};
  static getDerivedStateFromError(e: Error) { return { error: String(e?.message ?? e) }; }
  render() { return this.state.error ? <pre data-failed={this.props.id} style={{ color: 'red', whiteSpace: 'pre-wrap', fontSize: 11 }}>{this.state.error}</pre> : this.props.children; }
}
const page = Number(new URLSearchParams(location.search).get('page') ?? 0);
const dark = location.search.includes('dark');
const shown = list.slice(page * ${PER_PAGE}, page * ${PER_PAGE} + ${PER_PAGE});
createRoot(document.getElementById('root')!).render(
  <div className={'motion-root' + (dark ? ' dark' : '')} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: 8 }}>
    {shown.map(([id, title, m]) => {
      const C = pick(m);
      return (
        <section key={id} data-ex={id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 8, height: 340, overflow: 'hidden', position: 'relative' }}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>#{id} {title}</div>
          <div data-body={id} style={{ transform: 'scale(0.75)', transformOrigin: '0 0', width: '133%' }}>
            <Boundary id={id}>{C ? <C /> : <pre data-failed={id}>no component export</pre>}</Boundary>
          </div>
        </section>
      );
    })}
  </div>,
);
`);
console.log('› vite build');
try { sh('npx', ['vite', 'build'], work); } catch (e) { console.log(e.stdout || e.stderr); throw new Error('consumer build failed'); }

// 3. render in a browser, page by page
const port = 3031;
const server = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], { cwd: work, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 2500));
const browser = await chromium.launch({ channel: 'chrome' });
const problems = [];
const pages = Math.ceil(examples.length / PER_PAGE);
try {
  for (const theme of ['', '&dark']) {
    for (let p = 0; p < pages; p++) {
      const tab = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
      tab.on('pageerror', (e) => problems.push({ kind: 'pageerror', page: p, theme, message: e.message.slice(0, 200) }));
      tab.on('console', (m) => { if (m.type() === 'error') problems.push({ kind: 'console', page: p, theme, message: m.text().slice(0, 200) }); });
      await tab.goto(`http://localhost:${port}/?page=${p}${theme}`, { waitUntil: 'load' });
      await tab.waitForTimeout(1200);
      const res = await tab.evaluate(() => [...document.querySelectorAll('[data-body]')].map((b) => {
        const id = Number(b.getAttribute('data-body'));
        const failed = b.querySelector('[data-failed]')?.textContent;
        const r = b.getBoundingClientRect();
        const visible = [...b.querySelectorAll("*")].some((e) => { const q = e.getBoundingClientRect(); return q.width > 0 && q.height > 0 && getComputedStyle(e).visibility !== "hidden"; });
        return { id, failed, empty: !visible || r.height < 4 };
      }));
      for (const r of res) {
        if (r.failed) problems.push({ kind: 'crash', id: r.id, theme, message: r.failed.slice(0, 200) });
        else if (r.empty) problems.push({ kind: 'empty', id: r.id, theme });
      }
      if (!theme) await tab.screenshot({ path: path.join(out, `page-${p}.png`), fullPage: true });
      await tab.close();
    }
  }
} finally {
  await browser.close();
  server.kill();
}
const title = (id) => examples[id]?.title;
const uniq = [...new Map(problems.map((p) => [`${p.kind}|${p.id ?? ''}|${p.message ?? ''}`, p])).values()];
await fs.writeFile(path.join(out, 'report.json'), JSON.stringify(uniq.map((p) => ({ ...p, title: title(p.id) })), null, 1));
console.log(`\n${examples.length} examples rendered (light + dark). Problems: ${uniq.length}`);
for (const p of uniq.slice(0, 60)) console.log(`- [${p.kind}${p.theme ? ' dark' : ''}] ${p.id !== undefined ? `#${p.id} ${title(p.id)}: ` : ''}${p.message ?? ''}`);
console.log(`screenshots: ${out}/page-*.png`);
process.exitCode = uniq.length ? 1 : 0;
