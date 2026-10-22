import { useId, useRef, type CSSProperties, type PointerEvent } from 'react';
import { cn } from '../lib/cn';
import { areaPath, assignColors, defaultValueFormat, labelField, linearScale, linePath, monotonePath, numberField, textWidth, type Point } from './core';
import { axisText, baselineStroke, gridStroke, tickCountFor, valueAxis, type ChartSeries, type IndexKey } from './cartesian';
import { ChartDataTable, ChartLegend, ChartReadout, ChartTooltip, chartSurface, keyboardHint, useChartKeyboard, useElementWidth, useEntrance } from './ChartParts';

export interface LineChartProps<Datum> {
  data: Datum[];
  /** Field of each datum used for the x axis (e.g. "month"). */
  index: IndexKey<Datum>;
  /** One line per series. Colors default to the palette in order. */
  series: ChartSeries[];
  /** Height in px. Defaults to 240. The width follows the container. */
  height?: number;
  /** Formats axis ticks, tooltip values and the data table (e.g. currency). */
  valueFormat?(this: void, value: number): string;
  /** Accessible name of the chart and caption of its data table. */
  label: string;
  /** Fill the area under each line. */
  area?: boolean;
  /** Smooth (monotone) curves instead of straight segments. */
  curved?: boolean;
  /** Show the legend. Defaults to true for more than one series. */
  legend?: boolean;
  /**
   * Start the value axis at zero (default true). Set false for series far from zero (balances, prices) so the
   * axis hugs the data and changes stay visible; areas then fill down to the lowest tick.
   */
  zeroBaseline?: boolean;
  /** Header of the x column in the data table. Defaults to the `index` field name, capitalized. */
  indexLabel?: string;
  className?: string;
  style?: CSSProperties;
  id?: string;
}

const M = { top: 12, right: 12, bottom: 28 };
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Trend over time for one or more series, hand-drawn in SVG: nice y ticks, hairline grid, optional area fill
 * and curves. Hover or focus it and use the arrow keys to read values; a hidden table carries the same data.
 */
export function LineChart<Datum>({
  data,
  index,
  series,
  height = 240,
  valueFormat = defaultValueFormat,
  label,
  area,
  curved,
  legend,
  zeroBaseline = true,
  indexLabel,
  className,
  style,
  id,
}: LineChartProps<Datum>) {
  const uid = useId();
  const [boxRef, width] = useElementWidth<HTMLDivElement>(560);
  const svgRef = useRef<SVGSVGElement>(null);
  const colors = assignColors(series);
  const nav = useChartKeyboard(data.length);
  const showLegend = legend ?? series.length > 1;

  const labels = data.map((d) => labelField(d, index));
  const values = series.map((s) => data.map((d) => numberField(d, s.key)));
  const plotH = Math.max(40, height - M.top - M.bottom);
  const axis = valueAxis(values.flat().filter((v): v is number => v !== null), valueFormat, tickCountFor(plotH), zeroBaseline);
  const left = Math.ceil(axis.labelWidth) + 10;
  const plotW = Math.max(20, width - left - M.right);
  const x = (i: number) => left + (data.length <= 1 ? plotW / 2 : (i * plotW) / (data.length - 1));
  const y = linearScale([axis.min, axis.max], [M.top + plotH, M.top]);
  const baseline = y(Math.max(axis.min, Math.min(0, axis.max)));

  // The first and last labels are anchored at their edge, so the next centered label needs 1.5 label widths of room.
  const labelW = Math.max(...labels.map((l) => textWidth(l)), 0);
  const spacing = data.length > 1 ? plotW / (data.length - 1) : plotW;
  const step = Math.max(1, Math.ceil((labelW * 1.5 + 12) / Math.max(1, spacing)));

  const lines = values.map((col) => {
    // Missing values break the line into segments.
    const segments: Point[][] = [[]];
    col.forEach((v, i) => {
      if (v === null) {
        if (segments[segments.length - 1]?.length) segments.push([]);
      } else segments[segments.length - 1]?.push([x(i), y(v)]);
    });
    return segments
      .filter((pts) => pts.length)
      .map((pts) => {
        const d = curved ? monotonePath(pts) : linePath(pts);
        return { d, area: areaPath(d, pts, baseline), pts };
      });
  });

  useEntrance(svgRef, '[data-line]', [{ strokeDasharray: '0 1' }, { strokeDasharray: '1 0' }], { duration: 700 });
  useEntrance(svgRef, '[data-area]', [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 200 });

  const indexAt = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) * width) / (rect.width || width);
    if (data.length <= 1) return 0;
    return Math.max(0, Math.min(data.length - 1, Math.round(((px - left) / plotW) * (data.length - 1))));
  };

  const active = nav.active;
  const activeRows =
    active === null
      ? []
      : series.flatMap((s, si) => {
          const v = values[si]?.[active];
          return v === null || v === undefined ? [] : [{ label: s.label, value: valueFormat(v), color: colors[si] ?? '', y: y(v) }];
        });
  const readout = active === null || !nav.fromKeyboard ? '' : `${labels[active]}: ${activeRows.map((r) => `${r.label} ${r.value}`).join(', ')}`;
  const anchorY = activeRows.length ? Math.min(...activeRows.map((r) => r.y)) : M.top;

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
          {axis.ticks.map((t) => (
            <g key={t}>
              <line x1={left} x2={left + plotW} y1={y(t)} y2={y(t)} stroke={t === 0 ? baselineStroke : gridStroke} shapeRendering="crispEdges" />
              <text x={left - 8} y={y(t)} dy="0.32em" textAnchor="end" style={axisText}>
                {valueFormat(t)}
              </text>
            </g>
          ))}
          {labels.map((l, i) =>
            i % step === 0 ? (
              <text
                key={`${l}-${i}`}
                x={x(i)}
                y={height - 8}
                textAnchor={data.length > 1 && i === 0 ? 'start' : data.length > 1 && i === data.length - 1 ? 'end' : 'middle'}
                style={axisText}
              >
                {l}
              </text>
            ) : null,
          )}
          {area &&
            lines.map((parts, si) =>
              parts.map((p, pi) => <path key={`a${si}-${pi}`} data-area d={p.area} fill={colors[si]} fillOpacity={0.1} />),
            )}
          {lines.map((parts, si) =>
            parts.map((p, pi) =>
              p.pts.length === 1 ? (
                <circle key={`l${si}-${pi}`} cx={p.pts[0]?.[0]} cy={p.pts[0]?.[1]} r={2.5} fill={colors[si]} />
              ) : (
                <path
                  key={`l${si}-${pi}`}
                  data-line
                  d={p.d}
                  pathLength={1}
                  fill="none"
                  stroke={colors[si]}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ),
            ),
          )}
          {active !== null && (
            <g aria-hidden>
              <line x1={x(active)} x2={x(active)} y1={M.top} y2={M.top + plotH} stroke={baselineStroke} strokeDasharray="3 3" />
              {activeRows.map((r) => (
                <circle key={r.label} cx={x(active)} cy={r.y} r={4} fill={r.color} stroke="var(--n-bg-primary)" strokeWidth={2} />
              ))}
            </g>
          )}
        </svg>
        {active !== null && activeRows.length > 0 && (
          <ChartTooltip x={x(active)} y={anchorY} width={width} title={labels[active]} rows={activeRows} />
        )}
      </div>
      <span id={`${uid}-hint`} className="sr-only">{keyboardHint}</span>
      <ChartReadout>{readout}</ChartReadout>
      <ChartDataTable
        caption={label}
        columns={[indexLabel ?? capitalize(index), ...series.map((s) => s.label)]}
        rows={data.map((_, i) => [labels[i] ?? '', ...series.map((_s, si) => { const v = values[si]?.[i]; return v === null || v === undefined ? '–' : valueFormat(v); })])}
      />
    </div>
  );
}
