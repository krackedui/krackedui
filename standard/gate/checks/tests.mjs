// 5. Behaviour tests: vitest (standard/gate/vitest.config.ts) runs the system's own tests
// (systems/<name>/registry/test); all must pass. Interactive components without a test (no
// <Name>.test.tsx and no `describe('<Name>'`) are listed as warnings, not failures.
import fs from 'node:fs/promises';
import path from 'node:path';
import { run, walk, rel } from '../lib/context.mjs';
import { looksInteractive } from '../lib/exports.mjs';

async function run_(ctx) {
  const out = path.join(ctx.root, '.scratch', 'gate', ctx.system, 'vitest.json');
  await fs.rm(out, { force: true });
  const r = await run(path.join(ctx.root, 'node_modules/.bin/vitest'), ['run', '-c', 'standard/gate/vitest.config.ts'], { env: { SYSTEM: ctx.system, CI: '1' }, timeout: 900000 });
  const details = [];
  const warnings = [];
  let res = null;
  try { res = JSON.parse(await fs.readFile(out, 'utf8')); } catch { /* reported below */ }
  if (!res) {
    details.push({ where: 'vitest', message: `no results (exit ${r.code}): ${(r.stderr || r.stdout).trim().split('\n').slice(-12).join(' | ').slice(0, 1500)}` });
  } else {
    for (const f of res.testResults ?? []) {
      if (f.status === 'failed' && !(f.assertionResults ?? []).some((a) => a.status === 'failed')) {
        details.push({ where: rel(f.name), message: `suite failed to run: ${(f.message ?? '').split('\n').slice(0, 3).join(' ').slice(0, 400)}` });
      }
      for (const a of f.assertionResults ?? []) {
        if (a.status === 'failed') details.push({ where: rel(f.name), message: `✗ ${a.fullName}: ${(a.failureMessages ?? []).join(' ').split('\n')[0].slice(0, 300)}` });
      }
    }
  }

  // interactive components without a test (warning)
  const sysTests = await walk(path.join(ctx.registryDir, 'test'), { filter: (p) => /\.test\.tsx?$/.test(p) });
  const sysSources = await Promise.all(sysTests.map((f) => fs.readFile(f, 'utf8')));
  const interactive = (await ctx.exports()).filter((e) => (e.kind === 'component' || e.kind === 'compound') && looksInteractive(e));
  for (const e of interactive) {
    const tested = sysTests.some((f) => path.basename(f).replace(/\.test\.tsx?$/, '') === e.name) || sysSources.some((s) => new RegExp(`describe\\(\\s*['"\`]${e.name}['"\`]`).test(s));
    if (!tested) warnings.push({ where: e.name, message: `interactive component (${e.file}) has no test in ${rel(path.join(ctx.registryDir, 'test'))}` });
  }

  const total = res?.numTotalTests ?? 0;
  const failed = res ? (res.numFailedTests ?? 0) + (res.numFailedTestSuites ?? 0) : 1;
  const ok = res && failed === 0 && r.code === 0 && total > 0;
  if (res && total === 0) details.push({ where: 'tests', message: `no tests found in ${rel(path.join(ctx.registryDir, 'test'))}` });
  if (res && r.code !== 0 && failed === 0) details.push({ where: 'vitest', message: `vitest exited ${r.code}: ${(r.stderr || r.stdout).trim().split('\n').slice(-6).join(' | ').slice(0, 800)}` });
  return {
    status: ok ? 'pass' : 'fail',
    summary: `${res ? `${res.numPassedTests ?? 0}/${total} tests passed in ${res.numTotalTestSuites ?? 0} files` : 'vitest did not report'}; ${interactive.length - warnings.length}/${interactive.length} interactive components have a test (untested ones are flagged)`,
    details, warnings, data: { untested: warnings.map((w) => w.where) },
  };
}
export { run_ as run };
