// 14. Clean: no denied names (systems/<name>/.clean-deny, one per line, case-insensitive whole-word)
// in the built package, the docs content + generated public files, templates (source + build),
// README.md and SYSTEM.md; and no captured material (capture/, mirror/) shipped or referenced.
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { walk, rel } from '../lib/context.mjs';
import { builtTemplates } from '../lib/templates.mjs';

const TEXT = /\.(js|mjs|cjs|ts|tsx|jsx|d\.ts|css|json|md|txt|html|svg|map)$/;

async function run_(ctx) {
  const details = [];
  // The deny list names what a system must not mention, so public repos keep it out of the tree:
  // systems/<name>/.clean-deny (git-ignored) locally, or GATE_CLEAN_DENY_<NAME> (a CI secret; one name per line or comma).
  const fromEnv = process.env[`GATE_CLEAN_DENY_${ctx.system.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`] ?? '';
  const fromFile = await fs.readFile(path.join(ctx.sysDir, '.clean-deny'), 'utf8').catch(() => '');
  const deny = `${fromFile}\n${fromEnv}`
    .split(/[\n,]/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  if (!deny.length) details.push({ where: '.clean-deny', message: `no deny list: add systems/${ctx.system}/.clean-deny or the GATE_CLEAN_DENY_${ctx.system.toUpperCase()} secret` });
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  const re = deny.length ? new RegExp(`(?<![a-z0-9])(?:${deny.map(esc).join('|')})(?![a-z0-9])`, 'gi') : null;

  await ctx.build();
  const roots = [
    ctx.distDir,
    ctx.docsDir,
    path.join(ctx.root, 'apps/docs/public', ctx.system),
    path.join(ctx.root, 'apps/docs/public/r', ctx.system),
    path.join(ctx.registryDir, 'README.md'),
    path.join(ctx.registryDir, 'SYSTEM.md'),
  ];
  for (const t of await ctx.templates()) roots.push(path.join(t, 'src'), path.join(t, 'index.html'), path.join(t, 'README.md'));
  for (const t of (await builtTemplates(ctx).catch(() => []))) if (t.dir) roots.push(path.join(t.dir, 'dist'));

  const counts = {};
  let scanned = 0;
  for (const r of roots) {
    const st = await fs.stat(r).catch(() => null);
    if (!st) continue;
    const files = st.isDirectory() ? await walk(r, { skip: /(^|\/)(node_modules|\.next)$/, filter: (p) => TEXT.test(p) && !p.endsWith('.map') }) : [r];
    for (const f of files) {
      scanned++;
      const text = await fs.readFile(f, 'utf8');
      const lines = text.split('\n');
      const where = f.startsWith(ctx.root) ? rel(f) : `template build/${path.relative(path.dirname(path.dirname(f)), f)}`;
      if (re) lines.forEach((line, i) => {
        re.lastIndex = 0;
        const hits = [...new Set([...line.matchAll(re)].map((m) => m[0]))];
        if (hits.length) {
          for (const h of hits) counts[h.toLowerCase()] = (counts[h.toLowerCase()] ?? 0) + 1;
          details.push({ where: `${where}${lines.length > 1 ? `:${i + 1}` : ''}`, message: `denied name ${hits.map((h) => `"${h}"`).join(', ')}: ${line.trim().slice(0, 140)}` });
        }
      });
      if (/(^|[\s"'(/])(capture|mirror)\/[\w.-]+\.(png|jpe?g|json|html|svg)/.test(text) && !f.includes(`${path.sep}docs${path.sep}`)) {
        details.push({ where, message: 'references a file in capture/ or mirror/' });
      }
    }
  }

  // shipped files
  let packed = [];
  try { packed = (await ctx.tarball()).files; } catch (e) { details.push({ where: 'npm pack', message: e.message.slice(0, 300) }); }
  for (const f of packed) if (/(^|\/)(capture|mirror|raw)\//.test(f) || /\.(png|jpe?g|webp)$/.test(f) && !/^LICENSES\//.test(f)) details.push({ where: `package: ${f}`, message: 'captured or binary asset shipped in the package' });
  if (packed.length && !existsSync(path.join(ctx.registryDir, 'LICENSES'))) details.push({ where: 'registry/LICENSES', message: 'missing (ship licenses for third-party icons and fonts)' });

  const byName = Object.entries(counts).map(([k, v]) => `"${k}" ${v}`).join(', ');
  return {
    status: details.length ? 'fail' : 'pass',
    summary: `${scanned} files scanned, ${packed.length} packed files: ${details.length} problems${byName ? ` (denied names: ${byName})` : ''}`,
    details,
  };
}
export { run_ as run };
