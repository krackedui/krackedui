import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Icon, type IconName } from '../foundations/icon';

export interface StatProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
  /** The change against the previous period, e.g. "+4.2%". */
  delta?: ReactNode;
  trend?: 'up' | 'down' | 'flat';
  /** Whether up is the good direction. False for costs, churn, latency. */
  upIsGood?: boolean;
  description?: ReactNode;
  icon?: IconName;
}

/**
 * A single metric.
 *
 * The delta's colour comes from `trend` and `upIsGood` together, not from the direction alone:
 * costs rising is not a success, and this is the prop that says so. A flat trend stays neutral.
 */
export const Stat = forwardRef<HTMLDivElement, StatProps>(function Stat(
  { label, value, delta, trend, upIsGood = true, description, icon, className, ...rest },
  ref,
) {
  const good = trend === 'flat' || !trend ? null : (trend === 'up') === upIsGood;
  const tone = good === null ? 'neutral' : good ? 'success' : 'danger';
  return (
    <div ref={ref} className={cn('bay-stat', className)} {...rest}>
      <div className="bay-stat__label">
        {icon && <Icon name={icon} size={14} />}
        {label}
      </div>
      <div className="bay-stat__value">{value}</div>
      {(delta || description) && (
        <div className="bay-stat__foot">
          {delta && (
            <span className="bay-stat__delta" data-tone={tone}>
              {trend && trend !== 'flat' && <Icon name={trend === 'up' ? 'trendingUp' : 'trendingDown'} size={12} />}
              {delta}
            </span>
          )}
          {description && <span className="bay-stat__description">{description}</span>}
        </div>
      )}
    </div>
  );
});

// the DOM's own `title` is a string tooltip; the contract's is the heading, so the DOM one is dropped
export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: IconName;
  title: ReactNode;
  description?: ReactNode;
  /** The one thing to do next. */
  action?: ReactNode;
  children?: ReactNode;
}

/** What to show when there is nothing yet. Always offer the next step, not just the bad news. */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { icon, title, description, action, children, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn('bay-empty', className)} {...rest}>
      {icon && (
        <span className="bay-empty__icon" aria-hidden="true">
          <Icon name={icon} size={20} />
        </span>
      )}
      <p className="bay-empty__title">{title}</p>
      {description && <p className="bay-empty__description">{description}</p>}
      {action && <div className="bay-empty__action">{action}</div>}
      {children}
    </div>
  );
});
