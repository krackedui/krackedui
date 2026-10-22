// The docs site for docs/copy-paste checks: reuse a running one (DOCS_URL or :3002), otherwise start
// `next dev` on a free port for this run and stop it afterwards. Regenerates the docs assets
// (exports list, copy-paste registry, llms.txt) against that URL first.
import fs from 'node:fs/promises';
import path from 'node:path';
import { run } from './context.mjs';
import { freePort, startServer } from './consumer.mjs';

async function answers(url) {
  try { const r = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15000) }); return r.status < 500; } catch { return false; }
}

export async function docsServer(ctx) {
  let base = process.env.DOCS_URL ?? 'http://localhost:3002';
  if (!(await answers(`${base}/${ctx.system}`))) {
    const port = await freePort();
    base = `http://127.0.0.1:${port}`;
    ctx.log(`starting the docs site on :${port}`);
    await startServer(ctx, path.join(ctx.root, 'node_modules/.bin/next'), ['dev', '-p', String(port), '-H', '127.0.0.1'], { cwd: path.join(ctx.root, 'apps/docs'), url: `${base}/${ctx.system}/introduction`, timeout: 300000, env: { NEXT_TELEMETRY_DISABLED: '1' } });
  }
  return base;
}

/** Regenerate the docs assets. Reports whether the committed exports list was stale. */
export async function docsAssets(ctx, base) {
  const exportsFile = path.join(ctx.docsDir, 'generated', 'exports.json');
  const before = await fs.readFile(exportsFile, 'utf8').catch(() => '');
  const steps = [
    ['package exports', ['tooling/pipeline/package-exports.cjs', ctx.system], {}],
    ['copy-paste registry', ['tooling/pipeline/source-registry.mjs', ctx.system], { REGISTRY_URL: `${base}/r/${ctx.system}` }],
    ['llms.txt', ['standard/gate/checks/build-llms.mjs', ctx.system], { DOCS_URL: base }],
  ];
  const errors = [];
  for (const [label, args, env] of steps) {
    const r = await run('node', args, { env, timeout: 300000 });
    if (r.code !== 0) errors.push(`${label}: ${(r.stderr || r.stdout).trim().split('\n').slice(-4).join(' | ').slice(0, 500)}`);
  }
  const after = await fs.readFile(exportsFile, 'utf8').catch(() => '');
  return { errors, exportsStale: Boolean(before) && before !== after };
}
