import { useId, useRef, type CSSProperties } from 'react';
import { cn } from '../lib/cn';
import { areaPath, chartColorVar, linePath, linearScale, type Point } from './core';
import { useElementWidth, useEntrance } from './ChartParts';
import type { Tone } from '../data/tone';
import { toneColor } from '../data/tone';

export interface SparklineProps {
  /** Values in order (oldest first). */
  data: number[];
  /** Line color by meaning. Defaults to `accent`. */
  tone?: Tone;
  /** Width in px. Omit to fill the container. */
  width?: number;
  /** Height in px. Defaults to 28. */
  height?: number;
  /** Accessible summary, e.g. "Revenue, last 12 weeks, rising". */
  label: string;
  /** Soft fill under the line. Defaults to true. */
  area?: boolean;
  /** Format for the values in the hidden data list. */
  valueFormat?(this: void, value: number): string;
  className?: string;
  style?: CSSProperties;
  id?: string;
}

/**
 * Tiny inline trend line with no axes, for table cells and stat cards. It is an image with a summary label
 * plus a visually hidden list of its values; not interactive (put the numbers next to it).
 */
export function Sparkline({ data, tone = 'accent', width, height = 28, label, area = true, valueFormat = String, className, style, id }: SparklineProps) {
  const uid = useId();
  const [boxRef, measured] = useElementWidth<HTMLSpanElement>(width ?? 96);
  const svgRef = useRef<SVGSVGElement>(null);
  const w = width ?? measured;
  const color = chartColorVar(toneColor[tone]);
  const pad = 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const y = linearScale(min === max ? [min - 1, max + 1] : [min, max], [height - pad, pad]);
  const points: Point[] = data.map((v, i) => [data.length <= 1 ? w / 2 : pad + (i * (w - pad * 2)) / (data.length - 1), y(v)]);
  const d = linePath(points);
  const last = points[points.length - 1];

  useEntrance(svgRef, '[data-line]', [{ strokeDasharray: '0 1' }, { strokeDasharray: '1 0' }], { duration: 600 });

  return (
    <span
      ref={boxRef}
      id={id}
      className={cn('inline-block min-w-0 max-w-full align-middle', width === undefined && 'w-full', className)}
      style={{ width, height, ...style }}
    >
      <svg ref={svgRef} role="img" aria-label={label} aria-describedby={`${uid}-values`} width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="block overflow-visible">
        {area && points.length > 1 && <path d={areaPath(d, points, height)} fill={color} fillOpacity={0.12} />}
        {points.length > 1 && (
          <path data-line d={d} pathLength={1} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        )}
        {last && <circle cx={last[0]} cy={last[1]} r={2} fill={color} />}
      </svg>
      <span id={`${uid}-values`} className="sr-only">
        {`Values: ${data.map((v) => valueFormat(v)).join(', ')}`}
      </span>
    </span>
  );
}
