// The system's public exports, classified with the TypeScript checker: components (function,
// forwardRef/memo objects), compounds (objects of PascalCase parts), and everything else.
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export async function analyzeExports(ctx) {
  const ts = require('typescript');
  const entry = path.join(ctx.srcDir, 'index.ts');
  const program = ts.createProgram([entry], { jsx: ts.JsxEmit.ReactJSX, moduleResolution: ts.ModuleResolutionKind.Bundler, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, skipLibCheck: true, strict: true, noEmit: true });
  const checker = program.getTypeChecker();
  const mod = checker.getSymbolAtLocation(program.getSourceFile(entry));
  const inSrc = (d) => d.getSourceFile().fileName.startsWith(ctx.srcDir);

  const propsOfType = (type) => {
    const sig = type.getCallSignatures()[0];
    if (!sig) return null;
    const param = sig.getParameters()[0];
    if (!param) return { own: [], all: [] };
    const pt = checker.getTypeOfSymbol(param);
    const all = checker.getPropertiesOfType(pt);
    return { own: all.filter((p) => (p.declarations ?? []).some(inSrc)).map((p) => p.name), all: all.map((p) => p.name) };
  };
  const isComponentType = (type) => {
    if (type.getProperty('$$typeof')) return true; // forwardRef / memo / lazy
    const sig = type.getCallSignatures()[0];
    if (!sig) return false;
    const ret = checker.typeToString(checker.getReturnTypeOfSignature(sig));
    return /Element|ReactNode|ReactPortal|null/.test(ret) && sig.getParameters().length <= 2;
  };

  const out = [];
  for (const sym0 of checker.getExportsOfModule(mod)) {
    const sym = sym0.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(sym0) : sym0;
    if (!(sym.flags & ts.SymbolFlags.Value)) continue;
    const name = sym0.name;
    const decl = sym.declarations?.[0];
    const file = decl ? path.relative(ctx.srcDir, decl.getSourceFile().fileName) : '';
    const type = checker.getTypeOfSymbol(sym);
    let kind = 'other';
    let parts = [];
    let props = null;
    if (/^[A-Z]/.test(name)) {
      if (isComponentType(type)) { kind = 'component'; props = propsOfType(type) ?? propsOfType(checker.getApparentType(type)); }
      else {
        const ps = checker.getPropertiesOfType(type).filter((p) => /^[A-Z]/.test(p.name) && isComponentType(checker.getTypeOfSymbol(p)));
        if (ps.length && ps.length === checker.getPropertiesOfType(type).filter((p) => /^[A-Z]/.test(p.name)).length) {
          kind = 'compound';
          parts = ps.map((p) => p.name);
          const own = new Set();
          for (const p of ps) for (const n of propsOfType(checker.getTypeOfSymbol(p))?.own ?? []) own.add(n);
          props = { own: [...own], all: [] };
        }
      }
    } else if (/^use[A-Z]/.test(name)) kind = 'hook';
    out.push({ name, kind, file, parts, ownProps: props?.own ?? [] });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

/** Heuristic: a component that takes input (handlers or controlled state) is interactive. */
export const looksInteractive = (e) => e.ownProps.some((p) => /^on[A-Z]/.test(p) || ['value', 'checked', 'open', 'defaultValue', 'defaultOpen', 'href'].includes(p));
