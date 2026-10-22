import { useId, useRef, type CSSProperties, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { arcPath, assignColors, defaultValueFormat, type ChartColor } from './core';
import { ChartDataTable, ChartLegend, ChartReadout, ChartTooltip, chartSurface, keyboardHint, useChartKeyboard, useElementWidth, useEntrance } from './ChartParts';

export interface DonutChartDatum {
  label: string;
  value: number;
  color?: ChartColor;
}

export interface DonutChartProps {
  /** Slices, drawn clockwise from 12 o'clock. Negative values are ignored. */
  data: DonutChartDatum[];
  /** Accessible name of the chart and caption of its data table. */
  label: string;
  /** Formats tooltip, legend and data table values (e.g. currency). */
  valueFormat?(this: void, value: number): string;
  /** Content in the middle, e.g. the total. */
  center?: ReactNode;
  /** Diameter in px (shrinks to fit narrow containers). Defaults to 176. */
  size?: number;
  /** Ring thickness in px. Defaults to 14% of the size. */
  thickness?: number;
  /** Show the legend with values and shares beside (or under) the ring. Defaults to true. */
  legend?: boolean;
  className?: string;
  style?: CSSProperties;
  id?: string;
}

const percent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });

/**
 * Parts of a whole as a ring, with an optional center label and a legend of values and shares. Hover a slice,
 * or focus the chart and use the arrow keys; a hidden table carries the same data.
 */
export function DonutChart({
  data,
  label,
  valueFormat = defaultValueFormat,
  center,
  size = 176,
  thickness,
  legend = true,
  className,
  style,
  id,
}: DonutChartProps) {
  const uid = useId();
  const [boxRef, rendered] = useElementWidth<HTMLDivElement>(size);
  const svgRef = useRef<SVGSVGElement>(null);
  const colors = assignColors(data);
  const nav = useChartKeyboard(data.length);

  const total = data.reduce((a, d) => a + Math.max(0, d.value), 0);
  const stroke = thickness ?? Math.max(8, Math.round(size * 0.14));
  const r = (size - stroke) / 2;
  const c = size / 2;
  const visible = data.filter((d) => d.value > 0).length;
  const pad = visible > 1 ? Math.min(0.04, 1.2 / r) : 0; // small gap between slices, in radians

  let angle = 0;
  const slices = data.map((d, i) => {
    const sweep = total > 0 ? (Math.max(0, d.value) / total) * Math.PI * 2 : 0;
    const a0 = angle;
    angle += sweep;
    const start = a0 + pad / 2;
    const end = Math.max(start, a0 + sweep - pad / 2);
    const mid = a0 + sweep / 2;
    return {
      i,
      d: sweep >= Math.PI * 2 - 1e-6 ? null : sweep > 0 ? arcPath(c, c, r, start, end) : '',
      share: total > 0 ? Math.max(0, d.value) / total : 0,
      mid,
      delay: total > 0 ? (a0 / (Math.PI * 2)) * 500 : 0,
    };
  });

  useEntrance(svgRef, '[data-slice]', [{ strokeDasharray: '0 1' }, { strokeDasharray: '1 0' }], { duration: 600 });

  const active = nav.active;
  const activeDatum = active === null ? undefined : data[active];
  const activeSlice = active === null ? undefined : slices[active];
  const scale = rendered / size;
  const tipAt = activeSlice
    ? { x: (c + (r + stroke / 2) * Math.sin(activeSlice.mid)) * scale, y: (c - (r + stroke / 2) * Math.cos(activeSlice.mid)) * scale }
    : { x: 0, y: 0 };
  const readout =
    activeDatum && activeSlice && nav.fromKeyboard
      ? `${activeDatum.label}: ${valueFormat(activeDatum.value)}, ${percent.format(activeSlice.share)}`
      : '';

  return (
    <div id={id} className={cn('flex w-full min-w-0 flex-wrap items-center justify-center gap-x-8 gap-y-4', className)} style={style}>
      <div ref={boxRef} className="relative min-w-0 max-w-full shrink" style={{ width: size }}>
        <svg
          ref={svgRef}
          role="img"
          aria-label={label}
          aria-describedby={`${uid}-hint`}
          tabIndex={0}
          viewBox={`0 0 ${size} ${size}`}
          width="100%"
          className={cn(chartSurface, 'rounded-full')}
          style={{ height: 'auto', aspectRatio: '1' }}
          onKeyDown={nav.onKeyDown}
          onBlur={nav.clear}
          onPointerLeave={nav.clear}
        >
          <circle cx={c} cy={c} r={r} fill="none" stroke="var(--n-bg-tertiary-translucent-a)" strokeWidth={stroke} />
          {slices.map((s) =>
            s.d === '' ? null : s.d === null ? (
              <circle
                key={s.i}
                data-slice
                cx={c}
                cy={c}
                r={r}
                pathLength={1}
                fill="none"
                stroke={colors[s.i]}
                strokeWidth={stroke}
                transform={`rotate(-90 ${c} ${c})`}
                onPointerEnter={() => nav.point(s.i)}
              />
            ) : (
              <path
                key={s.i}
                data-slice
                d={s.d}
                pathLength={1}
                fill="none"
                stroke={colors[s.i]}
                strokeWidth={active === s.i ? stroke + 4 : stroke}
                opacity={active === null || active === s.i ? 1 : 0.55}
                style={{ transition: 'opacity 120ms ease, stroke-width 120ms ease' }}
                onPointerEnter={() => nav.point(s.i)}
              />
            ),
          )}
        </svg>
        {center !== undefined && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-[18%] text-center tabular-nums">
            {center}
          </div>
        )}
        {activeDatum && activeSlice && (
          <ChartTooltip
            x={tipAt.x}
            y={tipAt.y}
            width={rendered}
            rows={[{ label: activeDatum.label, value: `${valueFormat(activeDatum.value)} · ${percent.format(activeSlice.share)}`, color: colors[active ?? 0] ?? '' }]}
          />
        )}
      </div>
      {legend && (
        <ChartLegend
          className="min-w-0 flex-col items-stretch gap-y-1.5 [&>li]:justify-between [&>li]:gap-3"
          items={data.map((d, i) => ({ label: d.label, color: colors[i] ?? '', value: `${valueFormat(d.value)} · ${percent.format(slices[i]?.share ?? 0)}` }))}
        />
      )}
      <span id={`${uid}-hint`} className="sr-only">{keyboardHint}</span>
      <ChartReadout>{readout}</ChartReadout>
      <ChartDataTable
        caption={label}
        columns={['Category', 'Value', 'Share']}
        rows={data.map((d, i) => [d.label, valueFormat(d.value), percent.format(slices[i]?.share ?? 0)])}
      />
    </div>
  );
}
