// 8. Copy-paste: every registry item (shadcn format, served by the docs site at /r/<system>) installs
// on its own into a fresh project with the real shadcn CLI and typechecks (sweep-copy-paste.mjs).
import fs from 'node:fs/promises';
import path from 'node:path';
import { run } from '../lib/context.mjs';

async function run_(ctx) {
  const docs = await ctx.docsServer();
  const details = docs.errors.map((e) => ({ where: 'docs assets', message: e }));
  const reportFile = path.join(ctx.scratch, 'copy-paste.json');
  await fs.rm(reportFile, { force: true });
  const r = await run('node', ['standard/gate/checks/sweep-copy-paste.mjs', ctx.system, '8'], { env: { REGISTRY_URL: `${docs.base}/r/${ctx.system}`, REPORT_FILE: reportFile }, timeout: 1800000 });
  let rep;
  try { rep = JSON.parse(await fs.readFile(reportFile, 'utf8')); } catch {
    details.push({ where: 'sweep-copy-paste', message: (r.stderr || r.stdout).trim().split('\n').slice(-8).join(' | ').slice(0, 1200) });
    return { status: 'fail', summary: 'copy-paste sweep did not complete', details };
  }
  const bad = rep.results.filter((x) => !x.ok);
  for (const b of bad) details.push({ where: b.name, message: `[${b.stage}] ${String(b.error).replace(/\s+/g, ' ').slice(0, 400)}` });
  return {
    status: bad.length === 0 && details.length === 0 && rep.items > 0 ? 'pass' : 'fail',
    summary: `${rep.results.length - bad.length}/${rep.items} registry items install alone with shadcn and typecheck`,
    details,
  };
}
export { run_ as run };
