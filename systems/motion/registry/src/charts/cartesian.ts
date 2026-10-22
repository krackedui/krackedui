// Shared layout for charts with axes (LineChart, BarChart).
import { niceTicks, textWidth, type ChartColor } from './core';

export interface ChartSeries<Key extends string = string> {
  /** Field of each datum holding this series' numbers. */
  key: Key;
  /** Name in the legend, tooltip and data table. */
  label: string;
  color?: ChartColor;
}

/** `index` accepts the datum's keys once the datum type is known (plain `string` otherwise). */
export type IndexKey<Datum> = unknown extends Datum ? string : keyof Datum & string;

export interface ValueAxis {
  ticks: number[];
  min: number;
  max: number;
  /** Width of the widest tick label, px. */
  labelWidth: number;
}

/**
 * Nice ticks covering the values and the width their labels need. The axis includes zero unless
 * `includeZero` is false (then it hugs the data, e.g. account balances that never come near 0).
 */
export function valueAxis(values: number[], format: (v: number) => string, tickCount: number, includeZero = true): ValueAxis {
  const lo = includeZero || !values.length ? Math.min(0, ...values) : Math.min(...values);
  const hi = includeZero || !values.length ? Math.max(0, ...values) : Math.max(...values);
  const ticks = niceTicks(lo, hi, tickCount);
  const min = ticks[0] ?? 0;
  const max = ticks[ticks.length - 1] ?? 1;
  return { ticks, min, max, labelWidth: Math.max(...ticks.map((t) => textWidth(format(t)))) };
}

/** How many value ticks fit a plot of this height (about one per 40px, 2–6). */
export const tickCountFor = (plotHeight: number) => Math.max(2, Math.min(6, Math.round(plotHeight / 40)));

export const AXIS_FONT = 12;
export const axisText = { fill: 'var(--n-text-secondary)', fontSize: AXIS_FONT, fontVariantNumeric: 'tabular-nums' } as const;
export const gridStroke = 'var(--n-border-secondary-translucent-a)';
export const baselineStroke = 'var(--n-border-primary)';
