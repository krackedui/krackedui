import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import type { Tone } from '../display/badge';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: number | string;
  height?: number | string;
  radius?: 'sm' | 'md' | 'lg' | 'full';
  /** Render this many text lines instead of one block. The last line is short, as text ends. */
  lines?: number;
}

/** A placeholder shaped like the content that is coming. Hidden from assistive tech. */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { width, height, radius = 'sm', lines, className, style, ...rest },
  ref,
) {
  if (lines && lines > 1) {
    return (
      <div ref={ref} className={cn('bay-skeleton-lines', className)} aria-hidden="true" style={style} {...rest}>
        {Array.from({ length: lines }, (_, i) => (
          <span key={i} className="bay-skeleton" data-radius={radius} style={{ width: i === lines - 1 ? '60%' : '100%', height }} />
        ))}
      </div>
    );
  }
  return (
    <div
      ref={ref}
      className={cn('bay-skeleton', className)}
      data-radius={radius}
      aria-hidden="true"
      style={{ width, height, ...style }}
      {...rest}
    />
  );
});

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  tone?: Tone;
  /** Accessible name. Without it the bar is named by whatever labels it. */
  label?: string;
  size?: 'sm' | 'md';
}

/** A determinate progress bar. For work with no known end, use `Spinner`. */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value, max = 100, tone = 'accent', label, size = 'md', className, ...rest },
  ref,
) {
  const clamped = Math.min(max, Math.max(0, value));
  const pct = max === 0 ? 0 : (clamped / max) * 100;
  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className={cn('bay-progress', `bay-progress--${size}`, className)}
      data-tone={tone}
      {...rest}
    >
      <span className="bay-progress__fill" style={{ width: `${pct}%` }} />
    </div>
  );
});

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md' | 'lg';
  /** Announced while it spins. Defaults to "Loading". */
  label?: string;
}

/** Work with no known end. Announced politely, so a screen reader says it once. */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = 'md', label = 'Loading', className, ...rest },
  ref,
) {
  return (
    <span ref={ref} className={cn('bay-spinner', `bay-spinner--${size}`, className)} role="status" aria-live="polite" {...rest}>
      <span className="bay-spinner__circle" aria-hidden="true" />
      <span className="bay-sr-only">{label}</span>
    </span>
  );
});
