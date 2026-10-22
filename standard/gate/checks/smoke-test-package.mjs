// Release check for a Motion package: pack it exactly as npm would, install the tarball into fresh
// consumer apps outside the monorepo, and typecheck + build them.
//   1. Vite + React, no Tailwind      (import '@krackedui/motion/styles.css')
//   2. Next.js App Router, server page (flat compound aliases, server-safe helpers)
// The README's full-page example is compiled too.
// Usage: node standard/gate/checks/smoke-test-package.mjs [system=motion]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const system = process.argv[2] ?? 'motion';
const root = path.resolve('.');
const pkgDir = path.join(root, 'systems', system, 'registry');
const pkg = JSON.parse(await fs.readFile(path.join(pkgDir, 'package.json'), 'utf8'));
const work = path.join(os.tmpdir(), `motion-smoke-${pkg.name.replace(/[@/]/g, "-")}`);
const sh = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
const step = (s) => console.log(`› ${s}`);

step(`pack ${pkg.name}@${pkg.version}`);
await fs.mkdir(work, { recursive: true });
const tgz = path.join(work, sh('npm', ['pack', '--pack-destination', work, '--silent'], pkgDir).trim().split('\n').pop());

const readme = await fs.readFile(path.join(pkgDir, 'README.md'), 'utf8');
const readmePage = readme.match(/Example: a full page[^`]*```tsx\n([\s\S]*?)```/)?.[1];
if (!readmePage) throw new Error('README full-page example not found');

async function app(name, files, deps, devDeps, checks) {
  const dir = path.join(work, name);
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
  for (const [f, c] of Object.entries(files)) {
    await fs.mkdir(path.dirname(path.join(dir, f)), { recursive: true });
    await fs.writeFile(path.join(dir, f), c);
  }
  step(`${name}: install`);
  sh('npm', ['i', '--silent', ...deps, tgz], dir);
  sh('npm', ['i', '--silent', '-D', ...devDeps], dir);
  for (const [label, cmd, args] of checks) { step(`${name}: ${label}`); sh(cmd, args, dir); }
  console.log(`✓ ${name}`);
}

const tsconfig = JSON.stringify({ compilerOptions: { jsx: 'react-jsx', strict: true, module: 'ESNext', moduleResolution: 'Bundler', target: 'ES2022', skipLibCheck: true, noEmit: true, lib: ['ES2022', 'DOM'] }, include: ['src'] });

await app('vite-plain', {
  'package.json': JSON.stringify({ name: 'smoke-vite', private: true, type: 'module' }),
  'index.html': '<!doctype html><div id="root"></div><script type="module" src="/src/main.tsx"></script>',
  'vite.config.ts': "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({ plugins: [react()] });\n",
  'tsconfig.json': tsconfig,
  'src/ReadmePage.tsx': readmePage,
  'src/main.tsx': `import { createRoot } from 'react-dom/client';
import '@krackedui/motion/styles.css';
import { Button, Menu, IconButton, DatabaseView, createTasksSample, Editor, rt } from '@krackedui/motion';
import { Page } from './ReadmePage';
createRoot(document.getElementById('root')!).render(
  <div className="motion-root dark">
    <Button variant="primary">New</Button>
    <Menu.Root><Menu.Trigger asChild><IconButton icon="ellipsis" label="Actions" /></Menu.Trigger>
      <Menu.Content><Menu.Item icon="link">Copy link</Menu.Item></Menu.Content></Menu.Root>
    <Editor defaultValue={[{ id: 'a', type: 'text', text: rt('Hello') }]} />
    <DatabaseView data={createTasksSample()} />
    <Page />
  </div>,
);
`,
}, ['react@19.1.0', 'react-dom@19.1.0'], ['vite@6.3.5', '@vitejs/plugin-react@4.5.2', 'typescript@5.8.3', '@types/react@19.1.8', '@types/react-dom@19.1.6'],
[['typecheck', 'npx', ['tsc', '-p', '.']], ['build', 'npx', ['vite', 'build']]]);

await app('next-app-router', {
  'package.json': JSON.stringify({ name: 'smoke-next', private: true }),
  'app/layout.tsx': `import '@krackedui/motion/styles.css';
import type { ReactNode } from 'react';
export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="en"><body className="motion-root">{children}</body></html>;
}
`,
  'app/page.tsx': `// server component
import { Button, Callout, BlockContent, rt, MenuRoot, MenuTrigger, MenuContent, MenuItem, IconButton, DatabaseView, createTasksSample } from '@krackedui/motion';
export default function Page() {
  return (
    <main>
      <Button variant="primary">New</Button>
      <MenuRoot><MenuTrigger asChild><IconButton icon="ellipsis" label="Actions" /></MenuTrigger>
        <MenuContent><MenuItem icon="link">Copy link</MenuItem></MenuContent></MenuRoot>
      <BlockContent><Callout icon="🚀" text={rt('Server rendered')} /></BlockContent>
      <DatabaseView data={createTasksSample()} />
    </main>
  );
}
`,
}, ['next@15.3.4', 'react@19.1.0', 'react-dom@19.1.0'], ['typescript@5.8.3', '@types/react@19.1.8', '@types/react-dom@19.1.6', '@types/node@22.15.30'],
[['build', 'npx', ['next', 'build']]]);

console.log(`\nAll consumer checks passed for ${pkg.name}@${pkg.version} (${path.basename(tgz)}).`);
