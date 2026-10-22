// 13. Templates: each systems/<name>/templates/* builds from the packed tarball, imports only the
// public API, has no hard-coded colors, declares its pages in routes.json, and those pages pass the
// a11y and responsive audits. A system needs two templates.
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { rel } from '../lib/context.mjs';
import { builtTemplates, templateAudits, templateSourceProblems } from '../lib/templates.mjs';

const REQUIRED = 2;

async function run_(ctx) {
  const dirs = await ctx.templates();
  const details = [];
  if (dirs.length < REQUIRED) {
    details.push({ where: rel(ctx.templatesDir), message: `templates missing (need ${REQUIRED}, found ${dirs.length})` });
    if (!dirs.length) return { status: 'fail', summary: `templates missing (need ${REQUIRED})`, details };
  }
  for (const d of dirs) {
    if (!existsSync(path.join(d, 'routes.json'))) details.push({ where: rel(d), message: 'missing routes.json (array of routes to check)' });
    const pkg = JSON.parse(await fs.readFile(path.join(d, 'package.json'), 'utf8'));
    const want = `@krackedui/${ctx.system}-template-${path.basename(d)}`;
    if (pkg.name !== want) details.push({ where: `${rel(d)}/package.json`, message: `name should be "${want}"` });
    if (!pkg.dependencies?.[ctx.pkg.name]) details.push({ where: `${rel(d)}/package.json`, message: `must depend on ${ctx.pkg.name}` });
    details.push(...(await templateSourceProblems(ctx, d)));
  }
  const built = await builtTemplates(ctx);
  for (const t of built) if (t.error) details.push({ where: `template ${t.name}`, message: t.error });
  const a11y = await templateAudits(ctx, 'a11y');
  const resp = await templateAudits(ctx, 'responsive');
  details.push(...a11y.details, ...resp.details);
  const ok = built.filter((t) => !t.error);
  return {
    status: details.length ? 'fail' : 'pass',
    summary: `${dirs.length} templates, ${ok.length} build from the tarball; ${a11y.pages} pages: ${a11y.details.length} a11y problems, ${resp.details.length} responsive problems`,
    details,
  };
}
export { run_ as run };
