// 6. Build: the package builds; bundle budgets (dist/client.js ≤ 600 KB minified, styles.css ≤ 250 KB);
// the exports map is exactly the standard one and every target resolves to a file.
import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { transform } from 'esbuild';

const BUDGET = { 'client.js': 600 * 1024, 'styles.css': 250 * 1024 };
const REQUIRED_EXPORTS = ['.', './styles.css', './tailwind.css', './tokens.json', './package.json'];

async function run_(ctx) {
  const b = await ctx.build();
  const details = [];
  if (!b.ok) {
    const errs = b.output.split('\n').filter((l) => /error|Error:/.test(l) && !/^\s+at /.test(l)).slice(0, 12);
    for (const e of errs) details.push({ where: 'build', message: e.trim().slice(0, 300) });
    return { status: 'fail', summary: `npm run build -w ${ctx.pkg.name} failed`, details };
  }
  const data = {};
  const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
  // client.js measured minified (the package may ship it unminified for readable stack traces)
  const clientFile = path.join(ctx.distDir, 'client.js');
  if (existsSync(clientFile)) {
    const min = await transform(await fs.readFile(clientFile, 'utf8'), { minify: true, loader: 'js', format: 'esm', target: 'es2022' });
    data.clientMinBytes = Buffer.byteLength(min.code);
    if (data.clientMinBytes > BUDGET['client.js']) details.push({ where: 'dist/client.js', message: `${kb(data.clientMinBytes)} minified > budget ${kb(BUDGET['client.js'])}` });
  } else details.push({ where: 'dist/client.js', message: 'missing (the standard expects the client bundle at dist/client.js)' });
  const stylesFile = path.join(ctx.distDir, 'styles.css');
  if (existsSync(stylesFile)) {
    data.stylesBytes = (await fs.stat(stylesFile)).size;
    if (data.stylesBytes > BUDGET['styles.css']) details.push({ where: 'dist/styles.css', message: `${kb(data.stylesBytes)} > budget ${kb(BUDGET['styles.css'])}` });
  } else details.push({ where: 'dist/styles.css', message: 'missing' });

  // exports map
  const pkg = JSON.parse(await fs.readFile(path.join(ctx.registryDir, 'package.json'), 'utf8'));
  const exp = pkg.exports ?? {};
  const keys = Object.keys(exp);
  for (const k of REQUIRED_EXPORTS) if (!keys.includes(k)) details.push({ where: 'package.json exports', message: `missing "${k}"` });
  for (const k of keys) if (!REQUIRED_EXPORTS.includes(k)) details.push({ where: 'package.json exports', message: `unexpected "${k}" (the standard allows exactly ${REQUIRED_EXPORTS.join(', ')})` });
  const targets = (v) => (typeof v === 'string' ? [v] : v && typeof v === 'object' ? Object.values(v).flatMap(targets) : []);
  let resolved = 0;
  for (const [k, v] of Object.entries(exp)) for (const t of targets(v)) {
    if (existsSync(path.join(ctx.registryDir, t))) resolved++;
    else details.push({ where: `exports["${k}"]`, message: `${t} does not exist after the build` });
  }
  for (const f of ['main', 'module', 'types']) if (pkg[f] && !existsSync(path.join(ctx.registryDir, pkg[f]))) details.push({ where: `package.json ${f}`, message: `${pkg[f]} does not exist` });
  if (pkg.type !== 'module') details.push({ where: 'package.json', message: '"type" must be "module" (ESM only)' });
  if (JSON.stringify(pkg.sideEffects) !== JSON.stringify(['*.css'])) details.push({ where: 'package.json', message: '"sideEffects" must be ["*.css"]' });
  for (const [dep, range] of Object.entries(pkg.dependencies ?? {})) if (!/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(range)) details.push({ where: 'package.json dependencies', message: `${dep}@${range} is not pinned to an exact version` });
  for (const peer of ['react', 'react-dom']) if (!/^\^19/.test(pkg.peerDependencies?.[peer] ?? '')) details.push({ where: 'package.json peerDependencies', message: `${peer} must be a ^19 peer` });

  return {
    status: details.length ? 'fail' : 'pass',
    summary: `built in ${(b.ms / 1000).toFixed(0)}s; client.js ${data.clientMinBytes ? kb(data.clientMinBytes) : '?'} min (≤ 600 KB), styles.css ${data.stylesBytes ? kb(data.stylesBytes) : '?'} (≤ 250 KB); ${resolved} export targets resolve${details.length ? `; ${details.length} problems` : ''}`,
    details, data,
  };
}
export { run_ as run };
