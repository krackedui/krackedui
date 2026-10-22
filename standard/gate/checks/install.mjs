// 7. Install: the packed tarball installs and builds in fresh consumer apps outside the monorepo:
//    a) Vite + React (no Tailwind): typecheck + build, using the README's full-page example if it has one;
//    b) Next.js App Router: a *server component* page that uses the flat name of every compound part in
//       the inventory (MenuRoot, CardHeader…), built, started and loaded in a browser without errors;
//    c) every docs example rendered from the tarball in a browser, light and dark: no crash, no console
//       error, no uncaught exception, not empty.
import fs from 'node:fs/promises';
import path from 'node:path';
import { run, pool } from '../lib/context.mjs';
import { PINS, workDir, installApp, freePort, startServer, openExample } from '../lib/consumer.mjs';

// How to render each compound with contract props only, using flat names. `{X}` = flat name prefix.
const COMPOUND_USAGE = {
  Card: `<CardRoot><CardHeader><CardTitle>Title</CardTitle><CardDescription>Description</CardDescription></CardHeader><CardContent>Content</CardContent><CardFooter>Footer</CardFooter></CardRoot>`,
  Table: `<TableRoot><TableHeader><TableRow><TableHead>Name</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>Ada</TableCell></TableRow></TableBody><TableFooter><TableRow><TableCell>1 row</TableCell></TableRow></TableFooter></TableRoot>`,
  Accordion: `<AccordionRoot type="single" collapsible defaultValue="a"><AccordionItem value="a"><AccordionTrigger>Section</AccordionTrigger><AccordionContent>Body</AccordionContent></AccordionItem></AccordionRoot>`,
  Tabs: `<TabsRoot defaultValue="a"><TabsList><TabsTrigger value="a">A</TabsTrigger><TabsTrigger value="b">B</TabsTrigger></TabsList><TabsContent value="a">Panel A</TabsContent><TabsContent value="b">Panel B</TabsContent></TabsRoot>`,
  Menu: `<MenuRoot defaultOpen><MenuTrigger>Open menu</MenuTrigger><MenuContent><MenuLabel>Label</MenuLabel><MenuGroup><MenuItem icon="edit">Edit</MenuItem><MenuCheckboxItem checked>Pinned</MenuCheckboxItem></MenuGroup><MenuSeparator /><MenuRadioGroup value="a"><MenuRadioItem value="a">A</MenuRadioItem></MenuRadioGroup><MenuSub><MenuSubTrigger>More</MenuSubTrigger><MenuSubContent><MenuItem>Nested</MenuItem></MenuSubContent></MenuSub></MenuContent></MenuRoot>`,
  ContextMenu: `<ContextMenuRoot><ContextMenuTrigger>Right-click here</ContextMenuTrigger><ContextMenuContent><ContextMenuLabel>Label</ContextMenuLabel><ContextMenuGroup><ContextMenuItem>Edit</ContextMenuItem><ContextMenuCheckboxItem checked>Pinned</ContextMenuCheckboxItem></ContextMenuGroup><ContextMenuSeparator /><ContextMenuRadioGroup value="a"><ContextMenuRadioItem value="a">A</ContextMenuRadioItem></ContextMenuRadioGroup><ContextMenuSub><ContextMenuSubTrigger>More</ContextMenuSubTrigger><ContextMenuSubContent><ContextMenuItem>Nested</ContextMenuItem></ContextMenuSubContent></ContextMenuSub></ContextMenuContent></ContextMenuRoot>`,
  Dialog: `<DialogRoot><DialogTrigger>Open dialog</DialogTrigger><DialogContent><DialogTitle>Title</DialogTitle><DialogDescription>Description</DialogDescription><DialogFooter><DialogClose>Close</DialogClose></DialogFooter></DialogContent></DialogRoot>`,
  Sheet: `<SheetRoot><SheetTrigger>Open sheet</SheetTrigger><SheetContent><SheetTitle>Title</SheetTitle><SheetDescription>Description</SheetDescription><SheetFooter><SheetClose>Close</SheetClose></SheetFooter></SheetContent></SheetRoot>`,
  Popover: `<PopoverRoot><PopoverAnchor><span>Anchor</span></PopoverAnchor><PopoverTrigger>Open popover</PopoverTrigger><PopoverContent>Body<PopoverClose>Close</PopoverClose></PopoverContent></PopoverRoot>`,
  Sidebar: `<SidebarRoot><SidebarHeader>Workspace</SidebarHeader><SidebarSection title="Pages"><SidebarItem icon="home" active href="#home">Home</SidebarItem></SidebarSection><SidebarFooter>Footer</SidebarFooter></SidebarRoot>`,
};

async function rscPage(ctx) {
  const { inventory } = await ctx.contract();
  const compounds = inventory.filter((e) => e.kind === 'compound');
  const names = new Set();
  const blocks = [];
  const unknown = [];
  for (const e of compounds) {
    for (const p of e.parts) names.add(`${e.name}${p}`);
    const usage = COMPOUND_USAGE[e.name];
    if (usage) blocks.push(`      <section data-gate-compound="${e.name}">${usage}</section>`);
    else unknown.push(e.name);
  }
  // Compounds without a usage recipe: still import every flat part so a missing alias fails the build.
  const refs = unknown.flatMap((n) => compounds.find((e) => e.name === n).parts.map((p) => `${n}${p}`));
  return {
    unknown,
    code: `// Server component: no "use client". Uses only flat compound names, as the standard requires.
import { ${[...names].sort().join(', ')} } from '${ctx.pkg.name}';
${refs.length ? `export const parts = [${refs.join(', ')}];\n` : ''}
export default function Page() {
  return (
    <main>
${blocks.join('\n')}
    </main>
  );
}
`,
  };
}

async function viteSmoke(ctx, tgz, details) {
  const dir = workDir(ctx, 'vite-plain');
  await fs.mkdir(path.join(dir, 'src'), { recursive: true });
  const readme = await fs.readFile(path.join(ctx.registryDir, 'README.md'), 'utf8').catch(() => '');
  const readmePage = readme.match(/Example: a full page[^`]*```tsx\n([\s\S]*?)```/)?.[1];
  const files = {
    'package.json': JSON.stringify({ name: 'gate-vite', private: true, type: 'module' }),
    'index.html': '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>App</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>',
    'vite.config.ts': "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({ plugins: [react()], logLevel: 'error', build: { chunkSizeWarningLimit: 100000 } });\n",
    'tsconfig.json': JSON.stringify({ compilerOptions: { jsx: 'react-jsx', strict: true, module: 'ESNext', moduleResolution: 'Bundler', target: 'ES2022', skipLibCheck: true, noEmit: true, lib: ['ES2022', 'DOM', 'DOM.Iterable'], types: [] }, include: ['src'] }),
    'src/ReadmePage.tsx': readmePage ?? 'export function Page() { return null; }\n',
    'src/main.tsx': `import { createRoot } from 'react-dom/client';
import '${ctx.pkg.name}/styles.css';
import { Theme, Button, IconButton, Menu } from '${ctx.pkg.name}';
import { Page } from './ReadmePage';
createRoot(document.getElementById('root')!).render(
  <Theme appearance="dark">
    <Button variant="primary">New</Button>
    <Menu.Root><Menu.Trigger asChild><IconButton icon="more" label="Actions" /></Menu.Trigger>
      <Menu.Content><Menu.Item icon="link">Copy link</Menu.Item></Menu.Content></Menu.Root>
    <Page />
  </Theme>,
);
`,
  };
  for (const [f, c] of Object.entries(files)) await fs.writeFile(path.join(dir, f), c);
  await installApp(dir, [PINS.react, PINS.reactDom, tgz], [PINS.vite, PINS.pluginReact, PINS.typescript, PINS.typesReact, PINS.typesReactDom]);
  const tsc = await run(path.join(dir, 'node_modules/.bin/tsc'), ['-p', '.'], { cwd: dir, timeout: 300000 });
  if (tsc.code !== 0) for (const l of (tsc.stdout + tsc.stderr).split('\n').filter((x) => /error TS/.test(x)).slice(0, 15)) details.push({ where: 'vite app: typecheck', message: l.trim().slice(0, 300) });
  const vb = await run(path.join(dir, 'node_modules/.bin/vite'), ['build'], { cwd: dir, timeout: 300000 });
  if (vb.code !== 0) details.push({ where: 'vite app: build', message: (vb.stdout + vb.stderr).trim().split('\n').slice(-6).join(' | ').slice(0, 600) });
  return { readme: Boolean(readmePage), ok: tsc.code === 0 && vb.code === 0 };
}

async function nextSmoke(ctx, tgz, details) {
  const dir = workDir(ctx, 'next-app-router');
  await fs.mkdir(path.join(dir, 'app'), { recursive: true });
  await fs.rm(path.join(dir, '.next'), { recursive: true, force: true });
  const { registry } = await ctx.docs();
  const rootClass = registry.previewRootClassName ?? `${ctx.system}-root`;
  const page = await rscPage(ctx);
  const files = {
    'package.json': JSON.stringify({ name: 'gate-next', private: true }),
    'next.config.mjs': 'export default { devIndicators: false };\n',
    'tsconfig.json': JSON.stringify({ compilerOptions: { target: 'ES2022', lib: ['dom', 'dom.iterable', 'esnext'], strict: true, noEmit: true, module: 'esnext', moduleResolution: 'bundler', jsx: 'preserve', skipLibCheck: true, isolatedModules: true, esModuleInterop: true, resolveJsonModule: true, incremental: false, plugins: [{ name: 'next' }] }, include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'], exclude: ['node_modules'] }),
    'app/layout.tsx': `import '${ctx.pkg.name}/styles.css';
import type { ReactNode } from 'react';
export const metadata = { title: 'Gate' };
export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="en"><head><link rel="icon" href="data:," /></head><body className="${rootClass}">{children}</body></html>;
}
`,
    'app/page.tsx': page.code,
  };
  for (const [f, c] of Object.entries(files)) await fs.writeFile(path.join(dir, f), c);
  if (page.unknown.length) details.push({ where: 'next app', message: `no render recipe for compound(s) ${page.unknown.join(', ')}; their flat parts are imported but not rendered (add a recipe in standard/gate/checks/install.mjs)` });
  await installApp(dir, [PINS.next, PINS.react, PINS.reactDom, tgz], [PINS.typescript, PINS.typesReact, PINS.typesReactDom, PINS.typesNode]);
  const nb = await run(path.join(dir, 'node_modules/.bin/next'), ['build'], { cwd: dir, timeout: 600000, env: { NEXT_TELEMETRY_DISABLED: '1' } });
  if (nb.code !== 0) {
    const out = (nb.stdout + nb.stderr).replace(/\x1b\[[0-9;]*m/g, '');
    const lines = out.split('\n').filter((l) => /error|Error|failed|not exported|Type /.test(l)).slice(0, 10);
    for (const l of lines.length ? lines : out.split('\n').slice(-8)) details.push({ where: 'next app: build', message: l.trim().slice(0, 300) });
    return { ok: false };
  }
  const port = await freePort();
  const url = `http://127.0.0.1:${port}/`;
  const srv = await startServer(ctx, path.join(dir, 'node_modules/.bin/next'), ['start', '-p', String(port), '-H', '127.0.0.1'], { cwd: dir, url, env: { NEXT_TELEMETRY_DISABLED: '1' } });
  const browser = await ctx.browser();
  const tab = await browser.newPage();
  const errors = [];
  tab.on('pageerror', (e) => errors.push(`uncaught: ${e.message.slice(0, 300)}`));
  tab.on('console', (m) => { if (m.type() === 'error' && !/favicon\.ico/.test(m.location()?.url ?? '')) errors.push(`console.error: ${m.text().slice(0, 300)}${/Failed to load resource/.test(m.text()) ? ` (${m.location()?.url})` : ''}`); });
  await tab.goto(url, { waitUntil: 'networkidle' });
  await tab.waitForTimeout(500);
  const rendered = await tab.evaluate(() => [...document.querySelectorAll('[data-gate-compound]')].map((s) => [s.getAttribute('data-gate-compound'), (s.textContent ?? '').trim().length > 0]));
  await tab.close();
  srv.kill();
  for (const e of errors) details.push({ where: 'next app: server page', message: e });
  for (const [name, ok] of rendered) if (!ok) details.push({ where: 'next app: server page', message: `${name} rendered nothing` });
  return { ok: errors.length === 0 && rendered.every((r) => r[1]), compounds: rendered.length };
}

export async function renderSweep(ctx) {
  const app = await ctx.examplesApp();
  const browser = await ctx.browser();
  const problems = [];
  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    let done = 0;
    await pool(app.examples, 8, async (ex) => {
      const { page, errors, ready, error } = await openExample(context, app, ex, { theme });
      const where = `${ex.name} (${theme})`;
      if (error) problems.push({ where, message: `crash: ${error}` });
      else if (!ready) problems.push({ where, message: 'did not finish rendering within 20s' });
      for (const e of [...new Set(errors)]) problems.push({ where, message: e });
      if (!error && ready) {
        const empty = await page.evaluate(() => ![...document.body.querySelectorAll('*')].some((el) => {
          if (el.id === 'gate-root' || el.id === 'gate-example' || el.id === 'app' || el.tagName === 'SCRIPT') return false;
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
        }));
        if (empty) problems.push({ where, message: 'renders nothing visible' });
      }
      await page.close();
      if (++done % 100 === 0) ctx.log(`render ${theme}: ${done}/${app.examples.length}`);
    });
    await context.close();
  }
  return { problems, examples: app.examples.length, documents: app.documents.map((e) => e.name), buildErrors: app.buildErrors };
}

async function run_(ctx) {
  const details = [];
  let tgz;
  try { ({ tgz } = await ctx.tarball()); } catch (e) {
    return { status: 'fail', summary: `cannot pack: ${e.message.slice(0, 200)}`, details: [{ where: 'pack', message: e.message.slice(0, 1000) }] };
  }
  ctx.log('vite consumer app');
  const vite = await viteSmoke(ctx, tgz, details).catch((e) => { details.push({ where: 'vite app', message: e.message.slice(0, 600) }); return { ok: false }; });
  ctx.log('next.js consumer app (server components)');
  const next = await nextSmoke(ctx, tgz, details).catch((e) => { details.push({ where: 'next app', message: e.message.slice(0, 600) }); return { ok: false }; });
  ctx.log('render every docs example from the tarball');
  let sweep;
  try { sweep = await renderSweep(ctx); } catch (e) {
    details.push({ where: 'examples app', message: e.message.slice(0, 1000) });
    return { status: 'fail', summary: `vite ${vite.ok ? 'ok' : 'FAIL'}, next ${next.ok ? 'ok' : 'FAIL'}; examples app failed to build`, details };
  }
  details.push(...sweep.problems);
  const broken = new Set(sweep.problems.map((p) => p.where.replace(/ \((light|dark)\)$/, '')));
  return {
    status: vite.ok && next.ok && sweep.problems.length === 0 ? 'pass' : 'fail',
    summary: `vite app ${vite.ok ? 'ok' : 'FAIL'}${vite.readme === false ? ' (README has no full-page example)' : ''}, next RSC app ${next.ok ? `ok (${next.compounds} compounds)` : 'FAIL'}; ${sweep.examples - broken.size}/${sweep.examples} examples render clean in light + dark (${sweep.problems.length} problems)${sweep.documents.length ? `; ${sweep.documents.length} whole-document examples built but not rendered (${sweep.documents.join(', ')})` : ''}`,
    details, data: { buildErrors: sweep.buildErrors },
  };
}
export { run_ as run };
