// 4. Contract: every inventory entry is exported and accepts its contract props (check-contract.mjs),
// and every compound part has its flat alias in the built package.
import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { run } from '../lib/context.mjs';

async function run_(ctx) {
  const b = await ctx.build();
  const r = await run('node', [path.join(ctx.root, 'standard/gate/checks/check-contract.mjs'), ctx.system], { timeout: 600000 });
  let report;
  try { report = JSON.parse(await fs.readFile(path.join(ctx.scratch, 'contract', 'report.json'), 'utf8')); } catch {
    return { status: 'fail', summary: 'check-contract did not produce a report', details: [(r.stdout + r.stderr).slice(0, 2000)] };
  }
  const details = [];
  for (const [name, msgs] of Object.entries(report.failures)) for (const m of msgs) details.push({ where: name, message: m });
  const aliasesChecked = b.ok && existsSync(path.join(ctx.distDir, 'client.d.ts'));
  if (!aliasesChecked) details.push({ where: 'flat aliases', message: 'not verified: the package build failed (see the build check)' });
  const ok = report.failing.length === 0 && aliasesChecked;
  return {
    status: ok ? 'pass' : 'fail',
    summary: `${report.entries - report.failing.length}/${report.entries} inventory entries conform${report.failing.length ? ` — failing: ${report.failing.join(', ')}` : ''}${aliasesChecked ? '' : ' (flat aliases not verified)'}`,
    details, data: { failing: report.failing },
  };
}
export { run_ as run };
