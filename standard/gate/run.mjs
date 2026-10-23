#!/usr/bin/env node
// The KrackedUI gate: npm run gate -- <system> [--only a,b] [--skip-slow] [--update-baselines]
// Runs the checks of standard/SPEC.md §12 in order and writes systems/<system>/gate-report.json + GATE.md.
// A report is publishable (see verify.mjs) only when every check ran and passed (no --only/--skip-slow).
import path from 'node:path';
import { createContext, ROOT } from './lib/context.mjs';
import { sourceHash } from './lib/hash.mjs';
import { writeReports } from './lib/report.mjs';

export const CHECKS = [
  ['typecheck', 'Typecheck', false],
  ['lint', 'Lint', false],
  ['tokens', 'Tokens (report only)', false],
  ['tests', 'Behaviour tests', false],
  ['build', 'Build', false],
  ['install', 'Install', true],
  ['copy-paste', 'Copy-paste', true],
  ['a11y', 'Accessibility', true],
  ['responsive', 'Responsive', true],
  ['visual', 'Visual', true],
  ['templates', 'Templates', true],
  ['clean', 'Clean', false],
];

function parseArgs(argv) {
  const args = { system: null, only: null, skipSlow: false, updateBaselines: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--only') args.only = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
    else if (a.startsWith('--only=')) args.only = a.slice(7).split(',').map((s) => s.trim()).filter(Boolean);
    else if (a === '--skip-slow') args.skipSlow = true;
    else if (a === '--update-baselines') args.updateBaselines = true;
    else if (a === '-h' || a === '--help') args.help = true;
    else if (!a.startsWith('-') && !args.system) args.system = a;
    else throw new Error(`unknown argument: ${a}`);
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
if (args.help || !args.system) {
  console.log(`usage: npm run gate -- <system> [--only ${CHECKS.map((c) => c[0]).join(',')}] [--skip-slow] [--update-baselines]`);
  process.exit(args.help ? 0 : 2);
}
const unknown = (args.only ?? []).filter((id) => !CHECKS.some((c) => c[0] === id));
if (unknown.length) { console.error(`unknown check(s): ${unknown.join(', ')}`); process.exit(2); }

process.chdir(ROOT);
const started = Date.now();
const ctx = await createContext(args.system, { updateBaselines: args.updateBaselines });
const partial = Boolean(args.only || args.skipSlow);
const hashBefore = await sourceHash(args.system);
console.log(`gate: ${args.system}${partial ? ' (partial)' : ''}\n`);

const results = [];
let interrupted = false;
const stop = async () => { interrupted = true; await ctx.cleanup(); process.exit(130); };
process.on('SIGINT', stop);
process.on('SIGTERM', stop);

try {
  for (const [id, title, slow] of CHECKS) {
    if (args.only && !args.only.includes(id)) { results.push({ id, title, status: 'skip', summary: 'not selected (--only)', details: [] }); continue; }
    if (args.skipSlow && slow) { results.push({ id, title, status: 'skip', summary: 'slow check skipped (--skip-slow)', details: [] }); continue; }
    const t = Date.now();
    console.log(`▸ ${id}`);
    let r;
    try {
      const mod = await import(`./checks/${id}.mjs`);
      r = await mod.run(ctx);
    } catch (e) {
      r = { status: 'fail', summary: `check crashed: ${e?.message ?? e}`, details: [String(e?.stack ?? e).split('\n').slice(0, 8).join('\n')] };
    }
    const res = { id, title, status: r.status, summary: r.summary, durationSec: Math.round((Date.now() - t) / 1000), details: r.details ?? [], ...(r.warnings?.length ? { warnings: r.warnings } : {}), ...(r.data ? { data: r.data } : {}) };
    results.push(res);
    const mark = res.status === 'pass' ? '✓' : res.status === 'skip' ? '–' : '✗';
    console.log(`${mark} ${id} (${res.durationSec}s): ${res.summary}`);
    for (const d of res.details.slice(0, 8)) console.log(`     · ${(typeof d === 'string' ? d : [d.where, d.message].filter(Boolean).join(': ')).split('\n')[0].slice(0, 220)}`);
    if (res.details.length > 8) console.log(`     · … ${res.details.length - 8} more (GATE.md)`);
    console.log('');
  }
} finally {
  if (!interrupted) await ctx.cleanup();
}

const hashAfter = await sourceHash(args.system);
const allPass = results.every((r) => r.status === 'pass');
const anyFail = results.some((r) => r.status === 'fail');
const report = {
  system: args.system,
  status: anyFail ? 'fail' : allPass ? 'pass' : 'incomplete',
  partial,
  timestamp: new Date().toISOString(),
  durationSec: Math.round((Date.now() - started) / 1000),
  command: `npm run gate -- ${process.argv.slice(2).join(' ')}`,
  // If the source changed while the gate ran, the report vouches for nothing.
  sourceHash: hashBefore === hashAfter ? hashAfter : `changed-during-run:${hashAfter}`,
  checks: results,
};
if (hashBefore !== hashAfter) console.log('! sources changed while the gate was running; this report is not valid for publishing.');
await writeReports(ctx, report);
console.log(`${report.status.toUpperCase()}${partial ? ' (partial)' : ''} in ${report.durationSec}s: ${results.filter((r) => r.status === 'pass').length} pass, ${results.filter((r) => r.status === 'fail').length} fail, ${results.filter((r) => r.status === 'skip').length} skip`);
console.log(`→ ${path.relative(ROOT, path.join(ctx.sysDir, 'GATE.md'))}`);
process.exit(report.status === 'pass' && !partial ? 0 : report.status === 'fail' ? 1 : partial && !anyFail ? 0 : 1);
