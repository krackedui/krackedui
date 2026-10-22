// 5. Behaviour tests: vitest (standard/gate/vitest.config.ts) runs the contract tests against the system
// plus the system's own tests; all must pass. Every interactive inventory entry needs a contract test
// (standard/gate/tests/<Name>.test.tsx or a `describe('<Name>'` in a test there). Interactive extras
// without a test in systems/<name>/registry/test are listed as warnings.
import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';
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

  // coverage of interactive inventory entries
  const { inventory } = await ctx.contract();
  const testsDir = path.join(ctx.root, 'standard', 'gate', 'tests');
  const testFiles = await walk(testsDir, { filter: (p) => /\.test\.tsx?$/.test(p) });
  const sources = await Promise.all(testFiles.map((f) => fs.readFile(f, 'utf8')));
  const hasTest = (name) => existsSync(path.join(testsDir, `${name}.test.tsx`)) || sources.some((s) => new RegExp(`describe\\(\\s*['"\`]${name}['"\`]`).test(s));
  const missing = inventory.filter((e) => e.interactive && !hasTest(e.name)).map((e) => e.name);
  for (const m of missing) details.push({ where: m, message: `interactive inventory entry has no contract test (standard/gate/tests/${m}.test.tsx)` });

  // interactive extras without a system test (warning)
  const sysTests = await walk(path.join(ctx.registryDir, 'test'), { filter: (p) => /\.test\.tsx?$/.test(p) });
  const sysSources = await Promise.all(sysTests.map((f) => fs.readFile(f, 'utf8')));
  const invNames = new Set(inventory.map((e) => e.name));
  const extras = (await ctx.exports()).filter((e) => (e.kind === 'component' || e.kind === 'compound') && !invNames.has(e.name) && looksInteractive(e));
  for (const e of extras) {
    const tested = sysTests.some((f) => path.basename(f).replace(/\.test\.tsx?$/, '') === e.name) || sysSources.some((s) => new RegExp(`describe\\(\\s*['"\`]${e.name}['"\`]`).test(s)) || sources.some((s) => new RegExp(`describe\\(\\s*['"\`]${e.name}['"\`]`).test(s));
    if (!tested) warnings.push({ where: e.name, message: `interactive extra (${e.file}) has no test in ${rel(path.join(ctx.registryDir, 'test'))}/${e.name}.test.tsx` });
  }

  const total = res?.numTotalTests ?? 0;
  const failed = res ? (res.numFailedTests ?? 0) + (res.numFailedTestSuites ?? 0) : 1;
  const ok = res && failed === 0 && r.code === 0 && missing.length === 0;
  if (res && r.code !== 0 && failed === 0) details.push({ where: 'vitest', message: `vitest exited ${r.code}: ${(r.stderr || r.stdout).trim().split('\n').slice(-6).join(' | ').slice(0, 800)}` });
  const interactive = inventory.filter((e) => e.interactive).length;
  return {
    status: ok ? 'pass' : 'fail',
    summary: `${res ? `${res.numPassedTests ?? 0}/${total} tests passed in ${res.numTotalTestSuites ?? 0} files` : 'vitest did not report'}; ${interactive - missing.length}/${interactive} interactive inventory entries have a contract test; ${extras.length - warnings.length}/${extras.length} interactive extras tested (warning only)`,
    details, warnings, data: { missingTests: missing },
  };
}
export { run_ as run };
