// Pure chart math shared by LineChart, BarChart, DonutChart and Sparkline: colors, nice ticks, scales,
// paths and label thinning. No React here.

export type ChartColor = 'gray' | 'brown' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'purple' | 'pink' | 'red';

/** Default series colors, assigned in order (blue first, the system accent). */
export const chartPalette: readonly ChartColor[] = ['blue', 'orange', 'green', 'purple', 'pink', 'teal', 'yellow', 'red', 'brown', 'gray'];

/** CSS color for a contract Color: Motion's accent shade of that palette color (switches with the theme). */
export const chartColorVar = (color: ChartColor) => `var(--n-${color}-icon-accent-primary)`;

/** Resolved color per item: its own `color`, else the next palette color. */
export function assignColors<T extends { color?: ChartColor }>(items: readonly T[]): string[] {
  return items.map((item, i) => chartColorVar(item.color ?? chartPalette[i % chartPalette.length] ?? 'blue'));
}

const numberFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
/** Default value formatter: grouped digits, up to two decimals. */
export const defaultValueFormat = (value: number) => numberFormat.format(value);

/** A "nice" number close to `range` (1, 2, 2.5, 5 × 10^n). */
function niceStep(range: number, count: number): number {
  const rough = range / Math.max(1, count);
  const power = 10 ** Math.floor(Math.log10(rough));
  const fraction = rough / power;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
  return nice * power;
}

/**
 * Evenly spaced round tick values covering [min, max]; always includes 0 when the domain crosses or touches it.
 * Returns at least two ticks.
 */
export function niceTicks(min: number, max: number, count = 5): number[] {
  let lo = Math.min(min, max);
  let hi = Math.max(min, max);
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return [0, 1];
  if (lo === hi) {
    if (lo === 0) return [0, 1];
    lo = Math.min(0, lo);
    hi = Math.max(0, hi);
  }
  const step = niceStep(hi - lo, count);
  const start = Math.floor(lo / step) * step;
  const end = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) ticks.push(Number(v.toPrecision(12)));
  return ticks.length >= 2 ? ticks : [start, start + step];
}

/** Linear scale from a domain to a range. */
export function linearScale([d0, d1]: [number, number], [r0, r1]: [number, number]) {
  const span = d1 - d0 || 1;
  return (v: number) => r0 + ((v - d0) / span) * (r1 - r0);
}

export type Point = [x: number, y: number];

/** Straight polyline through the points. */
export function linePath(points: readonly Point[]): string {
  return points.map(([x, y], i) => `${i ? 'L' : 'M'}${round(x)},${round(y)}`).join('');
}

/**
 * Smooth curve through the points that never overshoots (monotone cubic interpolation, Fritsch–Carlson),
 * so a curved line does not invent peaks or dips between data points.
 */
export function monotonePath(points: readonly Point[]): string {
  const n = points.length;
  if (n < 3) return linePath(points);
  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    dx.push(x1 - x0);
    slope.push(x1 === x0 ? 0 : (y1 - y0) / (x1 - x0));
  }
  const tangent: number[] = [slope[0] ?? 0];
  for (let i = 1; i < n - 1; i++) {
    const a = slope[i - 1] ?? 0;
    const b = slope[i] ?? 0;
    if (a * b <= 0) tangent.push(0);
    else {
      const w1 = 2 * (dx[i] ?? 0) + (dx[i - 1] ?? 0);
      const w2 = (dx[i] ?? 0) + 2 * (dx[i - 1] ?? 0);
      tangent.push((w1 + w2) / (w1 / a + w2 / b));
    }
  }
  tangent.push(slope[n - 2] ?? 0);
  let d = `M${round(points[0][0])},${round(points[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const h = (dx[i] ?? 0) / 3;
    d += `C${round(x0 + h)},${round(y0 + h * (tangent[i] ?? 0))} ${round(x1 - h)},${round(y1 - h * (tangent[i + 1] ?? 0))} ${round(x1)},${round(y1)}`;
  }
  return d;
}

/** Closes a line path down to a baseline (for area fills). */
export function areaPath(line: string, points: readonly Point[], baseline: number): string {
  if (!points.length) return '';
  const first = points[0];
  const last = points[points.length - 1];
  return `${line}L${round(last[0])},${round(baseline)}L${round(first[0])},${round(baseline)}Z`;
}

/** SVG arc path along a circle from angle a0 to a1 (radians, 0 = 12 o'clock, clockwise). */
export function arcPath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const p = (a: number): Point => [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M${round(x0)},${round(y0)}A${round(r)},${round(r)} 0 ${large} 1 ${round(x1)},${round(y1)}`;
}

/** Approximate rendered width of a label at the chart's 12px UI font (tabular digits). */
export function textWidth(text: string, fontSize = 12): number {
  let w = 0;
  for (const ch of text) w += /[\d.,]/.test(ch) ? 0.56 : /[A-Z@%$€£MW]/.test(ch) ? 0.68 : /[\s'|il]/.test(ch) ? 0.3 : 0.55;
  return w * fontSize;
}

/** Show every `step`-th label so labels of `labelWidth` px fit in `available` px. */
export function labelStep(count: number, available: number, labelWidth: number): number {
  if (count <= 1) return 1;
  const fit = Math.max(1, Math.floor(available / Math.max(1, labelWidth)));
  return Math.max(1, Math.ceil(count / fit));
}

/** Shortens text to fit `maxWidth` px, ending with an ellipsis. */
export function truncateText(text: string, maxWidth: number, fontSize = 12): string {
  if (textWidth(text, fontSize) <= maxWidth) return text;
  let out = text;
  while (out.length > 1 && textWidth(`${out}…`, fontSize) > maxWidth) out = out.slice(0, -1);
  return `${out.trimEnd()}…`;
}

/** Reads a numeric field of a datum (non-numbers become null). */
export function numberField(datum: unknown, key: string): number | null {
  const v = typeof datum === 'object' && datum !== null ? (Reflect.get(datum, key) as unknown) : undefined;
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/** Reads a field of a datum as display text (the category / x value). */
export function labelField(datum: unknown, key: string): string {
  const v = typeof datum === 'object' && datum !== null ? (Reflect.get(datum, key) as unknown) : undefined;
  if (v instanceof Date) return v.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' ? String(v) : '';
}

const round = (v: number) => Math.round(v * 100) / 100;
