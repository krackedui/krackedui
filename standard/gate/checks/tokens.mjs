// 3. Tokens (report only): systems keep whatever tokens and naming they come with; nothing here can fail
// the gate. Hard-coded colors in component code and templates are listed as warnings so they're visible
// in GATE.md. Color contrast is enforced where it matters, on rendered UI, by the a11y check (axe).
import fs from 'node:fs/promises';
import path from 'node:path';
import { walk, rel } from '../lib/context.mjs';
import { findColors } from '../lib/source-scan.mjs';

async function run_(ctx) {
  const warnings = [];
  const isGenerated = (text) => /generated|do not edit/i.test(text.split('\n').slice(0, 5).join('\n'));
  const files = [...(await walk(ctx.srcDir, { filter: (p) => /\.(tsx?)$/.test(p) && !/\/styles\//.test(p) }))];
  for (const t of await ctx.templates()) files.push(...(await walk(path.join(t, 'src'), { filter: (p) => /\.(tsx?|css)$/.test(p) })));
  for (const f of files) {
    const text = await fs.readFile(f, 'utf8');
    if (isGenerated(text)) continue;
    for (const h of findColors(text)) warnings.push({ where: `${rel(f)}:${h.line}`, message: `hard-coded color (${h.kind}) \`${h.match}\`` });
  }
  return {
    status: 'pass',
    summary: `report only: ${warnings.length} hard-coded color${warnings.length === 1 ? '' : 's'} flagged in ${files.length} files`,
    details: [],
    warnings,
    data: { hardCodedColors: warnings.length },
  };
}
export { run_ as run };
