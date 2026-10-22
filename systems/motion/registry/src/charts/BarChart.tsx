import { useId, useRef, type CSSProperties, type PointerEvent } from 'react';
import { cn } from '../lib/cn';
import { assignColors, defaultValueFormat, labelField, labelStep, linearScale, numberField, textWidth, truncateText } from './core';
import { axisText, baselineStroke, gridStroke, tickCountFor, valueAxis, type ChartSeries, type IndexKey } from './cartesian';
import { ChartDataTable, ChartLegend, ChartReadout, ChartTooltip, chartSurface, keyboardHint, useChartKeyboard, useElementWidth, useEntrance } from './ChartParts';

export interface BarChartProps<Datum> {
  data: Datum[];
  /** Field of each datum naming its category (e.g. "month"). */
  index: IndexKey<Datum>;
  /** One bar (grouped) or one segment (stacked) per series. Colors default to the palette in order. */
  series: ChartSeries[];
  /** Height in px. Defaults to 240 (horizontal: 32px per category, at least 120). The width follows the container. */
  height?: number;
  /** Formats axis ticks, tooltip values and the data table (e.g. currency). */
  valueFormat?(this: void, value: number): string;
  /** Accessible name of the chart and caption of its data table. */
  label: string;
  /** Stack series on top of each other instead of side by side. */
  stacked?: boolean;
  /** `vertical` columns (default) or `horizontal` bars, which suit long category names. */
  layout?: 'vertical' | 'horizontal';
  /** Show the legend. Defaults to true for more than one series. */
  legend?: boolean;
  /** Header of the category column in the data table. Defaults to the `index` field name, capitalized. */
  indexLabel?: string;
  className?: string;
  style?: CSSProperties;
  id?: string;
}

interface Bar {
  series: number;
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
  negative: boolean;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Compares categories with grouped or stacked bars, vertical or horizontal, hand-drawn in SVG. Hover or focus
 * it and use the arrow keys to read each category; a hidden table carries the same data.
 */
export function BarChart<Datum>({
  data,
  index,
  series,
  height: heightProp,
  valueFormat = defaultValueFormat,
  label,
  stacked,
  layout = 'vertical',
  legend,
  indexLabel,
  className,
  style,
  id,
}: BarChartProps<Datum>) {
  const uid = useId();
  const [boxRef, width] = useElementWidth<HTMLDivElement>(560);
  const svgRef = useRef<SVGSVGElement>(null);
  const colors = assignColors(series);
  const nav = useChartKeyboard(data.length);
  const horizontal = layout === 'horizontal';
  const showLegend = legend ?? series.length > 1;
  const height = heightProp ?? (horizontal ? Math.max(120, data.length * 32 + 36) : 240);

  const labels = data.map((d) => labelField(d, index));
  const values = data.map((d) => series.map((s) => numberField(d, s.key)));
  // Domain: per-category totals when stacked (positives up, negatives down), else every value.
  const extent = stacked
    ? values.flatMap((row) => [row.reduce<number>((a, v) => a + Math.max(0, v ?? 0), 0), row.reduce<number>((a, v) => a + Math.min(0, v ?? 0), 0)])
    : values.flat().filter((v): v is number => v !== null);

  const n = Math.max(1, data.length);
  const k = Math.max(1, series.length);
  const top = 12;
  const right = 12;
  const bars: Bar[] = [];
  let valuePos: (v: number) => number;
  let axis: ReturnType<typeof valueAxis>;
  let plot: { x: number; y: number; w: number; h: number };
  let bandStart: (i: number) => number;
  let band: number;
  let categoryLabels: { text: string; full: string; x: number; y: number; anchor: 'start' | 'middle' | 'end' }[] = [];
  let valueLabels: { v: number; x: number; y: number; anchor: 'start' | 'middle' | 'end' }[] = [];

  if (!horizontal) {
    const bottom = 28;
    const plotH = Math.max(40, height - top - bottom);
    axis = valueAxis(extent, valueFormat, tickCountFor(plotH));
    const left = Math.ceil(axis.labelWidth) + 10;
    plot = { x: left, y: top, w: Math.max(20, width - left - right), h: plotH };
    band = plot.w / n;
    bandStart = (i) => plot.x + i * band;
    valuePos = linearScale([axis.min, axis.max], [plot.y + plot.h, plot.y]);
    const step = labelStep(n, plot.w, Math.max(...labels.map((l) => textWidth(l)), 0) + 12);
    const maxLabel = band * step - 6;
    categoryLabels = labels.flatMap((l, i) =>
      i % step === 0 ? [{ text: truncateText(l, Math.max(24, maxLabel)), full: l, x: bandStart(i) + band / 2, y: height - 8, anchor: 'middle' as const }] : [],
    );
    valueLabels = axis.ticks.map((t) => ({ v: t, x: left - 8, y: valuePos(t), anchor: 'end' as const }));
  } else {
    const bottom = 24;
    const labelRoom = Math.min(Math.max(...labels.map((l) => textWidth(l)), 0) + 12, Math.max(56, width * 0.32));
    const plotW = Math.max(40, width - labelRoom - right);
    axis = valueAxis(extent, valueFormat, Math.max(2, Math.min(6, Math.floor(plotW / 72))));
    plot = { x: labelRoom, y: top, w: plotW, h: Math.max(20, height - top - bottom) };
    band = plot.h / n;
    bandStart = (i) => plot.y + i * band;
    valuePos = linearScale([axis.min, axis.max], [plot.x, plot.x + plot.w]);
    categoryLabels = labels.map((l, i) => ({ text: truncateText(l, labelRoom - 12), full: l, x: labelRoom - 8, y: bandStart(i) + band / 2, anchor: 'end' as const }));
    const tickStep = labelStep(axis.ticks.length, plot.w, axis.labelWidth + 16);
    valueLabels = axis.ticks.flatMap((t, i) => (i % tickStep === 0 ? [{ v: t, x: valuePos(t), y: height - 6, anchor: 'middle' as const }] : []));
  }

  const zero = valuePos(Math.max(axis.min, Math.min(0, axis.max)));
  const thickness = stacked ? Math.min(40, band * 0.6) : Math.min(28, (band * 0.72) / k);
  const gap = stacked || k === 1 ? 0 : Math.min(3, thickness * 0.2);
  const groupSize = stacked ? thickness : thickness * k + gap * (k - 1);
  values.forEach((row, i) => {
    const offset = bandStart(i) + (band - groupSize) / 2;
    let up = 0;
    let down = 0;
    row.forEach((v, si) => {
      if (v === null) return;
      const from = stacked ? (v >= 0 ? up : down) : 0;
      const to = from + v;
      if (stacked) {
        if (v >= 0) up = to;
        else down = to;
      }
      const a = valuePos(from);
      const b = valuePos(to);
      const along = stacked ? offset : offset + si * (thickness + gap);
      if (!horizontal) bars.push({ series: si, index: i, x: along, y: Math.min(a, b), w: thickness, h: Math.abs(a - b), negative: v < 0 });
      else bars.push({ series: si, index: i, x: Math.min(a, b), y: along, w: Math.abs(a - b), h: thickness, negative: v < 0 });
    });
  });

  useEntrance(svgRef, '[data-bar]', (el) => {
    const negative = el.getAttribute('data-negative') === 'true';
    const from = horizontal ? 'scaleX(0)' : 'scaleY(0)';
    return [
      { transform: from, transformOrigin: horizontal ? (negative ? 'right' : 'left') : negative ? 'top' : 'bottom' },
      { transform: 'none', transformOrigin: horizontal ? (negative ? 'right' : 'left') : negative ? 'top' : 'bottom' },
    ];
  }, { duration: 520, stagger: 18 });

  const indexAt = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scale = width / (rect.width || width);
    const pos = horizontal ? (e.clientY - rect.top) * (height / (rect.height || height)) : (e.clientX - rect.left) * scale;
    const i = Math.floor((pos - (horizontal ? plot.y : plot.x)) / band);
    return i >= 0 && i < data.length ? i : null;
  };

  const active = nav.active;
  const activeRows =
    active === null
      ? []
      : series.flatMap((s, si) => {
          const v = values[active]?.[si];
          return v === null || v === undefined ? [] : [{ label: s.label, value: valueFormat(v), color: colors[si] ?? '' }];
        });
  if (stacked && active !== null && activeRows.length > 1) {
    const total = (values[active] ?? []).reduce<number>((a, v) => a + (v ?? 0), 0);
    activeRows.push({ label: 'Total', value: valueFormat(total), color: 'transparent' });
  }
  const readout = active === null || !nav.fromKeyboard ? '' : `${labels[active]}: ${activeRows.map((r) => `${r.label} ${r.value}`).join(', ')}`;
  const anchor =
    active === null
      ? { x: 0, y: 0 }
      : horizontal
        ? { x: Math.max(...bars.filter((b) => b.index === active).map((b) => b.x + b.w), plot.x), y: bandStart(active) + band / 2 }
        : { x: bandStart(active) + band / 2, y: Math.min(...bars.filter((b) => b.index === active).map((b) => b.y), plot.y + plot.h) };

  return (
    <div id={id} className={cn('flex w-full min-w-0 flex-col gap-3', className)} style={style}>
      {showLegend && <ChartLegend items={series.map((s, i) => ({ label: s.label, color: colors[i] ?? '' }))} />}
      <div ref={boxRef} className="relative w-full min-w-0">
        <svg
          ref={svgRef}
          role="img"
          aria-label={label}
          aria-describedby={`${uid}-hint`}
          tabIndex={0}
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className={chartSurface}
          onKeyDown={nav.onKeyDown}
          onBlur={nav.clear}
          onPointerMove={(e) => nav.point(indexAt(e))}
          onPointerLeave={nav.clear}
        >
          {active !== null && (
            <rect
              aria-hidden
              x={horizontal ? plot.x : bandStart(active)}
              y={horizontal ? bandStart(active) : plot.y}
              width={horizontal ? plot.w : band}
              height={horizontal ? band : plot.h}
              rx={4}
              fill="var(--n-button-hover-bg-a)"
            />
          )}
          {axis.ticks.map((t) => {
            const p = valuePos(t);
            return horizontal ? (
              <line key={t} x1={p} x2={p} y1={plot.y} y2={plot.y + plot.h} stroke={t === 0 ? baselineStroke : gridStroke} shapeRendering="crispEdges" />
            ) : (
              <line key={t} x1={plot.x} x2={plot.x + plot.w} y1={p} y2={p} stroke={t === 0 ? baselineStroke : gridStroke} shapeRendering="crispEdges" />
            );
          })}
          {valueLabels.map((t) => (
            <text key={t.v} x={t.x} y={t.y} dy={horizontal ? undefined : '0.32em'} textAnchor={t.anchor} style={axisText}>
              {valueFormat(t.v)}
            </text>
          ))}
          {categoryLabels.map((c, i) => (
            <text key={`${c.full}-${i}`} x={c.x} y={c.y} dy={horizontal ? '0.32em' : undefined} textAnchor={c.anchor} style={axisText}>
              {c.text !== c.full && <title>{c.full}</title>}
              {c.text}
            </text>
          ))}
          <line
            x1={horizontal ? zero : plot.x}
            x2={horizontal ? zero : plot.x + plot.w}
            y1={horizontal ? plot.y : zero}
            y2={horizontal ? plot.y + plot.h : zero}
            stroke={baselineStroke}
            shapeRendering="crispEdges"
          />
          {bars.map((b) => (
            <rect
              key={`${b.index}-${b.series}`}
              data-bar
              data-negative={b.negative}
              x={b.x}
              y={b.y}
              width={Math.max(0, b.w)}
              height={Math.max(0, b.h)}
              rx={Math.min(2, b.w / 2, b.h / 2)}
              fill={colors[b.series]}
              opacity={active === null || active === b.index ? 1 : 0.55}
              style={{ transition: 'opacity 120ms ease', transformBox: 'fill-box' }}
            />
          ))}
        </svg>
        {active !== null && activeRows.length > 0 && <ChartTooltip x={anchor.x} y={anchor.y} width={width} title={labels[active]} rows={activeRows} />}
      </div>
      <span id={`${uid}-hint`} className="sr-only">{keyboardHint}</span>
      <ChartReadout>{readout}</ChartReadout>
      <ChartDataTable
        caption={label}
        columns={[indexLabel ?? capitalize(index), ...series.map((s) => s.label)]}
        rows={data.map((_, i) => [labels[i] ?? '', ...series.map((_s, si) => { const v = values[i]?.[si]; return v === null || v === undefined ? '–' : valueFormat(v); })])}
      />
    </div>
  );
}
