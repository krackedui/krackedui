import { forwardRef, useId, type HTMLAttributes, type ReactNode } from 'react';
import { tv } from '../lib/tv';
import type { Tone } from './tone';

/**
 * Determinate progress bar: a hairline-thin track in the translucent grey wash with a tone-colored fill.
 * The fill grows with a short transform transition (none under reduced motion).
 */
export const progressVariants = tv({
  slots: {
    root: 'flex w-full min-w-0 flex-col gap-1.5',
    header: 'flex min-w-0 items-baseline justify-between gap-3 text-n-ui',
    label: 'min-w-0 truncate text-n-text-primary',
    value: 'shrink-0 text-n-text-secondary tabular-nums',
    track: 'relative w-full overflow-hidden rounded-full bg-n-bg-tertiary-translucent-a',
    fill: 'absolute inset-y-0 left-0 w-full origin-left rounded-full transition-transform duration-300 ease-out motion-reduce:transition-none',
  },
  variants: {
    size: { sm: { track: 'h-1' }, md: { track: 'h-1.5' } },
    tone: {
      neutral: { fill: 'bg-n-gray-icon-accent-primary' },
      accent: { fill: 'bg-n-blue-icon-accent-primary' },
      success: { fill: 'bg-n-green-icon-accent-primary' },
      warning: { fill: 'bg-n-orange-icon-accent-primary' },
      danger: { fill: 'bg-n-red-icon-accent-primary' },
      info: { fill: 'bg-n-blue-icon-accent-primary' },
    },
  },
  defaultVariants: { size: 'md', tone: 'accent' },
});

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value: number;
  /** Defaults to 100. */
  max?: number;
  tone?: Tone;
  /** Visible label above the bar; also its accessible name. Without it, pass `aria-label`. */
  label?: string;
  size?: 'sm' | 'md';
  /**
   * Text for the value, shown at the right of the label and announced as `aria-valuetext`
   * (e.g. "$1,240 of $2,000"). Defaults to the rounded percentage.
   */
  valueText?: string;
  /** Hide the value next to the label. */
  hideValue?: boolean;
  /** Extra content under the bar (e.g. "4 days left"). */
  description?: ReactNode;
}

/** Determinate progress (uploads, budgets, onboarding). For unknown durations use Spinner. */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value, max = 100, tone, label, size, valueText, hideValue, description, className, style, ...props },
  ref,
) {
  const id = useId();
  const safeMax = max > 0 ? max : 100;
  const clamped = Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), safeMax);
  const ratio = clamped / safeMax;
  const percent = `${Math.round(ratio * 100)}%`;
  const s = progressVariants({ size, tone });
  const labelled = label ? { 'aria-labelledby': `${id}-label` } : {};
  return (
    <div className={s.root({ className })} style={style}>
      {label && (
        <div className={s.header()}>
          <span id={`${id}-label`} className={s.label()}>{label}</span>
          {!hideValue && <span className={s.value()} aria-hidden>{valueText ?? percent}</span>}
        </div>
      )}
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={clamped}
        aria-valuetext={valueText ?? percent}
        {...labelled}
        className={s.track()}
        {...props}
      >
        <div className={s.fill()} style={{ transform: `scaleX(${ratio})` }} />
      </div>
      {description && <div className="text-n-ui-sm text-n-text-secondary">{description}</div>}
    </div>
  );
});
