// 9. Docs: every inventory entry and every other exported component has a page with description,
// installation, ≥1 example, API reference and sections titled "Accessibility" and "Usage";
// API tables match the real props (check-api-docs); snippets compile (check-snippets); every docs page
// loads clean (sweep-docs-pages); SYSTEM.md mentions every inventory entry.
// Non-component exports that look like components can be ignored, with a reason, in standard/gate/docs-ignore.json.
import fs from 'node:fs/promises';
import path from 'node:path';
import { run } from '../lib/context.mjs';

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');

async function run_(ctx) {
  const details = [];
  const data = {};
  const { registry } = await ctx.docs();
  const { inventory } = await ctx.contract();
  const exportsList = await ctx.exports();
  const ignore = JSON.parse(await fs.readFile(path.join(ctx.root, 'standard/gate/docs-ignore.json'), 'utf8').catch(() => '{}'))[ctx.system] ?? {};

  // export name → page slug (API table names first, then title / slug)
  const pageFor = new Map();
  for (const [slug, page] of Object.entries(registry.pages)) {
    for (const t of page.api ?? []) for (const part of String(t.name).split(/\s*\/\s*/)) {
      const base = part.replace(/\(.*$/, '').split('.')[0].trim();
      if (base && !pageFor.has(base)) pageFor.set(base, slug);
    }
  }
  const byTitle = new Map(Object.entries(registry.pages).map(([slug, p]) => [norm(p.title), slug]));
  const bySlug = new Map(Object.keys(registry.pages).map((slug) => [norm(slug.split('/').pop()), slug]));
  const find = (name) => pageFor.get(name) ?? byTitle.get(norm(name)) ?? bySlug.get(norm(name)) ?? byTitle.get(`${norm(name)}s`) ?? bySlug.get(`${norm(name)}s`);

  const invNames = new Set(inventory.map((e) => e.name));
  const required = [
    ...inventory.map((e) => ({ name: e.name, why: 'inventory' })),
    ...exportsList.filter((e) => (e.kind === 'component' || e.kind === 'compound') && !invNames.has(e.name) && !(e.name in ignore)).map((e) => ({ name: e.name, why: `extra (${e.file})` })),
  ];
  const sectionTitles = (p) => (p.sections ?? []).map((s) => String(s.title ?? '').trim().toLowerCase());
  const pageProblems = new Map();
  const checkPage = (slug) => {
    if (pageProblems.has(slug)) return pageProblems.get(slug);
    const p = registry.pages[slug];
    const miss = [];
    if (!p.description) miss.push('description');
    if (!p.install?.length) miss.push('installation');
    if (!(p.examples?.length || p.hero)) miss.push('examples');
    if (!p.api?.length) miss.push('API reference');
    if (!sectionTitles(p).includes('accessibility')) miss.push('"Accessibility" section');
    if (!sectionTitles(p).includes('usage')) miss.push('"Usage" section');
    pageProblems.set(slug, miss);
    return miss;
  };
  let noPage = 0;
  let incomplete = 0;
  for (const r of required) {
    const slug = find(r.name);
    if (!slug) { noPage++; details.push({ where: r.name, message: `no docs page (${r.why})` }); continue; }
    const miss = checkPage(slug);
    if (miss.length) { incomplete++; details.push({ where: `${r.name} → ${slug}`, message: `page lacks ${miss.join(', ')}` }); }
  }
  for (const name of Object.keys(ignore)) if (!exportsList.some((e) => e.name === name)) details.push({ where: 'docs-ignore.json', message: `"${name}" is not exported any more; remove it from the ignore list` });
  data.coverage = { required: required.length, noPage, incomplete };

  // SYSTEM.md mentions every inventory entry
  const systemMd = await fs.readFile(path.join(ctx.registryDir, 'SYSTEM.md'), 'utf8').catch(() => '');
  if (!systemMd) details.push({ where: 'registry/SYSTEM.md', message: 'missing' });
  const unmentioned = inventory.filter((e) => !new RegExp(`\\b${e.name}\\b`).test(systemMd)).map((e) => e.name);
  if (systemMd && unmentioned.length) details.push({ where: 'registry/SYSTEM.md', message: `does not mention: ${unmentioned.join(', ')}` });

  // API tables vs real props
  const api = await run('node', ['standard/gate/checks/check-api-docs.mjs', ctx.system], { timeout: 600000 });
  let apiReport = null;
  try { apiReport = JSON.parse(await fs.readFile(path.join(ctx.root, '.scratch/api-check/report.json'), 'utf8')); } catch { details.push({ where: 'check-api-docs', message: (api.stderr || api.stdout).slice(-600) }); }
  let wrong = 0; let missing = 0; let notFound = 0;
  for (const r of apiReport ?? []) {
    if (r.issue) { notFound++; details.push({ where: `${r.slug} API "${r.name}"`, message: r.issue }); continue; }
    wrong += r.wrong.length; missing += r.missing.length;
    details.push({ where: `${r.slug} API "${r.name}"`, message: [r.wrong.length && `documented but not real: ${r.wrong.join(', ')}`, r.missing.length && `real but undocumented: ${r.missing.join(', ')}`].filter(Boolean).join('; ') });
  }

  // snippets compile
  const sn = await run('node', ['standard/gate/checks/check-snippets.mjs', ctx.system], { timeout: 600000 });
  let snippetErrors = 0;
  try {
    const rep = JSON.parse(await fs.readFile(path.join(ctx.root, '.scratch/snippets', ctx.system, '_report.json'), 'utf8'));
    for (const [file, errs] of Object.entries(rep)) { snippetErrors += errs.length; details.push({ where: `snippet ${file}`, message: errs.slice(0, 3).join(' / ').slice(0, 400) }); }
  } catch { snippetErrors = 1; details.push({ where: 'check-snippets', message: (sn.stderr || sn.stdout).slice(-600) }); }

  // every docs page loads clean
  const docs = await ctx.docsServer();
  for (const e of docs.errors) details.push({ where: 'docs assets', message: e });
  if (docs.exportsStale) details.push({ where: 'docs/generated/exports.json', message: 'was stale and has been regenerated (npm run docs:assets); re-run the gate' });
  const reportFile = path.join(ctx.scratch, 'docs-pages.json');
  await fs.rm(reportFile, { force: true });
  const sw = await run('node', ['standard/gate/checks/sweep-docs-pages.mjs', ctx.system], { env: { DOCS_URL: docs.base, REPORT_FILE: reportFile }, timeout: 1800000 });
  let pageIssues = 0; let pages = 0;
  try {
    const rep = JSON.parse(await fs.readFile(reportFile, 'utf8'));
    pages = rep.pages;
    const uniq = new Map(rep.problems.map((p) => [`${p.url}|${p.kind}|${p.message}`, p]));
    pageIssues = uniq.size;
    for (const p of uniq.values()) details.push({ where: p.url.replace(docs.base, ''), message: `[${p.kind}] ${p.message}` });
  } catch { pageIssues = 1; details.push({ where: 'sweep-docs-pages', message: (sw.stderr || sw.stdout).slice(-600) }); }

  const fail = details.length > 0;
  return {
    status: fail ? 'fail' : 'pass',
    summary: `coverage: ${required.length - noPage - incomplete}/${required.length} exports have a complete page (${noPage} without page, ${incomplete} incomplete); API: ${wrong} wrong, ${missing} undocumented props, ${notFound} tables not matched; snippets: ${snippetErrors} errors; pages: ${pageIssues} problems on ${pages}; SYSTEM.md misses ${unmentioned.length} entries`,
    details, data,
  };
}
export { run_ as run };
