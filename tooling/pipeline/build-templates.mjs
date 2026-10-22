// Build every template of a system and copy it into the docs site, where it is served at
// <system>.krackedui.com/<template>/ (apps/docs/middleware.ts). Templates build against the package's
// dist (workspace link), exactly as a consumer would; run the package build first.
// Usage: node tooling/pipeline/build-templates.mjs [system=motion]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const system = process.argv[2] ?? 'motion';
const root = path.resolve('.');
const dir = path.join(root, 'systems', system, 'templates');
const names = (await fs.readdir(dir, { withFileTypes: true }).catch(() => [])).filter((d) => d.isDirectory()).map((d) => d.name);
if (!names.length) {
  console.log(`no templates in ${path.relative(root, dir)}`);
  process.exit(0);
}
for (const name of names) {
  const src = path.join(dir, name);
  const pkg = JSON.parse(await fs.readFile(path.join(src, 'package.json'), 'utf8'));
  execFileSync('npm', ['run', 'build', '-w', pkg.name], { cwd: root, stdio: ['ignore', 'pipe', 'inherit'] });
  const out = path.join(root, 'apps', 'docs', 'public', system, name);
  await fs.rm(out, { recursive: true, force: true });
  await fs.cp(path.join(src, 'dist'), out, { recursive: true });
  console.log(`${pkg.name} → ${path.relative(root, out)}`);
}
