// Turn a docs example's code into a complete, copy-paste-runnable module: the code readers see and copy
// is exactly what scripts/check-snippets.mjs compiles.
// - adds `import { … } from 'react'` for hooks/types used
// - adds `import { … } from '<package>'` for every package export used (values and types)
// - wraps bare JSX (optionally preceded by setup statements) into `export function <Name>() { … return (…) }`
// - wraps several JSX roots in a fragment

export interface PackageExports { values: string[]; types: string[] }

const REACT_VALUES = ['useState', 'useEffect', 'useMemo', 'useRef', 'useCallback', 'useReducer', 'useId', 'Fragment'];
const REACT_TYPES = ['ReactNode', 'ReactElement', 'CSSProperties', 'ComponentProps'];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Names used in code (identifiers not inside quotes or comments, roughly). */
function used(code: string, names: string[]): string[] {
  const stripped = code
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"/g, '""')
    // JSX text. Not after the `>` of an arrow `=>`, and not across statements (`;`, outside entities like
    // `&amp;`), so a generic's closing `>` (`useState<string | null>(…); const x = f();`) keeps the code after it.
    .replace(/(?<!=)>((?:[^<>{};]|&#?\w+;)*)</g, '><');
  return names.filter((n) => new RegExp(`(?<![\\w.$])${escape(n)}(?![\\w$])`).test(stripped));
}

function importedNames(code: string): Set<string> {
  const out = new Set<string>();
  for (const m of code.matchAll(/import\s+(?:type\s+)?\{([^}]*)\}\s+from/g))
    for (const part of m[1].split(',')) { const n = part.replace(/\btype\b/, '').split(/\s+as\s+/).pop()?.trim(); if (n) out.add(n); }
  for (const m of code.matchAll(/import\s+(?:\*\s+as\s+)?(\w+)\s+from/g)) out.add(m[1]);
  return out;
}

function declaredNames(code: string): Set<string> {
  const out = new Set<string>();
  for (const m of code.matchAll(/\b(?:function|const|let|var|class|type|interface)\s+(\w+)/g)) out.add(m[1]);
  for (const m of code.matchAll(/\bconst\s*\[\s*(\w+)\s*,\s*(\w+)/g)) { out.add(m[1]); out.add(m[2]); }
  return out;
}

const pascal = (s: string) => s.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^./, (c) => c.toUpperCase()).replace(/^[^A-Za-z]+/, '');

export function completeSnippet(code: string, opts: { packageName: string; exports: PackageExports; name: string }): string {
  let body = code.trim();
  // keep a leading import block as-is; complete whatever follows it
  const importBlock = body.match(/^(?:\s*import[^;]*;\s*\n)+/)?.[0] ?? '';
  body = body.slice(importBlock.length).trim();
  const isModule = /^\s*export\s/m.test(body);
  if (!isModule) {
    // split leading statements from the JSX part (first line starting with "<")
    const lines = body.split('\n');
    const jsxStart = findJsxStart(lines);
    const setup = jsxStart > 0 ? lines.slice(0, jsxStart).join('\n').trim() : '';
    let jsx = (jsxStart >= 0 ? lines.slice(jsxStart) : lines).join('\n').trim();
    if (jsxStart >= 0) {
      const roots = jsx.startsWith('{') ? 2 : countRoots(jsx);
      if (roots > 1) jsx = `<>\n${indent(jsx, 2)}\n</>`;
      const fn = `export function ${pascal(opts.name) || 'Example'}() {\n${setup ? indent(setup, 2) + '\n\n' : ''}  return (\n${indent(jsx, 4)}\n  );\n}`;
      body = fn;
    } else {
      // only declarations (helper components): export the top-level components so the file is usable
      body = (setup || body).replace(/^(function|const) ([A-Z]\w*)/gm, 'export $1 $2');
    }
  }
  body = (importBlock ? importBlock.trim() + '\n\n' : '') + body;
  const have = new Set([...importedNames(body), ...declaredNames(body)]);
  const need = (names: string[]) => used(body, names).filter((n) => !have.has(n));
  const reactValues = need(REACT_VALUES);
  const reactTypes = need(REACT_TYPES);
  const pkgValues = need(opts.exports.values);
  const pkgTypes = need(opts.exports.types).filter((n) => !pkgValues.includes(n));
  const imports: string[] = [];
  if (/(?<![\w.])React\./.test(body) && !have.has('React')) imports.push(`import * as React from 'react';`);
  const spec = (vals: string[], types: string[]) => [...vals, ...types.map((t) => `type ${t}`)].join(', ');
  if (reactValues.length || reactTypes.length) imports.push(`import { ${spec(reactValues, reactTypes)} } from 'react';`);
  if (pkgValues.length || pkgTypes.length) {
    // merge into an existing package import if there is one
    const re = new RegExp(`import\\s*\\{([^}]*)\\}\\s*from\\s*'${escape(opts.packageName)}';`);
    const m = body.match(re);
    if (m) body = body.replace(re, `import { ${[m[1].trim().replace(/,\s*$/, ''), spec(pkgValues, pkgTypes)].filter(Boolean).join(', ')} } from '${opts.packageName}';`);
    else imports.push(`import { ${spec(pkgValues, pkgTypes)} } from '${opts.packageName}';`);
  }
  return (imports.length ? imports.join('\n') + '\n' + (/^\s*import\s/.test(body) ? '' : '\n') : '') + body + '\n';
}

/** First top-level line (bracket depth 0, no indentation) that starts JSX: "<…" or "{…}". */
function findJsxStart(lines: string[]): number {
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (depth === 0 && /^[<{]/.test(line)) return i;
    const code = line.replace(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`/g, '').replace(/\/\/.*$/, '');
    for (const c of code) {
      if ('([{'.includes(c)) depth++;
      else if (')]}'.includes(c)) depth = Math.max(0, depth - 1);
    }
  }
  return -1;
}

function indent(s: string, n: number) {
  const pad = ' '.repeat(n);
  return s.split('\n').map((l) => (l ? pad + l : l)).join('\n');
}

/** Count top-level JSX elements in a JSX fragment string (tags at depth 0). */
function countRoots(jsx: string): number {
  let depth = 0, roots = 0, i = 0, brace = 0;
  while (i < jsx.length) {
    const c = jsx[i];
    if (c === '{') brace++;
    else if (c === '}') brace--;
    else if (c === '<' && brace === 0) {
      const close = jsx[i + 1] === '/';
      const end = findTagEnd(jsx, i);
      const self = jsx[end - 1] === '/';
      if (close) depth--;
      else { if (depth === 0) roots++; if (!self) depth++; }
      i = end;
    }
    i++;
  }
  return roots;
}
function findTagEnd(s: string, start: number): number {
  let brace = 0, q: string | null = null;
  for (let i = start + 1; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') q = c;
    else if (c === '{') brace++;
    else if (c === '}') brace--;
    else if (c === '>' && brace === 0) return i;
  }
  return s.length - 1;
}
