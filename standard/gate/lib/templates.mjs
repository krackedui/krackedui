// Templates: systems/<name>/templates/<sector>/ is a Vite app with
//   package.json   depends on "@krackedui/<name>" (the workspace package)
//   routes.json    ["/", "/#/projects", …]: every page the gate checks, relative to the app's base URL
//   src/           imports only from "@krackedui/<name>" (plus its "/styles.css" or "/tailwind.css")
// The gate copies each template to a temp dir, points the dependency at the packed tarball, installs,
// builds and serves it. Dark mode is checked through prefers-color-scheme: dark, so templates should
// use <Theme appearance="system"> (or follow the OS setting another way).
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { run, pool, walk } from './context.mjs';
import { workDir, installApp, freePort, startServer, PINS } from './consumer.mjs';
import { axe, focusVisible, targetSize, overflow } from './audits.mjs';

async function buildOne(ctx, tdir, tgz) {
  const name = path.basename(tdir);
  const dir = workDir(ctx, `template-${name}`);
  const keep = existsSync(path.join(dir, 'node_modules'));
  if (keep) { await fs.rename(path.join(dir, 'node_modules'), `${dir}.node_modules`); }
  await fs.rm(dir, { recursive: true, force: true });
  await fs.cp(tdir, dir, { recursive: true, filter: (src) => !/(^|\/)(node_modules|dist|\.vite)(\/|$)/.test(path.relative(tdir, src)) });
  if (keep) await fs.rename(`${dir}.node_modules`, path.join(dir, 'node_modules'));
  const pkg = JSON.parse(await fs.readFile(path.join(dir, 'package.json'), 'utf8'));
  for (const field of ['dependencies', 'devDependencies']) if (pkg[field]?.[ctx.pkg.name]) delete pkg[field][ctx.pkg.name];
  if (!pkg.devDependencies?.vite && !pkg.dependencies?.vite) (pkg.devDependencies ??= {}).vite = PINS.vite.split('@').pop();
  await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify(pkg, null, 1));
  await installApp(dir, [], []);
  await installApp(dir, [tgz], []);
  const b = await run(path.join(dir, 'node_modules/.bin/vite'), ['build'], { cwd: dir, timeout: 600000 });
  if (b.code !== 0) throw new Error(`vite build failed: ${(b.stdout + b.stderr).trim().split('\n').slice(-8).join(' | ').slice(0, 1200)}`);
  const routes = JSON.parse(await fs.readFile(path.join(tdir, 'routes.json'), 'utf8'));
  if (!Array.isArray(routes) || !routes.length || !routes.every((r) => typeof r === 'string')) throw new Error('routes.json must be a non-empty array of route strings');
  const port = await freePort();
  const srv = await startServer(ctx, path.join(dir, 'node_modules/.bin/vite'), ['preview', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: dir, url: `http://127.0.0.1:${port}/` });
  // vite preview prints the URL including the base path
  await new Promise((r) => setTimeout(r, 300));
  const base = srv.log().match(/http:\/\/127\.0\.0\.1:\d+(\/[^\s]*)?/)?.[1] ?? '/';
  const origin = `http://127.0.0.1:${port}${base.endsWith('/') ? base : `${base}/`}`;
  return { name, dir, routes, urls: routes.map((r) => new URL(r.replace(/^\//, ''), origin).href) };
}

/** Build + serve every template once per run. Resolves [{ name, urls } | { name, error }]. */
export async function builtTemplates(ctx) {
  ctx._templatesBuilt ??= (async () => {
    const dirs = await ctx.templates();
    if (!dirs.length) return [];
    const { tgz } = await ctx.tarball();
    return pool(dirs, 2, (d) => buildOne(ctx, d, tgz).catch((e) => ({ name: path.basename(d), error: e.message })));
  })();
  return ctx._templatesBuilt;
}

async function settle(page) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
}

/** Run the a11y or responsive audits on every template route (memoized per kind). */
export async function templateAudits(ctx, kind) {
  ctx._templateAudits ??= {};
  ctx._templateAudits[kind] ??= (async () => {
    const out = { details: [], byRule: {}, pages: 0, note: '' };
    const dirs = await ctx.templates();
    if (!dirs.length) { out.note = 'no templates yet'; return out; }
    const built = await builtTemplates(ctx);
    const browser = await ctx.browser();
    const add = (where, p) => { out.byRule[p.rule] = (out.byRule[p.rule] ?? 0) + 1; out.details.push({ where, message: `${p.rule}: ${p.message}${p.target ? ` — ${p.target}` : ''}` }); };
    for (const t of built) {
      if (t.error) { out.details.push({ where: `template ${t.name}`, message: `not audited: ${t.error}` }); continue; }
      out.pages += t.urls.length;
      const modes = kind === 'a11y'
        ? [['light', { viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce', colorScheme: 'light' }], ['dark', { viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce', colorScheme: 'dark' }], ['touch 375', { viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' }]]
        : (await ctx.contract()).responsiveWidths.map((w) => [`@${w}`, { viewport: { width: w, height: 900 }, reducedMotion: 'reduce', ...(w < 768 ? { hasTouch: true, isMobile: true } : {}) }]);
      for (const [label, opts] of modes) {
        const context = await browser.newContext(opts);
        await pool(t.urls, 4, async (url, i) => {
          const page = await context.newPage();
          const errors = [];
          page.on('pageerror', (e) => errors.push(e.message.split('\n')[0]));
          await page.goto(url, { waitUntil: 'load' });
          await settle(page);
          const where = `template ${t.name} ${t.routes[i]} (${label})`;
          for (const e of errors) add(where, { rule: 'page-error', message: e.slice(0, 300) });
          if (kind === 'a11y') {
            if (label === 'touch 375') for (const p of (await targetSize(page)).problems) add(where, p);
            else {
              for (const v of await axe(page)) add(where, { rule: `axe/${v.rule}`, message: `${v.message} (${v.impact}, ${v.nodes} nodes)`, target: v.target });
              if (label === 'light') for (const p of (await focusVisible(page, { maxStops: 60 })).problems) add(where, p);
            }
          } else for (const p of await overflow(page, opts.viewport.width)) add(where, p);
          await page.close();
        });
        await context.close();
      }
    }
    return out;
  })();
  return ctx._templateAudits[kind];
}

/** Static rules for template sources: public API imports only, no relative escapes, no colors. */
export async function templateSourceProblems(ctx, tdir) {
  const { findColors } = await import('./source-scan.mjs');
  const problems = [];
  const allowedSub = new Set(Object.keys(ctx.pkg.exports ?? {}).filter((k) => k !== '.').map((k) => k.slice(1)));
  for (const f of await walk(path.join(tdir, 'src'), { filter: (p) => /\.(tsx?|jsx?|css)$/.test(p) })) {
    const text = await fs.readFile(f, 'utf8');
    const relf = path.relative(ctx.root, f);
    text.split('\n').forEach((line, i) => {
      for (const m of line.matchAll(/(?:from\s+|import\s*\(\s*|import\s+|@import\s+(?:url\()?)['"]([^'"]+)['"]/g)) {
        const spec = m[1];
        if (spec.startsWith(ctx.pkg.name)) {
          const sub = spec.slice(ctx.pkg.name.length);
          if (sub && !allowedSub.has(sub)) problems.push({ where: `${relf}:${i + 1}`, message: `deep import "${spec}" (only "${ctx.pkg.name}" and its exported files are public)` });
        } else if (spec.startsWith('.')) {
          const target = path.resolve(path.dirname(f), spec);
          if (!target.startsWith(tdir + path.sep)) problems.push({ where: `${relf}:${i + 1}`, message: `relative import "${spec}" leaves the template` });
        } else if (/systems\/|registry\/src/.test(spec)) problems.push({ where: `${relf}:${i + 1}`, message: `import "${spec}" reaches into the monorepo` });
      }
    });
    for (const h of findColors(text)) problems.push({ where: `${relf}:${h.line}`, message: `hard-coded color (${h.kind}) \`${h.match}\`` });
  }
  return problems;
}
