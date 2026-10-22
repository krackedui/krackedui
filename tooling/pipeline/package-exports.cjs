// Write the public export list of a system package (values + types) for docs tooling.
// Usage: node tooling/pipeline/package-exports.cjs <system>  → systems/<system>/docs/generated/exports.json
const ts = require('typescript');
const fs = require('fs');
const path = require('path');
const system = process.argv[2] || 'motion';
const entry = `systems/${system}/registry/src/index.ts`;
const program = ts.createProgram([entry], { jsx: ts.JsxEmit.ReactJSX, moduleResolution: ts.ModuleResolutionKind.Bundler, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, skipLibCheck: true });
const checker = program.getTypeChecker();
const mod = checker.getSymbolAtLocation(program.getSourceFile(entry));
const values = [], types = [], files = {};
for (const e of checker.getExportsOfModule(mod)) {
  const t = e.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(e) : e;
  (t.flags & ts.SymbolFlags.Value ? values : types).push(e.name);
  const file = t.declarations?.[0]?.getSourceFile().fileName;
  if (file) files[e.name] = path.relative(`systems/${system}/registry/src`, file);
}
const out = `systems/${system}/docs/generated`;
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(`${out}/exports.json`, JSON.stringify({ values: values.sort(), types: types.sort(), files }, null, 1));
console.log(`${values.length} values, ${types.length} types`);
