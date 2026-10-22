import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { tv } from '../lib/tv';
import { Icon, type IconName } from '../icons/Icon';
import type { Tone } from './tone';

/**
 * Key metric: a 14px secondary label, a large tabular value and a delta chip whose color follows whether
 * the change is good (`upIsGood`). Sits inside a Card or on its own in a grid.
 */
export const statVariants = tv({
  slots: {
    root: 'flex min-w-0 flex-col gap-1',
    label: 'flex min-w-0 items-center gap-1.5 text-n-ui text-n-text-secondary',
    icon: 'shrink-0 text-n-icon-secondary',
    value: 'min-w-0 [overflow-wrap:anywhere] text-[24px] font-semibold leading-8 tracking-[-0.01em] text-n-text-primary tabular-nums',
    meta: 'flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-n-ui-sm',
    delta: 'inline-flex shrink-0 items-center gap-0.5 rounded-n-sm px-1 py-px font-medium tabular-nums',
    description: 'min-w-0 text-n-text-secondary',
  },
  variants: {
    tone: {
      neutral: { delta: 'bg-n-bg-tertiary-translucent-a text-n-text-secondary' },
      accent: { delta: 'bg-n-blue-bg-secondary text-n-blue-text-primary' },
      info: { delta: 'bg-n-blue-bg-secondary text-n-blue-text-primary' },
      success: { delta: 'bg-n-green-bg-secondary text-n-green-text-primary' },
      warning: { delta: 'bg-n-orange-bg-secondary text-n-orange-text-primary' },
      danger: { delta: 'bg-n-red-bg-secondary text-n-red-text-primary' },
    },
  },
  defaultVariants: { tone: 'neutral' },
});

export interface StatProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
  /** Change vs the previous period, e.g. "+4.2%". */
  delta?: ReactNode;
  /** Direction of the change; sets the arrow and (with `upIsGood`) the tone. */
  trend?: 'up' | 'down' | 'flat';
  /** Whether "up" is good (revenue) or bad (costs). Defaults to true. */
  upIsGood?: boolean;
  /** Overrides the tone derived from `trend` and `upIsGood`. */
  deltaTone?: Tone;
  /** Context after the delta, e.g. "vs last month". */
  description?: ReactNode;
  icon?: IconName;
  /** A small chart under the meta row, usually `<Sparkline>` for the same metric (give it its own `label`). */
  chart?: ReactNode;
}

function toneFor(trend: StatProps['trend'], upIsGood: boolean): Tone {
  if (!trend || trend === 'flat') return 'neutral';
  return (trend === 'up') === upIsGood ? 'success' : 'danger';
}

const trendWord = { up: 'Up', down: 'Down', flat: 'No change' } as const;
const trendIcon = { up: 'arrowUp', down: 'arrowDown', flat: 'minus' } as const satisfies Record<string, IconName>;

/** A single KPI with label, value, delta and context. */
export const Stat = forwardRef<HTMLDivElement, StatProps>(function Stat(
  { label, value, delta, trend, upIsGood = true, deltaTone, description, icon, chart, className, ...props },
  ref,
) {
  const s = statVariants({ tone: deltaTone ?? toneFor(trend, upIsGood) });
  return (
    <div ref={ref} className={s.root({ className })} {...props}>
      <div className={s.label()}>
        {icon && <Icon name={icon} size={16} className={s.icon()} />}
        <span className="min-w-0 truncate">{label}</span>
      </div>
      <div className={s.value()}>{value}</div>
      {(delta || description) && (
        <div className={s.meta()}>
          {delta && (
            <span className={s.delta()}>
              {trend && <Icon name={trendIcon[trend]} size={12} />}
              {trend && <span className="sr-only">{trendWord[trend]} </span>}
              {delta}
            </span>
          )}
          {description && <span className={s.description()}>{description}</span>}
        </div>
      )}
      {chart && <div className="mt-2 min-w-0">{chart}</div>}
    </div>
  );
});
