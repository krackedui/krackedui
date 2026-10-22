// Decode the captured abbreviated CSS variables (from the reference token stylesheet) into
// readable DTCG tokens for both themes, then emit CSS variables for Motion.
// Two documented deviations from the capture are applied here (see ADJUST and SOLID below):
// text colors darkened just enough for WCAG AA, and solid fills for white-on-color controls.
// Input:  systems/motion/capture/tokens-raw.json   ({ light: {--c-x: v}, dark: {...} })
// Output: systems/motion/registry/tokens/motion.tokens.json   (DTCG, light+dark per token)
//         systems/motion/registry/src/styles/tokens.css        (--n-* variables, .dark overrides)
//         systems/motion/registry/tokens/name-map.json          (original → readable, for evidence)
//         systems/motion/registry/src/styles/theme.css          (Tailwind v4 @theme mapping)
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

const sys = path.join(ROOT, 'systems', 'motion');
const raw = JSON.parse(await fs.readFile(path.join(sys, 'capture', 'tokens-raw.json'), 'utf8'));

// Abbreviation dictionary, inferred from the variable vocabulary (3-letter camel segments).
const WORDS = {
  tex: 'text', bac: 'bg', bor: 'border', ico: 'icon', sha: 'shadow', foc: 'focus', ove: 'overlay', sel: 'selection',
  but: 'button', inp: 'input', tab: 'table', men: 'menu', too: 'tooltip', lin: 'link', div: 'divider', scr: 'scroll',
  pri: 'primary', sec: 'secondary', ter: 'tertiary', dis: 'disabled', inv: 'inverse', acc: 'accent', tra: 'translucent',
  hov: 'hover', pre: 'pressed', ele: 'elevated', int: 'interactive', str: 'strong', bas: 'base', out: 'outline',
  dif: 'diffuse', sm: 'sm', md: 'md', lg: 'lg', rin: 'ring', fro: 'frozen', fil: 'fill', col: 'color', gro: 'group',
  box: 'box', row: 'row', smo: 'smoke', lig: 'light', whi: 'white', bla: 'black', pal: 'palette', ui: 'ui',
  gra: 'gray', bro: 'brown', ora: 'orange', yel: 'yellow', gre: 'green', blu: 'blue', pur: 'purple', pin: 'pink',
  red: 'red', tea: 'teal', mar: 'marker', edi: 'editor', pil: 'pill', hom: 'home', cal: 'calendar', car: 'card',
  ite: 'item', top: 'top', bar: 'bar', sta: 'status', dro: 'dropdown', cha: 'chat', ai: 'ai', tem: 'template',
  cod: 'code', sti: 'sticky', blo: 'block', pee: 'peek', tim: 'timeline', gal: 'gallery', vie: 'view', all: 'all',
  swi: 'switch', tog: 'toggle', des: 'desaturated', emb: 'embed', pla: 'placeholder', res: 'resizer', inn: 'inner',
  equ: 'equation', fin: 'find', hig: 'highlight', mat: 'match', uns: 'unselected', gla: 'glass', pag: 'page', was: 'wash',
  pop: 'popover', wax: 'wax', pap: 'paper', tok: 'token', boa: 'board', def: 'default', dar: 'dark', mod: 'modal',
  und: 'underlay', opa: 'opaque', dec: 'decoration', con: 'content', cov: 'cover', pho: 'photo', til: 'tile', eve: 'event',
  ass: 'assistant', cor: 'corner', bei: 'beige', ban: 'banner', cre: 'creator', pro: 'profile', rev: 'review',
  reg: 'regular', emo: 'emoji', seo: 'seo', tit: 'title', sit: 'site', bui: 'builder', ill: 'illustration',
  wit: 'with', the: 'thin', thi: 'thin', mdp: 'md', sea: 'search', sid: 'sidebar', mee: 'meeting', not: 'notification',
};
const COLORS = new Set(['gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red', 'teal']);

function decode(name) {
  const m = name.match(/^--(c[adl]?)-(.+)$/);
  if (!m) return null;
  const [, prefix, body] = m;
  const segs = body.match(/[A-Z]{2,}(?=[A-Z][a-z]|\d|$)|[A-Z]?[a-z]+|\d+/g) ?? [body];
  const words = segs.map((s) => WORDS[s.toLowerCase()] ?? s.toLowerCase());
  // group: palette scale, named color, or core
  let group = 'core';
  if (words[0] === 'palette') group = 'palette';
  else if (COLORS.has(words[0])) group = words[0];
  const rest = group === 'core' ? words : words.slice(1);
  const scope = { c: null, ca: 'alpha', cl: 'light-only', cd: 'dark-only' }[prefix];
  return { group, key: rest.join('-'), scope };
}

const light = raw.light, dark = raw.dark;

// WCAG AA adjustments (standard/contract tokens.ts contrastPairs). Each captured text color below
// failed 4.5:1 on the surface it is used on; it is darkened (light) or lightened (dark) along the
// same hue just enough to pass. Recorded in tokens.json as evidence level "adjusted".
const PALETTE_WHY = '4.5:1 on bg-primary, bg-secondary and the matching tinted backgrounds (palette text)';
const ADJUST = {
  '--n-text-secondary': { light: '#6d6b66', why: '4.5:1 on bg-secondary (sidebar) and bg-tertiary' },
  '--n-text-tertiary': { light: '#73706c', dark: '#8b8883', why: '4.5:1 on bg-primary and bg-secondary' },
  // Palette text (tags, status pills, colored text, callouts, links): every <color>-text-secondary and
  // <color>-text-accent-primary, lightness moved along its own hue until it reaches 4.6:1 on bg-primary,
  // bg-secondary and the color's own bg-primary / bg-secondary tints, in each theme (check / suggest:
  // node systems/motion/tooling/contrast.mjs --suggest; before/after table in REPORT.md). Replaces the earlier red value.
  '--n-gray-text-secondary': { light: '#6d6b66', dark: '#a5a39f', why: PALETTE_WHY },
  '--n-gray-text-accent-primary': { light: '#6e6b66', dark: '#a4a29e', why: PALETTE_WHY },
  '--n-brown-text-secondary': { light: '#85634b', dark: '#bc9e89', why: PALETTE_WHY },
  '--n-brown-text-accent-primary': { light: '#8a6242', dark: '#c29d7f', why: PALETTE_WHY },
  '--n-orange-text-secondary': { light: '#9b5b21', dark: '#dd9b5f', why: PALETTE_WHY },
  '--n-orange-text-accent-primary': { light: '#9d5922', dark: '#de9a63', why: PALETTE_WHY },
  '--n-yellow-text-secondary': { light: '#8c6624', dark: '#d7ae65', why: PALETTE_WHY },
  '--n-yellow-text-accent-primary': { light: '#8a671a', dark: '#dcad47', why: PALETTE_WHY },
  '--n-green-text-secondary': { light: '#407658', dark: '#6eb18b', why: PALETTE_WHY },
  '--n-green-text-accent-primary': { light: '#347854', dark: '#55b583', why: PALETTE_WHY },
  '--n-blue-text-secondary': { light: '#306eb2', dark: '#76a6da', why: PALETTE_WHY },
  '--n-blue-text-accent-primary': { light: '#206eba', dark: '#63a5e7', why: PALETTE_WHY },
  '--n-purple-text-secondary': { light: '#8955a7', dark: '#b28fc6', why: PALETTE_WHY },
  '--n-purple-text-accent-primary': { light: '#9740c5', dark: '#be87db', why: PALETTE_WHY },
  '--n-pink-text-secondary': { light: '#b33e7c', dark: '#d689b2', why: PALETTE_WHY },
  '--n-pink-text-accent-primary': { light: '#c12e6c', dark: '#e184ab', why: PALETTE_WHY },
  '--n-red-text-secondary': { light: '#b94139', dark: '#df8983', why: PALETTE_WHY },
  '--n-red-text-accent-primary': { light: '#c92e1f', dark: '#ea8379', why: PALETTE_WHY },
  '--n-teal-text-secondary': { light: '#257484', dark: '#38b0c8', why: PALETTE_WHY },
  '--n-teal-text-accent-primary': { light: '#27747f', dark: '#3cb2c3', why: PALETTE_WHY },
};
// Solid fills behind white text (primary/danger buttons, solid badges). The captured accent colors
// (#2783de, #e56458…) give white text less than 4.5:1, so solid controls use these darker fills.
// Same in both themes. hover/pressed are 10% / 20% darker.
const SOLID = {
  'blue-bg-solid': '#2377c9', 'blue-bg-solid-hover': '#206bb5', 'blue-bg-solid-pressed': '#1c5fa1',
  'red-bg-solid': '#be5349', 'red-bg-solid-hover': '#ab4b42', 'red-bg-solid-pressed': '#98423a',
  'green-bg-solid': '#39825c', 'orange-bg-solid': '#a7642e', 'gray-bg-solid': '#777571',
  'text-on-solid': '#fff',
};
// Tone text: semantic aliases by contract tone for money and status text ("+$1,240" in green, overdue in red):
// the tuned <hue>-text-secondary values (see ADJUST), so `text-n-text-success` and `text-n-green-text-secondary`
// are the same color, AA on every Motion surface in both themes.
const toneFrom = (hue) => ({ ...ADJUST[`--n-${hue}-text-secondary`], hue });
const TONE_TEXT = {
  'text-success': toneFrom('green'),
  'text-danger': toneFrom('red'),
  'text-warning': toneFrom('orange'),
  'text-info': toneFrom('blue'),
};
const names = [...new Set([...Object.keys(light), ...Object.keys(dark)])].sort();
const tokens = {};
const nameMap = {};
const cssLight = [], cssDark = [];
for (const name of names) {
  const d = decode(name);
  if (!d) continue;
  const readable = `--n-${d.group === 'core' ? '' : d.group + '-'}${d.key}${d.scope === 'alpha' ? '-a' : ''}`.replace(/--n--/, '--n-');
  nameMap[name] = readable;
  const adj = ADJUST[readable];
  const lv = adj?.light ?? light[name] ?? dark[name];
  const dv = adj?.dark ?? (adj?.light && !dark[name] ? light[name] : undefined) ?? dark[name] ?? light[name];
  const type = /shadow|ring/.test(d.key) || /px .*px/.test(lv) ? 'shadow' : 'color';
  (tokens[d.group] ??= {})[`${d.key}${d.scope === 'alpha' ? '-a' : ''}`] = {
    $type: type,
    $value: lv,
    $extensions: {
      modes: { light: lv, dark: dv },
      evidence: adj ? { level: 'adjusted', source: name, reason: `WCAG AA: ${adj.why}`, captured: { light: light[name] ?? dark[name], dark: dark[name] ?? light[name] } } : { level: 'observed', source: name },
    },
  };
  cssLight.push(`  ${readable}: ${lv};`);
  if (dv !== lv) cssDark.push(`  ${readable}: ${dv};`);
}

// Typography, spacing, radius and motion measured from captured states (see capture/states/*.json).
const font = {
  sans: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI Variable Display", "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"',
  serif: 'Lyon-Text, Georgia, ui-serif, serif',
  mono: 'iawriter-mono, Nitti, Menlo, Courier, monospace',
  code: 'SFMono-Regular, Menlo, Consolas, "PT Mono", "Liberation Mono", Courier, monospace',
};
const type = {
  'page-title': ['40px', '48px', 700, '-0.01em'], h1: ['30px', '39px', 600], h2: ['24px', '31.2px', 600], h3: ['20px', '26px', 600],
  body: ['16px', '24px', 400], 'ui-lg': ['15px', '22.5px', 500], ui: ['14px', '20px', 400], 'ui-medium': ['14px', '20px', 500],
  'ui-sm': ['12px', '16px', 400], caption: ['12px', '16px', 500], code: ['13.6px', '20.4px', 400], 'code-inline': ['85%', 'normal', 400],
};
const radius = { xs: '3px', sm: '4px', md: '6px', lg: '8px', xl: '10px', '2xl': '12px', '3xl': '14px', full: '9999px' };
const motion = { fast: '100ms', base: '200ms', slow: '300ms', easing: 'ease', 'easing-out': 'cubic-bezier(0.2, 0, 0, 1)' };

const extra = [];
const solidGroup = (tokens.solid ??= {});
for (const [k, v] of Object.entries(SOLID)) {
  extra.push(`  --n-${k}: ${v};`);
  solidGroup[k] = { $type: 'color', $value: v, $extensions: { modes: { light: v, dark: v }, evidence: { level: 'adjusted', reason: 'WCAG AA: white text on solid fills' } } };
}
const toneGroup = (tokens.tone ??= {});
for (const [k, { light: lv, dark: dv, hue }] of Object.entries(TONE_TEXT)) {
  extra.push(`  --n-${k}: ${lv};`);
  cssDark.push(`  --n-${k}: ${dv};`);
  toneGroup[k] = { $type: 'color', $value: lv, $extensions: { modes: { light: lv, dark: dv }, evidence: { level: 'adjusted', reason: `Alias of the AA-tuned ${hue}-text-secondary` } } };
}
for (const [k, v] of Object.entries(font)) extra.push(`  --n-font-${k}: ${v};`);
for (const [k, [size, lh, w, ls]] of Object.entries(type)) {
  extra.push(`  --n-type-${k}-size: ${size};`, `  --n-type-${k}-line: ${lh};`, `  --n-type-${k}-weight: ${w};`);
  if (ls) extra.push(`  --n-type-${k}-tracking: ${ls};`);
}
for (const [k, v] of Object.entries(radius)) extra.push(`  --n-radius-${k}: ${v};`);
for (const [k, v] of Object.entries(motion)) extra.push(`  --n-motion-${k}: ${v};`);
tokens.font = Object.fromEntries(Object.entries(font).map(([k, v]) => [k, { $type: 'fontFamily', $value: v, $extensions: { evidence: { level: 'observed' } } }]));
tokens.typography = Object.fromEntries(Object.entries(type).map(([k, [size, lh, w, ls]]) => [k, { $type: 'typography', $value: { fontSize: size, lineHeight: lh, fontWeight: w, letterSpacing: ls ?? 'normal' }, $extensions: { evidence: { level: 'observed' } } }]));
tokens.radius = Object.fromEntries(Object.entries(radius).map(([k, v]) => [k, { $type: 'dimension', $value: v, $extensions: { evidence: { level: 'observed' } } }]));
tokens.motion = Object.fromEntries(Object.entries(motion).map(([k, v]) => [k, { $type: k.startsWith('easing') ? 'cubicBezier' : 'duration', $value: v, $extensions: { evidence: { level: 'observed' } } }]));

const out = path.join(sys, 'registry');
await fs.mkdir(path.join(out, 'tokens'), { recursive: true });
await fs.mkdir(path.join(out, 'src', 'styles'), { recursive: true });
await fs.writeFile(path.join(out, 'tokens', 'motion.tokens.json'), JSON.stringify(tokens, null, 1));
await fs.writeFile(path.join(out, 'tokens', 'name-map.json'), JSON.stringify(nameMap, null, 1));
await fs.writeFile(path.join(out, 'src', 'styles', 'tokens.css'),
  `/* Generated from the captured token stylesheet. Do not edit by hand. */\n` +
  `:root, .light {\n${cssLight.join('\n')}\n${extra.join('\n')}\n}\n\n/* Dark: an ancestor .dark, or (for menus/popovers/dialogs portaled to <body>) any dark .motion-root on the page. */\n.dark,\nbody:has(.motion-root.dark) :is([data-radix-popper-content-wrapper], .motion-portal, .motion-overlay) {\n${cssDark.join('\n')}\n  color-scheme: dark;\n}\n`);
// Tailwind v4 theme: every color token becomes a utility (bg-n-bg-primary, text-n-text-secondary, ...),
// shadows become shadow-n-*, plus fonts, radii and type sizes.
const colorVars = [], shadowVars = [];
for (const readable of Object.values(nameMap)) {
  const n = readable.slice(4); // strip "--n-"
  const lv = cssLight.find((l) => l.startsWith(`  ${readable}:`))?.split(': ').slice(1).join(': ') ?? '';
  if (/px/.test(lv) && /shadow|ring|sha/.test(n)) shadowVars.push(`  --shadow-n-${n}: var(${readable});`);
  else if (/^(#|rgb|hsl)/.test(lv.trim())) colorVars.push(`  --color-n-${n}: var(${readable});`);
}
const themeCss = `/* Generated. Tailwind v4 theme mapping for the --n-* tokens. Do not edit by hand. */
@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
  --font-sans: var(--n-font-sans);
  --font-serif: var(--n-font-serif);
  --font-mono: var(--n-font-code);
${Object.keys(radius).map((k) => `  --radius-n-${k}: var(--n-radius-${k});`).join('\n')}
${Object.keys(type).map((k) => `  --text-n-${k}: var(--n-type-${k}-size);\n  --text-n-${k}--line-height: var(--n-type-${k}-line);\n  --text-n-${k}--font-weight: var(--n-type-${k}-weight);`).join('\n')}
${colorVars.join('\n')}
${Object.keys(SOLID).map((k) => `  --color-n-${k}: var(--n-${k});`).join('\n')}
${Object.keys(TONE_TEXT).map((k) => `  --color-n-${k}: var(--n-${k});`).join('\n')}
${shadowVars.join('\n')}
}
`;
await fs.writeFile(path.join(out, 'src', 'styles', 'theme.css'), themeCss);
console.log(`${Object.keys(nameMap).length} color/shadow tokens decoded; ${cssDark.length} dark overrides`);
const sample = ['--c-texPri', '--c-graTexSec', '--ca-butHovBac', '--c-shaOutMd', '--c-palBlu400', '--c-bluBacPri', '--cl-calIteHovBac', '--c-focSha'];
for (const s of sample) console.log(s, '→', nameMap[s]);
