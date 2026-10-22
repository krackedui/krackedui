// Generate AI-readable docs for a system: /<system>/llms.txt (index) and /<system>/llms-full.txt
// (SYSTEM.md + every page: description, API props, complete runnable examples).
// Usage: node standard/gate/checks/build-llms.mjs <system>  → apps/docs/public/<system>/llms*.txt
import { build } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';

const system = process.argv[2] ?? 'motion';
const root = path.resolve('.');
const tmp = path.join(root, '.scratch', 'llms', system);
await fs.mkdir(tmp, { recursive: true });
const stub = path.join(tmp, 'next-link-stub.mjs');
await fs.writeFile(stub, 'export default function Link() { return null; }\n');
const load = async (entry, name, alias = {}) => {
  const outfile = path.join(tmp, name);
  await build({ entryPoints: [entry], bundle: true, platform: 'node', format: 'esm', outfile, jsx: 'automatic', packages: 'external', loader: { '.css': 'empty' }, logLevel: 'error', alias });
  return import(outfile + `?t=${Date.now()}`);
};
const { default: registry } = await load(path.join(root, 'systems', system, 'docs', 'registry.tsx'), 'registry.mjs', {
  [JSON.parse(await fs.readFile(path.join(root, 'systems', system, 'registry', 'package.json'), 'utf8')).name]: path.join(root, 'systems', system, 'registry', 'src', 'index.ts'), 'next/link': stub,
});
const { completeSnippet } = await load(path.join(root, 'apps', 'docs', 'lib', 'snippet.ts'), 'snippet.mjs');

const site = process.env.DOCS_URL ?? 'http://localhost:3002';
const pageUrl = (slug) => `${site}/${system}/${slug}`;
const order = registry.nav.flatMap((s) => [...(s.items ?? []), ...(s.groups ?? []).flatMap((g) => g.items)]).map((i) => i.slug);
const textOf = (b) => (typeof b === 'string' ? b : b?.list ? b.list.map((l) => `- ${typeof l === 'string' ? l : ''}`).join('\n') : '');

// llms.txt: the index (https://llmstxt.org format)
const index = [
  `# ${registry.name} design system (${registry.packageName})`,
  '',
  `> ${(registry.tagline ?? '').replace(/\.?$/, '.')} Rebuilt from the real product and documented page by page. Read SYSTEM.md first for tokens, rules and recipes.`,
  '',
  `- Package: \`${registry.packageName}\` (React 19 + Tailwind v4 + Radix). Styles: \`@import "${registry.packageName}/styles.css"\`.`,
  `- Copy-paste source registry (shadcn format): ${site}/r/${system}/registry.json`,
  `- Full text for AI: ${site}/${system}/llms-full.txt`,
  '',
];
for (const section of registry.nav) {
  index.push(`## ${section.title}`, '');
  const items = [...(section.items ?? []), ...(section.groups ?? []).flatMap((g) => g.items)];
  for (const it of items) {
    const p = registry.pages[it.slug];
    if (p) index.push(`- [${p.title}](${pageUrl(it.slug)}): ${(p.description ?? '').replace(/\s+/g, ' ').slice(0, 160)}`);
  }
  index.push('');
}

// llms-full.txt: SYSTEM.md + every page
const systemMd = await fs.readFile(path.join(root, 'systems', system, 'registry', 'SYSTEM.md'), 'utf8')
  .catch(() => fs.readFile(path.join(root, 'systems', system, 'SYSTEM.md'), 'utf8'));
const full = [systemMd, '\n\n---\n\n# Component reference\n'];
for (const slug of order) {
  const p = registry.pages[slug];
  if (!p || p.wide) continue;
  full.push(`\n## ${p.title}\n\nURL: ${pageUrl(slug)}\n`);
  if (p.description) full.push(p.description + '\n');
  for (const s of p.sections ?? []) {
    const body = (s.blocks ?? []).map(textOf).filter(Boolean).join('\n');
    if (body && /accessib|composition/i.test(s.title ?? '')) full.push(`\n### ${s.title}\n\n${body}\n`);
  }
  for (const t of p.api ?? []) {
    full.push(`\n### ${t.name} props\n`);
    for (const pr of t.props ?? []) {
      const type = Array.isArray(pr.type) ? pr.type.join(' | ') : pr.type;
      full.push(`- \`${pr.name}\`: ${type}${pr.default ? ` (default ${pr.default})` : ''}${pr.description ? `: ${pr.description}` : ''}`);
    }
  }
  const examples = [p.hero, ...(p.examples ?? [])].filter((e) => e?.code);
  for (const e of examples) {
    const code = completeSnippet(e.code, { packageName: registry.packageName, exports: registry.exports, name: `${e.title} example` });
    full.push(`\n### Example: ${e.title}\n\n\`\`\`tsx\n${code}\`\`\`\n`);
  }
}

const out = path.join(root, 'apps', 'docs', 'public', system);
await fs.mkdir(out, { recursive: true });
await fs.writeFile(path.join(out, 'llms.txt'), index.join('\n'));
await fs.writeFile(path.join(out, 'llms-full.txt'), full.join('\n'));
console.log(`llms.txt ${(index.join('\n').length / 1024).toFixed(0)} KB, llms-full.txt ${(full.join('\n').length / 1024).toFixed(0)} KB`);
