'use client';

import { useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import type { Color } from '../display/badge';
import type { Tone } from '../display/badge';

/** The categorical slots, in their fixed order. Assigned in sequence, never cycled. */
export const chartSlots = ['var(--ds-chart-1)', 'var(--ds-chart-2)', 'var(--ds-chart-3)', 'var(--ds-chart-4)', 'var(--ds-chart-5)', 'var(--ds-chart-6)'] as const;

/**
 * The colour for series `i`. A named `color` maps onto the nearest slot; otherwise the slot is the
 * series' position. Past the sixth there is no seventh hue: the contract's `Color` names more than
 * the validated set holds, and generating one would break the palette. Fold the rest into "Other",
 * or facet.
 */
const COLOR_SLOT: Partial<Record<Color, number>> = { red: 0, purple: 1, yellow: 2, blue: 3, orange: 4, pink: 5, brown: 4, gray: 0, green: 2, teal: 3 };
export function seriesColor(index: number, color?: Color): string {
  const slot = color != null ? (COLOR_SLOT[color] ?? index) : index;
  return chartSlots[slot % chartSlots.length];
}

export interface ChartSeries {
  key: string;
  label: string;
  color?: Color;
}

/**
 * The field a chart is indexed by.
 *
 * `keyof Datum & string` alone collapses to `never` the moment `Datum` is not known — which is what
 * happens to anyone reading `ComponentProps<typeof LineChart>`, the gate's contract check included,
 * because TypeScript erases an uninstantiated type parameter to its constraint rather than to its
 * default. Falling back to `string` there keeps the prop usable instead of impossible.
 */
type IndexKey<Datum> = unknown extends Datum ? string : keyof Datum & string;

interface ChartBase<Datum> {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  data: Datum[];
  /** The field each datum is placed by. */
  index: IndexKey<Datum>;
  series: ChartSeries[];
  height?: number;
  valueFormat?: (value: number) => string;
  /** The chart's accessible name. Also the caption of the table underneath it. */
  label: string;
}

/**
 * The container's width in CSS pixels.
 *
 * A fixed `viewBox` at `width: 100%` does not make a chart responsive, it zooms it: at 1440 px a
 * 10 px axis label is drawn at about 24 px, and every stroke thickens with it. Type in a design
 * system does not grow with its container, so the chart is rendered at the width it actually has
 * and re-rendered when that changes.
 */
function useElementWidth(fallback: number): [React.RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(fallback);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(Math.max(240, Math.round(el.getBoundingClientRect().width)));
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

const num = (v: unknown): number => (typeof v === 'number' ? v : Number(v) || 0);
/** An index value as a label. Only text is a label; anything else draws nothing rather than "[object Object]". */
const axisLabel = (v: unknown): string => (typeof v === 'string' || typeof v === 'number' ? String(v) : '');
// `left` has to hold the widest formatted tick, not a bare number: 36 px fits "60" and clips
// "$36k". 48 holds a five-character label at 10 px, which is what valueFormat usually produces.
const PAD = { top: 8, right: 8, bottom: 20, left: 48 };

/** The table every chart carries, for assistive tech and for anyone who wants the numbers. */
function DataTableFallback<Datum>({ label, data, index, series, valueFormat }: { label: string; data: Datum[]; index: string; series: ChartSeries[]; valueFormat?: (v: number) => string }) {
  const fmt = valueFormat ?? ((v: number) => String(v));
  return (
    <table className="bay-sr-only">
      <caption>{label}</caption>
      <thead>
        <tr>
          <th scope="col">{index}</th>
          {series.map((s) => (
            <th key={s.key} scope="col">{s.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((d, i) => (
          <tr key={i}>
            <th scope="row">{String((d as Record<string, unknown>)[index])}</th>
            {series.map((s) => (
              <td key={s.key}>{fmt(num((d as Record<string, unknown>)[s.key]))}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** A legend is always present from two series up; one series is named by the title instead. */
function Legend({ series }: { series: ChartSeries[] }) {
  if (series.length < 2) return null;
  return (
    <div className="bay-chart__legend">
      {series.map((s, i) => (
        <span key={s.key} className="bay-chart__key">
          <span className="bay-chart__swatch" style={{ background: seriesColor(i, s.color) }} />
          {s.label}
        </span>
      ))}
    </div>
  );
}

function useScale<Datum>(data: Datum[], series: ChartSeries[], height: number, stacked = false) {
  return useMemo(() => {
    let max = 0;
    for (const d of data) {
      const row = d as Record<string, unknown>;
      if (stacked) max = Math.max(max, series.reduce((t, s) => t + num(row[s.key]), 0));
      else for (const s of series) max = Math.max(max, num(row[s.key]));
    }
    max = max || 1;
    const plot = height - PAD.top - PAD.bottom;
    return { max, plot, y: (v: number) => PAD.top + plot - (v / max) * plot };
  }, [data, series, height, stacked]);
}

/* ---------- line / area ---------- */

export interface LineChartProps<Datum = Record<string, unknown>> extends ChartBase<Datum> {
  area?: boolean;
  curved?: boolean;
}

/** A trend over time. One axis only — two measures of different scale want two charts. */
export function LineChart<Datum>({ className, style, id, data, index, series, height = 180, valueFormat, label, area, curved }: LineChartProps<Datum>) {
  const [box, w] = useElementWidth(480);
  const { max, y } = useScale(data, series, height);
  const [hover, setHover] = useState<number | null>(null);
  const fmt = valueFormat ?? ((v: number) => String(v));
  const x = (i: number) => PAD.left + (i * (w - PAD.left - PAD.right)) / Math.max(1, data.length - 1);

  const path = (key: string) =>
    data
      .map((d, i) => {
        const px = x(i);
        const py = y(num((d as Record<string, unknown>)[key]));
        if (i === 0) return `M${px},${py}`;
        if (!curved) return `L${px},${py}`;
        const prevX = x(i - 1);
        const cx = (prevX + px) / 2;
        return `C${cx},${y(num((data[i - 1] as Record<string, unknown>)[key]))} ${cx},${py} ${px},${py}`;
      })
      .join(' ');

  return (
    <div ref={box} className={cn('bay-chart', className)} style={style} id={id}>
      <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} role="img" aria-label={label} onPointerLeave={() => setHover(null)}>
        {[0, 0.5, 1].map((f) => (
          <line key={f} className="bay-chart__grid" x1={PAD.left} x2={w - PAD.right} y1={y(max * f)} y2={y(max * f)} />
        ))}
        {[0, 0.5, 1].map((f) => (
          <text key={f} className="bay-chart__axis" x={0} y={y(max * f) + 3}>{fmt(Math.round(max * f))}</text>
        ))}
        {/*
          The index along the bottom. Only every nth label is drawn — enough that they never collide
          at the width the chart actually has, and the stride is recomputed when that width changes.
          Without this a line chart over twelve months had no months on it: the hidden data table
          carried them, so nothing failed, and the picture was still unreadable.
        */}
        {data.map((d, i) => {
          const stride = Math.max(1, Math.ceil(data.length / Math.max(2, Math.floor((w - PAD.left - PAD.right) / 56))));
          if (i % stride !== 0 && i !== data.length - 1) return null;
          const anchor = i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle';
          return (
            <text key={`x-${i}`} className="bay-chart__axis" x={x(i)} y={height - 6} textAnchor={anchor}>
              {axisLabel((d as Record<string, unknown>)[index])}
            </text>
          );
        })}
        {series.map((s, si) => (
          <g key={s.key}>
            {area && <path className="bay-chart__area" d={`${path(s.key)} L${x(data.length - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill={seriesColor(si, s.color)} />}
            <path className="bay-chart__line" d={path(s.key)} stroke={seriesColor(si, s.color)} />
          </g>
        ))}
        {hover != null && <line className="bay-chart__crosshair" x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={height - PAD.bottom} />}
        {hover != null &&
          series.map((s, si) => (
            <circle key={s.key} className="bay-chart__dot" cx={x(hover)} cy={y(num((data[hover] as Record<string, unknown>)[s.key]))} fill={seriesColor(si, s.color)} />
          ))}
        {/* hit targets wider than the marks */}
        {data.map((_, i) => (
          <rect key={i} x={x(i) - 12} y={0} width={24} height={height} fill="transparent" onPointerEnter={() => setHover(i)} />
        ))}
      </svg>
      {hover != null && (
        <div className="bay-chart__tip" style={{ left: `${(x(hover) / w) * 100}%`, top: 0 }}>
          <div className="bay-chart__tipRow"><strong>{String((data[hover] as Record<string, unknown>)[index])}</strong></div>
          {series.map((s, si) => (
            <div key={s.key} className="bay-chart__tipRow">
              <span className="bay-chart__tipLabel">
                <span className="bay-chart__swatch" style={{ background: seriesColor(si, s.color) }} />
                {s.label}
              </span>
              <span className="bay-chart__tipValue">{fmt(num((data[hover] as Record<string, unknown>)[s.key]))}</span>
            </div>
          ))}
        </div>
      )}
      <Legend series={series} />
      <DataTableFallback label={label} data={data} index={index} series={series} valueFormat={valueFormat} />
    </div>
  );
}

/* ---------- bar ---------- */

export interface BarChartProps<Datum = Record<string, unknown>> extends ChartBase<Datum> {
  stacked?: boolean;
  layout?: 'vertical' | 'horizontal';
}

/** Compare categories. Bars are anchored to the baseline, with a 4px rounded data end. */
export function BarChart<Datum>({ className, style, id, data, index, series, height = 180, valueFormat, label, stacked }: BarChartProps<Datum>) {
  const [box, w] = useElementWidth(480);
  const { max, y } = useScale(data, series, height, stacked);
  const [hover, setHover] = useState<number | null>(null);
  const fmt = valueFormat ?? ((v: number) => String(v));
  const band = (w - PAD.left - PAD.right) / Math.max(1, data.length);
  const groupW = band * 0.68;
  const barW = stacked ? groupW : groupW / Math.max(1, series.length);

  return (
    <div ref={box} className={cn('bay-chart', className)} style={style} id={id}>
      <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} role="img" aria-label={label} onPointerLeave={() => setHover(null)}>
        {[0, 0.5, 1].map((f) => (
          <line key={f} className="bay-chart__grid" x1={PAD.left} x2={w - PAD.right} y1={y(max * f)} y2={y(max * f)} />
        ))}
        {[0, 0.5, 1].map((f) => (
          <text key={f} className="bay-chart__axis" x={0} y={y(max * f) + 3}>{fmt(Math.round(max * f))}</text>
        ))}
        {data.map((d, i) => {
          const row = d as Record<string, unknown>;
          const left = PAD.left + i * band + (band - groupW) / 2;
          let stackTop = 0;
          return (
            <g key={i} onPointerEnter={() => setHover(i)}>
              {series.map((s, si) => {
                const v = num(row[s.key]);
                const h = (v / max) * (height - PAD.top - PAD.bottom);
                const bx = stacked ? left : left + si * barW;
                const by = stacked ? y(stackTop + v) : y(v);
                if (stacked) stackTop += v;
                // only the data end is rounded: the top of a stack, or every bar when grouped.
                // A rounded join mid-stack would read as a gap that is not in the data.
                const isEnd = !stacked || si === series.length - 1;
                return (
                  <rect
                    key={s.key}
                    className="bay-chart__bar"
                    x={bx}
                    y={by}
                    width={Math.max(2, barW)}
                    height={Math.max(1, h)}
                    rx={isEnd ? 4 : 0}
                    fill={seriesColor(si, s.color)}
                  />
                );
              })}
              <text className="bay-chart__axis" x={left + groupW / 2} y={height - 6} textAnchor="middle">
                {String(row[index]).slice(0, 6)}
              </text>
            </g>
          );
        })}
      </svg>
      {hover != null && (
        <div className="bay-chart__tip" style={{ left: `${((PAD.left + hover * band + band / 2) / w) * 100}%`, top: 0 }}>
          <div className="bay-chart__tipRow"><strong>{String((data[hover] as Record<string, unknown>)[index])}</strong></div>
          {series.map((s, si) => (
            <div key={s.key} className="bay-chart__tipRow">
              <span className="bay-chart__tipLabel">
                <span className="bay-chart__swatch" style={{ background: seriesColor(si, s.color) }} />
                {s.label}
              </span>
              <span className="bay-chart__tipValue">{fmt(num((data[hover] as Record<string, unknown>)[s.key]))}</span>
            </div>
          ))}
        </div>
      )}
      <Legend series={series} />
      <DataTableFallback label={label} data={data} index={index} series={series} valueFormat={valueFormat} />
    </div>
  );
}

/* ---------- donut ---------- */

export interface DonutChartProps {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  data: { label: string; value: number; color?: Color }[];
  label: string;
  valueFormat?: (value: number) => string;
  /** What sits in the middle, usually the total. */
  center?: ReactNode;
  size?: number;
}

/** Parts of a whole. Segments carry a 2px surface gap, so neighbours never merge. */
export function DonutChart({ className, style, id, data, label, valueFormat, center, size = 150 }: DonutChartProps) {
  const fmt = valueFormat ?? ((v: number) => String(v));
  const total = data.reduce((t, d) => t + d.value, 0) || 1;
  const r = size / 2 - 6;
  const c = size / 2;
  const stroke = 18;
  const circumference = 2 * Math.PI * (r - stroke / 2);
  let offset = 0;

  return (
    <div className={cn('bay-chart', className)} style={style} id={id}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label} style={{ width: size }}>
        <g transform={`rotate(-90 ${c} ${c})`}>
          {data.map((d, i) => {
            const frac = d.value / total;
            const dash = frac * circumference;
            const el = (
              <circle
                key={d.label}
                cx={c}
                cy={c}
                r={r - stroke / 2}
                fill="none"
                stroke={seriesColor(i, d.color)}
                strokeWidth={stroke}
                strokeDasharray={`${Math.max(0, dash - 2)} ${circumference - Math.max(0, dash - 2)}`}
                strokeDashoffset={-offset}
              />
            );
            offset += dash;
            return el;
          })}
        </g>
        {center && (
          <text x={c} y={c + 4} textAnchor="middle" style={{ fill: 'var(--ds-text-primary)', fontSize: 14, fontWeight: 600 }}>
            {center}
          </text>
        )}
      </svg>
      <div className="bay-chart__legend">
        {data.map((d, i) => (
          <span key={d.label} className="bay-chart__key">
            <span className="bay-chart__swatch" style={{ background: seriesColor(i, d.color) }} />
            {d.label}
            <span className="bay-chart__tipValue">{fmt(d.value)}</span>
          </span>
        ))}
      </div>
      <table className="bay-sr-only">
        <caption>{label}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{fmt(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- sparkline ---------- */

export interface SparklineProps {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  data: number[];
  tone?: Tone;
  width?: number;
  height?: number;
  label: string;
}

const TONE_STROKE: Record<Tone, string> = {
  neutral: 'var(--ds-text-tertiary)',
  accent: 'var(--ds-accent-default)',
  success: 'var(--ds-status-success)',
  warning: 'var(--ds-status-warning)',
  danger: 'var(--ds-status-danger)',
  info: 'var(--ds-status-info)',
};

/** A tiny inline trend. No axes: it shows shape, and the number beside it carries the value. */
export function Sparkline({ className, style, id, data, tone = 'accent', width = 72, height = 20, label }: SparklineProps) {
  const uid = useId();
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const span = max - min || 1;
  const d = data
    .map((v, i) => `${i ? 'L' : 'M'}${(i * width) / Math.max(1, data.length - 1)},${height - ((v - min) / span) * height}`)
    .join(' ');
  return (
    <span className={cn('bay-sparkline', className)} style={style} id={id}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={uid}>
        <title id={uid}>{label}</title>
        <path d={d} stroke={TONE_STROKE[tone]} />
      </svg>
    </span>
  );
}
