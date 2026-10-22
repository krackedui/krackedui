// Source scanning helpers: strip comments (keep strings) and find hard-coded colors.
const PALETTE = 'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const UTIL = 'bg|text|border(?:-[trblxyse])?|ring|ring-offset|outline|fill|stroke|from|via|to|decoration|shadow|accent|caret|divide|placeholder|inset-shadow';
const RULES = [
  ['hex color', /(?<![a-zA-Z0-9&#/$-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g],
  ['rgb()', /(?<![a-zA-Z-])rgba?\(/g],
  ['hsl()', /(?<![a-zA-Z-])hsla?\(/g],
  ['Tailwind palette class', new RegExp(`(?<![\\w-])(?:${UTIL})-(?:${PALETTE})-(?:50|[1-9]00|950)(?![\\w-])`, 'g')],
  ['Tailwind black/white class', new RegExp(`(?<![\\w-])(?:${UTIL})-(?:white|black)(?![\\w-])`, 'g')],
];

/** Replace comments with spaces, line structure preserved. Strings are kept (they hold class names). */
export function stripComments(src) {
  let out = '';
  let i = 0;
  let state = 'code';
  let quote = '';
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (state === 'code') {
      if (c === '/' && n === '/') { state = 'line'; out += '  '; i += 2; continue; }
      if (c === '/' && n === '*') { state = 'block'; out += '  '; i += 2; continue; }
      if (c === '"' || c === "'" || c === '`') { state = 'str'; quote = c; }
      out += c; i++; continue;
    }
    if (state === 'line') { if (c === '\n') { state = 'code'; out += c; } else out += ' '; i++; continue; }
    if (state === 'block') {
      if (c === '*' && n === '/') { state = 'code'; out += '  '; i += 2; continue; }
      out += c === '\n' ? c : ' '; i++; continue;
    }
    // string
    if (c === '\\') { out += c + (n ?? ''); i += 2; continue; }
    if (c === quote || (c === '\n' && quote !== '`')) state = 'code';
    out += c; i++;
  }
  return out;
}

/** Hard-coded colors in a source file. Lines with `token-exempt:` are skipped. CSS files: comments stripped the same way. */
export function findColors(text) {
  const raw = text.split('\n');
  const code = stripComments(text).split('\n');
  const hits = [];
  code.forEach((line, i) => {
    if (/token-exempt:/.test(raw[i]) || /token-exempt:/.test(raw[i - 1] ?? '') && /^\s*(\/\/|\/\*|\{\/\*)/.test(raw[i - 1])) return;
    for (const [kind, re] of RULES) {
      re.lastIndex = 0;
      for (const m of line.matchAll(re)) hits.push({ line: i + 1, kind, match: m[0], text: raw[i].trim().slice(0, 160) });
    }
  });
  return hits;
}
