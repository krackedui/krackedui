// 2. Lint: ESLint 9 (eslint.config.mjs: typescript-eslint recommended-type-checked, react-hooks, jsx-a11y)
// over the system's registry/src, registry/test, templates and docs: 0 errors. Plus a ban on
// suppression comments (`eslint-disable`, `@ts-ignore`, `@ts-nocheck`) in the package and templates.
import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { run, walk, rel } from '../lib/context.mjs';

async function run_(ctx) {
  const targets = [
    path.join(ctx.srcDir),
    path.join(ctx.registryDir, 'test'),
    ...(await ctx.templates()).map((t) => path.join(t, 'src')),
    ctx.docsDir,
  ].filter((p) => existsSync(p));
  const out = path.join(ctx.scratch, 'eslint.json');
  await fs.rm(out, { force: true });
  const r = await run(path.join(ctx.root, 'node_modules/.bin/eslint'), ['--format', 'json', '--output-file', out, '--no-warn-ignored', '--no-error-on-unmatched-pattern', ...targets.map(rel)], { timeout: 900000 });
  let results;
  try { results = JSON.parse(await fs.readFile(out, 'utf8')); } catch {
    return { status: 'fail', summary: 'eslint did not run', details: [(r.stderr || r.stdout).trim().slice(0, 1500)] };
  }
  const details = [];
  const warnings = [];
  const byRule = {};
  let errors = 0;
  for (const f of results) for (const m of f.messages) {
    const rule = m.ruleId ?? (m.fatal ? 'parse-error' : 'eslint');
    const item = { where: `${rel(f.filePath)}:${m.line}`, message: `${rule}: ${m.message}` };
    if (m.severity === 2 || m.fatal) { errors++; byRule[rule] = (byRule[rule] ?? 0) + 1; details.push(item); } else warnings.push(item);
  }

  // Suppression comments: never allowed in shipped code (registry/src) or templates.
  const banned = /\beslint-disable\b|@ts-ignore\b|@ts-nocheck\b/;
  const scan = [ctx.srcDir, ...(await ctx.templates()).map((t) => path.join(t, 'src'))].filter((p) => existsSync(p));
  for (const dir of scan) {
    for (const f of await walk(dir, { filter: (p) => /\.(tsx?|jsx?|mjs|cjs|css)$/.test(p) })) {
      const lines = (await fs.readFile(f, 'utf8')).split('\n');
      lines.forEach((line, i) => {
        const m = line.match(banned);
        if (m) { errors++; byRule['no-suppression-comments'] = (byRule['no-suppression-comments'] ?? 0) + 1; details.push({ where: `${rel(f)}:${i + 1}`, message: `no-suppression-comments: \`${m[0]}\` is not allowed; fix the code instead` }); }
      });
    }
  }
  details.sort((a, b) => a.message.localeCompare(b.message));
  const ruleSummary = Object.entries(byRule).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ');
  return {
    status: errors ? 'fail' : 'pass',
    summary: `${errors} errors, ${warnings.length} warnings in ${results.length} files${ruleSummary ? ` — by rule: ${ruleSummary}` : ''}`,
    details, warnings, data: { byRule },
  };
}
export { run_ as run };
