// Source hash: what a gate report vouches for. Any change to the package source, its build pipeline,
// docs, templates, the contract, the gate itself or the approved baselines invalidates the report.
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, walk } from './context.mjs';

export function hashInputs(system) {
  const sys = path.join(ROOT, 'systems', system);
  return [
    path.join(sys, 'registry', 'src'),
    path.join(sys, 'registry', 'build'),
    path.join(sys, 'registry', 'package.json'),
    path.join(sys, 'docs'),
    path.join(sys, 'templates'),
    path.join(sys, 'gate', 'baselines'),
    path.join(ROOT, 'standard', 'contract'),
    path.join(ROOT, 'standard', 'gate'),
  ];
}

export async function sourceHash(system) {
  const h = crypto.createHash('sha256');
  const skip = /(^|\/)(node_modules|dist|build-output|\.next|\.turbo|\.vite)$/;
  for (const input of hashInputs(system)) {
    let files = [];
    const st = await fs.stat(input).catch(() => null);
    if (!st) continue;
    // templates/<x>/dist is the template build output; registry/build is the build *pipeline* (kept).
    files = st.isDirectory() ? await walk(input, { skip, filter: (p) => !/\.tsbuildinfo$/.test(p) }) : [input];
    for (const f of files) {
      h.update(path.relative(ROOT, f).split(path.sep).join('/'));
      h.update('\0');
      h.update(await fs.readFile(f));
      h.update('\0');
    }
  }
  return h.digest('hex');
}
