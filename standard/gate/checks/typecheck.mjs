// 1. Typecheck: registry, playground, docs app (which includes systems/<name>/docs), contract tests and
// every template, all strict, 0 errors.
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { run, pool, rel } from '../lib/context.mjs';

export { runCheck as run };

async function runCheck(ctx) {
  const tsc = path.join(ctx.root, 'node_modules/.bin/tsc');
  // Contract tests are system-agnostic: point '@system' at this system.
  const testsTsconfig = path.join(ctx.scratch, 'tsconfig.tests.json');
  await fs.writeFile(testsTsconfig, JSON.stringify({
    extends: path.join(ctx.root, 'standard/gate/tests/tsconfig.json'),
    compilerOptions: { paths: { '@system': [path.join(ctx.srcDir, 'index.ts')] } },
    include: [path.join(ctx.root, 'standard/gate/tests/**/*.ts'), path.join(ctx.root, 'standard/gate/tests/**/*.tsx'), path.join(ctx.registryDir, 'test/**/*.ts'), path.join(ctx.registryDir, 'test/**/*.tsx')],
  }, null, 1));
  const projects = [
    ['registry', path.join(ctx.registryDir, 'tsconfig.json')],
    ['playground', path.join(ctx.sysDir, 'playground/tsconfig.json')],
    ['docs (apps/docs + systems docs)', path.join(ctx.root, 'apps/docs/tsconfig.json')],
    ['tests', testsTsconfig],
  ];
  for (const t of await ctx.templates()) projects.push([`template ${path.basename(t)}`, path.join(t, 'tsconfig.json')]);

  const details = [];
  const counts = {};
  await pool(projects, 4, async ([name, tsconfig]) => {
    if (!existsSync(tsconfig)) { counts[name] = 'missing tsconfig'; details.push({ where: name, message: `missing ${rel(tsconfig)}` }); return; }
    // Strictness is part of the check: a project that turns strict off fails.
    const strict = await isStrict(tsconfig);
    if (!strict) details.push({ where: name, message: `${rel(tsconfig)} is not "strict": true` });
    const r = await run(tsc, ['-p', tsconfig, '--noEmit', '--pretty', 'false'], { cwd: path.dirname(tsconfig), timeout: 600000 });
    const errs = (r.stdout + r.stderr).split('\n').filter((l) => /error TS\d+/.test(l));
    counts[name] = errs.length;
    if (r.code !== 0 && !errs.length) details.push({ where: name, message: (r.stdout + r.stderr).trim().slice(0, 400) || `tsc exited ${r.code}` });
    for (const e of errs) {
      const m = e.match(/^(.*?)\((\d+),(\d+)\): error (TS\d+): (.*)$/);
      const file = m ? rel(path.resolve(path.dirname(tsconfig), m[1])) : '';
      details.push({ where: `${name}`, message: m ? `${file}:${m[2]} ${m[4]} ${m[5]}` : e.trim() });
    }
  });
  const total = Object.values(counts).reduce((n, c) => n + (typeof c === 'number' ? c : 1), 0) + details.filter((d) => /not "strict"/.test(d.message)).length;
  const summary = Object.entries(counts).map(([k, v]) => `${k}: ${typeof v === 'number' ? `${v} errors` : v}`).join(', ');
  return { status: total === 0 ? 'pass' : 'fail', summary: `${total} errors (${summary})`, details, data: { counts } };
}

async function isStrict(tsconfig, depth = 0) {
  try {
    const txt = await fs.readFile(tsconfig, 'utf8');
    const json = JSON.parse(txt.replace(/\/\/.*$/gm, '').replace(/,(\s*[}\]])/g, '$1'));
    if (json.compilerOptions?.strict === true) return true;
    if (json.compilerOptions?.strict === false) return false;
    if (json.extends && depth < 5) return isStrict(path.resolve(path.dirname(tsconfig), json.extends.endsWith('.json') ? json.extends : `${json.extends}.json`), depth + 1);
  } catch { /* unreadable: report as not strict */ }
  return false;
}
