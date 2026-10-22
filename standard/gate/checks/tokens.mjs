// 3. Tokens: (a) no hard-coded colors in component code and templates; (b) every required --ds-* token
// resolves to a non-empty value in light and dark (real browser, built styles.css); (c) every
// contrastPairs entry reaches 4.5:1 in both themes (alpha composited over the background).
import fs from 'node:fs/promises';
import path from 'node:path';
import { walk, rel } from '../lib/context.mjs';
import { findColors } from '../lib/source-scan.mjs';

const MIN_CONTRAST = 4.5;

async function run_(ctx) {
  const details = [];
  const data = {};

  // (a) hard-coded colors
  const isGenerated = (text) => /generated|do not edit/i.test(text.split('\n').slice(0, 5).join('\n'));
  const files = [
    ...(await walk(ctx.srcDir, { filter: (p) => /\.(tsx?)$/.test(p) && !/\/styles\//.test(p) })),
  ];
  for (const t of await ctx.templates()) files.push(...(await walk(path.join(t, 'src'), { filter: (p) => /\.(tsx?|css)$/.test(p) })));
  let colorHits = 0;
  for (const f of files) {
    const text = await fs.readFile(f, 'utf8');
    if (isGenerated(text)) continue;
    for (const h of findColors(text)) {
      colorHits++;
      details.push({ where: `${rel(f)}:${h.line}`, message: `hard-coded color (${h.kind}) \`${h.match}\` — use a token, or add \`/* token-exempt: <reason> */\` for a measured value with no token` });
    }
  }
  data.hardCodedColors = colorHits;

  // (b) + (c) resolve tokens in a browser
  const styles = await ctx.stylesCss();
  if (!styles) {
    details.push({ where: 'build', message: 'no stylesheet: the package build failed and build/styles.css could not be compiled (see the build check)' });
    return { status: 'fail', summary: `${colorHits} hard-coded colors; token resolution skipped (no stylesheet)`, details, data };
  }
  if (styles.note) details.push({ where: 'note', message: styles.note });
  const { requiredTokenNames, contrastPairs } = await ctx.contract();
  const { registry } = await ctx.docs();
  const rootClass = registry.previewRootClassName ?? `${ctx.system}-root`;
  const css = await fs.readFile(styles.file, 'utf8');
  const browser = await ctx.browser();
  const page = await browser.newPage();
  await page.setContent(`<!doctype html><html lang="en"><head><style>${css}</style></head><body>
    <div id="light" class="${rootClass}"><span>light</span></div>
    <div id="dark" class="${rootClass} dark"><span>dark</span></div></body></html>`);
  const resolved = await page.evaluate(({ names, pairs }) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const g = canvas.getContext('2d', { willReadFrequently: true });
    const toRgba = (cssColor) => {
      g.clearRect(0, 0, 1, 1);
      g.fillStyle = '#000'; g.fillStyle = cssColor;
      g.fillRect(0, 0, 1, 1);
      const [r, gg, b, a] = g.getImageData(0, 0, 1, 1).data;
      return [r, gg, b, a / 255];
    };
    const out = {};
    for (const theme of ['light', 'dark']) {
      const root = document.getElementById(theme);
      const cs = getComputedStyle(root);
      const values = Object.fromEntries(names.map((n) => [n, cs.getPropertyValue(n).trim()]));
      const color = (name) => {
        const probe = document.createElement('i');
        probe.style.color = `var(${name})`;
        root.appendChild(probe);
        const c = getComputedStyle(probe).color;
        probe.remove();
        return { css: c, rgba: toRgba(c) };
      };
      const colors = {};
      for (const [t, bg] of pairs) { colors[t] ??= color(t); colors[bg] ??= color(bg); }
      colors['--ds-bg-app'] ??= color('--ds-bg-app');
      out[theme] = { values, colors };
    }
    return out;
  }, { names: requiredTokenNames, pairs: contrastPairs });
  await page.close();

  let missing = 0;
  for (const theme of ['light', 'dark']) for (const n of requiredTokenNames) {
    if (!resolved[theme].values[n]) { missing++; details.push({ where: `${theme}`, message: `${n} is not defined (empty inside .${rootClass}${theme === 'dark' ? '.dark' : ''})` }); }
  }
  data.missingTokens = missing;

  const over = (fg, bg) => { const a = fg[3]; return [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a)).concat(1); };
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const contrast = [];
  let lowContrast = 0;
  for (const theme of ['light', 'dark']) {
    const { colors, values } = resolved[theme];
    const canvasBg = theme === 'dark' ? [0, 0, 0, 1] : [255, 255, 255, 1];
    const app = over(colors['--ds-bg-app'].rgba, canvasBg);
    for (const [t, bgName] of contrastPairs) {
      if (!values[t] && !colors[t]?.css) continue;
      const bg = bgName === '--ds-bg-app' ? app : over(over(colors[bgName].rgba, app), canvasBg);
      const fg = over(colors[t].rgba, bg);
      const r = ratio(fg, bg);
      contrast.push({ theme, text: t, bg: bgName, ratio: Math.round(r * 100) / 100 });
      if (r < MIN_CONTRAST) { lowContrast++; details.push({ where: theme, message: `contrast ${t} on ${bgName} is ${r.toFixed(2)}:1 (< ${MIN_CONTRAST}:1); text ${colors[t].css} on ${colors[bgName].css}` }); }
    }
  }
  data.contrast = contrast;
  const fails = colorHits + missing + lowContrast;
  return {
    status: fails ? 'fail' : 'pass',
    summary: `${colorHits} hard-coded colors, ${missing} missing token values (of ${requiredTokenNames.length}×2), ${lowContrast} contrast pairs below ${MIN_CONTRAST}:1 (of ${contrastPairs.length}×2)`,
    details, data,
  };
}
export { run_ as run };
