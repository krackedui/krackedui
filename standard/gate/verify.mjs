// Publish/deploy guard: passes only if systems/<system>/gate-report.json says the full gate passed
// for exactly the current source (same sourceHash). Wired into the package's `prepublishOnly`.
// Usage: node standard/gate/verify.mjs <system> [<system>…]
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT } from './lib/context.mjs';
import { sourceHash } from './lib/hash.mjs';

/** Resolves { ok, reason } for one system. */
export async function verify(system) {
  const file = path.join(ROOT, 'systems', system, 'gate-report.json');
  let report;
  try { report = JSON.parse(await fs.readFile(file, 'utf8')); } catch {
    return { ok: false, reason: `no gate report (systems/${system}/gate-report.json). Run: npm run gate -- ${system}` };
  }
  if (report.system !== system) return { ok: false, reason: `gate-report.json is for "${report.system}", not "${system}"` };
  if (report.partial) return { ok: false, reason: `the last gate run was partial (--only/--skip-slow). Run the full gate: npm run gate -- ${system}` };
  if (report.status !== 'pass') {
    const failed = (report.checks ?? []).filter((c) => c.status !== 'pass').map((c) => c.id).join(', ');
    return { ok: false, reason: `the gate failed (${failed || 'see GATE.md'}). Fix the failures and run: npm run gate -- ${system}` };
  }
  const now = await sourceHash(system);
  if (report.sourceHash !== now) return { ok: false, reason: `the source changed since the gate passed (${report.timestamp}). Run: npm run gate -- ${system}` };
  return { ok: true, reason: `gate passed at ${report.timestamp} for the current source` };
}

/** Every system with a registry package. */
export async function allSystems() {
  const dirs = await fs.readdir(path.join(ROOT, 'systems'), { withFileTypes: true });
  const out = [];
  for (const d of dirs) if (d.isDirectory() && (await fs.stat(path.join(ROOT, 'systems', d.name, 'registry', 'package.json')).catch(() => null))) out.push(d.name);
  return out.sort();
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const systems = process.argv.slice(2);
  if (!systems.length) { console.error('usage: node standard/gate/verify.mjs <system> [<system>…]'); process.exit(2); }
  let ok = true;
  for (const s of systems) {
    const r = await verify(s);
    console[r.ok ? 'log' : 'error'](`${r.ok ? '✓' : '✗'} ${s}: ${r.reason}`);
    ok &&= r.ok;
  }
  if (!ok) console.error('\nRefusing: publishing and deploying require a passing gate for the current source (standard/SPEC.md §12).');
  process.exit(ok ? 0 : 1);
}
