// Compare every docs API Reference table with the component's real TypeScript props.
// Reports: documented props that don't exist, own props that aren't documented, tables whose
// component can't be found. Own props = declared in the package source (not inherited from React/Radix/DOM).
// Usage: node standard/gate/checks/check-api-docs.mjs [system=motion]
import { build } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const system = process.argv[2] ?? 'motion';
const root = path.resolve('.');
const srcDir = path.join(root, 'systems', system, 'registry', 'src');
const tmp = path.join(root, '.scratch', 'api-check');
await fs.mkdir(tmp, { recursive: true });
const pkgName = JSON.parse(await fs.readFile(path.join(root, 'systems', system, 'registry', 'package.json'), 'utf8')).name;

// 1. docs API tables
const stub = path.join(tmp, 'next-link.mjs');
await fs.writeFile(stub, 'export default function Link() { return null; }\n');
const outfile = path.join(tmp, 'registry.mjs');
await build({ entryPoints: [path.join(root, 'systems', system, 'docs', 'registry.tsx')], bundle: true, platform: 'node', format: 'esm', outfile, jsx: 'automatic', packages: 'external', loader: { '.css': 'empty' }, logLevel: 'error', alias: { [pkgName]: path.join(srcDir, 'index.ts'), 'next/link': stub } });
const { default: registry } = await import(outfile);
const tables = [];
for (const [slug, page] of Object.entries(registry.pages)) for (const t of page.api ?? []) tables.push({ slug, name: t.name, props: (t.props ?? []).map((p) => ({ name: p.name, default: p.default })) });

// 2. real props from the type checker
const program = ts.createProgram([path.join(srcDir, 'index.ts')], { jsx: ts.JsxEmit.ReactJSX, moduleResolution: ts.ModuleResolutionKind.Bundler, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, skipLibCheck: true, strict: true });
const checker = program.getTypeChecker();
const mod = checker.getSymbolAtLocation(program.getSourceFile(path.join(srcDir, 'index.ts')));
const exportsByName = new Map(checker.getExportsOfModule(mod).map((s) => [s.name, s]));
const inSrc = (decl) => decl.getSourceFile().fileName.startsWith(srcDir);

function propsOf(name) {
  // "Menu.Root", "Button", "useToast()", "Sidebar.TreeItem"
  const clean = name.replace(/\(.*$/, '').trim();
  const [base, ...rest] = clean.split('.');
  let sym = exportsByName.get(base);
  if (!sym) return null;
  let type = checker.getTypeOfSymbol(sym.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(sym) : sym);
  for (const part of rest) {
    const p = type.getProperty(part);
    if (!p) return null;
    type = checker.getTypeOfSymbol(p);
  }
  const sig = type.getCallSignatures()[0];
  if (!sig) return { kind: 'not-a-component' };
  const param = sig.getParameters()[0];
  if (!param) return { own: [], all: [] };
  const pt = checker.getTypeOfSymbol(param);
  const all = checker.getPropertiesOfType(pt);
  const own = all.filter((p) => (p.declarations ?? []).some(inSrc)).map((p) => p.name);
  // defaults: from destructuring defaults in the component's own source, when findable
  return { own, all: all.map((p) => p.name) };
}

// A table may document several parts ("Menu.Label / Menu.Separator") or a hook's return value ("useToast()").
function returnPropsOf(name) {
  const base = name.replace(/\(.*$/, '').trim();
  const sym = exportsByName.get(base);
  if (!sym) return null;
  const type = checker.getTypeOfSymbol(sym.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(sym) : sym);
  const sig = type.getCallSignatures()[0];
  if (!sig) return null;
  return checker.getPropertiesOfType(checker.getReturnTypeOfSignature(sig)).map((p) => p.name);
}
const report = [];
for (const t of tables) {
  // "Menu.Label / Separator" → Menu.Label, Menu.Separator; "Menu.Search / MenuSearch" and
  // "MenuLabel / MenuSeparator" name top-level exports directly.
  const parts = t.name.split(/\s*\/\s*/).map((n, i, all) => (n.includes('.') || i === 0 || exportsByName.has(n.replace(/\(.*$/, '').trim()) || !all[0].includes('.') ? n : `${all[0].split('.')[0]}.${n}`));
  const isHook = /^use[A-Z]/.test(t.name.trim());
  const isVariants = /Variants$|^Utilities$|^Helpers$/.test(t.name.trim()) || /For$/.test(t.name.split('/')[0].trim());
  if (isVariants) continue; // variant recipes / helper lists, not component props
  const documented = t.props.flatMap((p) => p.name.split(/\s*\/\s*/)).map((n) => n.replace(/\?$/, '').replace(/\(\)$/, '')).filter((n) => !n.startsWith('...'));
  if (isHook) {
    const ret = returnPropsOf(t.name);
    if (!ret) { report.push({ ...t, issue: 'hook not found' }); continue; }
    const wrong = documented.filter((n) => !ret.includes(n));
    const missing = ret.filter((n) => !documented.includes(n));
    if (wrong.length || missing.length) report.push({ slug: t.slug, name: t.name, wrong, missing });
    continue;
  }
  const reals = parts.map(propsOf);
  if (reals.some((r) => !r)) { report.push({ ...t, issue: `not found: ${parts.filter((_, i) => !reals[i]).join(', ')}` }); continue; }
  const comps = reals.filter((r) => !r.kind);
  if (!comps.length) continue;
  const all = new Set(comps.flatMap((r) => r.all));
  const own = [...new Set(comps.flatMap((r) => r.own))];
  const wrong = documented.filter((n) => !all.has(n));
  const missing = own.filter((n) => !documented.includes(n) && !['children', 'className', 'style', 'ref', 'key'].includes(n));
  if (wrong.length || missing.length) report.push({ slug: t.slug, name: t.name, wrong, missing });
}
await fs.writeFile(path.join(tmp, 'report.json'), JSON.stringify(report, null, 1));
const wrongN = report.reduce((n, r) => n + (r.wrong?.length ?? 0), 0);
const missingN = report.reduce((n, r) => n + (r.missing?.length ?? 0), 0);
const notFound = report.filter((r) => r.issue);
console.log(`${tables.length} API tables checked: ${wrongN} documented props that don't exist, ${missingN} real props not documented, ${notFound.length} tables whose component wasn't found`);
for (const r of report) {
  if (r.issue) console.log(`- ${r.slug} ${r.name}: ${r.issue}`);
  else console.log(`- ${r.slug} ${r.name}:${r.wrong.length ? ` WRONG [${r.wrong.join(', ')}]` : ''}${r.missing.length ? ` missing [${r.missing.join(', ')}]` : ''}`);
}
