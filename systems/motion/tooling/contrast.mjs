// Contrast check for Motion's palette and tone text tokens (independent of the gate, which checks --ds-* pairs).
// Every <color>-text-secondary / <color>-text-accent-primary and text-success|danger|warning|info must reach
// 4.5:1 on bg-primary, bg-secondary and the color's own bg-primary / bg-secondary tints, in light and dark.
// Usage: node systems/motion/tooling/contrast.mjs          → table + exit 1 on any failure
//        TARGET=4.6 node systems/motion/tooling/contrast.mjs --suggest  → also writes suggested values
//        (lightness moved along the token's own hue) to stdout, for ADJUST in tokens.mjs.
import fs from 'node:fs';
const TARGET = Number(process.env.TARGET ?? 4.6);
const MIN = 4.5;
const suggest = process.argv.includes('--suggest');
const css = fs.readFileSync('systems/motion/registry/src/styles/tokens.css', 'utf8');
const [lightPart, darkPart] = css.split('/* Dark:');
const get = (part, n) => part.match(new RegExp(`\\s${n}: (#[0-9a-f]{3,6});`))?.[1];
const val = (theme, n) => (theme === 'dark' ? get(darkPart, n) : undefined) ?? get(lightPart, n);
const hex2rgb = (hex) => { const h = hex.slice(1); const f = h.length === 3 ? h.split('').map((c) => c + c) : h.match(/../g); return f.map((x) => parseInt(x, 16)); };
const lum = (rgb) => rgb.map((x) => x / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)).reduce((a, c, i) => a + c * [0.2126, 0.7152, 0.0722][i], 0);
const cr = (a, b) => { const [x, y] = [lum(hex2rgb(a)), lum(hex2rgb(b))].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const rgb2hsl = ([r, g, b]) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; } return [h, s, l]; };
const hsl2hex = ([h, s, l]) => { const f = (n) => { const k = (n + h * 12) % 12; const a = s * Math.min(l, 1 - l); return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))); }; return '#' + [f(0), f(8), f(4)].map((x) => x.toString(16).padStart(2, '0')).join(''); };
const colors = ['gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red', 'teal'];
const kinds = ['text-secondary', 'text-accent-primary'];
const tones = { success: 'green', danger: 'red', warning: 'orange', info: 'blue' };
const bgsFor = (c) => ['--n-bg-primary', '--n-bg-secondary', `--n-${c}-bg-primary`, `--n-${c}-bg-secondary`];
const out = {}; const rows = [];
const items = [...colors.flatMap((c) => kinds.map((k) => [c, `--n-${c}-${k}`])), ...Object.entries(tones).map(([t, c]) => [c, `--n-text-${t}`])];
let failures = 0;
for (const [c, name] of items) {
  const res = {};
  for (const theme of ['light', 'dark']) {
    const orig = val(theme, name);
    const bgs = bgsFor(c).map((b) => val(theme, b)).filter(Boolean);
    const minC = (hex) => Math.min(...bgs.map((b) => cr(hex, b)));
    let hex = orig; let [h, s, l] = rgb2hsl(hex2rgb(orig));
    while (minC(hex) < TARGET && l > 0.02 && l < 0.98) { l += theme === 'light' ? -0.005 : 0.005; hex = hsl2hex([h, s, l]); }
    res[theme] = { orig, hex, before: minC(orig), after: minC(hex) };
    if (minC(orig) < MIN) failures++;
  }
  rows.push(`| \`${name}\` | ${res.light.orig} ${res.light.before.toFixed(2)} | ${res.light.hex} ${res.light.after.toFixed(2)} | ${res.dark.orig} ${res.dark.before.toFixed(2)} | ${res.dark.hex} ${res.dark.after.toFixed(2)} |`);
  if (res.light.hex !== res.light.orig || res.dark.hex !== res.dark.orig) out[name] = { light: res.light.hex, dark: res.dark.hex };
}
console.log('| Token | Light (min ratio) | Light suggested | Dark | Dark suggested |\n|---|---|---|---|---|\n' + rows.join('\n'));
if (suggest) console.log(JSON.stringify(out, null, 1));
console.log(failures ? `${failures} token/theme pairs below ${MIN}:1` : `all ${items.length} tokens reach ${MIN}:1 in both themes`);
process.exitCode = failures ? 1 : 0;
